import * as XLSX from 'xlsx';
import { MONTH_NAMES } from '../data/defaultData';
import { recalculateAllMonths, parseNumber } from './formatters';

export async function parseExcelFile(file) {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });

  const sheetNames = workbook.SheetNames || [];
  if (sheetNames.length === 0) {
    throw new Error('File Excel tidak memiliki sheet yang valid.');
  }

  // --- STRATEGY 1: Parse Multi-sheet Format (Data_Transaksi & Laporan_Bulanan) ---
  const hasDataTransaksi = sheetNames.some(s => s.toLowerCase().replace(/[\s_-]+/g, '') === 'datatransaksi');
  const hasLaporanBulanan = sheetNames.some(s => s.toLowerCase().replace(/[\s_-]+/g, '') === 'laporanbulanan');

  if (hasDataTransaksi || hasLaporanBulanan) {
    const monthlyMap = {};

    // 1. First parse Laporan_Bulanan for base months and initial Saldo Awal
    if (hasLaporanBulanan) {
      const sheetName = sheetNames.find(s => s.toLowerCase().replace(/[\s_-]+/g, '') === 'laporanbulanan');
      const ws = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

      let headerRowIdx = -1;
      let colMap = { periode: 0, tahun: 1, bulan: 2, saldoAwal: 3, pemasukan: 4, pengeluaran: 5 };

      // Locate header row
      for (let r = 0; r < Math.min(rows.length, 12); r++) {
        const row = rows[r];
        if (!Array.isArray(row)) continue;
        const text = row.map(c => String(c).toLowerCase()).join(' ');
        if (text.includes('periode') || (text.includes('saldo awal') && text.includes('bulan'))) {
          headerRowIdx = r;
          // Dynamically detect column indices
          row.forEach((cellVal, cIdx) => {
            const h = String(cellVal).toLowerCase().trim();
            if (h === 'periode' || h.includes('periode')) colMap.periode = cIdx;
            else if (h === 'tahun' || h.includes('tahun')) colMap.tahun = cIdx;
            else if (h === 'bulan' || h.includes('bulan')) colMap.bulan = cIdx;
            else if (h.includes('saldo awal')) colMap.saldoAwal = cIdx;
            else if (h.includes('pemasukan')) colMap.pemasukan = cIdx;
            else if (h.includes('pengeluaran')) colMap.pengeluaran = cIdx;
          });
          break;
        }
      }

      const startRow = headerRowIdx !== -1 ? headerRowIdx + 1 : 0;
      for (let r = startRow; r < rows.length; r++) {
        const row = rows[r];
        if (!Array.isArray(row) || row.length === 0) continue;

        let periodVal = String(row[colMap.periode] || '').trim();
        let yearVal = parseInt(row[colMap.tahun]) || null;
        let monthVal = String(row[colMap.bulan] || '').trim();

        // Extract from period string if needed (e.g. "2023-01")
        if (periodVal && /^\d{4}-\d{1,2}$/.test(periodVal)) {
          const parts = periodVal.split('-');
          const y = parseInt(parts[0], 10);
          const mNum = parseInt(parts[1], 10);
          const formattedPeriod = `${y}-${String(mNum).padStart(2, '0')}`;
          
          if (!yearVal) yearVal = y;
          if (!monthVal && mNum >= 1 && mNum <= 12) {
            monthVal = MONTH_NAMES[mNum - 1];
          }

          monthlyMap[formattedPeriod] = {
            period: formattedPeriod,
            year: yearVal || y,
            month: monthVal || 'Januari',
            saldoAwal: parseNumber(row[colMap.saldoAwal]),
            pemasukan: parseNumber(row[colMap.pemasukan]),
            expenses: []
          };
        }
      }
    }

    // 2. Parse Data_Transaksi for detail expense items and income
    if (hasDataTransaksi) {
      const sheetName = sheetNames.find(s => s.toLowerCase().replace(/[\s_-]+/g, '') === 'datatransaksi');
      const ws = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

      let txHeaderIdx = -1;
      let txColMap = { periode: 0, tahun: 1, bulan: 2, nama: 4, kategori: 5, tipe: 6, nominal: 7 };

      for (let r = 0; r < Math.min(rows.length, 12); r++) {
        const row = rows[r];
        if (!Array.isArray(row)) continue;
        const text = row.map(c => String(c).toLowerCase()).join(' ');
        if (text.includes('transaksi') || text.includes('kategori') || text.includes('nominal')) {
          txHeaderIdx = r;
          row.forEach((cellVal, cIdx) => {
            const h = String(cellVal).toLowerCase().trim();
            if (h === 'periode' || h.includes('periode')) txColMap.periode = cIdx;
            else if (h === 'tahun' || h.includes('tahun')) txColMap.tahun = cIdx;
            else if (h === 'bulan' || h.includes('bulan')) txColMap.bulan = cIdx;
            else if (h.includes('keterangan') || h.includes('nama transaksi') || h.includes('transaksi')) txColMap.nama = cIdx;
            else if (h === 'kategori' || h.includes('kategori')) txColMap.kategori = cIdx;
            else if (h === 'tipe' || h.includes('tipe') || h.includes('jenis')) txColMap.tipe = cIdx;
            else if (h.includes('nominal') || h.includes('jumlah')) txColMap.nominal = cIdx;
          });
          break;
        }
      }

      const txStartRow = txHeaderIdx !== -1 ? txHeaderIdx + 1 : 0;
      for (let r = txStartRow; r < rows.length; r++) {
        const row = rows[r];
        if (!Array.isArray(row) || row.length === 0) continue;

        let periodVal = String(row[txColMap.periode] || '').trim();
        let yearVal = parseInt(row[txColMap.tahun]) || null;
        let monthVal = String(row[txColMap.bulan] || '').trim();
        let nama = String(row[txColMap.nama] || '').trim();
        let kategori = String(row[txColMap.kategori] || 'Lain-lain').trim();
        let tipe = String(row[txColMap.tipe] || '').trim().toLowerCase();
        let nominal = parseNumber(row[txColMap.nominal]);

        if (!nama && nominal === 0) continue;

        // Normalize period
        let periodKey = '';
        if (periodVal && /^\d{4}-\d{1,2}$/.test(periodVal)) {
          const parts = periodVal.split('-');
          periodKey = `${parts[0]}-${String(parts[1]).padStart(2, '0')}`;
          if (!yearVal) yearVal = parseInt(parts[0], 10);
          if (!monthVal) monthVal = getMonthNameFromPeriod(periodKey);
        } else if (yearVal && monthVal) {
          const mIdx = MONTH_NAMES.indexOf(monthVal);
          const mStr = mIdx >= 0 ? String(mIdx + 1).padStart(2, '0') : '01';
          periodKey = `${yearVal}-${mStr}`;
        }

        if (!periodKey) continue;

        if (!monthlyMap[periodKey]) {
          monthlyMap[periodKey] = {
            period: periodKey,
            year: yearVal || parseInt(periodKey.split('-')[0], 10) || 2024,
            month: monthVal || getMonthNameFromPeriod(periodKey),
            saldoAwal: 0,
            pemasukan: 0,
            expenses: []
          };
        }

        const isIncome = tipe === 'pemasukan' || 
          kategori.toLowerCase().includes('pemasukan') || 
          nama.toLowerCase().includes('iuran') || 
          nama.toLowerCase().includes('pemasukan kas');

        if (isIncome) {
          monthlyMap[periodKey].pemasukan = (monthlyMap[periodKey].pemasukan || 0) + nominal;
        } else if (nama || nominal > 0) {
          monthlyMap[periodKey].expenses.push({
            name: nama || 'Pengeluaran Kas',
            category: kategori || 'Lain-lain',
            amount: nominal
          });
        }
      }
    }

    const monthlyList = Object.values(monthlyMap);
    if (monthlyList.length > 0) {
      return recalculateAllMonths(monthlyList);
    }
  }

  // --- STRATEGY 2: Fallback for any standard single sheet table ---
  for (const sName of sheetNames) {
    const ws = workbook.Sheets[sName];
    const rawData = XLSX.utils.sheet_to_json(ws, { defval: '' });

    if (rawData && rawData.length > 0) {
      const sample = rawData[0];
      const keys = Object.keys(sample);

      const hasMonthLike = keys.some(k => k.toLowerCase().includes('bulan') || k.toLowerCase().includes('month') || k.toLowerCase().includes('periode'));
      
      if (hasMonthLike) {
        const list = rawData.map((item, idx) => {
          let month = findValueByKeywords(item, ['bulan', 'month', 'nama bulan']) || `Bulan ${idx + 1}`;
          let year = parseInt(findValueByKeywords(item, ['tahun', 'year'])) || new Date().getFullYear();
          let saldoAwal = parseNumber(findValueByKeywords(item, ['saldo awal', 'saldo_awal', 'awal']));
          let pemasukan = parseNumber(findValueByKeywords(item, ['pemasukan', 'income', 'masuk', 'iuran']));
          let pengeluaran = parseNumber(findValueByKeywords(item, ['total pengeluaran', 'pengeluaran', 'expense', 'keluar']));
          
          let mIdx = MONTH_NAMES.indexOf(month);
          let monthStr = mIdx >= 0 ? String(mIdx + 1).padStart(2, '0') : String(idx + 1).padStart(2, '0');
          let period = `${year}-${monthStr}`;

          return {
            period,
            year,
            month: typeof month === 'string' ? month : `Bulan ${idx + 1}`,
            saldoAwal,
            pemasukan,
            expenses: pengeluaran > 0 ? [{ name: 'Total Pengeluaran Kas', category: 'Lain-lain', amount: pengeluaran }] : []
          };
        });

        const validList = list.filter(d => d.pemasukan > 0 || d.expenses.length > 0 || d.saldoAwal > 0);
        if (validList.length > 0) {
          return recalculateAllMonths(validList);
        }
      }
    }
  }

  throw new Error("Format file Excel tidak dikenali atau lembar kerja kosong. Pastikan file memiliki data transaksi/laporan bulanan.");
}

function findValueByKeywords(obj, keywords) {
  if (!obj || typeof obj !== 'object') return null;
  const keys = Object.keys(obj);
  for (const kw of keywords) {
    const matchedKey = keys.find(k => k.toLowerCase().trim() === kw || k.toLowerCase().includes(kw));
    if (matchedKey && obj[matchedKey] !== undefined && obj[matchedKey] !== '') {
      return obj[matchedKey];
    }
  }
  return null;
}

function getMonthNameFromPeriod(period) {
  const parts = String(period || '').split('-');
  if (parts.length === 2) {
    const monthNum = parseInt(parts[1], 10);
    if (monthNum >= 1 && monthNum <= 12) {
      return MONTH_NAMES[monthNum - 1];
    }
  }
  return period || 'Januari';
}
