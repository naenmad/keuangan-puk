import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Layers, 
  FileSpreadsheet, 
  Calendar, 
  Check, 
  Bot, 
  X 
} from 'lucide-react';

export default function Sidebar({
  activeView,
  onSelectView,
  availableYears,
  selectedYear,
  onSelectYear,
  fileName,
  isDirty,
  isOpenMobile,
  onCloseMobile
}) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard & Buku Kas', icon: BarChart3 },
    { id: 'ai_analysis', label: 'Analisa AI Keuangan', icon: Bot, badge: 'Smart' },
    { id: 'rekap_pemasukan', label: 'Rekap Pemasukan', icon: TrendingUp },
    { id: 'rekap_kategori', label: 'Rekap Kategori', icon: Layers },
    { id: 'transaksi', label: 'Semua Data Transaksi', icon: FileSpreadsheet }
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden animate-fade-in"
        />
      )}

      {/* Sidebar Container (Fixed on Desktop, Slide-over Drawer on Mobile) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white dark:bg-[#0e1626] border-r border-slate-200 dark:border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top Section: Branding & Navigation */}
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                  Keuangan PUK
                </h1>
                <span className="text-[11px] font-semibold text-blue-600 dark:text-cyan-400">
                  Excel Live Dashboard
                </span>
              </div>
            </div>

            {/* Close Button on Mobile Drawer */}
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden transition"
              title="Tutup Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu Navigation */}
          <div className="p-4 space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 py-2">
              Menu Navigasi
            </div>
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = activeView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectView(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Year Filter Section */}
          <div className="p-4 pt-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 py-2 flex items-center justify-between">
              <span>Filter Periode</span>
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <div className="grid grid-cols-2 gap-1.5 px-1">
              <button
                onClick={() => {
                  onSelectYear('all');
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`col-span-2 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left flex items-center justify-between ${
                  selectedYear === 'all'
                    ? 'bg-slate-900 text-white dark:bg-slate-700 dark:text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <span>Semua Tahun</span>
                {selectedYear === 'all' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
              </button>

              {availableYears.map(yr => (
                <button
                  key={yr}
                  onClick={() => {
                    onSelectYear(yr);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all text-center ${
                    selectedYear === yr
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section: Active File Info */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#0a0e1a]/40">
          <div className="flex items-center gap-2 mb-1.5">
            <FileSpreadsheet className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate" title={fileName}>
              {fileName || 'Laporan_Keuangan.xlsx'}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Status File:</span>
            {isDirty ? (
              <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                Belum Disimpan
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Tersimpan
              </span>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
