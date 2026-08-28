import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Scale, 
  ArrowUpRight, 
  ArrowDownRight,
  Calendar
} from 'lucide-react';
import { formatRp, formatShortRp } from '../utils/formatters';

export default function SummaryCards({ monthlyData, selectedYear }) {
  const filtered = selectedYear === 'all' 
    ? monthlyData 
    : monthlyData.filter(d => d.year === selectedYear);

  const totalPemasukan = filtered.reduce((s, d) => s + (d.pemasukan || 0), 0);
  const totalPengeluaran = filtered.reduce((s, d) => s + (d.totalPengeluaran || 0), 0);
  const netSurplus = totalPemasukan - totalPengeluaran;
  
  const latestSaldo = filtered.length > 0 ? filtered[filtered.length - 1].saldoAkhir : 0;
  const avgMonthlySurplus = filtered.length > 0 ? netSurplus / filtered.length : 0;
  const isPositiveSurplus = netSurplus >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
      {/* 1. Saldo Kas Berjalan */}
      <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-all border-l-4 border-l-blue-600 dark:border-l-cyan-400">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Saldo Kas Berjalan
          </span>
          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-cyan-500/10 border border-blue-200 dark:border-cyan-500/20 flex items-center justify-center text-blue-600 dark:text-cyan-400">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2 font-mono">
          {formatRp(latestSaldo)}
        </div>
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
          <Calendar className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
          <span>
            {filtered.length > 0
              ? `Posisi ${filtered[filtered.length - 1].month} ${filtered[filtered.length - 1].year}`
              : 'Tidak ada data'}
          </span>
        </div>
      </div>

      {/* 2. Total Pemasukan */}
      <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-all border-l-4 border-l-emerald-600 dark:border-l-emerald-400">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Pemasukan
          </span>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight mb-2 font-mono">
          {formatRp(totalPemasukan)}
        </div>
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-emerald-600 dark:text-emerald-300 font-semibold">
          <ArrowUpRight className="w-4 h-4" />
          <span>{filtered.length} bulan tercatat ({selectedYear === 'all' ? 'Semua Periode' : `Tahun ${selectedYear}`})</span>
        </div>
      </div>

      {/* 3. Total Pengeluaran */}
      <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-all border-l-4 border-l-rose-600 dark:border-l-rose-400">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Pengeluaran
          </span>
          <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tight mb-2 font-mono">
          {formatRp(totalPengeluaran)}
        </div>
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-rose-600 dark:text-rose-300 font-semibold">
          <ArrowDownRight className="w-4 h-4" />
          <span>Akumulasi pos pengeluaran kas</span>
        </div>
      </div>

      {/* 4. Net Surplus / Defisit */}
      <div className={`bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-all border-l-4 ${
        isPositiveSurplus ? 'border-l-teal-600 dark:border-l-cyan-400' : 'border-l-rose-600 dark:border-l-rose-500'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Net Surplus / Defisit
          </span>
          <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center ${
            isPositiveSurplus 
              ? 'bg-teal-50 dark:bg-emerald-500/10 border-teal-200 dark:border-emerald-500/20 text-teal-600 dark:text-emerald-400' 
              : 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400'
          }`}>
            <Scale className="w-5 h-5" />
          </div>
        </div>
        <div className={`text-2xl sm:text-3xl font-black tracking-tight mb-2 font-mono ${
          isPositiveSurplus ? 'text-teal-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
        }`}>
          {isPositiveSurplus ? '+' : ''}{formatRp(netSurplus)}
        </div>
        <div className="flex items-center gap-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
          <span>Rata-rata: </span>
          <span className={`font-bold font-mono ${avgMonthlySurplus >= 0 ? 'text-teal-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300'}`}>
            {avgMonthlySurplus >= 0 ? '+' : ''}{formatShortRp(avgMonthlySurplus)}/bln
          </span>
        </div>
      </div>
    </div>
  );
}
