import React from 'react';
import { Layers } from 'lucide-react';
import { CATEGORIES } from '../data/defaultData';
import { formatRp } from '../utils/formatters';

export default function RekapKategoriTable({ monthlyData, availableYears }) {
  const years = availableYears.length > 0 ? availableYears : [2024];
  const activeCategories = CATEGORIES.filter(c => c !== 'Pemasukan Kas');

  const matrix = {};
  const yearTotals = {};
  years.forEach(yr => { yearTotals[yr] = 0; });
  let grandTotal = 0;

  activeCategories.forEach(cat => {
    matrix[cat] = {
      yearly: {},
      total: 0
    };

    years.forEach(yr => {
      let sum = 0;
      monthlyData
        .filter(d => d.year === yr)
        .forEach(d => {
          (d.expenses || []).forEach(e => {
            if ((e.category || 'Lain-lain').trim().toLowerCase() === cat.trim().toLowerCase()) {
              sum += (e.amount || 0);
            }
          });
        });

      matrix[cat].yearly[yr] = sum;
      matrix[cat].total += sum;
      yearTotals[yr] += sum;
      grandTotal += sum;
    });
  });

  return (
    <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 mb-8 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between pb-5 border-b border-slate-200 dark:border-slate-800 mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600 dark:text-purple-400" />
            Rekapitulasi Pengeluaran Per Kategori & Per Tahun
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Matriks akumulasi pengeluaran per kategori pos dan persentase kontribusi terhadap total belanja
          </p>
        </div>
      </div>

      <div className="overflow-x-auto -mx-5 sm:-mx-7 px-5 sm:px-7">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="border-b-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-300 font-bold uppercase text-[11px] tracking-wider">
              <th className="py-4 px-3 text-center w-12">No</th>
              <th className="py-4 px-4">Kategori Pengeluaran</th>
              {years.map(yr => (
                <th key={yr} className="py-4 px-4 text-right font-mono">
                  {yr} (Rp)
                </th>
              ))}
              <th className="py-4 px-4 text-right font-bold text-rose-600 dark:text-rose-400 font-mono">
                Total Keseluruhan (Rp)
              </th>
              <th className="py-4 px-4 text-center font-bold text-slate-700 dark:text-slate-300">
                Kontribusi %
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-mono font-medium">
            {activeCategories.map((cat, idx) => {
              const row = matrix[cat];
              const pct = grandTotal > 0 ? ((row.total / grandTotal) * 100).toFixed(1) : '0.0';

              return (
                <tr key={cat} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-3 text-center text-slate-400 font-sans">{idx + 1}</td>
                  <td className="py-3.5 px-4 font-sans font-bold text-slate-800 dark:text-slate-200">{cat}</td>
                  {years.map(yr => {
                    const val = row.yearly[yr] || 0;
                    return (
                      <td key={yr} className="py-3.5 px-4 text-right text-slate-600 dark:text-slate-300">
                        {val > 0 ? formatRp(val) : <span className="text-slate-300 dark:text-slate-600">-</span>}
                      </td>
                    );
                  })}
                  <td className="py-3.5 px-4 text-right font-bold text-rose-600 dark:text-rose-400">
                    {row.total > 0 ? formatRp(row.total) : <span className="text-slate-300 dark:text-slate-600">-</span>}
                  </td>
                  <td className="py-3.5 px-4 text-center text-amber-600 dark:text-amber-400 font-bold font-mono">
                    {pct}%
                  </td>
                </tr>
              );
            })}

            {/* Total Row */}
            <tr className="bg-slate-50 dark:bg-slate-900 border-t-2 border-slate-300 dark:border-slate-700 font-bold text-sm">
              <td className="py-4 px-3 text-center"></td>
              <td className="py-4 px-4 font-sans text-slate-900 dark:text-white uppercase tracking-wider text-xs font-black">
                TOTAL PENGELUARAN
              </td>
              {years.map(yr => (
                <td key={yr} className="py-4 px-4 text-right text-rose-600 dark:text-rose-400 font-black font-mono">
                  {formatRp(yearTotals[yr] || 0)}
                </td>
              ))}
              <td className="py-4 px-4 text-right text-blue-600 dark:text-cyan-400 text-base font-black font-mono">
                {formatRp(grandTotal)}
              </td>
              <td className="py-4 px-4 text-center text-slate-800 dark:text-slate-200 font-black">
                100%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
