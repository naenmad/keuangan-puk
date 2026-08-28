import React from 'react';
import { 
  Menu, 
  Plus, 
  Save, 
  Download, 
  Upload, 
  Sun, 
  Moon, 
  Type,
  Sparkles
} from 'lucide-react';

export default function Navbar({
  activeView,
  selectedYear,
  onOpenMobileMenu,
  onOpenAddMonthModal,
  onSave,
  isSaving,
  isDirty,
  hasDirectHandle,
  onExportDownload,
  onOpenUploadModal,
  isDark,
  onToggleTheme,
  isLargeFont,
  onToggleFontSize
}) {
  const viewTitles = {
    dashboard: 'Dashboard Ringkasan & Buku Kas',
    rekap_pemasukan: 'Rekapitulasi Pemasukan Kas Antar Tahun',
    rekap_kategori: 'Rekapitulasi Pengeluaran Per Kategori',
    transaksi: 'Daftar Master Seluruh Transaksi'
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#0e1626]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 lg:px-8 py-3.5 transition-colors">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden border border-slate-200 dark:border-slate-800"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight flex items-center gap-2">
              <span>{viewTitles[activeView] || 'Dashboard'}</span>
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>Periode: <strong className="text-slate-800 dark:text-slate-200">{selectedYear === 'all' ? 'Semua Tahun' : `Tahun ${selectedYear}`}</strong></span>
              <span>•</span>
              <span className="hidden sm:inline text-blue-600 dark:text-cyan-400 font-semibold">Live Excel Sync</span>
            </div>
          </div>
        </div>

        {/* Right: Actions & Theme Toggles */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Add Month */}
          <button
            onClick={onOpenAddMonthModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">Tambah Bulan</span>
          </button>

          {/* Save Button */}
          <button
            onClick={onSave}
            disabled={isSaving}
            title={hasDirectHandle ? 'Simpan langsung ke file di disk' : 'Simpan / Download file'}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-95 ${
              isDirty
                ? 'bg-blue-600 text-white shadow-blue-600/25 hover:bg-blue-700'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700'
            }`}
          >
            <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">{isSaving ? 'Menyimpan...' : hasDirectHandle ? 'Simpan (Ctrl+S)' : 'Simpan'}</span>
          </button>

          {/* Export Excel Button */}
          <button
            onClick={onExportDownload}
            title="Download file Excel 5 Sheet lengkap dengan grafik gambar"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition active:scale-95"
          >
            <Download className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
            <span className="hidden lg:inline">Unduh Excel</span>
          </button>

          {/* Upload / Switch File */}
          <button
            onClick={onOpenUploadModal}
            title="Upload atau ganti file Excel"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition active:scale-95"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden xl:inline">Ganti File</span>
          </button>

          {/* Theme & Font Controls */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={onToggleTheme}
              title={isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-blue-600" />
              )}
            </button>

            <button
              onClick={onToggleFontSize}
              title={isLargeFont ? 'Ukuran Teks Normal' : 'Perbesar Ukuran Teks (Ramah Lansia)'}
              className={`p-1.5 rounded-lg text-xs font-bold transition ml-0.5 ${
                isLargeFont 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
              }`}
            >
              <Type className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
