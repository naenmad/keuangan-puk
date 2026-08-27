import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart3, 
  Table as TableIcon, 
  TrendingUp, 
  Layers, 
  FileSpreadsheet, 
  Search, 
  Filter,
  Sparkles,
  ArrowUpDown,
  Upload,
  RefreshCw,
  HardDrive
} from 'lucide-react';

import { DEFAULT_MONTHLY_SEED, CATEGORIES } from './data/defaultData';
import { recalculateAllMonths, formatRp } from './utils/formatters';
import { parseExcelFile } from './utils/excelParser';
import { exportAndDownloadExcel } from './utils/excelGenerator';
import { 
  pickExcelFileWithHandle, 
  saveFinancialDataToFile,
  saveToLocalStorage,
  loadFromLocalStorage,
  clearLocalStorage,
  getActiveFileName,
  setActiveFileName,
  getActiveFileHandle
} from './utils/fileSystemSync';

import Header from './components/Header';
import UploadZone from './components/UploadZone';
import SummaryCards from './components/SummaryCards';
import ChartSection from './components/ChartSection';
import MonthlyTable from './components/MonthlyTable';
import MonthlyEditorModal from './components/MonthlyEditorModal';
import RekapPemasukanTable from './components/RekapPemasukanTable';
import RekapKategoriTable from './components/RekapKategoriTable';
import Toast from './components/Toast';

export default function App() {
  const [monthlyData, setMonthlyData] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [fileName, setFileName] = useState('Laporan_Keuangan_PUK.xlsx');
  const [hasDirectHandle, setHasDirectHandle] = useState(false);
  const [selectedYear, setSelectedYear] = useState('all');
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' | 'rekap_pemasukan' | 'rekap_kategori' | 'transaksi'
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Modals
  const [editingMonth, setEditingMonth] = useState(null);
  const [isAddMonthModalOpen, setIsAddMonthModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Search in detail transactions view
  const [txSearch, setTxSearch] = useState('');
  const [txCategoryFilter, setTxCategoryFilter] = useState('all');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Try loading from localStorage on startup
  useEffect(() => {
    const saved = loadFromLocalStorage();
    if (saved && Array.isArray(saved) && saved.length > 0) {
      setMonthlyData(recalculateAllMonths(saved));
      setIsLoaded(true);
      setFileName(getActiveFileName() || 'Laporan_Keuangan_PUK.xlsx');
      showToast('📂 Data sesi sebelumnya berhasil dimuat dari browser.', 'info');
    }
  }, []);

  // Save to localStorage whenever data changes
  const updateData = useCallback((newData) => {
    const recalculated = recalculateAllMonths(newData);
    setMonthlyData(recalculated);
    setIsDirty(true);
    saveToLocalStorage(recalculated);
  }, []);

  // Handle Save (Ctrl+S or Button)
  const handleSave = useCallback(async () => {
    if (!monthlyData || monthlyData.length === 0) return;
    setIsSaving(true);
    try {
      const result = await saveFinancialDataToFile(monthlyData);
      setIsDirty(false);
      if (result.method === 'direct_write') {
        showToast(`💾 Perubahan berhasil disimpan langsung ke file "${result.filename}" di disk!`, 'success');
      } else {
        showToast(`📥 File Excel "${result.filename}" berhasil diunduh dan disinkronkan!`, 'success');
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
    showToast(`✅ File "${file.name}" berhasil dimuat! ${parsed.length} periode bulan terbaca.`, 'success');
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
    showToast(`⚡ Live Direct Sync aktif untuk "${fileName}". Anda bisa menyimpan langsung dengan Ctrl+S!`, 'success');
  };

  // Handle Use Default Seed Data
  const handleUseDefaultData = () => {
    const data = recalculateAllMonths(DEFAULT_MONTHLY_SEED);
    setMonthlyData(data);
    setIsLoaded(true);
    setFileName('Laporan_Keuangan_PUK.xlsx');
    setActiveFileName('Laporan_Keuangan_PUK.xlsx');
    setHasDirectHandle(false);
    setIsDirty(false);
    saveToLocalStorage(data);
    showToast('✨ Data contoh master (2023 - 2026) berhasil dimuat!', 'success');
  };

  // Handle Download Excel (.xlsx)
  const handleExportDownload = async () => {
    try {
      await exportAndDownloadExcel(monthlyData, fileName || 'Laporan_Keuangan_PUK.xlsx');
      showToast('📥 File Excel (.xlsx) 5 Sheet berhasil dibuat dan diunduh!', 'success');
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
      showToast(`✅ Periode ${monthItem.month} ${monthItem.year} berhasil ditambahkan!`, 'success');
    } else {
      const next = monthlyData.map(d => d.period === monthItem.period ? monthItem : d);
      updateData(next);
      showToast(`✅ Perubahan ${monthItem.month} ${monthItem.year} berhasil disimpan! Saldo diperbarui.`, 'success');
    }
  };

  // Handle Delete Month
  const handleDeleteMonth = (period) => {
    if (window.confirm(`Yakin ingin menghapus periode bulan ${period}?`)) {
      const next = monthlyData.filter(d => d.period !== period);
      updateData(next);
      showToast(`🗑️ Periode ${period} telah dihapus. Saldo berikutnya otomatis dihitung ulang.`, 'warning');
    }
  };

  // Available years list
  const availableYears = Array.from(new Set(monthlyData.map(d => d.year))).sort((a, b) => a - b);

  // Flattened all transactions for detail view
  const allTransactions = [];
  monthlyData.forEach(d => {
    if (d.pemasukan > 0) {
      allTransactions.push({
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
      allTransactions.push({
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

  const filteredTransactions = allTransactions.filter(tx => {
    const matchesYear = selectedYear === 'all' || tx.year === selectedYear;
    const matchesCategory = txCategoryFilter === 'all' || tx.category === txCategoryFilter;
    const matchesSearch = txSearch === '' || 
      tx.name.toLowerCase().includes(txSearch.toLowerCase()) ||
      tx.category.toLowerCase().includes(txSearch.toLowerCase()) ||
      tx.month.toLowerCase().includes(txSearch.toLowerCase()) ||
      String(tx.year).includes(txSearch);

    return matchesYear && matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background text-[#f0f2f8] selection:bg-accentBlue selection:text-white pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {!isLoaded ? (
          /* Initial Screen: Upload Zone */
          <div className="py-12 flex flex-col items-center justify-center">
            <UploadZone
              onFileUploaded={handleFileUploaded}
              onPickWithNativeHandle={handlePickWithNativeHandle}
              onUseDefaultData={handleUseDefaultData}
            />
          </div>
        ) : (
          /* Main Dashboard & Editor Screen */
          <>
            <Header
              fileName={fileName}
              hasDirectHandle={hasDirectHandle}
              isDirty={isDirty}
              isSaving={isSaving}
              onSave={handleSave}
              onExportDownload={handleExportDownload}
              onOpenUploadModal={() => setIsUploadModalOpen(true)}
              onOpenAddMonthModal={() => setIsAddMonthModalOpen(true)}
              availableYears={availableYears}
              selectedYear={selectedYear}
              onSelectYear={setSelectedYear}
            />

            {/* Navigation Tabs (Dashboard / Rekap Pemasukan / Rekap Kategori / Transaksi) */}
            <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 border-b border-borderCustom/40">
              <button
                onClick={() => setActiveView('dashboard')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
                  activeView === 'dashboard'
                    ? 'bg-accentBlue text-white shadow-lg shadow-accentBlue/25 ring-1 ring-accentBlue/50'
                    : 'bg-surface/60 text-slate-400 hover:text-white hover:bg-surface border border-borderCustom/40'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Dashboard & Buku Kas</span>
              </button>

              <button
                onClick={() => setActiveView('rekap_pemasukan')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
                  activeView === 'rekap_pemasukan'
                    ? 'bg-accentBlue text-white shadow-lg shadow-accentBlue/25 ring-1 ring-accentBlue/50'
                    : 'bg-surface/60 text-slate-400 hover:text-white hover:bg-surface border border-borderCustom/40'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Rekap Pemasukan</span>
              </button>

              <button
                onClick={() => setActiveView('rekap_kategori')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
                  activeView === 'rekap_kategori'
                    ? 'bg-accentBlue text-white shadow-lg shadow-accentBlue/25 ring-1 ring-accentBlue/50'
                    : 'bg-surface/60 text-slate-400 hover:text-white hover:bg-surface border border-borderCustom/40'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Rekap Kategori</span>
              </button>

              <button
                onClick={() => setActiveView('transaksi')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
                  activeView === 'transaksi'
                    ? 'bg-accentBlue text-white shadow-lg shadow-accentBlue/25 ring-1 ring-accentBlue/50'
                    : 'bg-surface/60 text-slate-400 hover:text-white hover:bg-surface border border-borderCustom/40'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Semua Data Transaksi ({allTransactions.length})</span>
              </button>
            </div>

            {/* View 1: Main Dashboard (KPI Cards + Charts + Monthly Table) */}
            {activeView === 'dashboard' && (
              <>
                <SummaryCards
                  monthlyData={monthlyData}
                  selectedYear={selectedYear}
                />

                <ChartSection
                  monthlyData={monthlyData}
                  selectedYear={selectedYear}
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

            {/* View 2: Rekap Pemasukan */}
            {activeView === 'rekap_pemasukan' && (
              <RekapPemasukanTable
                monthlyData={monthlyData}
                availableYears={availableYears}
              />
            )}

            {/* View 3: Rekap Kategori */}
            {activeView === 'rekap_kategori' && (
              <RekapKategoriTable
                monthlyData={monthlyData}
                availableYears={availableYears}
              />
            )}

            {/* View 4: Transaksi Detail Table with Search & Filter */}
            {activeView === 'transaksi' && (
              <div className="glass-panel rounded-3xl p-5 sm:p-7 mb-8 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-borderCustom/40 mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <FileSpreadsheet className="w-5 h-5 text-accentCyan" />
                      Daftar Master Seluruh Transaksi
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Menampilkan {filteredTransactions.length} dari total {allTransactions.length} baris transaksi
                    </p>
                  </div>

                  {/* Search & Category Filter Controls */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Search */}
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Cari transaksi / bulan..."
                        value={txSearch}
                        onChange={e => setTxSearch(e.target.value)}
                        className="bg-surface border border-borderCustom rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-accentBlue w-48 sm:w-60"
                      />
                    </div>

                    {/* Category Filter */}
                    <select
                      value={txCategoryFilter}
                      onChange={e => setTxCategoryFilter(e.target.value)}
                      className="bg-surface border border-borderCustom rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-accentBlue"
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
                      <tr className="border-b border-slate-800 bg-surface/80 text-slate-400 font-semibold uppercase text-[11px] tracking-wider">
                        <th className="py-3.5 px-3 text-center w-12">No</th>
                        <th className="py-3.5 px-3 text-center">Periode</th>
                        <th className="py-3.5 px-4">Bulan & Tahun</th>
                        <th className="py-3.5 px-4">Nama Transaksi</th>
                        <th className="py-3.5 px-4">Kategori</th>
                        <th className="py-3.5 px-4 text-center">Tipe</th>
                        <th className="py-3.5 px-4 text-right">Nominal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {filteredTransactions.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-10 text-slate-500 font-medium font-sans">
                            Tidak ada transaksi yang cocok dengan pencarian / filter.
                          </td>
                        </tr>
                      ) : (
                        filteredTransactions.map((tx, idx) => {
                          const isIncome = tx.type === 'pemasukan';
                          return (
                            <tr key={tx.id || idx} className="hover:bg-slate-800/40 transition-colors">
                              <td className="py-3 px-3 text-center text-slate-500 font-sans">{idx + 1}</td>
                              <td className="py-3 px-3 text-center text-slate-400">{tx.period}</td>
                              <td className="py-3 px-4 font-sans text-slate-300">{tx.month} {tx.year}</td>
                              <td className="py-3 px-4 font-sans font-medium text-white">{tx.name}</td>
                              <td className="py-3 px-4 font-sans">
                                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                                  {tx.category}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center font-sans">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    isIncome
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  }`}
                                >
                                  {tx.type}
                                </span>
                              </td>
                              <td
                                className={`py-3 px-4 text-right font-bold ${
                                  isIncome ? 'text-emerald-400' : 'text-rose-400'
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
              </div>
            )}
          </>
        )}
      </div>

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

      {/* Upload Modal (when clicking Ganti File from header) */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="w-full max-w-2xl">
            <UploadZone
              onFileUploaded={handleFileUploaded}
              onPickWithNativeHandle={handlePickWithNativeHandle}
              onUseDefaultData={handleUseDefaultData}
              isModal={true}
              onCloseModal={() => setIsUploadModalOpen(false)}
            />
          </div>
        </div>
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
