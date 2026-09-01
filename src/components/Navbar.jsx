import React from 'react';
import { 
  Menu,
  Plus, 
  Download, 
  Upload, 
  Sun, 
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Sidebar as SidebarIcon
} from 'lucide-react';

export default function Navbar({
  activeView,
  selectedYear,
  onOpenMobileMenu,
  onOpenAddMonthModal,
  onOpenDownloadModal,
  onOpenUploadModal,
  isDark,
  onToggleTheme,
  sidebarMode = 'expanded',
  onToggleSidebarMode,
  onToggleSidebarVisibility
}) {
  const viewTitles = {
    dashboard: 'Dashboard & Buku Kas',
    ai_analysis: 'Analisa AI Keuangan',
    rekap_pemasukan: 'Rekapitulasi Pemasukan Kas',
    rekap_kategori: 'Rekapitulasi Kategori Pengeluaran',
    transaksi: 'Daftar Master Transaksi'
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 dark:bg-[#0e1626]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 lg:px-8 py-3.5 transition-colors">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Sidebar Toggle & Mobile Hamburger + Title */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Desktop Sidebar Toggle Button */}
          <button
            onClick={onToggleSidebarVisibility || onToggleSidebarMode}
            className="hidden md:inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition shrink-0 active:scale-95"
            title={sidebarMode === 'hidden' ? "Tampilkan Sidebar" : sidebarMode === 'compact' ? "Perluas Sidebar" : "Perkecil/Sembunyikan Sidebar"}
          >
            {sidebarMode === 'hidden' ? (
              <PanelLeftOpen className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
            ) : sidebarMode === 'compact' ? (
              <SidebarIcon className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
            ) : (
              <PanelLeftClose className="w-5 h-5" />
            )}
          </button>

          {/* Mobile Hamburger */}
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition shrink-0 active:scale-95"
            title="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight truncate">
              {viewTitles[activeView] || 'Dashboard'}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>Periode: <strong className="text-slate-800 dark:text-slate-200">{selectedYear === 'all' ? 'Semua Tahun' : `Tahun ${selectedYear}`}</strong></span>
              <span>•</span>
              <span className="hidden sm:inline text-blue-600 dark:text-cyan-400 font-semibold">Live Excel Sync</span>
            </div>
          </div>
        </div>

        {/* Right: Actions & Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* 1. Tambah Bulan Button */}
          <button
            onClick={onOpenAddMonthModal}
            className="inline-flex items-center justify-center gap-2 h-10 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 transition active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Tambah Bulan</span>
          </button>

          {/* 2. Unduh Excel Dialog Trigger */}
          <button
            onClick={onOpenDownloadModal}
            title="Download file Excel dengan nama kustom"
            className="inline-flex items-center justify-center gap-2 h-10 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20 transition active:scale-95 shrink-0"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Unduh Excel</span>
          </button>

          {/* 3. Upload / Ganti File Button */}
          <button
            onClick={onOpenUploadModal}
            title="Upload atau ganti file Excel"
            className="inline-flex items-center justify-center gap-2 h-10 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition active:scale-95 shrink-0"
          >
            <Upload className="w-4 h-4 shrink-0" />
            <span className="hidden xl:inline">Ganti File</span>
          </button>

          {/* 4. Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            title={isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition shrink-0 active:scale-95"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-blue-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
