import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Save, 
  Calendar, 
  AlertCircle, 
  Sparkles
} from 'lucide-react';
import { CATEGORIES, MONTH_NAMES } from '../data/defaultData';
import { formatRp, parseNumber } from '../utils/formatters';

export default function MonthlyEditorModal({
  isOpen,
  onClose,
  initialData,
  isNew = false,
  allMonthlyData,
  onSaveMonth,
  isDark = true
}) {
  if (!isOpen) return null;

  const [year, setYear] = useState(initialData?.year || new Date().getFullYear());
  const [month, setMonth] = useState(initialData?.month || 'Januari');
  const [saldoAwal, setSaldoAwal] = useState(initialData?.saldoAwal ?? 0);
  const [pemasukan, setPemasukan] = useState(initialData?.pemasukan ?? 0);
  const [expenses, setExpenses] = useState(
    initialData?.expenses ? initialData.expenses.map(e => ({ ...e })) : []
  );
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setYear(initialData.year);
      setMonth(initialData.month);
      setSaldoAwal(initialData.saldoAwal);
      setPemasukan(initialData.pemasukan);
      setExpenses(initialData.expenses ? initialData.expenses.map(e => ({ ...e })) : []);
    } else {
      const latest = allMonthlyData && allMonthlyData.length > 0
        ? allMonthlyData[allMonthlyData.length - 1]
        : null;
      if (latest) {
        setSaldoAwal(latest.saldoAkhir);
        const mIdx = MONTH_NAMES.indexOf(latest.month);
        if (mIdx >= 0 && mIdx < 11) {
          setMonth(MONTH_NAMES[mIdx + 1]);
          setYear(latest.year);
        } else {
          setMonth('Januari');
          setYear(latest.year + 1);
        }
        setPemasukan(latest.pemasukan || 0);
      } else {
        setSaldoAwal(0);
        setPemasukan(0);
      }
      setExpenses([
        { name: 'Setor COS dan akomodasi pengurus', category: 'Setor COS & Pengurus', amount: 0 }
      ]);
    }
  }, [initialData, isOpen]);

  const totalExpense = expenses.reduce((sum, e) => sum + (parseNumber(e.amount) || 0), 0);
  const numPemasukan = parseNumber(pemasukan) || 0;
  const numSaldoAwal = parseNumber(saldoAwal) || 0;
  const surplus = numPemasukan - totalExpense;
  const saldoAkhir = numSaldoAwal + surplus;

  const handleAddExpenseRow = () => {
    setExpenses(prev => [
      ...prev,
      { name: '', category: 'Lain-lain', amount: 0 }
    ]);
  };

  const handleRemoveExpenseRow = (index) => {
    setExpenses(prev => prev.filter((_, i) => i !== index));
  };

  const handleExpenseChange = (index, field, value) => {
    setExpenses(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: field === 'amount' ? parseNumber(value) : value
      };
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    const mIdx = MONTH_NAMES.indexOf(month);
    const monthStr = mIdx >= 0 ? String(mIdx + 1).padStart(2, '0') : '01';
    const period = `${year}-${monthStr}`;

    if (isNew) {
      const exists = allMonthlyData.some(d => d.period === period);
      if (exists) {
        setError(`Periode ${month} ${year} (${period}) sudah ada dalam daftar. Pilih bulan/tahun lain atau edit data yang sudah ada.`);
        return;
      }
    }

    const payload = {
      period,
      year: parseInt(year, 10),
      month,
      saldoAwal: numSaldoAwal,
      pemasukan: numPemasukan,
      expenses: expenses.filter(e => e.name.trim() !== '' || e.amount > 0)
    };

    onSaveMonth(payload, isNew);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-[#1a2035] rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-borderCustom my-8 shadow-2xl">
        {/* Modal Header */}
        <div className="p-6 border-b border-borderCustom flex items-center justify-between bg-surface/90 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-accentBlue/20 border border-accentBlue/40 flex items-center justify-center text-accentCyan">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                {isNew ? 'Tambah Periode Laporan Baru' : `Edit Laporan: ${month} ${year}`}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400">
                Ubah saldo awal, pos pemasukan, dan detail transaksi pengeluaran bulanan.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content / Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#1a2035]">
            {error && (
              <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs sm:text-sm font-semibold flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Top Row: Bulan, Tahun, Saldo Awal, Pemasukan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Bulan */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Bulan
                </label>
                <select
                  value={month}
                  onChange={e => setMonth(e.target.value)}
                  className="w-full bg-surface border border-borderCustom rounded-xl px-3.5 py-3 text-sm sm:text-base text-white font-bold focus:outline-none focus:border-accentBlue cursor-pointer"
                >
                  {MONTH_NAMES.map(m => (
                    <option key={m} value={m} className="bg-slate-900 text-white">
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tahun */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Tahun
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={e => setYear(parseInt(e.target.value) || 2024)}
                  min="2020"
                  max="2035"
                  className="w-full bg-surface border border-borderCustom rounded-xl px-3.5 py-3 text-sm sm:text-base text-white font-mono font-bold focus:outline-none focus:border-accentBlue"
                />
              </div>

              {/* Saldo Awal */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Saldo Awal (Rp)
                </label>
                <input
                  type="number"
                  value={saldoAwal}
                  onChange={e => setSaldoAwal(e.target.value)}
                  className="w-full bg-surface border border-borderCustom rounded-xl px-3.5 py-3 text-sm sm:text-base text-white font-mono font-bold focus:outline-none focus:border-accentBlue"
                />
              </div>

              {/* Pemasukan */}
              <div>
                <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1.5">
                  Pemasukan Kas (Rp)
                </label>
                <input
                  type="number"
                  value={pemasukan}
                  onChange={e => setPemasukan(e.target.value)}
                  className="w-full bg-surface border border-emerald-500/50 rounded-xl px-3.5 py-3 text-sm sm:text-base text-emerald-300 font-mono font-bold focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            {/* Live Calculation Preview Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 p-4 sm:p-5 rounded-2xl bg-surface/80 border border-borderCustom">
              <div>
                <span className="text-xs text-slate-400 font-semibold">Saldo Awal:</span>
                <p className="font-mono text-sm sm:text-base font-bold text-slate-200">
                  {formatRp(numSaldoAwal)}
                </p>
              </div>
              <div>
                <span className="text-xs text-emerald-400 font-semibold">Pemasukan:</span>
                <p className="font-mono text-sm sm:text-base font-black text-emerald-400">
                  +{formatRp(numPemasukan)}
                </p>
              </div>
              <div>
                <span className="text-xs text-rose-400 font-semibold">Total Pengeluaran:</span>
                <p className="font-mono text-sm sm:text-base font-black text-rose-400">
                  -{formatRp(totalExpense)}
                </p>
              </div>
              <div>
                <span className="text-xs text-accentCyan font-semibold">Saldo Akhir:</span>
                <p className="font-mono text-sm sm:text-base font-black text-accentCyan">
                  {formatRp(saldoAkhir)}
                </p>
              </div>
            </div>

            {/* Expense Transaction Rows */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                    Pos Transaksi Pengeluaran
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {expenses.length} Pos
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAddExpenseRow}
                  className="flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-rose-600 hover:bg-rose-500 text-white transition-all active:scale-95 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Baris Pos</span>
                </button>
              </div>

              {expenses.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-700 rounded-2xl bg-surface/30 text-slate-500 text-sm">
                  Belum ada pos pengeluaran. Klik tombol "Tambah Baris Pos" di atas untuk menambahkan.
                </div>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {expenses.map((exp, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-3 rounded-2xl bg-surface border border-slate-800 hover:border-slate-700 transition"
                    >
                      <span className="w-6 text-center text-xs font-mono font-bold text-slate-500 shrink-0 hidden sm:block">
                        {idx + 1}.
                      </span>

                      {/* Nama Pos */}
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Nama Transaksi (contoh: Servis Mobil PUK)"
                          value={exp.name}
                          onChange={e => handleExpenseChange(idx, 'name', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white font-semibold focus:outline-none focus:border-accentBlue placeholder:text-slate-500"
                        />
                      </div>

                      {/* Kategori */}
                      <div className="w-full sm:w-52">
                        <select
                          value={exp.category || 'Lain-lain'}
                          onChange={e => handleExpenseChange(idx, 'category', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-200 font-semibold focus:outline-none focus:border-accentBlue"
                        >
                          {CATEGORIES.filter(c => c !== 'Pemasukan Kas').map(cat => (
                            <option key={cat} value={cat} className="bg-slate-900">
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Nominal */}
                      <div className="w-full sm:w-40">
                        <input
                          type="number"
                          placeholder="Nominal Rp"
                          value={exp.amount || ''}
                          onChange={e => handleExpenseChange(idx, 'amount', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-rose-400 font-mono font-bold focus:outline-none focus:border-rose-500 placeholder:text-slate-500 text-right"
                        />
                      </div>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleRemoveExpenseRow(idx)}
                        className="p-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition shrink-0 self-end sm:self-auto"
                        title="Hapus baris ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-5 border-t border-borderCustom bg-surface/90 flex items-center justify-between shrink-0">
            <div className="text-xs sm:text-sm text-slate-400 flex items-center gap-1.5 font-medium">
              <Sparkles className="w-4 h-4 text-accentCyan" />
              <span>Perubahan otomatis mengalir ke saldo bulan berikutnya</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-surface hover:bg-slate-800 text-slate-300 border border-borderCustom transition"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-accentBlue to-accentCyan text-white shadow-lg shadow-accentBlue/25 transition-all hover:scale-[1.02] active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
