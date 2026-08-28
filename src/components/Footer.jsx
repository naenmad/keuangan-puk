import React from 'react';
import { FileSpreadsheet, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-12 py-6 border-t border-slate-200 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Laporan Keuangan PUK PT SAI
          </span>
          <span>•</span>
          <span>Excel Live Sync</span>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Pemrosesan Lokal Aman
          </span>
          <span>•</span>
          <span>Shortcut <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono font-bold text-slate-700 dark:text-slate-300">Ctrl+S</kbd></span>
        </div>
      </div>
    </footer>
  );
}
