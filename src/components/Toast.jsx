import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  if (!message) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <XCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-cyan-400 shrink-0" />
  };

  const borderColors = {
    success: 'border-emerald-500/40 bg-[#064e3b]/90 text-emerald-100',
    error: 'border-rose-500/40 bg-[#4c0519]/90 text-rose-100',
    warning: 'border-amber-500/40 bg-[#451a03]/90 text-amber-100',
    info: 'border-cyan-500/40 bg-[#083344]/90 text-cyan-100'
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-in">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md transition-all ${
          borderColors[type] || borderColors.info
        }`}
      >
        {icons[type] || icons.info}
        <div className="text-sm font-medium pr-2">{message}</div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
