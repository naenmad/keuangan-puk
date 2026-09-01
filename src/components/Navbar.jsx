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
  Sidebar as SidebarIcon,
  Lock,
  LogOut,
  ShieldCheck,
  Eye,
  RefreshCw
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
  onToggleSidebarVisibility,
  isAdmin = false,
  onOpenLoginModal,
  onLogout,
  onRefreshCloud,
  isSyncing = false
}) {
  const viewTitles = {
    dashboard: 'Dashboard & Kas',
    ai_analysis: 'Analisa AI',
    rekap_pemasukan: 'Rekap Pemasukan',
    rekap_kategori: 'Rekap Kategori',
    transaksi: 'Master Transaksi'
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 dark:bg-[#0e1626]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-3 sm:px-6 py-2.5 sm:py-3 transition-colors">
      <div className="flex items-center justify-between gap-2 max-w-7xl mx-auto">
        {/* Left: Sidebar Toggle / Hamburger + Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {/* Desktop Sidebar Toggle Button */}
          <button
            onClick={onToggleSidebarVisibility || onToggleSidebarMode}
            className="hidden md:inline-flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300/80 dark:border-slate-700 transition shrink-0 active:scale-95"
            title="Toggle Sidebar"
          >
            {sidebarMode === 'hidden' ? (
              <PanelLeftOpen className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
            ) : sidebarMode === 'compact' ? (
              <SidebarIcon className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>

          {/* Mobile Hamburger */}
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300/80 dark:border-slate-700 transition shrink-0 active:scale-95"
            title="Buka Menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="min-w-0 flex flex-col justify-center">
            <div className="flex items-center gap-1.5 min-w-0">
              <h2 className="text-xs sm:text-base font-black text-slate-900 dark:text-white leading-tight truncate">
                {viewTitles[activeView] || 'Dashboard'}
              </h2>

              {/* Status Badge */}
              {isAdmin ? (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  <span>Admin</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-medium uppercase tracking-wider bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 shrink-0">
                  <Eye className="w-2.5 h-2.5 text-slate-400" />
                  <span className="hidden xs:inline">Read</span>
                </span>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              <span>Periode: <strong className="text-slate-800 dark:text-slate-200">{selectedYear === 'all' ? 'Semua Tahun' : `Tahun ${selectedYear}`}</strong></span>
              <span>•</span>
              <span className="text-blue-600 dark:text-cyan-400 font-semibold truncate">PUK PT. SAI</span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Refresh / Sync Cloud Button */}
          {onRefreshCloud && (
            <button
              onClick={onRefreshCloud}
              disabled={isSyncing}
              title="Sinkronkan data cloud terbaru"
              className="inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300/80 dark:border-slate-700 transition shrink-0 active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-500' : ''}`} />
            </button>
          )}

          {/* Admin: Tambah Bulan */}
          {isAdmin && (
            <button
              onClick={onOpenAddMonthModal}
              title="Tambah Bulan Baru"
              className="inline-flex items-center justify-center gap-1.5 h-8 sm:h-9 px-2.5 sm:px-3.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition active:scale-95 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Tambah</span>
            </button>
          )}

          {/* Admin: Ganti File */}
          {isAdmin && (
            <button
              onClick={onOpenUploadModal}
              title="Upload atau ganti file Excel"
              className="hidden lg:inline-flex items-center justify-center gap-1.5 h-8 sm:h-9 px-3 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300/80 dark:border-slate-700 transition active:scale-95 shrink-0"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Ganti File</span>
            </button>
          )}

          {/* Unduh Excel Button (Public & Admin) */}
          <button
            onClick={onOpenDownloadModal}
            title="Download file Excel (.xlsx)"
            className="inline-flex items-center justify-center gap-1.5 h-8 sm:h-9 px-2.5 sm:px-3.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition active:scale-95 shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Unduh</span>
          </button>

          {/* Login / Logout Button */}
          {isAdmin ? (
            <button
              onClick={onLogout}
              title="Keluar dari sesi Administrator"
              className="inline-flex items-center justify-center gap-1.5 h-8 sm:h-9 px-2 sm:px-3 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/60 transition active:scale-95 shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Keluar</span>
            </button>
          ) : (
            <button
              onClick={onOpenLoginModal}
              title="Login sebagai Admin untuk mengedit data"
              className="inline-flex items-center justify-center gap-1.5 h-8 sm:h-9 px-2.5 sm:px-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition active:scale-95 shrink-0"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            title={isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
            className="inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300/80 dark:border-slate-700 transition shrink-0 active:scale-95"
          >
            {isDark ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-blue-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
