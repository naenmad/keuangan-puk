import React, { useState, useMemo } from 'react';
import { 
  Bot, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  AlertTriangle, 
  Lightbulb, 
  PieChart,
  Copy,
  Check,
  Zap,
  Target,
  FileCheck2,
  Sliders,
  Scale,
  DollarSign,
  AlertCircle,
  Activity,
  ArrowRight
} from 'lucide-react';
import { formatRp, formatShortRp } from '../utils/formatters';

export default function AIAnalysisSection({ monthlyData = [], selectedYear }) {
  const [copied, setCopied] = useState(false);
  const [scenario, setScenario] = useState('moderate'); // 'optimistic' | 'moderate' | 'stress'

  const filtered = useMemo(() => {
    if (!Array.isArray(monthlyData)) return [];
    return selectedYear === 'all'
      ? monthlyData
      : monthlyData.filter(d => d && d.year === selectedYear);
  }, [monthlyData, selectedYear]);

  // Deep Financial Intelligence Computation
  const analysis = useMemo(() => {
    if (!filtered || filtered.length === 0) return null;

    const nMonths = filtered.length;
    const totalPemasukan = filtered.reduce((s, d) => s + (d?.pemasukan || 0), 0);
    const totalPengeluaran = filtered.reduce((s, d) => s + (d?.totalPengeluaran || 0), 0);
    const netSurplus = totalPemasukan - totalPengeluaran;
    const avgMonthlyIncome = totalPemasukan / nMonths;
    const avgMonthlyExpense = totalPengeluaran / nMonths;
    const avgMonthlySurplus = netSurplus / nMonths;
    const latestItem = filtered[filtered.length - 1];
    const latestSaldo = latestItem?.saldoAkhir || 0;

    // Financial Health & Margins
    const netMarginPct = totalPemasukan > 0 ? (netSurplus / totalPemasukan) * 100 : 0;
    const expenseRatioPct = totalPemasukan > 0 ? (totalPengeluaran / totalPemasukan) * 100 : 100;
    const savingRatePct = 100 - expenseRatioPct;
    const dailyBurnRate = avgMonthlyExpense / 30;

    // Runway (Defensive Interval Period) in Months & Days
    const runwayMonths = avgMonthlyExpense > 0 ? latestSaldo / avgMonthlyExpense : 999;
    const runwayDays = Math.round(runwayMonths * 30);

    // Surplus vs Deficit Month Count
    const surplusMonths = filtered.filter(d => (d?.surplusDefisit || 0) >= 0);
    const deficitMonths = filtered.filter(d => (d?.surplusDefisit || 0) < 0);
    const surplusMonthRatio = (surplusMonths.length / nMonths) * 100;

    // Peak Analysis (Highest & Lowest Months)
    let peakIncomeMonth = filtered[0];
    let peakExpenseMonth = filtered[0];
    let lowestExpenseMonth = filtered[0];

    filtered.forEach(d => {
      if ((d?.pemasukan || 0) > (peakIncomeMonth?.pemasukan || 0)) peakIncomeMonth = d;
      if ((d?.totalPengeluaran || 0) > (peakExpenseMonth?.totalPengeluaran || 0)) peakExpenseMonth = d;
      if ((d?.totalPengeluaran || 0) < (lowestExpenseMonth?.totalPengeluaran || 0)) lowestExpenseMonth = d;
    });

    // Category Pareto Breakdown
    const catMap = {};
    filtered.forEach(d => {
      (d?.expenses || []).forEach(e => {
        const cat = e?.category || 'Lain-lain';
        catMap[cat] = (catMap[cat] || 0) + (e?.amount || 0);
      });
    });

    const sortedCategories = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
    const topCategory = sortedCategories[0] || ['Operasional', 0];
    const topCategoryPct = totalPengeluaran > 0 ? ((topCategory[1] / totalPengeluaran) * 100).toFixed(1) : '0';
    
    // Top 3 cumulative share
    const top3Sum = sortedCategories.slice(0, 3).reduce((s, c) => s + c[1], 0);
    const top3Pct = totalPengeluaran > 0 ? ((top3Sum / totalPengeluaran) * 100).toFixed(1) : '0';

    // Volatility (Expense Standard Deviation)
    const expenseVariance = filtered.reduce((s, d) => s + Math.pow((d?.totalPengeluaran || 0) - avgMonthlyExpense, 2), 0) / nMonths;
    const expenseStdDev = Math.sqrt(expenseVariance);
    const volatilityPct = avgMonthlyExpense > 0 ? ((expenseStdDev / avgMonthlyExpense) * 100).toFixed(1) : '0';

    // Comprehensive Financial Scoring (0 - 100)
    let score = 50;
    if (netSurplus > 0) score += 15;
    if (netMarginPct >= 20) score += 15;
    else if (netMarginPct > 5) score += 8;
    if (runwayMonths >= 6) score += 15;
    else if (runwayMonths >= 3) score += 10;
    if (surplusMonthRatio >= 80) score += 10;
    else if (surplusMonthRatio >= 60) score += 5;
    if (volatilityPct < 30) score += 5;

    score = Math.min(Math.max(score, 15), 98);

    // Audit Status & Opinion
    let auditOpinion = 'Wajar dengan Pengawasan';
    let healthStatus = 'Kondisi Kas Stabil';
    let statusTheme = 'blue';

    if (score >= 85) {
      auditOpinion = 'Wajar Tanpa Pengecualian (Sangat Prima)';
      healthStatus = 'Struktur Kas Sangat Sehat & Mandiri';
      statusTheme = 'emerald';
    } else if (score >= 70) {
      auditOpinion = 'Wajar & Terkendali (Sehat)';
      healthStatus = 'Arus Kas Positif & Berkelanjutan';
      statusTheme = 'teal';
    } else if (score < 55) {
      auditOpinion = 'Perhatian Khusus (Defisit Risiko Tinggi)';
      healthStatus = 'Perlu Pengetatan Efisiensi Anggaran';
      statusTheme = 'rose';
    }

    // Stress Testing Simulation Models
    const scenarios = {
      optimistic: {
        title: 'Skenario Optimis (Iuran Naik 15% & Efisiensi Belanja 10%)',
        desc: 'Simulasi jika organisasi melakukan optimasi iuran dan rasionalisasi pos konsumsi/operasional.',
        projectedMonthlySurplus: (avgMonthlyIncome * 1.15) - (avgMonthlyExpense * 0.9),
        runway: 'Sangat Panjang (> 24 Bulan)',
        riskLevel: 'Rendah (Sangat Aman)'
      },
      moderate: {
        title: 'Skenario Berjalan / Moderat (Tren Historis Saat Ini)',
        desc: 'Proyeksi arus kas jika pemasukan dan pola pengeluaran berjalan sesuai rata-rata yang ada.',
        projectedMonthlySurplus: avgMonthlySurplus,
        runway: `${runwayMonths.toFixed(1)} Bulan (${runwayDays} Hari)`,
        riskLevel: runwayMonths >= 6 ? 'Rendah' : runwayMonths >= 3 ? 'Sedang' : 'Tinggi'
      },
      stress: {
        title: 'Skenario Krisis Advokasi / Mogok (Pemasukan -30% & Biaya +50%)',
        desc: 'Uji ketahanan likuiditas jika terjadi sengketa ketenagakerjaan atau advokasi hukum mendadak.',
        projectedMonthlySurplus: (avgMonthlyIncome * 0.7) - (avgMonthlyExpense * 1.5),
        runway: avgMonthlyExpense > 0 ? (latestSaldo / (avgMonthlyExpense * 1.5)).toFixed(1) + ' Bulan' : '0 Bulan',
        riskLevel: 'Tinggi (Kritis)'
      }
    };

    // Actionable Executive Recommendations (Categorized)
    const recommendations = [
      {
        category: 'Likuiditas & Cadangan Kas',
        priority: 'Tinggi',
        action: `Bentuk Rekening Dana Cadangan Abadi Organisasi sebesar ${formatRp(avgMonthlyExpense * 3)} (setara 3 bulan operasional penuh) yang dipisahkan dari pos kas harian untuk perlindungan likuiditas darurat.`
      },
      {
        category: 'Optimasi Pos Pengeluaran',
        priority: topCategoryPct > 40 ? 'Tinggi' : 'Sedang',
        action: `Terapkan standarisasi plafon (budget cap) pada pos "${topCategory[0]}" yang saat ini menyerap ${topCategoryPct}% (${formatRp(topCategory[1])}) dari total pengeluaran kas.`
      },
      {
        category: 'Kebijakan Pengelolaan Iuran',
        priority: 'Sedang',
        action: `Pertahankan surplus bulanan rata-rata di atas ${formatRp(avgMonthlyIncome * 0.15)} (15% dari pemasukan) untuk memperkuat kapasitas modal sosial dan advokasi anggota.`
      },
      {
        category: 'Audit & Akuntabilitas Berkala',
        priority: 'Rutin',
        action: `Lakukan rekonsiliasi berkala dengan fitur Live Sync Excel setiap akhir bulan untuk memastikan saldo buku fisik dan digital selalu selaras 100%.`
      }
    ];

    return {
      nMonths,
      totalPemasukan,
      totalPengeluaran,
      netSurplus,
      avgMonthlyIncome,
      avgMonthlyExpense,
      avgMonthlySurplus,
      latestSaldo,
      latestPeriod: `${latestItem?.month || ''} ${latestItem?.year || ''}`,
      netMarginPct: netMarginPct.toFixed(1),
      expenseRatioPct: expenseRatioPct.toFixed(1),
      savingRatePct: savingRatePct.toFixed(1),
      dailyBurnRate,
      runwayMonths: runwayMonths.toFixed(1),
      runwayDays,
      surplusMonthsCount: surplusMonths.length,
      deficitMonthsCount: deficitMonths.length,
      surplusMonthRatio: surplusMonthRatio.toFixed(0),
      peakIncomeMonth,
      peakExpenseMonth,
      lowestExpenseMonth,
      sortedCategories,
      topCategory,
      topCategoryPct,
      top3Pct,
      volatilityPct,
      score,
      auditOpinion,
      healthStatus,
      statusTheme,
      scenarios,
      recommendations
    };
  }, [filtered]);

  // Copy Executive Report to Clipboard
  const handleCopySummary = () => {
    if (!analysis) return;
    const report = `=====================================================
LAPORAN EKSEKUTIF ANALISA KEUANGAN PUK PT SAI (AI INTELLIGENCE)
Periode Analisis: ${selectedYear === 'all' ? 'Seluruh Periode (2023 - 2026)' : `Tahun Buku ${selectedYear}`}
=====================================================

1. RINGKASAN AUDIT & KESEHATAN KEUANGAN
-----------------------------------------------------
• Skor Kesehatan Keuangan : ${analysis.score}/100 [${analysis.healthStatus}]
• Opini Audit Internal   : ${analysis.auditOpinion}
• Saldo Kas Terkini       : ${formatRp(analysis.latestSaldo)} (Posisi ${analysis.latestPeriod})
• Total Pemasukan Kas     : ${formatRp(analysis.totalPemasukan)} (Rata-rata: ${formatRp(analysis.avgMonthlyIncome)}/bln)
• Total Pengeluaran Kas   : ${formatRp(analysis.totalPengeluaran)} (Rata-rata: ${formatRp(analysis.avgMonthlyExpense)}/bln)
• Net Akumulasi Surplus   : ${analysis.netSurplus >= 0 ? '+' : ''}${formatRp(analysis.netSurplus)} (Margin: ${analysis.netMarginPct}%)
• Tingkat Retensi Kas     : ${analysis.savingRatePct}% dari total penerimaan kas

2. DIAGNOSIS LIKUIDITAS & STRUKTUR BELANJA
-----------------------------------------------------
• Ketahanan Kas (Runway)  : ±${analysis.runwayMonths} Bulan (±${analysis.runwayDays} Hari operasional tanpa pemasukan)
• Burn Rate Harian        : ${formatRp(analysis.dailyBurnRate)}/hari
• Konsistensi Surplus     : ${analysis.surplusMonthsCount} dari ${analysis.nMonths} bulan surplus (${analysis.surplusMonthRatio}%)
• Beban Belanja Utama     : "${analysis.topCategory[0]}" menyerap ${analysis.topCategoryPct}% (${formatRp(analysis.topCategory[1])})
• Konsentrasi Top 3 Biaya : ${analysis.top3Pct}% dari total anggaran kas
• Volatilitas Belanja     : ±${analysis.volatilityPct}% per bulan

3. REKOMENDASI STRATEGIS PENGURUS
-----------------------------------------------------
${analysis.recommendations.map((r, i) => `${i + 1}. [Prioritas ${r.priority}] ${r.category}: ${r.action}`).join('\n')}

=====================================================
Dihasilkan secara otomatis oleh Sistem Neraca Keuangan PUK PT SAI.
Format Excel Sync Standar Akuntansi Organisasi.
=====================================================`;

    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (!analysis) {
    return (
      <div className="bg-white dark:bg-[#131b2e] rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-sm">
        <Bot className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">Belum Ada Data untuk Dianalisis</h3>
        <p className="text-xs text-slate-400 mt-1">Silakan pilih filter tahun yang memiliki data atau unggah file laporan keuangan.</p>
      </div>
    );
  }

  const activeScenario = analysis.scenarios[scenario];

  return (
    <div className="space-y-6 mb-10 animate-fade-in">
      {/* 1. Header Hero Banner: Executive AI Intelligence */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-950/20 border border-slate-700/60 relative overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-600/30 shrink-0">
              <Bot className="w-8 h-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-blue-500/20 border border-blue-400/40 text-cyan-300">
                  AI Financial Auditor & Strategic Advisor
                </span>
                <span className="text-xs text-slate-300 font-semibold flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  {analysis.nMonths} Periode Bulan Teranalisis
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Analisa Diagnostik & Rekomendasi Eksekutif
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl font-medium">
                Audit komprehensif struktur arus kas, margin surplus, likuiditas darurat, mitigasi risiko anggaran, dan proyeksi ketahanan kas organisasi.
              </p>
            </div>
          </div>

          <button
            onClick={handleCopySummary}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm backdrop-blur-md transition-all active:scale-95 shadow-md shrink-0 self-start md:self-auto"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-300" />}
            <span>{copied ? 'Laporan Lengkap Tersalin!' : 'Salin Laporan Eksekutif (Notulen/WA)'}</span>
          </button>
        </div>
      </div>

      {/* 2. Primary Executive Scorecard (4 Metric Blocks) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Metric 1: Financial Health Score */}
        <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Skor Kesehatan Kas
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl sm:text-4xl font-black font-mono text-slate-900 dark:text-white">
              {analysis.score}
            </span>
            <span className="text-sm font-bold text-slate-400">/ 100</span>
          </div>
          <p className="text-xs font-bold text-blue-600 dark:text-cyan-400 truncate">
            {analysis.healthStatus}
          </p>
        </div>

        {/* Metric 2: Net Cash Margin & Retention */}
        <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Margin Net Surplus
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2 font-mono">
            <span className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400">
              {analysis.netMarginPct}%
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Retensi tabungan <strong className="text-slate-800 dark:text-slate-200 font-bold">{analysis.savingRatePct}%</strong> dari total kas masuk
          </p>
        </div>

        {/* Metric 3: Defensive Runway Interval */}
        <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden border-l-4 border-l-indigo-600">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Ketahanan Kas (Runway)
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2 font-mono">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              ±{analysis.runwayMonths}
            </span>
            <span className="text-sm font-bold text-slate-500">Bulan</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Mampu mendanai <strong className="text-slate-800 dark:text-slate-200 font-bold">{analysis.runwayDays} hari</strong> operasional penuh
          </p>
        </div>

        {/* Metric 4: Burn Rate & Consistency */}
        <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Konsistensi Arus Kas
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2 font-mono">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              {analysis.surplusMonthRatio}%
            </span>
            <span className="text-xs font-bold text-slate-400">Bulan Surplus</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Burn rate rata-rata <strong className="text-slate-800 dark:text-slate-200 font-bold font-mono">{formatShortRp(analysis.dailyBurnRate)}/hari</strong>
          </p>
        </div>
      </div>

      {/* 3. Deep Diagnosis Grid (Audit Findings, Cost Drivers, Peak Anomalies) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Col 1 & 2: Structural Diagnosis & Cost Driver Analysis */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Struktur & Evaluasi Pengeluaran (Pareto 80/20) */}
          <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <PieChart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    Analisis Struktur Biaya & Cost Drivers (Pareto)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Pos pengeluaran yang menyerap porsi terbesar dari keseluruhan anggaran
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Konsentrasi Top 3 Pos Belanja Terbesar:
                  </span>
                  <span className="text-xs font-black font-mono text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-500/30">
                    {analysis.top3Pct}% dari Total Pengeluaran
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex">
                  {analysis.sortedCategories.slice(0, 4).map(([cat, amount], idx) => {
                    const pct = analysis.totalPengeluaran > 0 ? (amount / analysis.totalPengeluaran) * 100 : 0;
                    const colors = ['bg-blue-600', 'bg-indigo-500', 'bg-cyan-500', 'bg-slate-400'];
                    return (
                      <div
                        key={cat}
                        title={`${cat}: ${formatRp(amount)} (${pct.toFixed(1)}%)`}
                        style={{ width: `${pct}%` }}
                        className={`${colors[idx % colors.length]} transition-all`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Top 4 Categories Detail List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {analysis.sortedCategories.slice(0, 4).map(([cat, total], idx) => {
                  const pct = analysis.totalPengeluaran > 0 ? ((total / analysis.totalPengeluaran) * 100).toFixed(1) : '0';
                  return (
                    <div
                      key={cat}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-cyan-400 shrink-0" />
                          <span className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">{cat}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 block">
                          Porsi {pct}% dari total
                        </span>
                      </div>
                      <div className="text-right font-mono font-black text-xs text-slate-900 dark:text-white shrink-0">
                        {formatRp(total)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Card: Analisis Peak, Anomali, & Volatilitas Kas */}
          <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200 dark:border-slate-800 mb-5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Deteksi Anomali & Rekor Transaksi
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Perbandingan rekor bulanan tertinggi dan tingkat fluktuasi belanja
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 font-semibold block mb-1">Pemasukan Tertinggi:</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  {analysis.peakIncomeMonth?.month} {analysis.peakIncomeMonth?.year}
                </p>
                <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm block mt-1">
                  +{formatRp(analysis.peakIncomeMonth?.pemasukan)}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 font-semibold block mb-1">Pengeluaran Tertinggi:</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  {analysis.peakExpenseMonth?.month} {analysis.peakExpenseMonth?.year}
                </p>
                <span className="font-mono font-black text-rose-600 dark:text-rose-400 text-sm block mt-1">
                  -{formatRp(analysis.peakExpenseMonth?.totalPengeluaran)}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 font-semibold block mb-1">Volatilitas Belanja:</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  ±{analysis.volatilityPct}% Fluktuasi
                </p>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">
                  {Number(analysis.volatilityPct) < 30 ? 'Pola belanja cukup stabil' : 'Perlu pengendalian variansi'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Col 3: Stress-Test Scenario Simulation & AI Recommendations */}
        <div className="space-y-6">
          {/* Stress-Test Simulation Widget */}
          <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Simulasi Skenario Kas
                </h3>
              </div>
            </div>

            {/* Scenario Switcher Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4 text-[11px] font-bold">
              <button
                onClick={() => setScenario('optimistic')}
                className={`py-1.5 rounded-lg transition-all ${
                  scenario === 'optimistic' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Optimis
              </button>
              <button
                onClick={() => setScenario('moderate')}
                className={`py-1.5 rounded-lg transition-all ${
                  scenario === 'moderate' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Moderat
              </button>
              <button
                onClick={() => setScenario('stress')}
                className={`py-1.5 rounded-lg transition-all ${
                  scenario === 'stress' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Krisis / Uji
              </button>
            </div>

            {/* Active Scenario Result Box */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
              <h4 className="font-bold text-slate-900 dark:text-white">{activeScenario.title}</h4>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">{activeScenario.desc}</p>
              
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Proyeksi Surplus/Bln:</span>
                  <span className={`font-bold ${activeScenario.projectedMonthlySurplus >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {activeScenario.projectedMonthlySurplus >= 0 ? '+' : ''}{formatShortRp(activeScenario.projectedMonthlySurplus)}/bln
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ketahanan Likuiditas:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{activeScenario.runway}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tingkat Risiko:</span>
                  <span className="font-bold text-blue-600 dark:text-cyan-400">{activeScenario.riskLevel}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Strategic Action Matrix */}
          <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Rekomendasi Manajemen Kas
              </h3>
            </div>

            <div className="space-y-3">
              {analysis.recommendations.map((rec, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{rec.category}</span>
                    <span className={`px-2 py-0.2 rounded text-[10px] font-black uppercase tracking-wider ${
                      rec.priority === 'Tinggi'
                        ? 'bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400'
                        : 'bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-cyan-400'
                    }`}>
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                    {rec.action}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
