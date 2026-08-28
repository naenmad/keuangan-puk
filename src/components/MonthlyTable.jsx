import React, { useState, useMemo } from 'react';
import { 
  Table, 
  Edit3, 
  Trash2, 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Sparkles,
  ArrowRight,
  ListFilter
} from 'lucide-react';
import { formatRp } from '../utils/formatters';

export default function MonthlyTable({
  monthlyData = [],
  selectedYear,
  onEditMonth,
  onDeleteMonth,
  onOpenAddMonthModal
}) {
  const [expandedRows, setExpandedRows] = useState({});
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    if (!Array.isArray(monthlyData)) return [];
    return selectedYear === 'all'
      ? monthlyData
      : monthlyData.filter(d => d && d.year === selectedYear);
  }, [monthlyData, selectedYear]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedYear, pageSize]);

  const totalItems = filtered.length;
  const effectivePageSize = pageSize === 'all' ? totalItems : pageSize;
  const totalPages = pageSize === 'all' || totalItems === 0 ? 1 : Math.ceil(totalItems / pageSize);
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedData = useMemo(() => {
    if (pageSize === 'all') return filtered;
    const startIndex = (validCurrentPage - 1) * pageSize;
    return filtered.slice(startIndex, startIndex + pageSize);
  }, [filtered, validCurrentPage, pageSize]);

  const startIdxDisplay = totalItems === 0 ? 0 : (validCurrentPage - 1) * effectivePageSize + 1;
  const endIdxDisplay = pageSize === 'all' ? totalItems : Math.min(validCurrentPage * pageSize, totalItems);

  const toggleExpand = (period) => {
    if (!period) return;
    setExpandedRows(prev => ({
      ...prev,
      [period]: !prev[period]
    }));
  };

  return (
    <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 mb-8 shadow-sm overflow-hidden">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-cyan-400">
              <Table className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Tabel Laporan & Buku Kas Bulanan
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                Rincian saldo berjalan, pemasukan, pengeluaran, dan aksi edit per bulan
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Page size selector */}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <ListFilter className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
            <span className="font-semibold">Tampilkan:</span>
            <select
              value={pageSize}
              onChange={e => {
                const val = e.target.value;
                setPageSize(val === 'all' ? 'all' : parseInt(val, 10));
              }}
              className="bg-transparent font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
            >
              <option value={5} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">5 baris</option>
              <option value={10} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">10 baris</option>
              <option value={15} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">15 baris</option>
              <option value={25} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">25 baris</option>
              <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Semua data</option>
            </select>
          </div>

          {/* Add New Month Button */}
          <button
            onClick={onOpenAddMonthModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Bulan</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto -mx-5 sm:-mx-7 px-5 sm:px-7">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="border-b-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-300 font-bold uppercase text-[11px] tracking-wider">
              <th className="py-4 px-3 text-center w-12"></th>
              <th className="py-4 px-3 text-center">Periode</th>
              <th className="py-4 px-4">Bulan & Tahun</th>
              <th className="py-4 px-4 text-right">Saldo Awal</th>
              <th className="py-4 px-4 text-right">Pemasukan</th>
              <th className="py-4 px-4 text-right">Total Pengeluaran</th>
              <th className="py-4 px-4 text-right">Saldo Akhir</th>
              <th className="py-4 px-4 text-right">Surplus / Defisit</th>
              <th className="py-4 px-4 text-center">Aksi Edit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-medium">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-12 text-slate-400 font-medium text-sm">
                  Tidak ada data untuk filter tahun {selectedYear}.
                </td>
              </tr>
            ) : (
              paginatedData.map((d, idx) => {
                const isExpanded = !!expandedRows[d?.period];
                const isPositive = (d?.surplusDefisit || 0) >= 0;
                const expenseCount = (d?.expenses || []).length;

                return (
                  <React.Fragment key={d?.period || idx}>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                      {/* Expand Toggle */}
                      <td className="py-3.5 px-3 text-center">
                        <button
                          onClick={() => toggleExpand(d?.period)}
                          title={isExpanded ? 'Tutup rincian' : 'Lihat rincian pengeluaran'}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50 transition"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Period Badge */}
                      <td className="py-3.5 px-3 text-center font-mono font-semibold text-xs text-slate-500 dark:text-slate-400">
                        {d?.period || '-'}
                      </td>

                      {/* Month & Year */}
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white text-sm">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                              isPositive ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          <span>{d?.month || ''} {d?.year || ''}</span>
                          <span className="text-xs text-slate-400 font-normal">
                            ({expenseCount} pos)
                          </span>
                        </div>
                      </td>

                      {/* Saldo Awal */}
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-600 dark:text-slate-300">
                        {formatRp(d?.saldoAwal)}
                      </td>

                      {/* Pemasukan */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        +{formatRp(d?.pemasukan)}
                      </td>

                      {/* Pengeluaran */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                        -{formatRp(d?.totalPengeluaran)}
                      </td>

                      {/* Saldo Akhir */}
                      <td className="py-3.5 px-4 text-right font-mono font-black text-blue-600 dark:text-cyan-400 text-sm">
                        {formatRp(d?.saldoAkhir)}
                      </td>

                      {/* Surplus / Defisit */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${
                            isPositive
                              ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                              : 'bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30'
                          }`}
                        >
                          {isPositive ? '+' : ''}
                          {formatRp(d?.surplusDefisit)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onEditMonth(d)}
                            title="Edit data bulan ini"
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-600 text-blue-600 dark:text-cyan-400 hover:text-white border border-blue-200 dark:border-blue-500/20 transition-all font-semibold text-xs active:scale-95 shadow-sm"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => onDeleteMonth(d?.period)}
                            title="Hapus periode bulan ini"
                            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-600 text-rose-600 dark:text-rose-400 hover:text-white border border-rose-200 dark:border-rose-500/20 transition-all active:scale-95"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Detail Sub-row */}
                    {isExpanded && (
                      <tr className="bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800">
                        <td colSpan={9} className="p-4 sm:px-8">
                          <div className="bg-white dark:bg-[#0e1626] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200 dark:border-slate-800">
                              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400 flex items-center gap-1.5">
                                <Sparkles className="w-4 h-4 text-amber-500" />
                                Rincian Transaksi Pengeluaran ({d?.month} {d?.year})
                              </h4>
                              <button
                                onClick={() => onEditMonth(d)}
                                className="text-xs sm:text-sm text-blue-600 dark:text-cyan-400 hover:underline font-bold flex items-center gap-1"
                              >
                                <span>Edit Rincian Ini</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>

                            {(!d?.expenses || d.expenses.length === 0) ? (
                              <p className="text-xs sm:text-sm text-slate-400 italic py-2">
                                Belum ada rincian pengeluaran untuk bulan ini.
                              </p>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                {d.expenses.map((exp, eIdx) => (
                                  <div
                                    key={eIdx}
                                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs sm:text-sm"
                                  >
                                    <div className="min-w-0 pr-2">
                                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{exp?.name || 'Pos Pengeluaran'}</p>
                                      <span className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-200/80 dark:bg-slate-800 px-2 py-0.5 rounded font-semibold mt-1 inline-block border border-slate-300 dark:border-slate-700">
                                        {exp?.category || 'Lain-lain'}
                                      </span>
                                    </div>
                                    <div className="font-mono font-black text-rose-600 dark:text-rose-400 shrink-0 text-sm">
                                      -{formatRp(exp?.amount)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls Footer */}
      {totalItems > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 mt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Menampilkan data <span className="font-bold text-slate-900 dark:text-white font-mono">{startIdxDisplay} - {endIdxDisplay}</span> dari total <span className="font-bold text-slate-900 dark:text-white font-mono">{totalItems}</span> periode bulan
          </div>

          {totalPages > 1 && pageSize !== 'all' && (
            <div className="flex items-center gap-1.5 self-center sm:self-auto">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={validCurrentPage === 1}
                title="Halaman Pertama"
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={validCurrentPage === 1}
                title="Halaman Sebelumnya"
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs sm:text-sm transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Sebelumnya</span>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - validCurrentPage) <= 1)
                .map((pageNum, idx, arr) => {
                  const prevVal = arr[idx - 1];
                  const showEllipsis = prevVal && pageNum - prevVal > 1;

                  return (
                    <React.Fragment key={pageNum}>
                      {showEllipsis && <span className="px-1 text-slate-400 font-bold">...</span>}
                      <button
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                          validCurrentPage === pageNum
                            ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                            : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    </React.Fragment>
                  );
                })}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={validCurrentPage === totalPages}
                title="Halaman Berikutnya"
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs sm:text-sm transition"
              >
                <span className="hidden sm:inline">Berikutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={validCurrentPage === totalPages}
                title="Halaman Terakhir"
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
