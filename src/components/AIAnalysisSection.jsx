import React, { useState, useMemo } from 'react';
import { 
  Bot, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  AlertTriangle, 
  Lightbulb, 
  ArrowUpRight, 
  ArrowDownRight,
  PieChart,
  Copy,
  Check,
  RefreshCw,
  Zap,
  Target
} from 'lucide-react';
import { formatRp, formatShortRp } from '../utils/formatters';

export default function AIAnalysisSection({ monthlyData = [], selectedYear }) {
  const [copied, setCopied] = useState(false);

  const filtered = useMemo(() => {
    if (!Array.isArray(monthlyData)) return [];
    return selectedYear === 'all'
      ? monthlyData
      : monthlyData.filter(d => d && d.year === selectedYear);
  }, [monthlyData, selectedYear]);

  // AI Analytics computation
  const analysis = useMemo(() => {
    if (!filtered || filtered.length === 0) return null;

    const totalPemasukan = filtered.reduce((s, d) => s + (d?.pemasukan || 0), 0);
    const totalPengeluaran = filtered.reduce((s, d) => s + (d?.totalPengeluaran || 0), 0);
    const netSurplus = totalPemasukan - totalPengeluaran;
    const avgMonthlyIncome = totalPemasukan / filtered.length;
    const avgMonthlyExpense = totalPengeluaran / filtered.length;
    const avgMonthlySurplus = netSurplus / filtered.length;
    const latestSaldo = filtered[filtered.length - 1]?.saldoAkhir || 0;

    // Burn rate / Expense Ratio
    const expenseRatio = totalPemasukan > 0 ? (totalPengeluaran / totalPemasukan) * 100 : 100;
    const savingRate = 100 - expenseRatio;

    // Category breakdown
    const catMap = {};
    filtered.forEach(d => {
      (d?.expenses || []).forEach(e => {
        const cat = e?.category || 'Lain-lain';
        catMap[cat] = (catMap[cat] || 0) + (e?.amount || 0);
      });
    });

    const sortedCategories = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
    const topCategory = sortedCategories[0] || ['Tidak ada', 0];
    const topCategoryPct = totalPengeluaran > 0 ? ((topCategory[1] / totalPengeluaran) * 100).toFixed(1) : 0;

    // Financial Health Score Calculation (0 - 100)
    let score = 50;
    if (netSurplus > 0) score += 20;
    if (savingRate >= 20) score += 15;
    else if (savingRate > 0) score += 5;
    if (latestSaldo > avgMonthlyExpense * 3) score += 15;
    else if (latestSaldo > avgMonthlyExpense) score += 10;
    if (expenseRatio <= 75) score += 5;

    score = Math.min(Math.max(score, 10), 98);

    let healthStatus = 'Cukup Stabil';
    let healthColor = 'text-blue-500';
    let healthBg = 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20';

    if (score >= 85) {
      healthStatus = 'Sangat Sehat & Mandiri';
      healthColor = 'text-emerald-500';
      healthBg = 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20';
    } else if (score >= 70) {
      healthStatus = 'Sehat & Terkendali';
      healthColor = 'text-teal-500';
      healthBg = 'bg-teal-50 dark:bg-teal-500/10 border-teal-200 dark:border-teal-500/20';
    } else if (score < 50) {
      healthStatus = 'Perlu Evaluasi Pengeluaran';
      healthColor = 'text-amber-500';
      healthBg = 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20';
    }

    // Runway prediction
    const runwayMonths = avgMonthlyExpense > 0 ? (latestSaldo / avgMonthlyExpense).toFixed(1) : '∞';

    // 3 Month Cashflow Forecast
    const forecast = [
      { month: 'Bulan +1', expectedSaldo: latestSaldo + avgMonthlySurplus },
      { month: 'Bulan +2', expectedSaldo: latestSaldo + (avgMonthlySurplus * 2) },
      { month: 'Bulan +3', expectedSaldo: latestSaldo + (avgMonthlySurplus * 3) }
    ];

    return {
      totalPemasukan,
      totalPengeluaran,
      netSurplus,
      avgMonthlyIncome,
      avgMonthlyExpense,
      avgMonthlySurplus,
      latestSaldo,
      expenseRatio: expenseRatio.toFixed(1),
      savingRate: savingRate.toFixed(1),
      score,
      healthStatus,
      healthColor,
      healthBg,
      runwayMonths,
      sortedCategories,
      topCategory,
      topCategoryPct,
      forecast
    };
  }, [filtered]);

  const handleCopySummary = () => {
    if (!analysis) return;
    const text = `📊 RINGKASAN ANALISA KEUANGAN PUK AI
Periode: ${selectedYear === 'all' ? 'Semua Tahun' : `Tahun ${selectedYear}`}
------------------------------------------
• Skor Kesehatan Kas: ${analysis.score}/100 (${analysis.healthStatus})
• Saldo Kas Terkini: ${formatRp(analysis.latestSaldo)}
• Total Pemasukan: ${formatRp(analysis.totalPemasukan)}
• Total Pengeluaran: ${formatRp(analysis.totalPengeluaran)}
• Net Surplus Kas: ${analysis.netSurplus >= 0 ? '+' : ''}${formatRp(analysis.netSurplus)}
• Rasio Pengeluaran terhadap Pemasukan: ${analysis.expenseRatio}%
• Kategori Belanja Utama: ${analysis.topCategory[0]} (${analysis.topCategoryPct}%)
• Proyeksi Ketahanan Kas: ±${analysis.runwayMonths} bulan ke depan
------------------------------------------
Dihasilkan otomatis oleh Sistem Neraca Keuangan PUK PT SAI.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (!analysis) {
    return (
      <div className="bg-white dark:bg-[#131b2e] rounded-3xl p-8 text-center border border-slate-200 dark:border-slate-800">
        <p className="text-slate-500">Belum ada data keuangan untuk dianalisis oleh AI.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-blue-500/15 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
              <Bot className="w-8 h-8 text-cyan-200" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-md text-white border border-white/30">
                  AI Financial Intelligence
                </span>
                <span className="text-xs text-cyan-100 font-medium">
                  {selectedYear === 'all' ? 'Analisis Seluruh Data' : `Analisis Tahun ${selectedYear}`}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                Laporan & Rekomendasi Pintar AI
              </h2>
              <p className="text-xs sm:text-sm text-cyan-100 mt-1 max-w-xl">
                Evaluasi otomatis pola arus kas, efisiensi pengeluaran per kategori, dan estimasi proyeksi saldo kas berjalan.
              </p>
            </div>
          </div>

          <button
            onClick={handleCopySummary}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold text-xs sm:text-sm backdrop-blur-md transition active:scale-95 self-start md:self-auto"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Tersalin ke Clipboard!' : 'Salin Ringkasan AI'}</span>
          </button>
        </div>
      </div>

      {/* KPI Insight Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. Health Score */}
        <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Skor Kesehatan Keuangan
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="flex items-baseline gap-3 mb-3">
            <span className="text-4xl sm:text-5xl font-black font-mono text-slate-900 dark:text-white">
              {analysis.score}
            </span>
            <span className="text-base font-bold text-slate-400">/ 100</span>
          </div>

          <div className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${analysis.healthBg}`}>
            <span className={`w-2 h-2 rounded-full bg-current ${analysis.healthColor}`}></span>
            <span className={analysis.healthColor}>{analysis.healthStatus}</span>
          </div>
        </div>

        {/* 2. Expense vs Income Ratio */}
        <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Rasio Efisiensi Anggaran
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Target className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-slate-500 dark:text-slate-400">Rasio Belanja:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{analysis.expenseRatio}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full"
                  style={{ width: `${Math.min(analysis.expenseRatio, 100)}%` }}
                />
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tingkat retensi tabungan kas sebesar <strong className="text-emerald-600 dark:text-emerald-400">{analysis.savingRate}%</strong> dari total pemasukan.
            </p>
          </div>
        </div>

        {/* 3. Runway & Ketahanan Kas */}
        <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Estimasi Ketahanan Kas
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-cyan-400">
              <Zap className="w-5 h-5" />
            </div>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl sm:text-4xl font-black font-mono text-slate-900 dark:text-white">
              ±{analysis.runwayMonths}
            </span>
            <span className="text-sm font-bold text-slate-500">Bulan ke Depan</span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Berdasarkan rata-rata konsumsi kas bulanan sebesar <strong className="text-slate-800 dark:text-slate-200 font-mono">{formatShortRp(analysis.avgMonthlyExpense)}</strong>.
          </p>
        </div>
      </div>

      {/* Deep Insights & AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: AI Executive Findings */}
        <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Temuan Utama AI
          </h3>

          <div className="space-y-3 text-xs sm:text-sm">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <div className="font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span>Kestabilan Arus Kas Bulanan</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                Pemasukan kas konsisten rata-rata <strong className="text-slate-900 dark:text-white font-mono">{formatRp(analysis.avgMonthlyIncome)}</strong> per bulan, menghasilkan net akumulasi <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{formatRp(analysis.netSurplus)}</strong>.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <div className="font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                <PieChart className="w-4 h-4 text-blue-500" />
                <span>Pos Pengeluaran Terbesar</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                Pos <strong>"{analysis.topCategory[0]}"</strong> menyerap <strong className="text-rose-600 dark:text-rose-400 font-mono">{analysis.topCategoryPct}%</strong> ({formatRp(analysis.topCategory[1])}) dari total seluruh belanja kas.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Actionable Suggestions & Forecast */}
        <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            Rekomendasi Strategis & Proyeksi
          </h3>

          <div className="space-y-3 text-xs sm:text-sm">
            <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-slate-700 dark:text-slate-300">
              <span className="font-bold text-blue-700 dark:text-cyan-300 block mb-1">
                💡 Rekomendasi Alokasi Cadangan Kas:
              </span>
              Pertahankan saldo mengendap minimal 2x rata-rata pengeluaran bulanan (±{formatRp(analysis.avgMonthlyExpense * 2)}) untuk mengantisipasi agenda advokasi atau kegiatan organisasi mendadak.
            </div>

            {/* Proyeksi Saldo 3 Bulan */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span className="font-bold text-slate-800 dark:text-slate-200 block mb-2">
                📈 Proyeksi Kas 3 Bulan Mendatang (Tren Berjalan):
              </span>
              <div className="grid grid-cols-3 gap-2 text-center">
                {analysis.forecast.map((f, i) => (
                  <div key={i} className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-[11px] text-slate-400 font-semibold block">{f.month}</span>
                    <span className="text-xs font-mono font-black text-blue-600 dark:text-cyan-400">
                      {formatShortRp(f.expectedSaldo)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
