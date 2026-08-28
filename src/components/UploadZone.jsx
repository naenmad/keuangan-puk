import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  Sparkles, 
  ArrowRight,
  HardDrive,
  ShieldCheck
} from 'lucide-react';
import { isFileSystemAccessSupported } from '../utils/fileSystemSync';

export default function UploadZone({ 
  onFileUploaded, 
  onUseDefaultData, 
  onPickWithNativeHandle,
  isModal = false,
  onCloseModal
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const fileInputRef = useRef(null);

  const hasFSA = isFileSystemAccessSupported();

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    setErrorMsg(null);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };

  const handleFileInputChange = async (e) => {
    setErrorMsg(null);
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };

  const processFile = async (file) => {
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      setErrorMsg('Format file harus berupa Excel (.xlsx atau .xls)');
      return;
    }
    setIsProcessing(true);
    try {
      await onFileUploaded(file);
      if (isModal && onCloseModal) onCloseModal();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Gagal memproses file Excel.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNativePick = async () => {
    setErrorMsg(null);
    setIsProcessing(true);
    try {
      await onPickWithNativeHandle();
      if (isModal && onCloseModal) onCloseModal();
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error(err);
        setErrorMsg(err.message || 'Gagal membuka file.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`w-full max-w-3xl mx-auto ${isModal ? 'p-0' : 'py-6'}`}>
      <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 text-center relative overflow-hidden shadow-sm">
        {/* Header Icon */}
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 p-[2px] shadow-xl shadow-blue-500/20">
            <div className="w-full h-full bg-white dark:bg-[#0e1626] rounded-3xl flex items-center justify-center">
              <FileSpreadsheet className="w-10 h-10 text-blue-600 dark:text-cyan-400" />
            </div>
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
          Upload File Excel Laporan Keuangan
        </h2>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-lg mx-auto mb-8 font-medium">
          Buka file spreadsheet kas PUK untuk visualisasi grafik, live edit transaksi bulanan, dan simpan otomatis.
        </p>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-sm font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Dropzone Container */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 cursor-pointer transition-all duration-300 relative group ${
            isDragging
              ? 'border-blue-600 dark:border-cyan-400 bg-blue-50/50 dark:bg-cyan-500/10 scale-[1.01]'
              : 'border-slate-300 dark:border-slate-700 hover:border-blue-500 bg-slate-50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-900/80'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center gap-3.5">
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#1a233a] border border-slate-200 dark:border-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
              <UploadCloud className="w-8 h-8 text-blue-600 dark:text-cyan-400" />
            </div>
            <div>
              <p className="text-base font-bold text-slate-800 dark:text-slate-200">
                {isProcessing ? 'Memproses File...' : 'Tarik & Letakkan file .xlsx ke sini, atau klik untuk memilih'}
              </p>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Mendukung multi-sheet (Data_Transaksi, Laporan_Bulanan) atau format tabel biasa
              </p>
            </div>
          </div>
        </div>

        {/* Actions Grid: Native File Handle & Default Seed */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          {/* Option 1: Native File Picker for direct live save */}
          {hasFSA && (
            <button
              onClick={handleNativePick}
              disabled={isProcessing}
              className="flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:shadow-md transition-all group shadow-sm"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white text-blue-600 dark:text-cyan-400 transition-colors">
                <HardDrive className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-200 text-sm sm:text-base">
                  <span>Pilih & Live Direct Save</span>
                  <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-500/30">
                    Disarankan
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Bisa langsung simpan (Ctrl+S) ke file Excel asli di laptop tanpa perlu download berulang.
                </p>
              </div>
            </button>
          )}

          {/* Option 2: Default Sample Data */}
          <button
            onClick={onUseDefaultData}
            disabled={isProcessing}
            className={`flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:shadow-md transition-all group shadow-sm ${
              !hasFSA ? 'sm:col-span-2' : ''
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white text-emerald-600 dark:text-emerald-400 transition-colors">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-slate-200 text-sm sm:text-base flex items-center gap-1.5">
                <span>Gunakan Data Contoh (2023 - 2026)</span>
                <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Langsung coba dashboard menggunakan data master lengkap dari script PUK PT SAI.
              </p>
            </div>
          </button>
        </div>

        {/* Privacy Note */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Privasi 100% Aman: Kalkulasi dan file Excel diproses lokal di dalam peramban Anda.</span>
        </div>
      </div>
    </div>
  );
}
