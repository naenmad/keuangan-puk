import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Chart as ChartJS, registerables } from 'chart.js';
import { CATEGORIES, MONTH_NAMES } from '../data/defaultData';
import { recalculateAllMonths } from './formatters';

ChartJS.register(...registerables);

/**
 * Render chart to an offscreen canvas and return base64 data string
 */
async function renderChartToPng({ type, data, options, width = 800, height = 420 }) {
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Fill canvas background with crisp white for Excel embedding
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  return new Promise((resolve) => {
    const chart = new ChartJS(ctx, {
      type,
      data,
      options: {
        ...options,
        animation: false,
        responsive: false,
        devicePixelRatio: 2,
        plugins: {
          ...options.plugins,
          legend: {
            ...options.plugins?.legend,
            labels: {
              ...options.plugins?.legend?.labels,
              color: '#1e293b',
              font: { family: 'Arial', size: 12, weight: 'bold' }
            }
          },
          title: {
            display: true,
            text: options.titleText || '',
            color: '#0f172a',
            font: { family: 'Arial', size: 14, weight: 'bold' },
            padding: { top: 10, bottom: 15 }
          }
        },
        scales: options.scales ? {
          x: {
            ...options.scales.x,
            ticks: { color: '#334155', font: { family: 'Arial', size: 11, weight: '600' } },
            grid: { color: '#e2e8f0' }
          },
          y: {
            ...options.scales.y,
            ticks: { color: '#334155', font: { family: 'Arial', size: 11, weight: '600' } },
            grid: { color: '#e2e8f0' }
          }
        } : undefined
      }
    });

    // Capture image
    const base64 = chart.toBase64Image('image/png', 1.0);
    chart.destroy();
    resolve(base64);
  });
}

/**
 * Generate chart images for the Excel export
 */
async function createExcelChartImages(data, years) {
  try {
    // 1. Dashboard Chart: Tren Arus Kas Tahunan (Pemasukan, Pengeluaran, Saldo Akhir)
    const dashLabels = years.map(y => `Tahun ${y}`);
    const dashPemasukan = years.map(y => data.filter(d => d.year === y).reduce((s, d) => s + d.pemasukan, 0));
    const dashPengeluaran = years.map(y => data.filter(d => d.year === y).reduce((s, d) => s + d.totalPengeluaran, 0));
    const dashSaldoAkhir = years.map(y => {
      const ym = data.filter(d => d.year === y);
      return ym.length > 0 ? ym[ym.length - 1].saldoAkhir : 0;
    });

    const imgDash = await renderChartToPng({
      type: 'bar',
      width: 780,
      height: 380,
      titleText: 'Grafik Ringkasan Arus Kas & Saldo Akhir Per Tahun',
      data: {
        labels: dashLabels,
        datasets: [
          {
            type: 'bar',
            label: 'Total Pemasukan',
            data: dashPemasukan,
            backgroundColor: 'rgba(16, 185, 129, 0.8)',
            borderColor: '#059669',
            borderWidth: 1.5,
            borderRadius: 4
          },
          {
            type: 'bar',
            label: 'Total Pengeluaran',
            data: dashPengeluaran,
            backgroundColor: 'rgba(239, 68, 68, 0.8)',
            borderColor: '#dc2626',
            borderWidth: 1.5,
            borderRadius: 4
          },
          {
            type: 'line',
            label: 'Saldo Akhir Kas',
            data: dashSaldoAkhir,
            borderColor: '#2563eb',
            backgroundColor: '#2563eb',
            borderWidth: 3,
            tension: 0.2,
            pointRadius: 5
          }
        ]
      },
      options: {
        plugins: { legend: { position: 'top' } },
        scales: {
          y: {
            ticks: {
              callback: v => 'Rp ' + (v / 1000000).toFixed(0) + ' jt'
            }
          }
        }
      }
    });

    // 2. Rekap Pemasukan Chart: Tren Pemasukan Bulanan Antar Tahun (Jan - Des)
    const incDatasets = years.map((yr, idx) => {
      const colors = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
      const bgColors = ['rgba(37,99,235,0.7)', 'rgba(16,185,129,0.7)', 'rgba(245,158,11,0.7)', 'rgba(139,92,246,0.7)', 'rgba(236,72,153,0.7)'];
      return {
        label: `Tahun ${yr}`,
        data: MONTH_NAMES.map(mName => {
          const match = data.find(d => d.year === yr && d.month.toLowerCase() === mName.toLowerCase());
          return match ? match.pemasukan : 0;
        }),
        backgroundColor: bgColors[idx % bgColors.length],
        borderColor: colors[idx % colors.length],
        borderWidth: 1.5,
        borderRadius: 4
      };
    });

    const imgInc = await renderChartToPng({
      type: 'bar',
      width: 820,
      height: 400,
      titleText: 'Tren Pemasukan Kas per Bulan Antar Tahun (Januari — Desember)',
      data: {
        labels: MONTH_NAMES,
        datasets: incDatasets
      },
      options: {
        plugins: { legend: { position: 'top' } },
        scales: {
          y: {
            ticks: {
              callback: v => 'Rp ' + (v / 1000000).toFixed(0) + ' jt'
            }
          }
        }
      }
    });

    // 3. Rekap Kategori Chart: Perbandingan Pengeluaran Per Kategori
    const activeCats = CATEGORIES.filter(c => c !== 'Pemasukan Kas').slice(0, 10);
    const catDatasets = years.map((yr, idx) => {
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
      const bgColors = ['rgba(59,130,246,0.75)', 'rgba(16,185,129,0.75)', 'rgba(245,158,11,0.75)', 'rgba(139,92,246,0.75)', 'rgba(236,72,153,0.75)'];
      return {
        label: `Tahun ${yr}`,
        data: activeCats.map(cat => {
          let sum = 0;
          data.filter(d => d.year === yr).forEach(d => {
            (d.expenses || []).forEach(e => {
              if ((e.category || 'Lain-lain').trim().toLowerCase() === cat.trim().toLowerCase()) {
                sum += (e.amount || 0);
              }
            });
          });
          return sum;
        }),
        backgroundColor: bgColors[idx % bgColors.length],
        borderColor: colors[idx % colors.length],
        borderWidth: 1.5,
        borderRadius: 4
      };
    });

    const imgCat = await renderChartToPng({
      type: 'bar',
      width: 860,
      height: 440,
      titleText: 'Perbandingan Pengeluaran per Kategori Tiap Tahun',
      data: {
        labels: activeCats,
        datasets: catDatasets
      },
      options: {
        indexAxis: 'y',
        plugins: { legend: { position: 'top' } },
        scales: {
          x: {
            ticks: {
              callback: v => 'Rp ' + (v / 1000000).toFixed(0) + ' jt'
            }
          }
        }
      }
    });

    return { imgDash, imgInc, imgCat };
  } catch (err) {
    console.warn('Could not generate chart images for Excel:', err);
    return null;
  }
}

export async function generateExcelWorkbook(monthlyData) {
  const data = recalculateAllMonths(monthlyData);
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Laporan Keuangan PUK PT SAI';
  wb.created = new Date();

  // Color Styles
  const navyFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1B365D' }
  };
  const thFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2C3E50' }
  };
  const zebraFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF8FAFC' }
  };
  const whiteFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFFFFF' }
  };
  const totalFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE2E8F0' }
  };

  const borderThin = {
    top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
    left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
    bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
    right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
  };

  const borderDoubleBottom = {
    top: { style: 'thin', color: { argb: 'FF94A3B8' } },
    bottom: { style: 'double', color: { argb: 'FF1E293B' } },
    left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
    right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
  };

  const numFmtRp = '_("Rp"* #,##0_);_("Rp"* (#,##0);_("Rp"* "-"_);_(@_)';

  // Extract years
  const years = Array.from(new Set(data.map(d => d.year))).sort((a, b) => a - b);
  if (years.length === 0) years.push(2024);

  // Generate chart images
  const chartImages = await createExcelChartImages(data, years);

  // ==========================================
  // SHEET 1: Dashboard_Tahunan
  // ==========================================
  const wsDash = wb.addWorksheet('Dashboard_Tahunan', {
    views: [{ showGridLines: false }],
    properties: { tabColor: { argb: 'FF1B365D' } }
  });

  wsDash.columns = [
    { width: 4 },   // A
    { width: 22 },  // B: Indikator / Tahun
    { width: 20 },  // C: Saldo Awal
    { width: 20 },  // D: Pemasukan
    { width: 20 },  // E: Pengeluaran
    { width: 20 },  // F: Saldo Akhir
    { width: 20 }   // G: Surplus/Defisit
  ];

  // Header Banner
  wsDash.mergeCells('A1:G2');
  const dashTitle = wsDash.getCell('A1');
  dashTitle.value = 'EXECUTIVE SUMMARY — LAPORAN KEUANGAN PUK';
  dashTitle.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  dashTitle.fill = navyFill;
  dashTitle.alignment = { vertical: 'middle', horizontal: 'center' };

  wsDash.mergeCells('A3:G3');
  const dashSub = wsDash.getCell('A3');
  dashSub.value = 'Rekapitulasi Keuangan Per Tahun & Total Saldo Berjalan';
  dashSub.font = { name: 'Arial', size: 9, italic: true, color: { argb: 'FFCBD5E1' } };
  dashSub.fill = navyFill;
  dashSub.alignment = { vertical: 'middle', horizontal: 'center' };

  // Summary Table Header
  const summaryHeaders = ['No', 'Tahun', 'Saldo Awal (Rp)', 'Total Pemasukan (Rp)', 'Total Pengeluaran (Rp)', 'Saldo Akhir (Rp)', 'Surplus/Defisit (Rp)'];
  const row4 = wsDash.getRow(5);
  summaryHeaders.forEach((h, i) => {
    const cell = row4.getCell(i + 1);
    cell.value = h;
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = thFill;
    cell.alignment = { vertical: 'middle', horizontal: i <= 1 ? 'center' : 'right' };
    cell.border = borderThin;
  });

  let curRow = 6;
  years.forEach((yr, idx) => {
    const yearMonths = data.filter(d => d.year === yr);
    const saldoAwal = yearMonths.length > 0 ? yearMonths[0].saldoAwal : 0;
    const totPemasukan = yearMonths.reduce((s, d) => s + d.pemasukan, 0);
    const totPengeluaran = yearMonths.reduce((s, d) => s + d.totalPengeluaran, 0);
    const saldoAkhir = yearMonths.length > 0 ? yearMonths[yearMonths.length - 1].saldoAkhir : 0;
    const surplus = totPemasukan - totPengeluaran;

    const r = wsDash.getRow(curRow);
    r.getCell(1).value = idx + 1;
    r.getCell(2).value = yr;
    r.getCell(3).value = saldoAwal;
    r.getCell(4).value = totPemasukan;
    r.getCell(5).value = totPengeluaran;
    r.getCell(6).value = saldoAkhir;
    r.getCell(7).value = surplus;

    for (let c = 1; c <= 7; c++) {
      const cell = r.getCell(c);
      cell.fill = idx % 2 === 0 ? zebraFill : whiteFill;
      cell.border = borderThin;
      cell.font = { name: 'Arial', size: 10 };
      if (c === 1 || c === 2) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        if (c === 2) cell.font = { name: 'Arial', size: 10, bold: true };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
        cell.numFmt = numFmtRp;
      }
    }
    curRow++;
  });

  // Total Row in Dashboard
  const rTot = wsDash.getRow(curRow);
  rTot.getCell(1).value = '';
  rTot.getCell(2).value = 'TOTAL KESELURUHAN';
  rTot.getCell(3).value = data.length > 0 ? data[0].saldoAwal : 0;
  rTot.getCell(4).value = { formula: `SUM(D6:D${curRow - 1})` };
  rTot.getCell(5).value = { formula: `SUM(E6:E${curRow - 1})` };
  rTot.getCell(6).value = data.length > 0 ? data[data.length - 1].saldoAkhir : 0;
  rTot.getCell(7).value = { formula: `D${curRow}-E${curRow}` };

  for (let c = 1; c <= 7; c++) {
    const cell = rTot.getCell(c);
    cell.fill = totalFill;
    cell.font = { name: 'Arial', size: 10, bold: true };
    cell.border = borderDoubleBottom;
    if (c >= 3) {
      cell.alignment = { vertical: 'middle', horizontal: 'right' };
      cell.numFmt = numFmtRp;
    } else {
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    }
  }

  // Embed Chart Image to Dashboard Sheet
  if (chartImages?.imgDash) {
    const imgId = wb.addImage({
      base64: chartImages.imgDash,
      extension: 'png'
    });
    wsDash.addImage(imgId, {
      tl: { col: 1, row: curRow + 2 },
      ext: { width: 720, height: 350 }
    });
  }

  // ==========================================
  // SHEET 2: Laporan_Bulanan
  // ==========================================
  const wsMonth = wb.addWorksheet('Laporan_Bulanan', {
    views: [{ showGridLines: false }],
    properties: { tabColor: { argb: 'FF27AE60' } }
  });

  wsMonth.columns = [
    { width: 4 },   // A
    { width: 14 },  // B: Periode
    { width: 16 },  // C: Bulan
    { width: 10 },  // D: Tahun
    { width: 18 },  // E: Saldo Awal
    { width: 18 },  // F: Pemasukan
    { width: 18 },  // G: Pengeluaran
    { width: 18 },  // H: Saldo Akhir
    { width: 18 }   // I: Surplus/Defisit
  ];

  wsMonth.mergeCells('A1:I2');
  const mTitle = wsMonth.getCell('A1');
  mTitle.value = 'BUKU KAS & LAPORAN BULANAN PUK';
  mTitle.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  mTitle.fill = navyFill;
  mTitle.alignment = { vertical: 'middle', horizontal: 'center' };

  wsMonth.mergeCells('A3:I3');
  const mSub = wsMonth.getCell('A3');
  mSub.value = 'Rincian Arus Kas Masuk, Keluar, dan Saldo Berjalan Tiap Bulan';
  mSub.font = { name: 'Arial', size: 9, italic: true, color: { argb: 'FFCBD5E1' } };
  mSub.fill = navyFill;
  mSub.alignment = { vertical: 'middle', horizontal: 'center' };

  const mHeaders = ['No', 'Periode', 'Bulan', 'Tahun', 'Saldo Awal (Rp)', 'Total Pemasukan (Rp)', 'Total Pengeluaran (Rp)', 'Saldo Akhir (Rp)', 'Surplus/Defisit (Rp)'];
  const mHeadRow = wsMonth.getRow(5);
  mHeaders.forEach((h, i) => {
    const cell = mHeadRow.getCell(i + 1);
    cell.value = h;
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = thFill;
    cell.alignment = { vertical: 'middle', horizontal: i <= 3 ? 'center' : 'right' };
    cell.border = borderThin;
  });

  let mRow = 6;
  data.forEach((d, idx) => {
    const r = wsMonth.getRow(mRow);
    r.getCell(1).value = idx + 1;
    r.getCell(2).value = d.period;
    r.getCell(3).value = d.month;
    r.getCell(4).value = d.year;
    r.getCell(5).value = idx === 0 ? d.saldoAwal : { formula: `H${mRow - 1}` };
    r.getCell(6).value = d.pemasukan;
    r.getCell(7).value = { formula: `SUMIFS(Data_Transaksi!$I:$I, Data_Transaksi!$B:$B, $B${mRow}, Data_Transaksi!$H:$H, "Pengeluaran")` };
    r.getCell(8).value = { formula: `E${mRow}+F${mRow}-G${mRow}` };
    r.getCell(9).value = { formula: `F${mRow}-G${mRow}` };

    for (let c = 1; c <= 9; c++) {
      const cell = r.getCell(c);
      cell.fill = idx % 2 === 0 ? zebraFill : whiteFill;
      cell.border = borderThin;
      cell.font = { name: 'Arial', size: 10 };
      if (c <= 4) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
        cell.numFmt = numFmtRp;
      }
    }
    mRow++;
  });

  // Total Row Laporan Bulanan
  const mTotRow = wsMonth.getRow(mRow);
  mTotRow.getCell(1).value = '';
  mTotRow.getCell(2).value = 'TOTAL';
  mTotRow.getCell(5).value = data.length > 0 ? data[0].saldoAwal : 0;
  mTotRow.getCell(6).value = { formula: `SUM(F6:F${mRow - 1})` };
  mTotRow.getCell(7).value = { formula: `SUM(G6:G${mRow - 1})` };
  mTotRow.getCell(8).value = { formula: `H${mRow - 1}` };
  mTotRow.getCell(9).value = { formula: `F${mRow}-G${mRow}` };

  for (let c = 1; c <= 9; c++) {
    const cell = mTotRow.getCell(c);
    cell.fill = totalFill;
    cell.font = { name: 'Arial', size: 10, bold: true };
    cell.border = borderDoubleBottom;
    if (c >= 5) {
      cell.alignment = { vertical: 'middle', horizontal: 'right' };
      cell.numFmt = numFmtRp;
    } else {
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    }
  }

  // ==========================================
  // SHEET 3: Data_Transaksi
  // ==========================================
  const wsTx = wb.addWorksheet('Data_Transaksi', {
    views: [{ showGridLines: false }],
    properties: { tabColor: { argb: 'FF2980B9' } }
  });

  wsTx.columns = [
    { width: 4 },   // A: Space
    { width: 12 },  // B: Periode
    { width: 10 },  // C: Tahun
    { width: 14 },  // D: Bulan
    { width: 6 },   // E: No
    { width: 45 },  // F: Nama Transaksi
    { width: 26 },  // G: Kategori
    { width: 14 },  // H: Tipe
    { width: 18 }   // I: Nominal
  ];

  wsTx.mergeCells('A1:I2');
  const txTitle = wsTx.getCell('A1');
  txTitle.value = 'DATA DETAIL TRANSAKSI KEUANGAN PUK';
  txTitle.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  txTitle.fill = navyFill;
  txTitle.alignment = { vertical: 'middle', horizontal: 'center' };

  const txHeaders = ['No', 'Periode', 'Tahun', 'Bulan', 'Item', 'Nama Transaksi', 'Kategori', 'Tipe', 'Nominal (Rp)'];
  const txHeadRow = wsTx.getRow(4);
  txHeaders.forEach((h, i) => {
    const cell = txHeadRow.getCell(i + 1);
    cell.value = h;
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = thFill;
    cell.alignment = { vertical: 'middle', horizontal: i <= 4 || i === 7 ? 'center' : (i === 8 ? 'right' : 'left') };
    cell.border = borderThin;
  });

  let txRow = 5;
  let globalTxNo = 1;

  data.forEach((d) => {
    // 1. Pemasukan row
    if (d.pemasukan > 0) {
      const r = wsTx.getRow(txRow);
      r.getCell(1).value = globalTxNo++;
      r.getCell(2).value = d.period;
      r.getCell(3).value = d.year;
      r.getCell(4).value = d.month;
      r.getCell(5).value = 1;
      r.getCell(6).value = `Pemasukan Kas ${d.month} ${d.year}`;
      r.getCell(7).value = 'Pemasukan Kas';
      r.getCell(8).value = 'Pemasukan';
      r.getCell(9).value = d.pemasukan;

      for (let c = 1; c <= 9; c++) {
        const cell = r.getCell(c);
        cell.fill = txRow % 2 === 0 ? zebraFill : whiteFill;
        cell.border = borderThin;
        cell.font = { name: 'Arial', size: 9.5 };
        if (c <= 5 || c === 8) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else if (c === 9) {
          cell.alignment = { vertical: 'middle', horizontal: 'right' };
          cell.numFmt = numFmtRp;
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        }
      }
      txRow++;
    }

    // 2. Expense rows
    (d.expenses || []).forEach((e, itemIdx) => {
      const r = wsTx.getRow(txRow);
      r.getCell(1).value = globalTxNo++;
      r.getCell(2).value = d.period;
      r.getCell(3).value = d.year;
      r.getCell(4).value = d.month;
      r.getCell(5).value = itemIdx + 1;
      r.getCell(6).value = e.name;
      r.getCell(7).value = e.category || 'Lain-lain';
      r.getCell(8).value = 'Pengeluaran';
      r.getCell(9).value = e.amount;

      for (let c = 1; c <= 9; c++) {
        const cell = r.getCell(c);
        cell.fill = txRow % 2 === 0 ? zebraFill : whiteFill;
        cell.border = borderThin;
        cell.font = { name: 'Arial', size: 9.5 };
        if (c <= 5 || c === 8) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else if (c === 9) {
          cell.alignment = { vertical: 'middle', horizontal: 'right' };
          cell.numFmt = numFmtRp;
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        }
      }
      txRow++;
    });
  });

  // ==========================================
  // SHEET 4: Rekap_Pemasukan
  // ==========================================
  const wsInc = wb.addWorksheet('Rekap_Pemasukan', {
    views: [{ showGridLines: false }],
    properties: { tabColor: { argb: 'FFD35400' } }
  });

  wsInc.columns = [
    { width: 4 },
    { width: 16 },
    ...years.map(() => ({ width: 18 })),
    { width: 22 }
  ];

  wsInc.mergeCells(1, 1, 2, years.length + 3);
  const incTitle = wsInc.getCell('A1');
  incTitle.value = 'REKAPITULASI PEMASUKAN KAS PER BULAN & PER TAHUN';
  incTitle.font = { name: 'Arial', size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
  incTitle.fill = navyFill;
  incTitle.alignment = { vertical: 'middle', horizontal: 'center' };

  const incHeaders = ['No', 'Bulan', ...years.map(y => `${y} (Rp)`), 'Total Pemasukan (Rp)'];
  const incHeadRow = wsInc.getRow(4);
  incHeaders.forEach((h, i) => {
    const cell = incHeadRow.getCell(i + 1);
    cell.value = h;
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = thFill;
    cell.alignment = { vertical: 'middle', horizontal: i <= 1 ? 'center' : 'right' };
    cell.border = borderThin;
  });

  let incRow = 5;
  MONTH_NAMES.forEach((mName, mIdx) => {
    const r = wsInc.getRow(incRow);
    r.getCell(1).value = mIdx + 1;
    r.getCell(2).value = mName;

    years.forEach((yr, yIdx) => {
      const match = data.find(d => d.year === yr && d.month.toLowerCase() === mName.toLowerCase());
      r.getCell(3 + yIdx).value = match ? match.pemasukan : 0;
    });

    const startColLetter = 'C';
    const endColLetter = String.fromCharCode(67 + years.length - 1);
    r.getCell(3 + years.length).value = { formula: `SUM(${startColLetter}${incRow}:${endColLetter}${incRow})` };

    for (let c = 1; c <= years.length + 3; c++) {
      const cell = r.getCell(c);
      cell.fill = mIdx % 2 === 0 ? zebraFill : whiteFill;
      cell.border = borderThin;
      cell.font = { name: 'Arial', size: 10 };
      if (c <= 2) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
        cell.numFmt = numFmtRp;
      }
    }
    incRow++;
  });

  // Total Pemasukan Row
  const incTot = wsInc.getRow(incRow);
  incTot.getCell(1).value = '';
  incTot.getCell(2).value = 'TOTAL PEMASUKAN';
  years.forEach((_, yIdx) => {
    const colLetter = String.fromCharCode(67 + yIdx);
    incTot.getCell(3 + yIdx).value = { formula: `SUM(${colLetter}5:${colLetter}${incRow - 1})` };
  });
  const grandTotColLetter = String.fromCharCode(67 + years.length);
  incTot.getCell(3 + years.length).value = { formula: `SUM(${grandTotColLetter}5:${grandTotColLetter}${incRow - 1})` };

  for (let c = 1; c <= years.length + 3; c++) {
    const cell = incTot.getCell(c);
    cell.fill = totalFill;
    cell.font = { name: 'Arial', size: 10, bold: true };
    cell.border = borderDoubleBottom;
    if (c >= 3) {
      cell.alignment = { vertical: 'middle', horizontal: 'right' };
      cell.numFmt = numFmtRp;
    } else {
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    }
  }

  // Embed Chart Image to Rekap Pemasukan Sheet
  if (chartImages?.imgInc) {
    const imgId = wb.addImage({
      base64: chartImages.imgInc,
      extension: 'png'
    });
    wsInc.addImage(imgId, {
      tl: { col: 1, row: incRow + 2 },
      ext: { width: 750, height: 360 }
    });
  }

  // ==========================================
  // SHEET 5: Rekap_Kategori
  // ==========================================
  const wsCat = wb.addWorksheet('Rekap_Kategori', {
    views: [{ showGridLines: false }],
    properties: { tabColor: { argb: 'FF8E44AD' } }
  });

  wsCat.columns = [
    { width: 4 },
    { width: 34 },
    ...years.map(() => ({ width: 18 })),
    { width: 22 },
    { width: 14 }
  ];

  wsCat.mergeCells(1, 1, 2, years.length + 4);
  const catTitle = wsCat.getCell('A1');
  catTitle.value = 'REKAPITULASI PENGELUARAN PER KATEGORI & PER TAHUN';
  catTitle.font = { name: 'Arial', size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
  catTitle.fill = navyFill;
  catTitle.alignment = { vertical: 'middle', horizontal: 'center' };

  const catHeaders = ['No', 'Kategori Pengeluaran', ...years.map(y => `${y} (Rp)`), 'Total Keseluruhan (Rp)', 'Kontribusi %'];
  const catHeadRow = wsCat.getRow(4);
  catHeaders.forEach((h, i) => {
    const cell = catHeadRow.getCell(i + 1);
    cell.value = h;
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = thFill;
    cell.alignment = { vertical: 'middle', horizontal: i <= 1 ? 'center' : (i === catHeaders.length - 1 ? 'center' : 'right') };
    cell.border = borderThin;
  });

  const activeCategories = CATEGORIES.filter(c => c !== 'Pemasukan Kas');
  let catRow = 5;
  const totCatRowIdx = 5 + activeCategories.length;

  activeCategories.forEach((catName, cIdx) => {
    const r = wsCat.getRow(catRow);
    r.getCell(1).value = cIdx + 1;
    r.getCell(2).value = catName;

    // Yearly sum using SUMIFS formula
    years.forEach((yr, yIdx) => {
      r.getCell(3 + yIdx).value = {
        formula: `SUMIFS(Data_Transaksi!$I:$I, Data_Transaksi!$G:$G, $B${catRow}, Data_Transaksi!$C:$C, ${yr}, Data_Transaksi!$H:$H, "Pengeluaran")`
      };
    });

    const startColLetter = 'C';
    const endColLetter = String.fromCharCode(67 + years.length - 1);
    const totalColLetter = String.fromCharCode(67 + years.length);
    r.getCell(3 + years.length).value = { formula: `SUM(${startColLetter}${catRow}:${endColLetter}${catRow})` };
    r.getCell(4 + years.length).value = { formula: `${totalColLetter}${catRow}/$${totalColLetter}$${totCatRowIdx}` };

    for (let c = 1; c <= years.length + 4; c++) {
      const cell = r.getCell(c);
      cell.fill = cIdx % 2 === 0 ? zebraFill : whiteFill;
      cell.border = borderThin;
      cell.font = { name: 'Arial', size: 10 };
      if (c === 1) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else if (c === 2) {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
        cell.font = { name: 'Arial', size: 10, bold: true };
      } else if (c === years.length + 4) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.numFmt = '0.0%';
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
        cell.numFmt = numFmtRp;
      }
    }
    catRow++;
  });

  // Category Total Row
  const catTot = wsCat.getRow(catRow);
  catTot.getCell(1).value = '';
  catTot.getCell(2).value = 'TOTAL PENGELUARAN';
  years.forEach((_, yIdx) => {
    const colLetter = String.fromCharCode(67 + yIdx);
    catTot.getCell(3 + yIdx).value = { formula: `SUM(${colLetter}5:${colLetter}${catRow - 1})` };
  });
  const catTotalColLetter = String.fromCharCode(67 + years.length);
  catTot.getCell(3 + years.length).value = { formula: `SUM(${catTotalColLetter}5:${catTotalColLetter}${catRow - 1})` };
  const catPctColLetter = String.fromCharCode(67 + years.length + 1);
  catTot.getCell(4 + years.length).value = { formula: `SUM(${catPctColLetter}5:${catPctColLetter}${catRow - 1})` };

  for (let c = 1; c <= years.length + 4; c++) {
    const cell = catTot.getCell(c);
    cell.fill = totalFill;
    cell.font = { name: 'Arial', size: 10, bold: true };
    cell.border = borderDoubleBottom;
    if (c >= 3 && c <= years.length + 3) {
      cell.alignment = { vertical: 'middle', horizontal: 'right' };
      cell.numFmt = numFmtRp;
    } else if (c === years.length + 4) {
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.numFmt = '0%';
    } else {
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
    }
  }

  // Embed Chart Image to Rekap Kategori Sheet
  if (chartImages?.imgCat) {
    const imgId = wb.addImage({
      base64: chartImages.imgCat,
      extension: 'png'
    });
    wsCat.addImage(imgId, {
      tl: { col: 1, row: catRow + 2 },
      ext: { width: 780, height: 380 }
    });
  }

  return wb;
}

export async function exportAndDownloadExcel(monthlyData, filename = 'Laporan_Keuangan_PUK.xlsx') {
  const wb = await generateExcelWorkbook(monthlyData);
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, filename);
}
