import React, { useState } from 'react';
import { Key, Lock, X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { changeAdminPassword } from '../utils/auth';

export default function ChangePasswordModal({ isOpen, onClose, onSuccess }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password baru tidak cocok!');
      return;
    }

    if (newPassword.length < 4) {
      setError('Password baru minimal 4 karakter!');
      return;
    }

    setLoading(true);
    try {
      const res = await changeAdminPassword(oldPassword, newPassword);
      if (res.success) {
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        if (onSuccess) onSuccess(res.message || 'Password admin berhasil diubah!');
        onClose();
      } else {
        setError(res.message || 'Gagal mengubah password');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengubah password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-scaleUp">
        {/* Top Gradient */}
        <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500" />

        <div className="p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center border border-emerald-200 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 shrink-0">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Ganti Password Admin Keuangan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Perbarui password akses administrator cloud
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Password Lama
              </label>
              <input
                type="password"
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                placeholder="Masukkan password lama..."
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Password Baru
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Masukkan password baru..."
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Konfirmasi Password Baru
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Ketik ulang password baru..."
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-600 dark:text-rose-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2 transition"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Simpan Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
