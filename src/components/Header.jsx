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
    <header className="border-b border-borderCustom/60 pb-6 mb-8">
      {/* Top row: Brand + Theme Controls + File Status + Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        {/* Left: Logo & File Info */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accentBlue via-indigo-600 to-accentCyan flex items-center justify-center shadow-lg shadow-accentBlue/25 ring-2 ring-white/20 shrink-0">
            <FileSpreadsheet className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Laporan Keuangan PUK
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-accentBlue/20 text-accentCyan border border-accentBlue/40">
                Excel Live Dashboard
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs sm:text-sm text-slate-400">
              <span className="flex items-center gap-1.5 font-mono font-semibold text-slate-200 bg-surface px-2.5 py-1 rounded-lg border border-borderCustom">
                <HardDrive className={`w-3.5 h-3.5 ${hasDirectHandle ? 'text-emerald-400' : 'text-slate-400'}`} />
                {fileName || 'Laporan_Keuangan_PUK.xlsx'}
              </span>
              <span>•</span>
              {isDirty ? (
                <span className="text-amber-400 font-bold flex items-center gap-1.5 animate-pulse bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/30">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  Ada Perubahan Belum Disimpan
                </span>
              ) : (
                <span className="text-emerald-400 font-bold flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/30">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Tersimpan Sinkron
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Theme Toggle & Actions */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Accessibility Theme Switcher */}
          <div className="flex items-center bg-surface p-1 rounded-xl border border-borderCustom shadow-inner">
            <button
              onClick={onToggleTheme}
              title={isDark ? 'Beralih ke Mode Hangat / Terang Lembut' : 'Beralih ke Mode Gelap Sejuk (Default)'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-200 hover:bg-cardHover transition shadow-sm"
            >
              {isDark ? (
                <>
                  <Moon className="w-4 h-4 text-accentCyan" />
                  <span>Mode Gelap Sejuk</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Mode Lembut</span>
                </>
              )}
            </button>

            <button
              onClick={onToggleFontSize}
              title={isLargeFont ? 'Ukuran Teks Normal' : 'Perbesar Ukuran Teks (Ramah Lansia)'}
              className={`p-1.5 rounded-lg text-xs font-bold transition ml-1 ${
                isLargeFont 
                  ? 'bg-accentBlue text-white shadow-sm' 
                  : 'text-slate-300 hover:bg-cardHover'
              }`}
            >
              <Type className="w-4 h-4" />
            </button>
          </div>

          {/* Add Month */}
          <button
            onClick={onOpenAddMonthModal}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/25 transition-all hover:scale-[1.02] active:scale-95"
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
                ? 'bg-gradient-to-r from-accentBlue to-accentCyan text-white shadow-accentBlue/30 hover:brightness-110'
                : 'bg-card text-slate-200 hover:bg-cardHover border border-borderCustom'
            }`}
          >
            <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
            <span>{isSaving ? 'Menyimpan...' : hasDirectHandle ? 'Simpan File (Ctrl+S)' : 'Simpan & Sync'}</span>
          </button>

          {/* Download Button (with charts included) */}
          <button
            onClick={onExportDownload}
            title="Download file Excel 5 Sheet lengkap dengan grafik gambar"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-surface hover:bg-cardHover text-slate-200 border border-borderCustom transition-all active:scale-95 shadow-sm"
          >
            <Download className="w-4 h-4 text-accentCyan" />
            <span>Unduh Excel (+Grafik)</span>
          </button>

          {/* Change File */}
          <button
            onClick={onOpenUploadModal}
            title="Upload atau ganti file Excel"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-surface hover:bg-cardHover text-slate-300 border border-borderCustom transition-all active:scale-95 shadow-sm"
          >
            <Upload className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">Ganti File</span>
          </button>
        </div>
      </div>

      {/* Year Filter Navigation Bar */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-borderCustom/40 flex-wrap gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400 mr-1">
            Pilih Tahun:
          </span>
          <button
            onClick={() => onSelectYear('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              selectedYear === 'all'
                ? 'bg-accentBlue text-white shadow-md shadow-accentBlue/30 ring-2 ring-accentBlue/50'
                : 'bg-surface text-slate-300 hover:text-white hover:bg-card border border-borderCustom/60 shadow-sm'
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
                  ? 'bg-accentBlue text-white shadow-md shadow-accentBlue/30 ring-2 ring-accentBlue/50'
                  : 'bg-surface text-slate-300 hover:text-white hover:bg-card border border-borderCustom/60 shadow-sm'
              }`}
            >
              {yr}
            </button>
          ))}
        </div>

        <div className="text-xs sm:text-sm text-slate-400 flex items-center gap-1.5 font-medium">
          <Sparkles className="w-4 h-4 text-accentAmber" />
          <span>Kalkulasi saldo berjalan dan rumus otomatis terhubung</span>
        </div>
      </div>
    </header>
  );
}
