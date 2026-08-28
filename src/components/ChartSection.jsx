import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { BarChart3, PieChart, TrendingUp, Layers } from 'lucide-react';
import { formatRp, formatShortRp } from '../utils/formatters';

// Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function ChartSection({ monthlyData, selectedYear, isDark = true }) {
  const [activeTab, setActiveTab] = useState('cashflow');

  const filtered = selectedYear === 'all'
    ? monthlyData
    : monthlyData.filter(d => d.year === selectedYear);

  const labels = filtered.map(d => `${d.month.slice(0, 3)} '${String(d.year).slice(-2)}`);
  
  const textColor = isDark ? '#94a3b8' : '#475569';
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  
  // 1. Cashflow Chart Data
  const cashflowChartData = {
    labels,
    datasets: [
      {
        type: 'bar',
        label: 'Pemasukan',
        data: filtered.map(d => d.pemasukan),
        backgroundColor: isDark ? 'rgba(52, 211, 153, 0.65)' : 'rgba(16, 185, 129, 0.85)',
        borderColor: isDark ? '#34d399' : '#059669',
        borderWidth: 1.5,
        borderRadius: 6,
        order: 2
      },
      {
        type: 'bar',
        label: 'Pengeluaran',
        data: filtered.map(d => d.totalPengeluaran),
        backgroundColor: isDark ? 'rgba(248, 113, 113, 0.65)' : 'rgba(239, 68, 68, 0.85)',
        borderColor: isDark ? '#f87171' : '#dc2626',
        borderWidth: 1.5,
        borderRadius: 6,
        order: 2
      },
      {
        type: 'line',
        label: 'Saldo Akhir Kas',
        data: filtered.map(d => d.saldoAkhir),
        borderColor: isDark ? '#22d3ee' : '#2563eb',
        backgroundColor: isDark ? '#22d3ee' : '#2563eb',
        borderWidth: 3,
        tension: 0.3,
        pointBackgroundColor: isDark ? '#22d3ee' : '#2563eb',
        pointBorderColor: isDark ? '#131b2e' : '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: false,
        order: 1
      }
    ]
  };

  const cashflowOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: textColor,
          font: { family: 'Inter', size: 12, weight: '600' },
          usePointStyle: true,
          boxWidth: 8,
          padding: 14
        }
      },
      tooltip: {
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
        titleColor: isDark ? '#f8fafc' : '#0f172a',
        bodyColor: isDark ? '#cbd5e1' : '#334155',
        borderColor: isDark ? '#334155' : '#cbd5e1',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: function(ctx) {
            return `${ctx.dataset.label}: ${formatRp(ctx.raw)}`;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: { color: textColor, font: { family: 'Inter', size: 11, weight: '600' } },
        grid: { color: gridColor }
      },
      y: {
        ticks: {
          color: textColor,
          font: { family: 'Inter', size: 11, weight: '600' },
          callback: v => formatShortRp(v)
        },
        grid: { color: gridColor }
      }
    }
  };

  // 2. Category Donut Data
  const catTotals = {};
  filtered.forEach(d => {
    (d.expenses || []).forEach(e => {
      const cat = e.category || 'Lain-lain';
      catTotals[cat] = (catTotals[cat] || 0) + (e.amount || 0);
    });
  });

  const sortedCategories = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);

  const catColors = [
    '#2563eb', '#0284c7', '#059669', '#d97706', '#dc2626',
    '#7c3aed', '#db2777', '#ea580c', '#0d9488', '#6366f1',
    '#0891b2', '#65a30d', '#ca8a04', '#475569'
  ];

  const categoryDonutData = {
    labels: sortedCategories.map(c => c[0]),
    datasets: [
      {
        data: sortedCategories.map(c => c[1]),
        backgroundColor: sortedCategories.map((_, idx) => catColors[idx % catColors.length]),
        borderColor: isDark ? '#131b2e' : '#ffffff',
        borderWidth: 2,
        hoverOffset: 6
      }
    ]
  };

  const categoryOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: textColor,
          font: { family: 'Inter', size: 11, weight: '600' },
          boxWidth: 10,
          padding: 10
        }
      },
      tooltip: {
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
        titleColor: isDark ? '#f8fafc' : '#0f172a',
        bodyColor: isDark ? '#cbd5e1' : '#334155',
        borderColor: isDark ? '#334155' : '#cbd5e1',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function(ctx) {
            const val = ctx.raw;
            const total = sortedCategories.reduce((s, c) => s + c[1], 0);
            const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
            return `${ctx.label}: ${formatRp(val)} (${pct}%)`;
          }
        }
      }
    }
  };

  // 3. Surplus / Defisit Chart Data
  const surplusData = {
    labels,
    datasets: [
      {
        label: 'Surplus / Defisit Bulanan',
        data: filtered.map(d => d.surplusDefisit),
        backgroundColor: filtered.map(d =>
          d.surplusDefisit >= 0
            ? (isDark ? 'rgba(52, 211, 153, 0.7)' : 'rgba(16, 185, 129, 0.85)')
            : (isDark ? 'rgba(248, 113, 113, 0.7)' : 'rgba(239, 68, 68, 0.85)')
        ),
        borderColor: filtered.map(d =>
          d.surplusDefisit >= 0 ? '#059669' : '#dc2626'
        ),
        borderWidth: 1.5,
        borderRadius: 4
      }
    ]
  };

  const surplusOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
        titleColor: isDark ? '#f8fafc' : '#0f172a',
        bodyColor: isDark ? '#cbd5e1' : '#334155',
        borderColor: isDark ? '#334155' : '#cbd5e1',
        borderWidth: 1,
        callbacks: {
          label: ctx => `Surplus/Defisit: ${formatRp(ctx.raw)}`
        }
      }
    },
    scales: {
      x: { ticks: { color: textColor, font: { weight: '600' } }, grid: { color: gridColor } },
      y: {
        ticks: {
          color: textColor,
          font: { weight: '600' },
          callback: v => formatShortRp(v)
        },
        grid: { color: gridColor }
      }
    }
  };

  return (
    <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 mb-8 shadow-sm">
      {/* Chart Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800 mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
            Visualisasi & Grafik Analisis
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {selectedYear === 'all' ? 'Menampilkan seluruh tren periode' : `Analisis keuangan tahun ${selectedYear}`}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('cashflow')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'cashflow'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Arus Kas & Saldo</span>
          </button>
          <button
            onClick={() => setActiveTab('category')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'category'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>Proporsi Kategori</span>
          </button>
          <button
            onClick={() => setActiveTab('surplus')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'surplus'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Surplus / Defisit</span>
          </button>
        </div>
      </div>

      {/* Main Chart Body */}
      <div className="w-full h-80 sm:h-96 relative">
        {activeTab === 'cashflow' && (
          <Bar key={`cashflow-${isDark ? 'dark' : 'light'}`} data={cashflowChartData} options={cashflowOptions} />
        )}
        {activeTab === 'category' && (
          <div className="w-full h-full flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="w-full lg:w-3/5 h-64 sm:h-full">
              <Doughnut key={`donut-${isDark ? 'dark' : 'light'}`} data={categoryDonutData} options={categoryOptions} />
            </div>
            {/* Top Categories Ranking */}
            <div className="w-full lg:w-2/5 flex flex-col gap-2.5 max-h-80 overflow-y-auto pr-1">
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Top Kategori Pengeluaran
              </h4>
              {sortedCategories.slice(0, 6).map(([cat, total], idx) => {
                const grandTotal = sortedCategories.reduce((s, c) => s + c[1], 0);
                const pct = grandTotal > 0 ? ((total / grandTotal) * 100).toFixed(1) : 0;
                return (
                  <div
                    key={cat}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: catColors[idx % catColors.length] }}
                      />
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{cat}</span>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{formatRp(total)}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 ml-1.5 font-mono">({pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {activeTab === 'surplus' && (
          <Bar key={`surplus-${isDark ? 'dark' : 'light'}`} data={surplusData} options={surplusOptions} />
        )}
      </div>
    </div>
  );
}
