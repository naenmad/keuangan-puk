import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  Sparkles, 
  Calendar
} from 'lucide-react';

export default function DownloadDialogModal({
  isOpen,
  onClose,
  defaultFilename,
  onConfirmDownload
}) {
  if (!isOpen) return null;

  // Generate default name with today's date in Indonesian format (e.g. "28 Agustus 2026")
  const getSuggestedName = () => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    return `Laporan Keuangan PUK (${formattedDate}).xlsx`;
  };

  const [filename, setFilename] = useState(() => getSuggestedName());
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFilename(getSuggestedName());
    }
  }, [isOpen]);

  const handleDownload = async (e) => {
    e.preventDefault();
    let finalName = filename.trim();
    if (!finalName) {
      finalName = getSuggestedName();
    }
    if (!finalName.toLowerCase().endsWith('.xlsx')) {
      finalName += '.xlsx';
    }

    setIsExporting(true);
    try {
      await onConfirmDownload(finalName);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#131b2e] rounded-3xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl transition-all">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-[#0e1626]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-cyan-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Unduh File Excel
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sesuaikan nama file sebelum mengunduh laporan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleDownload} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Nama File Excel (.xlsx)
            </label>
            <div className="relative">
              <input
                type="text"
                value={filename}
                onChange={e => setFilename(e.target.value)}
                placeholder="Contoh: Laporan Keuangan PUK (28 Agustus 2026).xlsx"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 pr-10"
                autoFocus
              />
              <FileSpreadsheet className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Included Features Badge */}
          <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-800/80 space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Konten File Otomatis Terintegrasi:
            </span>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>5 Sheet Lengkap: Dashboard, Buku Kas, Transaksi, Rekap Pemasukan & Kategori</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Gambar Grafik Visual Resolusi Tinggi (Embedded Charts)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Formula SUM & Format Rupiah Akuntansi Asli</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isExporting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition active:scale-95 disabled:opacity-50"
            >
              <Download className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
              <span>{isExporting ? 'Menyiapkan...' : 'Unduh Sekarang'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
