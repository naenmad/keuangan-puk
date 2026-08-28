import React from 'react';
import { TrendingUp } from 'lucide-react';
import { MONTH_NAMES } from '../data/defaultData';
import { formatRp } from '../utils/formatters';

export default function RekapPemasukanTable({ monthlyData = [], availableYears = [] }) {
  const years = availableYears.length > 0 ? availableYears : [2024];

  const yearTotals = {};
  years.forEach(yr => {
    yearTotals[yr] = (Array.isArray(monthlyData) ? monthlyData : [])
      .filter(d => d && d.year === yr)
      .reduce((sum, d) => sum + (d?.pemasukan || 0), 0);
  });

  const grandTotal = Object.values(yearTotals).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 mb-8 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between pb-5 border-b border-slate-200 dark:border-slate-800 mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Rekapitulasi Pemasukan Kas Bulanan Antar Tahun
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Matriks perbandingan pemasukan kas dari bulan Januari hingga Desember untuk setiap tahun
          </p>
        </div>
      </div>

      <div className="overflow-x-auto -mx-5 sm:-mx-7 px-5 sm:px-7">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="border-b-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-300 font-bold uppercase text-[11px] tracking-wider">
              <th className="py-4 px-3 text-center w-12">No</th>
              <th className="py-4 px-4">Bulan</th>
              {years.map(yr => (
                <th key={yr} className="py-4 px-4 text-right font-mono">
                  {yr} (Rp)
                </th>
              ))}
              <th className="py-4 px-4 text-right font-bold text-blue-600 dark:text-cyan-400 font-mono">
                Total Pemasukan (Rp)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-mono font-medium">
            {MONTH_NAMES.map((mName, idx) => {
              let rowTotal = 0;
              return (
                <tr key={mName} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-3 text-center text-slate-400 font-sans">{idx + 1}</td>
                  <td className="py-3.5 px-4 font-sans font-bold text-slate-800 dark:text-slate-200">{mName}</td>
                  {years.map(yr => {
                    const match = (Array.isArray(monthlyData) ? monthlyData : []).find(
                      d => d && d.year === yr && String(d?.month || '').toLowerCase() === mName.toLowerCase()
                    );
                    const val = match ? (match.pemasukan || 0) : 0;
                    rowTotal += val;
                    return (
                      <td key={yr} className="py-3.5 px-4 text-right text-slate-600 dark:text-slate-300">
                        {val > 0 ? formatRp(val) : <span className="text-slate-300 dark:text-slate-600">-</span>}
                      </td>
                    );
                  })}
                  <td className="py-3.5 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                    {formatRp(rowTotal)}
                  </td>
                </tr>
              );
            })}

            {/* Total Row */}
            <tr className="bg-slate-50 dark:bg-slate-900 border-t-2 border-slate-300 dark:border-slate-700 font-bold text-sm">
              <td className="py-4 px-3 text-center"></td>
              <td className="py-4 px-4 font-sans text-slate-900 dark:text-white uppercase tracking-wider text-xs font-black">
                TOTAL PEMASUKAN
              </td>
              {years.map(yr => (
                <td key={yr} className="py-4 px-4 text-right text-emerald-600 dark:text-emerald-400 font-black font-mono">
                  {formatRp(yearTotals[yr] || 0)}
                </td>
              ))}
              <td className="py-4 px-4 text-right text-blue-600 dark:text-cyan-400 text-base font-black font-mono">
                {formatRp(grandTotal)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
