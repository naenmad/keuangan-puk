import * as XLSX from 'xlsx';
import { MONTH_NAMES } from '../data/defaultData.js';
import { recalculateAllMonths, parseNumber } from './formatters.js';

export async function parseExcelFile(file) {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });

  const sheetNames = workbook.SheetNames || [];
  if (sheetNames.length === 0) {
    throw new Error('File Excel tidak memiliki sheet yang valid.');
  }

  const findSheet = (name) => sheetNames.find(s => s.toLowerCase().replace(/[\s_-]+/g, '') === name.toLowerCase().replace(/[\s_-]+/g, ''));

  const dataTxSheetName = findSheet('Data_Transaksi') || findSheet('DataTransaksi') || findSheet('Transaksi');
  const laporanBulananSheetName = findSheet('Laporan_Bulanan') || findSheet('LaporanBulanan') || findSheet('Bulanan');

  // --- STRATEGY 1: Parse Multi-sheet Format (Data_Transaksi & Laporan_Bulanan) ---
  if (dataTxSheetName || laporanBulananSheetName) {
    const monthlyMap = {};

    // 1. Parse Laporan_Bulanan for base months, initial Saldo Awal, and base values
    if (laporanBulananSheetName) {
      const ws = workbook.Sheets[laporanBulananSheetName];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

      let headerRowIdx = -1;
      let colMap = { periode: -1, bulan: -1, tahun: -1, saldoAwal: -1, pemasukan: -1, pengeluaran: -1 };

      for (let r = 0; r < Math.min(rows.length, 15); r++) {
        const row = rows[r];
        if (!Array.isArray(row)) continue;
        const cells = row.map(c => String(c).toLowerCase().trim());
        
        let matchCount = 0;
        let pIdx = -1, bIdx = -1, tIdx = -1, saIdx = -1, inIdx = -1, outIdx = -1;

        cells.forEach((c, idx) => {
          if (c === 'periode' || c.startsWith('periode')) { pIdx = idx; matchCount++; }
          else if (c === 'bulan' || (c.includes('bulan') && !c.includes('laporan'))) { bIdx = idx; matchCount++; }
          else if (c === 'tahun' || c.startsWith('tahun')) { tIdx = idx; matchCount++; }
          else if (c.includes('saldo awal')) { saIdx = idx; matchCount++; }
          else if (c.includes('pemasukan')) { inIdx = idx; matchCount++; }
          else if (c.includes('pengeluaran')) { outIdx = idx; matchCount++; }
        });

        // Require at least 2 column matches to avoid matching single-column title rows
        if (matchCount >= 2 && (pIdx !== -1 || (bIdx !== -1 && tIdx !== -1))) {
          headerRowIdx = r;
          colMap = { periode: pIdx, bulan: bIdx, tahun: tIdx, saldoAwal: saIdx, pemasukan: inIdx, pengeluaran: outIdx };
          break;
        }
      }

      if (headerRowIdx !== -1) {
        for (let r = headerRowIdx + 1; r < rows.length; r++) {
          const row = rows[r];
          if (!Array.isArray(row) || row.length === 0) continue;

          let periodVal = colMap.periode !== -1 ? String(row[colMap.periode] || '').trim() : '';
          let monthVal = colMap.bulan !== -1 ? String(row[colMap.bulan] || '').trim() : '';
          let yearVal = colMap.tahun !== -1 ? parseInt(row[colMap.tahun], 10) : null;
          let saldoAwalVal = colMap.saldoAwal !== -1 ? parseNumber(row[colMap.saldoAwal]) : 0;
          let pemasukanVal = colMap.pemasukan !== -1 ? parseNumber(row[colMap.pemasukan]) : 0;
          let pengeluaranVal = colMap.pengeluaran !== -1 ? parseNumber(row[colMap.pengeluaran]) : 0;

          if (periodVal.toUpperCase() === 'TOTAL' || monthVal.toUpperCase() === 'TOTAL') continue;
          if (!periodVal && !monthVal && !yearVal) continue;

          let periodKey = '';
          if (/^\d{4}-\d{1,2}$/.test(periodVal)) {
            const parts = periodVal.split('-');
            const y = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10);
            periodKey = `${y}-${String(m).padStart(2, '0')}`;
            if (!yearVal) yearVal = y;
            if (!monthVal && m >= 1 && m <= 12) monthVal = MONTH_NAMES[m - 1];
          } else if (yearVal && monthVal) {
            const mIdx = MONTH_NAMES.findIndex(m => m.toLowerCase() === monthVal.toLowerCase());
            if (mIdx !== -1) {
              periodKey = `${yearVal}-${String(mIdx + 1).padStart(2, '0')}`;
            }
          }

          if (periodKey) {
            monthlyMap[periodKey] = {
              period: periodKey,
              year: yearVal || parseInt(periodKey.split('-')[0], 10),
              month: monthVal || getMonthNameFromPeriod(periodKey),
              saldoAwal: saldoAwalVal,
              pemasukan: pemasukanVal,
              expenses: pengeluaranVal > 0 ? [{ name: 'Total Pengeluaran Kas', category: 'Lain-lain', amount: pengeluaranVal }] : []
            };
          }
        }
      }
    }

    // 2. Parse Data_Transaksi for detail transaction items
    if (dataTxSheetName) {
      const ws = workbook.Sheets[dataTxSheetName];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

      let txHeaderIdx = -1;
      let txColMap = { periode: -1, tahun: -1, bulan: -1, nama: -1, kategori: -1, tipe: -1, nominal: -1 };

      for (let r = 0; r < Math.min(rows.length, 15); r++) {
        const row = rows[r];
        if (!Array.isArray(row)) continue;
        const cells = row.map(c => String(c).toLowerCase().trim());
        
        let matchCount = 0;
        let pIdx = -1, tIdx = -1, bIdx = -1, nIdx = -1, kIdx = -1, typeIdx = -1, nomIdx = -1;

        cells.forEach((c, idx) => {
          if (c === 'periode' || c.startsWith('periode')) { pIdx = idx; matchCount++; }
          else if (c === 'tahun' || c.startsWith('tahun')) { tIdx = idx; matchCount++; }
          else if (c === 'bulan' || (c.includes('bulan') && !c.includes('laporan'))) { bIdx = idx; matchCount++; }
          else if (c.includes('nama') || c.includes('keterangan') || c.includes('uraian') || c === 'transaksi') { nIdx = idx; matchCount++; }
          else if (c === 'kategori' || c.includes('kategori')) { kIdx = idx; matchCount++; }
          else if (c === 'tipe' || c.includes('tipe') || c === 'jenis') { typeIdx = idx; matchCount++; }
          else if (c.includes('nominal') || c.includes('jumlah') || c.includes('debet') || c.includes('kredit')) { nomIdx = idx; matchCount++; }
        });

        // Require at least 3 matching columns to ensure it is the real header row
        if (matchCount >= 3 && (pIdx !== -1 || (bIdx !== -1 && tIdx !== -1)) && (nomIdx !== -1 || nIdx !== -1)) {
          txHeaderIdx = r;
          txColMap = { periode: pIdx, tahun: tIdx, bulan: bIdx, nama: nIdx, kategori: kIdx, tipe: typeIdx, nominal: nomIdx };
          break;
        }
      }

      if (txHeaderIdx !== -1) {
        // Check if Data_Transaksi explicitly records income (Pemasukan) rows
        let hasIncomeRows = false;
        for (let r = txHeaderIdx + 1; r < rows.length; r++) {
          const row = rows[r];
          if (!Array.isArray(row) || row.length === 0) continue;
          const tipe = txColMap.tipe !== -1 ? String(row[txColMap.tipe] || '').trim().toLowerCase() : '';
          const kat = txColMap.kategori !== -1 ? String(row[txColMap.kategori] || '').trim().toLowerCase() : '';
          const nama = txColMap.nama !== -1 ? String(row[txColMap.nama] || '').trim().toLowerCase() : '';
          if (tipe === 'pemasukan' || kat.includes('pemasukan') || nama.includes('pemasukan kas')) {
            hasIncomeRows = true;
            break;
          }
        }

        // If Data_Transaksi defines Pemasukan, reset monthlyMap pemasukan so we accumulate from rows accurately
        if (hasIncomeRows) {
          Object.keys(monthlyMap).forEach(k => {
            monthlyMap[k].pemasukan = 0;
          });
        }

        // Reset any placeholder expenses from Laporan_Bulanan before pushing detail items
        Object.keys(monthlyMap).forEach(k => {
          monthlyMap[k].expenses = [];
        });

        for (let r = txHeaderIdx + 1; r < rows.length; r++) {
          const row = rows[r];
          if (!Array.isArray(row) || row.length === 0) continue;

          let periodVal = txColMap.periode !== -1 ? String(row[txColMap.periode] || '').trim() : '';
          let yearVal = txColMap.tahun !== -1 ? parseInt(row[txColMap.tahun], 10) : null;
          let monthVal = txColMap.bulan !== -1 ? String(row[txColMap.bulan] || '').trim() : '';
          let namaVal = txColMap.nama !== -1 ? String(row[txColMap.nama] || '').trim() : '';
          let kategoriVal = txColMap.kategori !== -1 ? String(row[txColMap.kategori] || 'Lain-lain').trim() : 'Lain-lain';
          let tipeVal = txColMap.tipe !== -1 ? String(row[txColMap.tipe] || '').trim().toLowerCase() : '';
          let nominalVal = txColMap.nominal !== -1 ? parseNumber(row[txColMap.nominal]) : 0;

          if (!namaVal && nominalVal === 0) continue;
          if (periodVal.toUpperCase() === 'TOTAL' || monthVal.toUpperCase() === 'TOTAL') continue;

          // Normalize period
          let periodKey = '';
          if (/^\d{4}-\d{1,2}$/.test(periodVal)) {
            const parts = periodVal.split('-');
            const y = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10);
            periodKey = `${y}-${String(m).padStart(2, '0')}`;
            if (!yearVal) yearVal = y;
            if (!monthVal && m >= 1 && m <= 12) monthVal = MONTH_NAMES[m - 1];
          } else if (yearVal && monthVal) {
            const mIdx = MONTH_NAMES.findIndex(m => m.toLowerCase() === monthVal.toLowerCase());
            if (mIdx !== -1) {
              periodKey = `${yearVal}-${String(mIdx + 1).padStart(2, '0')}`;
            }
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

          const isIncome = tipeVal === 'pemasukan' ||
            kategoriVal.toLowerCase().includes('pemasukan') ||
            namaVal.toLowerCase().includes('pemasukan kas') ||
            namaVal.toLowerCase().includes('iuran');

          if (isIncome) {
            monthlyMap[periodKey].pemasukan += nominalVal;
          } else if (namaVal || nominalVal > 0) {
            monthlyMap[periodKey].expenses.push({
              name: namaVal || 'Pengeluaran Kas',
              category: kategoriVal || 'Lain-lain',
              amount: nominalVal
            });
          }
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
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
    if (!rows || rows.length === 0) continue;

    let hIdx = -1;
    let map = {};
    for (let r = 0; r < Math.min(rows.length, 15); r++) {
      const row = rows[r];
      if (!Array.isArray(row)) continue;
      const cells = row.map(c => String(c).toLowerCase().trim());
      
      const pIdx = cells.findIndex(c => c.includes('periode'));
      const bIdx = cells.findIndex(c => c.includes('bulan'));
      const tIdx = cells.findIndex(c => c.includes('tahun'));
      const inIdx = cells.findIndex(c => c.includes('pemasukan') || c.includes('income') || c.includes('masuk'));
      const outIdx = cells.findIndex(c => c.includes('pengeluaran') || c.includes('expense') || c.includes('keluar'));
      const saIdx = cells.findIndex(c => c.includes('saldo awal'));

      if ((pIdx !== -1 || bIdx !== -1) && (inIdx !== -1 || outIdx !== -1 || saIdx !== -1)) {
        hIdx = r;
        map = { periode: pIdx, bulan: bIdx, tahun: tIdx, pemasukan: inIdx, pengeluaran: outIdx, saldoAwal: saIdx };
        break;
      }
    }

    if (hIdx !== -1) {
      const list = [];
      for (let r = hIdx + 1; r < rows.length; r++) {
        const row = rows[r];
        if (!Array.isArray(row) || row.length === 0) continue;

        let periodVal = map.periode !== -1 ? String(row[map.periode] || '').trim() : '';
        let monthVal = map.bulan !== -1 ? String(row[map.bulan] || '').trim() : '';
        let yearVal = map.tahun !== -1 ? parseInt(row[map.tahun], 10) : new Date().getFullYear();
        let pemasukan = map.pemasukan !== -1 ? parseNumber(row[map.pemasukan]) : 0;
        let pengeluaran = map.pengeluaran !== -1 ? parseNumber(row[map.pengeluaran]) : 0;
        let saldoAwal = map.saldoAwal !== -1 ? parseNumber(row[map.saldoAwal]) : 0;

        if (periodVal.toUpperCase() === 'TOTAL' || monthVal.toUpperCase() === 'TOTAL') continue;
        if (!periodVal && !monthVal && pemasukan === 0 && pengeluaran === 0) continue;

        let periodKey = '';
        if (/^\d{4}-\d{1,2}$/.test(periodVal)) {
          const parts = periodVal.split('-');
          const y = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10);
          periodKey = `${y}-${String(m).padStart(2, '0')}`;
          if (!yearVal) yearVal = y;
          if (!monthVal && m >= 1 && m <= 12) monthVal = MONTH_NAMES[m - 1];
        } else if (monthVal) {
          const mIdx = MONTH_NAMES.findIndex(m => m.toLowerCase() === monthVal.toLowerCase());
          const mNum = mIdx !== -1 ? mIdx + 1 : (list.length + 1);
          periodKey = `${yearVal}-${String(mNum).padStart(2, '0')}`;
        }

        if (periodKey) {
          list.push({
            period: periodKey,
            year: yearVal || parseInt(periodKey.split('-')[0], 10),
            month: monthVal || getMonthNameFromPeriod(periodKey),
            saldoAwal,
            pemasukan,
            expenses: pengeluaran > 0 ? [{ name: 'Total Pengeluaran Kas', category: 'Lain-lain', amount: pengeluaran }] : []
          });
        }
      }

      if (list.length > 0) {
        return recalculateAllMonths(list);
      }
    }
  }

  throw new Error('Format file Excel tidak dikenali atau lembar kerja kosong. Pastikan file memiliki data transaksi atau laporan bulanan.');
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
