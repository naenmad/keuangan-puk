import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Layers, 
  FileSpreadsheet, 
  Search, 
  Filter,
  ListFilter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Bot
} from 'lucide-react';

import { CATEGORIES } from './data/defaultData';
import { recalculateAllMonths, formatRp } from './utils/formatters';
import { parseExcelFile } from './utils/excelParser';
import { exportAndDownloadExcel } from './utils/excelGenerator';
import { 
  pickExcelFileWithHandle, 
  saveFinancialDataToFile,
  saveToLocalStorage,
  loadFromLocalStorage,
  getActiveFileName,
  setActiveFileName
} from './utils/fileSystemSync';

import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import UploadZone from './components/UploadZone';
import SummaryCards from './components/SummaryCards';
import ChartSection from './components/ChartSection';
import MonthlyTable from './components/MonthlyTable';
import MonthlyEditorModal from './components/MonthlyEditorModal';
import DownloadDialogModal from './components/DownloadDialogModal';
import AIAnalysisSection from './components/AIAnalysisSection';
import RekapPemasukanTable from './components/RekapPemasukanTable';
import RekapKategoriTable from './components/RekapKategoriTable';
import Toast from './components/Toast';

export default function App() {
  const [monthlyData, setMonthlyData] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [fileName, setFileName] = useState('Laporan_Keuangan_PUK.xlsx');
  const [hasDirectHandle, setHasDirectHandle] = useState(false);
  const [selectedYear, setSelectedYear] = useState('all');
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' | 'ai_analysis' | 'rekap_pemasukan' | 'rekap_kategori' | 'transaksi'
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Mobile sidebar drawer state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Soothing Dark Mode / Clean Light Mode state (Controlled via Navbar)
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('neraca_theme');
    return saved === 'dark' || saved === null;
  });

  // Modals
  const [editingMonth, setEditingMonth] = useState(null);
  const [isAddMonthModalOpen, setIsAddMonthModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  // Search & Filter & Pagination in detail transactions view
  const [txSearch, setTxSearch] = useState('');
  const [txCategoryFilter, setTxCategoryFilter] = useState('all');
  const [txPageSize, setTxPageSize] = useState(25);
  const [txCurrentPage, setTxCurrentPage] = useState(1);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Toggle Theme
  const handleToggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      localStorage.setItem('neraca_theme', next ? 'dark' : 'light');
      return next;
    });
  };

  // Synchronize 'dark' class on <html> element
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [isDark]);

  // Try loading from localStorage on startup
  useEffect(() => {
    const saved = loadFromLocalStorage();
    if (saved && Array.isArray(saved) && saved.length > 0) {
      setMonthlyData(recalculateAllMonths(saved));
      setIsLoaded(true);
      setFileName(getActiveFileName() || 'Laporan_Keuangan_PUK.xlsx');
      showToast('Data sesi sebelumnya berhasil dimuat dari browser.', 'info');
    }
  }, []);

  // Save to localStorage whenever data changes
  const updateData = useCallback((newData) => {
    const recalculated = recalculateAllMonths(newData);
    setMonthlyData(recalculated);
    setIsDirty(true);
    saveToLocalStorage(recalculated);
  }, []);

  // Handle Direct Save (Ctrl+S or Save Button)
  const handleSave = useCallback(async () => {
    if (!monthlyData || monthlyData.length === 0) return;
    setIsSaving(true);
    try {
      const result = await saveFinancialDataToFile(monthlyData);
      setIsDirty(false);
      if (result.method === 'direct_write') {
        showToast(`Perubahan berhasil disimpan langsung ke file "${result.filename}" di disk!`, 'success');
      } else {
        showToast(`File Excel "${result.filename}" berhasil diunduh dan disinkronkan!`, 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan file: ' + err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  }, [monthlyData]);

  // Keyboard shortcut Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (isLoaded) {
          handleSave();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoaded, handleSave]);

  // Handle File Upload
  const handleFileUploaded = async (file) => {
    const parsed = await parseExcelFile(file);
    setMonthlyData(parsed);
    setIsLoaded(true);
    setFileName(file.name);
    setActiveFileName(file.name);
    setHasDirectHandle(false);
    setIsDirty(false);
    saveToLocalStorage(parsed);
    showToast(`File "${file.name}" berhasil dimuat. ${parsed.length} periode bulan terbaca.`, 'success');
  };

  // Handle Pick with Native File System API
  const handlePickWithNativeHandle = async () => {
    const { file, fileHandle, fileName } = await pickExcelFileWithHandle();
    const parsed = await parseExcelFile(file);
    setMonthlyData(parsed);
    setIsLoaded(true);
    setFileName(fileName);
    setHasDirectHandle(true);
    setIsDirty(false);
    saveToLocalStorage(parsed);
    showToast(`Live Direct Sync aktif untuk "${fileName}". Anda bisa menyimpan langsung dengan Ctrl+S.`, 'success');
  };

  // Handle Download Excel with Custom Name
  const handleConfirmDownload = async (customFilename) => {
    try {
      showToast('Menyiapkan file Excel lengkap dengan grafik gambar...', 'info');
      await exportAndDownloadExcel(monthlyData, customFilename || fileName);
      showToast(`File "${customFilename}" (5 Sheet + Grafik Gambar) berhasil diunduh.`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Gagal mengekspor file: ' + err.message, 'error');
    }
  };

  // Handle Save / Edit Month
  const handleSaveMonth = (monthItem, isNew) => {
    if (isNew) {
      const next = [...monthlyData, monthItem];
      updateData(next);
      showToast(`Periode ${monthItem.month} ${monthItem.year} berhasil ditambahkan.`, 'success');
    } else {
      const next = monthlyData.map(d => d.period === monthItem.period ? monthItem : d);
      updateData(next);
      showToast(`Perubahan ${monthItem.month} ${monthItem.year} berhasil disimpan. Saldo diperbarui.`, 'success');
    }
  };

  // Handle Delete Month
  const handleDeleteMonth = (period) => {
    if (window.confirm(`Yakin ingin menghapus periode bulan ${period}?`)) {
      const next = monthlyData.filter(d => d.period !== period);
      updateData(next);
      showToast(`Periode ${period} telah dihapus. Saldo berikutnya otomatis dihitung ulang.`, 'warning');
    }
  };

  const availableYears = Array.from(new Set(monthlyData.map(d => d.year))).sort((a, b) => a - b);

  // Flattened all transactions for detail view
  const allTransactions = useMemo(() => {
    const list = [];
    monthlyData.forEach(d => {
      if (d.pemasukan > 0) {
        list.push({
          id: `${d.period}-inflow`,
          period: d.period,
          year: d.year,
          month: d.month,
          name: `Pemasukan Kas ${d.month} ${d.year}`,
          category: 'Pemasukan Kas',
          type: 'pemasukan',
          amount: d.pemasukan
        });
      }
      (d.expenses || []).forEach((e, idx) => {
        list.push({
          id: `${d.period}-exp-${idx}`,
          period: d.period,
          year: d.year,
          month: d.month,
          name: e.name,
          category: e.category || 'Lain-lain',
          type: 'pengeluaran',
          amount: e.amount
        });
      });
    });
    return list;
  }, [monthlyData]);

  const filteredTransactions = useMemo(() => {
    return allTransactions.filter(tx => {
      const matchesYear = selectedYear === 'all' || tx.year === selectedYear;
      const matchesCategory = txCategoryFilter === 'all' || tx.category === txCategoryFilter;
      const matchesSearch = txSearch === '' || 
        tx.name.toLowerCase().includes(txSearch.toLowerCase()) ||
        tx.category.toLowerCase().includes(txSearch.toLowerCase()) ||
        tx.month.toLowerCase().includes(txSearch.toLowerCase()) ||
        String(tx.year).includes(txSearch);

      return matchesYear && matchesCategory && matchesSearch;
    });
  }, [allTransactions, selectedYear, txCategoryFilter, txSearch]);

  // Transaction list pagination
  const totalTxItems = filteredTransactions.length;
  const effectiveTxPageSize = txPageSize === 'all' ? totalTxItems : txPageSize;
  const totalTxPages = txPageSize === 'all' || totalTxItems === 0 ? 1 : Math.ceil(totalTxItems / txPageSize);
  const validTxPage = Math.min(Math.max(1, txCurrentPage), totalTxPages);

  const paginatedTransactions = useMemo(() => {
    if (txPageSize === 'all') return filteredTransactions;
    const start = (validTxPage - 1) * txPageSize;
    return filteredTransactions.slice(start, start + txPageSize);
  }, [filteredTransactions, validTxPage, txPageSize]);

  const txStartDisplay = totalTxItems === 0 ? 0 : (validTxPage - 1) * effectiveTxPageSize + 1;
  const txEndDisplay = txPageSize === 'all' ? totalTxItems : Math.min(validTxPage * txPageSize, totalTxItems);

  useEffect(() => {
    setTxCurrentPage(1);
  }, [txSearch, txCategoryFilter, selectedYear, txPageSize]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0a0e1a] text-slate-900 dark:text-[#f0f2f8] transition-colors duration-200">
      {!isLoaded ? (
        /* Initial Screen: Upload Zone */
        <div className="min-h-screen flex items-center justify-center p-4">
          <UploadZone
            onFileUploaded={handleFileUploaded}
            onPickWithNativeHandle={handlePickWithNativeHandle}
          />
        </div>
      ) : (
        /* App Layout: Desktop Sidebar / Mobile Drawer + Navbar + Main Content + Footer */
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <Sidebar
            activeView={activeView}
            onSelectView={setActiveView}
            availableYears={availableYears}
            selectedYear={selectedYear}
            onSelectYear={setSelectedYear}
            fileName={fileName}
            hasDirectHandle={hasDirectHandle}
            isDirty={isDirty}
            isOpenMobile={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
          />

          {/* Main Wrapper (Offset for Desktop Sidebar only on md+) */}
          <div className="flex-1 flex flex-col md:pl-72 min-w-0">
            {/* Top Navbar */}
            <Navbar
              activeView={activeView}
              selectedYear={selectedYear}
              onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
              onOpenAddMonthModal={() => setIsAddMonthModalOpen(true)}
              onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
              onOpenUploadModal={() => setIsUploadModalOpen(true)}
              isDark={isDark}
              onToggleTheme={handleToggleTheme}
            />

            {/* Main Content Area */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              {/* View 1: Main Dashboard */}
              {activeView === 'dashboard' && (
                <>
                  <SummaryCards
                    monthlyData={monthlyData}
                    selectedYear={selectedYear}
                  />

                  <ChartSection
                    monthlyData={monthlyData}
                    selectedYear={selectedYear}
                    isDark={isDark}
                  />

                  <MonthlyTable
                    monthlyData={monthlyData}
                    selectedYear={selectedYear}
                    onEditMonth={month => setEditingMonth(month)}
                    onDeleteMonth={handleDeleteMonth}
                    onOpenAddMonthModal={() => setIsAddMonthModalOpen(true)}
                  />
                </>
              )}

              {/* View 2: Analisa AI Keuangan */}
              {activeView === 'ai_analysis' && (
                <AIAnalysisSection
                  monthlyData={monthlyData}
                  selectedYear={selectedYear}
                />
              )}

              {/* View 3: Rekap Pemasukan */}
              {activeView === 'rekap_pemasukan' && (
                <RekapPemasukanTable
                  monthlyData={monthlyData}
                  availableYears={availableYears}
                />
              )}

              {/* View 4: Rekap Kategori */}
              {activeView === 'rekap_kategori' && (
                <RekapKategoriTable
                  monthlyData={monthlyData}
                  availableYears={availableYears}
                />
              )}

              {/* View 5: Transaksi Detail Table */}
              {activeView === 'transaksi' && (
                <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 mb-8 shadow-sm overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800 mb-6">
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <FileSpreadsheet className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
                        Daftar Master Seluruh Transaksi
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                        Menampilkan {filteredTransactions.length} dari total {allTransactions.length} baris transaksi
                      </p>
                    </div>

                    {/* Search & Category Filter Controls & Page Size */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      {/* Rows selector */}
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                        <ListFilter className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                        <span className="font-semibold text-slate-600 dark:text-slate-300">Tampilkan:</span>
                        <select
                          value={txPageSize}
                          onChange={e => {
                            const v = e.target.value;
                            setTxPageSize(v === 'all' ? 'all' : parseInt(v, 10));
                          }}
                          className="bg-transparent font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                        >
                          <option value={10} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">10</option>
                          <option value={25} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">25</option>
                          <option value={50} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">50</option>
                          <option value={100} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">100</option>
                          <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Semua</option>
                        </select>
                      </div>

                      {/* Search */}
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Cari transaksi / bulan..."
                          value={txSearch}
                          onChange={e => setTxSearch(e.target.value)}
                          className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white font-medium placeholder:text-slate-400 focus:outline-none focus:border-blue-600 w-48 sm:w-60 shadow-sm"
                        />
                      </div>

                      {/* Category Filter */}
                      <select
                        value={txCategoryFilter}
                        onChange={e => setTxCategoryFilter(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:border-blue-600 shadow-sm cursor-pointer"
                      >
                        <option value="all">Semua Kategori</option>
                        <option value="Pemasukan Kas">Pemasukan Kas</option>
                        {CATEGORIES.filter(c => c !== 'Pemasukan Kas').map(cat => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto -mx-5 sm:-mx-7 px-5 sm:px-7">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-300 font-bold uppercase text-[11px] tracking-wider">
                          <th className="py-4 px-3 text-center w-12">No</th>
                          <th className="py-4 px-3 text-center">Periode</th>
                          <th className="py-4 px-4">Bulan & Tahun</th>
                          <th className="py-4 px-4">Nama Transaksi</th>
                          <th className="py-4 px-4">Kategori</th>
                          <th className="py-4 px-4 text-center">Tipe</th>
                          <th className="py-4 px-4 text-right font-mono">Nominal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-mono font-medium">
                        {paginatedTransactions.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-12 text-slate-400 font-medium font-sans text-sm">
                              Tidak ada transaksi yang cocok dengan pencarian / filter.
                            </td>
                          </tr>
                        ) : (
                          paginatedTransactions.map((tx, idx) => {
                            const isIncome = tx.type === 'pemasukan';
                            const globalIdx = txPageSize === 'all' ? idx + 1 : (validTxPage - 1) * txPageSize + idx + 1;

                            return (
                              <tr key={tx.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                <td className="py-3 px-3 text-center text-slate-400 font-sans font-semibold">{globalIdx}</td>
                                <td className="py-3 px-3 text-center text-slate-500 dark:text-slate-400 font-semibold">{tx.period}</td>
                                <td className="py-3 px-4 font-sans font-bold text-slate-800 dark:text-slate-200">{tx.month} {tx.year}</td>
                                <td className="py-3 px-4 font-sans font-bold text-slate-900 dark:text-white">{tx.name}</td>
                                <td className="py-3 px-4 font-sans">
                                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                    {tx.category}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-center font-sans">
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                      isIncome
                                        ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                                        : 'bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30'
                                    }`}
                                  >
                                    {tx.type}
                                  </span>
                                </td>
                                <td
                                  className={`py-3 px-4 text-right font-black ${
                                    isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                                  }`}
                                >
                                  {isIncome ? '+' : '-'}{formatRp(tx.amount)}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  {totalTxItems > 0 && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 mt-4 border-t border-slate-200 dark:border-slate-800">
                      <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                        Menampilkan baris <span className="font-bold text-slate-900 dark:text-white font-mono">{txStartDisplay} - {txEndDisplay}</span> dari total <span className="font-bold text-slate-900 dark:text-white font-mono">{totalTxItems}</span> transaksi
                      </div>

                      {totalTxPages > 1 && txPageSize !== 'all' && (
                        <div className="flex items-center gap-1.5 self-center sm:self-auto">
                          <button
                            onClick={() => setTxCurrentPage(1)}
                            disabled={validTxPage === 1}
                            title="Halaman Pertama"
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                          >
                            <ChevronsLeft className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setTxCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={validTxPage === 1}
                            title="Halaman Sebelumnya"
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs sm:text-sm transition"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">Sebelumnya</span>
                          </button>

                          {Array.from({ length: totalTxPages }, (_, i) => i + 1)
                            .filter(p => p === 1 || p === totalTxPages || Math.abs(p - validTxPage) <= 1)
                            .map((pageNum, idx, arr) => {
                              const prevVal = arr[idx - 1];
                              const showEllipsis = prevVal && pageNum - prevVal > 1;

                              return (
                                <React.Fragment key={pageNum}>
                                  {showEllipsis && <span className="px-1 text-slate-400 font-bold">...</span>}
                                  <button
                                    onClick={() => setTxCurrentPage(pageNum)}
                                    className={`w-8 h-8 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                                      validTxPage === pageNum
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
                            onClick={() => setTxCurrentPage(prev => Math.min(prev + 1, totalTxPages))}
                            disabled={validTxPage === totalTxPages}
                            title="Halaman Berikutnya"
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs sm:text-sm transition"
                          >
                            <span className="hidden sm:inline">Berikutnya</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setTxCurrentPage(totalTxPages)}
                            disabled={validTxPage === totalTxPages}
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
              )}

              {/* Footer */}
              <Footer />
            </main>
          </div>
        </div>
      )}

      {/* Edit Month Modal */}
      {editingMonth && (
        <MonthlyEditorModal
          isOpen={!!editingMonth}
          onClose={() => setEditingMonth(null)}
          initialData={editingMonth}
          isNew={false}
          allMonthlyData={monthlyData}
          onSaveMonth={handleSaveMonth}
        />
      )}

      {/* Add New Month Modal */}
      {isAddMonthModalOpen && (
        <MonthlyEditorModal
          isOpen={isAddMonthModalOpen}
          onClose={() => setIsAddMonthModalOpen(false)}
          initialData={null}
          isNew={true}
          allMonthlyData={monthlyData}
          onSaveMonth={handleSaveMonth}
        />
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="w-full max-w-2xl">
            <UploadZone
              onFileUploaded={handleFileUploaded}
              onPickWithNativeHandle={handlePickWithNativeHandle}
              isModal={true}
              onCloseModal={() => setIsUploadModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Floating Download Dialog Modal */}
      {isDownloadModalOpen && (
        <DownloadDialogModal
          isOpen={isDownloadModalOpen}
          onClose={() => setIsDownloadModalOpen(false)}
          defaultFilename={fileName}
          onConfirmDownload={handleConfirmDownload}
          monthlyData={monthlyData}
          selectedYear={selectedYear}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
