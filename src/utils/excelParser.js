import * as XLSX from 'xlsx';
import { MONTH_NAMES } from '../data/defaultData';
import { recalculateAllMonths, parseNumber } from './formatters';

export async function parseExcelFile(file) {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  // Priority 1: Check if 'Data_Transaksi' and 'Laporan_Bulanan' exist
  const sheetNames = workbook.SheetNames;
  
  if (sheetNames.includes('Data_Transaksi')) {
    const txSheet = workbook.Sheets['Data_Transaksi'];
    const txRows = XLSX.utils.sheet_to_json(txSheet, { header: 1 });
    
    // Check if Laporan_Bulanan exists for initial Saldo Awal reference
    let monthlySeedMap = {};
    if (sheetNames.includes('Laporan_Bulanan')) {
      const mSheet = workbook.Sheets['Laporan_Bulanan'];
      const mRows = XLSX.utils.sheet_to_json(mSheet, { header: 1 });
      
      // Find header row in Laporan_Bulanan
      let headerIdx = -1;
      for (let r = 0; r < Math.min(mRows.length, 10); r++) {
        const row = mRows[r];
        if (row && row.some(cell => String(cell).toLowerCase().includes('periode') || String(cell).toLowerCase().includes('saldo awal'))) {
          headerIdx = r;
          break;
        }
      }

      if (headerIdx !== -1) {
        for (let r = headerIdx + 1; r < mRows.length; r++) {
          const row = mRows[r];
          if (!row || row.length < 5) continue;
          
          // Let's inspect column values: Periode(B), Bulan(C), Tahun(D), Saldo Awal(E), Pemasukan(F)
          const periode = String(row[1] || '').trim();
          const bulan = String(row[2] || '').trim();
          const tahun = parseInt(row[3]) || null;
          const saldoAwal = parseNumber(row[4]);
          const pemasukan = parseNumber(row[5]);
          
          if (periode && /^\d{4}-\d{2}$/.test(periode)) {
            monthlySeedMap[periode] = {
              period: periode,
              year: tahun || parseInt(periode.split('-')[0]),
              month: bulan,
              saldoAwal: saldoAwal || 0,
              pemasukan: pemasukan || 0,
              expenses: []
            };
          }
        }
      }
    }

    // Now parse Data_Transaksi
    // Row headers usually at row 4 (1-indexed) or similar
    let txHeaderIdx = -1;
    for (let r = 0; r < Math.min(txRows.length, 10); r++) {
      const row = txRows[r];
      if (row && row.some(cell => String(cell).toLowerCase().includes('nama transaksi') || String(cell).toLowerCase().includes('kategori'))) {
        txHeaderIdx = r;
        break;
      }
    }

    if (txHeaderIdx !== -1) {
      for (let r = txHeaderIdx + 1; r < txRows.length; r++) {
        const row = txRows[r];
        if (!row || row.length < 6) continue;
        
        // Data_Transaksi format:
        // Col A: No, Col B: Periode, Col C: Tahun, Col D: Bulan, Col E: No, Col F: Nama Transaksi, Col G: Kategori, Col H: Tipe, Col I: Nominal
        const periode = String(row[1] || '').trim();
        const tahun = parseInt(row[2]) || (periode ? parseInt(periode.split('-')[0]) : 2024);
        const bulan = String(row[3] || '').trim();
        const nama = String(row[5] || '').trim();
        const kategori = String(row[6] || 'Lain-lain').trim();
        const tipe = String(row[7] || '').trim().toLowerCase();
        const nominal = parseNumber(row[8] !== undefined ? row[8] : row[7]);

        if (!periode || !/^\d{4}-\d{2}$/.test(periode)) continue;

        if (!monthlySeedMap[periode]) {
          monthlySeedMap[periode] = {
            period: periode,
            year: tahun,
            month: bulan || getMonthNameFromPeriod(periode),
            saldoAwal: 0,
            pemasukan: 0,
            expenses: []
          };
        }

        if (tipe === 'pemasukan' || nama.toLowerCase().includes('iuran') || nama.toLowerCase().includes('pemasukan kas')) {
          monthlySeedMap[periode].pemasukan = nominal;
        } else if (nama) {
          monthlySeedMap[periode].expenses.push({
            name: nama,
            category: kategori || 'Lain-lain',
            amount: nominal
          });
        }
      }
    }

    const monthlyList = Object.values(monthlySeedMap);
    if (monthlyList.length > 0) {
      return recalculateAllMonths(monthlyList);
    }
  }

  // Fallback: Parse any tabular sheet
  const firstSheet = workbook.Sheets[sheetNames[0]];
  const rawData = XLSX.utils.sheet_to_json(firstSheet);
  
  if (rawData && rawData.length > 0) {
    const list = rawData.map((item, idx) => {
      const month = item['Bulan'] || item['bulan'] || item['Month'] || `Bulan ${idx+1}`;
      const year = parseInt(item['Tahun'] || item['tahun'] || item['Year']) || 2024;
      const saldoAwal = parseNumber(item['Saldo Awal (Rp)'] || item['Saldo Awal'] || item['saldoAwal'] || 0);
      const pemasukan = parseNumber(item['Pemasukan (Rp)'] || item['Pemasukan'] || item['pemasukan'] || 0);
      const pengeluaran = parseNumber(item['Pengeluaran (Rp)'] || item['Total Pengeluaran (Rp)'] || item['pengeluaran'] || 0);
      
      const mIdx = MONTH_NAMES.indexOf(month);
      const monthStr = mIdx >= 0 ? String(mIdx + 1).padStart(2, '0') : '01';
      const period = `${year}-${monthStr}`;

      return {
        period,
        year,
        month,
        saldoAwal,
        pemasukan,
        expenses: pengeluaran > 0 ? [{ name: 'Total Pengeluaran', category: 'Lain-lain', amount: pengeluaran }] : []
      };
    });

    return recalculateAllMonths(list);
  }

  throw new Error("Format file Excel tidak dikenali atau kosong.");
}

function getMonthNameFromPeriod(period) {
  const parts = period.split('-');
  if (parts.length === 2) {
    const monthNum = parseInt(parts[1], 10);
    if (monthNum >= 1 && monthNum <= 12) {
      return MONTH_NAMES[monthNum - 1];
    }
  }
  return period;
}
