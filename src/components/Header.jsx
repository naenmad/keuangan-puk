import React from 'react';
import { 
  FileSpreadsheet, 
  Save, 
  Download, 
  Upload, 
  Check, 
  HardDrive,
  Sparkles,
  Plus,
  Sun,
  Moon,
  Type
} from 'lucide-react';

export default function Header({
  fileName,
  hasDirectHandle,
  isDirty,
  isSaving,
  onSave,
  onExportDownload,
  onOpenUploadModal,
  onOpenAddMonthModal,
  availableYears,
  selectedYear,
  onSelectYear,
  isDark,
  onToggleTheme,
  isLargeFont,
  onToggleFontSize
}) {
  return (
    <header className="border-b border-slate-200 dark:border-borderCustom/60 pb-6 mb-8">
      {/* Top row: Brand + Theme Controls + File Status + Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        {/* Left: Logo & File Info */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25 ring-2 ring-white/30 shrink-0">
            <FileSpreadsheet className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Laporan Keuangan PUK
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-accentBlue/20 text-blue-800 dark:text-accentCyan border border-blue-300 dark:border-accentBlue/40">
                Excel Live Dashboard
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5 font-mono font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-surface px-2.5 py-1 rounded-lg border border-slate-300 dark:border-borderCustom">
                <HardDrive className={`w-3.5 h-3.5 ${hasDirectHandle ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`} />
                {fileName || 'Laporan_Keuangan_PUK.xlsx'}
              </span>
              <span>•</span>
              {isDirty ? (
                <span className="text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1.5 animate-pulse bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded border border-amber-200 dark:border-transparent">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Ada Perubahan Belum Disimpan
                </span>
              ) : (
                <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-transparent">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Tersimpan Sinkron
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Theme Toggle & Actions */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Accessibility Theme Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-surface p-1 rounded-xl border border-slate-300 dark:border-borderCustom">
            <button
              onClick={onToggleTheme}
              title={isDark ? 'Beralih ke Mode Terang (Ramah Orang Tua)' : 'Beralih ke Mode Gelap'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-card transition shadow-sm"
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Mode Terang</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-blue-600" />
                  <span>Mode Gelap</span>
                </>
              )}
            </button>

            <button
              onClick={onToggleFontSize}
              title={isLargeFont ? 'Ukuran Teks Normal' : 'Perbesar Ukuran Teks (Ramah Lansia)'}
              className={`p-1.5 rounded-lg text-xs font-bold transition ml-1 ${
                isLargeFont 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-card'
              }`}
            >
              <Type className="w-4 h-4" />
            </button>
          </div>

          {/* Add Month */}
          <button
            onClick={onOpenAddMonthModal}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Bulan</span>
          </button>

          {/* Save Button */}
          <button
            onClick={onSave}
            disabled={isSaving}
            title={hasDirectHandle ? 'Simpan langsung ke file di disk' : 'Simpan / Download file'}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md active:scale-95 ${
              isDirty
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-600/30 hover:brightness-110'
                : 'bg-white dark:bg-card text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-cardHover border border-slate-300 dark:border-borderCustom'
            }`}
          >
            <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
            <span>{isSaving ? 'Menyimpan...' : hasDirectHandle ? 'Simpan File (Ctrl+S)' : 'Simpan & Sync'}</span>
          </button>

          {/* Download Button (with charts included) */}
          <button
            onClick={onExportDownload}
            title="Download file Excel 5 Sheet lengkap dengan grafik gambar"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white dark:bg-surface hover:bg-slate-50 dark:hover:bg-cardHover text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-borderCustom transition-all active:scale-95 shadow-sm"
          >
            <Download className="w-4 h-4 text-blue-600 dark:text-accentCyan" />
            <span>Unduh Excel (+Grafik)</span>
          </button>

          {/* Change File */}
          <button
            onClick={onOpenUploadModal}
            title="Upload atau ganti file Excel"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white dark:bg-surface hover:bg-slate-50 dark:hover:bg-cardHover text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-borderCustom transition-all active:scale-95 shadow-sm"
          >
            <Upload className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Ganti File</span>
          </button>
        </div>
      </div>

      {/* Year Filter Navigation Bar */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200 dark:border-borderCustom/40 flex-wrap gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mr-1">
            Pilih Tahun:
          </span>
          <button
            onClick={() => onSelectYear('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              selectedYear === 'all'
                ? 'bg-blue-600 dark:bg-accentBlue text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-400/40'
                : 'bg-white dark:bg-surface text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-card border border-slate-300 dark:border-borderCustom/60 shadow-sm'
            }`}
          >
            Semua Tahun
          </button>
          {availableYears.map(yr => (
            <button
              key={yr}
              onClick={() => onSelectYear(yr)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                selectedYear === yr
                  ? 'bg-blue-600 dark:bg-accentBlue text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-400/40'
                  : 'bg-white dark:bg-surface text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-card border border-slate-300 dark:border-borderCustom/60 shadow-sm'
              }`}
            >
              {yr}
            </button>
          ))}
        </div>

        <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1.5 font-medium">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Kalkulasi saldo berjalan dan rumus otomatis terhubung</span>
        </div>
      </div>
    </header>
  );
}
