import React from 'react';
import { FileSpreadsheet, Sparkles, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-12 pt-6 pb-8 border-t border-slate-200 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-600/15 text-blue-600 dark:text-cyan-400 flex items-center justify-center font-bold">
            <FileSpreadsheet className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Laporan Keuangan PUK PT SAI
          </span>
          <span>•</span>
          <span>Sistem Neraca & Manipulasi Excel Otomatis</span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            100% Client-Side Safe
          </span>
          <span>•</span>
          <span>Tekan <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono font-bold text-slate-800 dark:text-slate-200">Ctrl+S</kbd> untuk Simpan</span>
          <span>•</span>
          <span className="text-blue-600 dark:text-cyan-400 font-medium">Vercel Ready</span>
        </div>
      </div>
    </footer>
  );
}
