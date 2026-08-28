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
import { formatRp, parseThousands, formatThousands } from '../utils/formatters';

export default function MonthlyEditorModal({
  isOpen,
  onClose,
  initialData,
  isNew = false,
  allMonthlyData,
  onSaveMonth
}) {
  if (!isOpen) return null;

  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState('Januari');
  const [saldoAwalInput, setSaldoAwalInput] = useState('0');
  const [pemasukanInput, setPemasukanInput] = useState('0');
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setYear(initialData.year);
      setMonth(initialData.month);
      setSaldoAwalInput(formatThousands(initialData.saldoAwal ?? 0));
      setPemasukanInput(formatThousands(initialData.pemasukan ?? 0));
      setExpenses(
        initialData.expenses
          ? initialData.expenses.map(e => ({
              name: e.name,
              category: e.category,
              amount: e.amount,
              amountInput: formatThousands(e.amount ?? 0)
            }))
          : []
      );
    } else {
      // Automatic next month determination
      if (allMonthlyData && allMonthlyData.length > 0) {
        // Find latest chronological month
        const sorted = [...allMonthlyData].sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year;
          return MONTH_NAMES.indexOf(a.month) - MONTH_NAMES.indexOf(b.month);
        });

        const latest = sorted[sorted.length - 1];
        const mIdx = MONTH_NAMES.indexOf(latest.month);

        let nextM, nextY;
        if (mIdx >= 0 && mIdx < 11) {
          nextM = MONTH_NAMES[mIdx + 1];
          nextY = latest.year;
        } else {
          nextM = MONTH_NAMES[0];
          nextY = latest.year + 1;
        }

        setMonth(nextM);
        setYear(nextY);
        setSaldoAwalInput(formatThousands(latest.saldoAkhir || 0));
        setPemasukanInput(formatThousands(latest.pemasukan || 9000000));
      } else {
        setMonth('Januari');
        setYear(new Date().getFullYear());
        setSaldoAwalInput('0');
        setPemasukanInput(formatThousands(9000000));
      }

      setExpenses([
        { 
          name: 'Setor COS dan akomodasi pengurus', 
          category: 'Setor COS & Pengurus', 
          amount: 0, 
          amountInput: '' 
        }
      ]);
    }
  }, [initialData, isOpen, allMonthlyData]);

  // Numerical calculations from formatted strings
  const numSaldoAwal = parseThousands(saldoAwalInput);
  const numPemasukan = parseThousands(pemasukanInput);
  const totalExpense = expenses.reduce((sum, e) => sum + (parseThousands(e.amountInput) || 0), 0);
  const surplus = numPemasukan - totalExpense;
  const saldoAkhir = numSaldoAwal + surplus;

  const handleAddExpenseRow = () => {
    setExpenses(prev => [
      ...prev,
      { name: '', category: 'Lain-lain', amount: 0, amountInput: '' }
    ]);
  };

  const handleRemoveExpenseRow = (index) => {
    setExpenses(prev => prev.filter((_, i) => i !== index));
  };

  const handleExpenseNameOrCategoryChange = (index, field, value) => {
    setExpenses(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return updated;
    });
  };

  const handleExpenseAmountChange = (index, rawValue) => {
    const formatted = formatThousands(rawValue);
    const numeric = parseThousands(formatted);
    setExpenses(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        amountInput: formatted,
        amount: numeric
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

    const cleanedExpenses = expenses
      .filter(e => e.name.trim() !== '' || (parseThousands(e.amountInput) || 0) > 0)
      .map(e => ({
        name: e.name,
        category: e.category || 'Lain-lain',
        amount: parseThousands(e.amountInput) || 0
      }));

    const payload = {
      period,
      year: parseInt(year, 10),
      month,
      saldoAwal: numSaldoAwal,
      pemasukan: numPemasukan,
      expenses: cleanedExpenses
    };

    onSaveMonth(payload, isNew);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-[#131b2e] rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 my-8 shadow-2xl">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-[#0e1626] shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-cyan-400">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                {isNew ? 'Tambah Periode Bulan Baru' : `Edit Laporan: ${month} ${year}`}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {isNew 
                  ? 'Bulan & saldo awal otomatis ditentukan dari periode terakhir'
                  : 'Ubah saldo awal, pemasukan, dan rincian transaksi pengeluaran'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content / Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-white dark:bg-[#131b2e]">
            {error && (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs sm:text-sm font-semibold flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Top Row: Bulan, Tahun, Saldo Awal, Pemasukan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Bulan */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Bulan
                </label>
                <select
                  value={month}
                  onChange={e => setMonth(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-3 text-sm sm:text-base text-slate-900 dark:text-white font-bold focus:outline-none focus:border-blue-600 cursor-pointer"
                >
                  {MONTH_NAMES.map(m => (
                    <option key={m} value={m} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tahun */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Tahun
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={e => setYear(parseInt(e.target.value) || 2026)}
                  min="2020"
                  max="2035"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-3 text-sm sm:text-base text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-blue-600"
                />
              </div>

              {/* Saldo Awal (Auto Formatted) */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Saldo Awal (Rp)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={saldoAwalInput}
                    onChange={e => setSaldoAwalInput(formatThousands(e.target.value))}
                    placeholder="0"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-3 text-sm sm:text-base text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-blue-600 text-right pr-4"
                  />
                  <span className="text-xs text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 font-bold pointer-events-none">Rp</span>
                </div>
              </div>

              {/* Pemasukan (Auto Formatted) */}
              <div>
                <label className="block text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1.5">
                  Pemasukan Kas (Rp)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={pemasukanInput}
                    onChange={e => setPemasukanInput(formatThousands(e.target.value))}
                    placeholder="9.000.000"
                    className="w-full bg-emerald-50/50 dark:bg-slate-900 border border-emerald-300 dark:border-emerald-500/50 rounded-xl px-3.5 py-3 text-sm sm:text-base text-emerald-700 dark:text-emerald-300 font-mono font-bold focus:outline-none focus:border-emerald-500 text-right pr-4"
                  />
                  <span className="text-xs text-emerald-600/70 absolute left-3 top-1/2 -translate-y-1/2 font-bold pointer-events-none">Rp</span>
                </div>
              </div>
            </div>

            {/* Live Calculation Preview Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Saldo Awal:</span>
                <p className="font-mono text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200">
                  {formatRp(numSaldoAwal)}
                </p>
              </div>
              <div>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Pemasukan:</span>
                <p className="font-mono text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400">
                  +{formatRp(numPemasukan)}
                </p>
              </div>
              <div>
                <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold">Total Pengeluaran:</span>
                <p className="font-mono text-sm sm:text-base font-black text-rose-600 dark:text-rose-400">
                  -{formatRp(totalExpense)}
                </p>
              </div>
              <div>
                <span className="text-xs text-blue-600 dark:text-cyan-400 font-semibold">Saldo Akhir:</span>
                <p className="font-mono text-sm sm:text-base font-black text-blue-600 dark:text-cyan-400">
                  {formatRp(saldoAkhir)}
                </p>
              </div>
            </div>

            {/* Expense Transaction Rows */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Pos Transaksi Pengeluaran
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30">
                    {expenses.length} Pos
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAddExpenseRow}
                  className="flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white transition-all active:scale-95 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Baris Pos</span>
                </button>
              </div>

              {expenses.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-900/30 text-slate-400 text-sm">
                  Belum ada pos pengeluaran. Klik tombol "Tambah Baris Pos" di atas untuk menambahkan.
                </div>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {expenses.map((exp, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition"
                    >
                      <span className="w-6 text-center text-xs font-mono font-bold text-slate-400 shrink-0 hidden sm:block">
                        {idx + 1}.
                      </span>

                      {/* Nama Pos */}
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Nama Transaksi (contoh: Servis Mobil PUK)"
                          value={exp.name}
                          onChange={e => handleExpenseNameOrCategoryChange(idx, 'name', e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-blue-600 placeholder:text-slate-400"
                        />
                      </div>

                      {/* Kategori */}
                      <div className="w-full sm:w-52">
                        <select
                          value={exp.category || 'Lain-lain'}
                          onChange={e => handleExpenseNameOrCategoryChange(idx, 'category', e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-200 font-semibold focus:outline-none focus:border-blue-600"
                        >
                          {CATEGORIES.filter(c => c !== 'Pemasukan Kas').map(cat => (
                            <option key={cat} value={cat} className="bg-white dark:bg-slate-900">
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Nominal (Auto Formatted separator) */}
                      <div className="w-full sm:w-44 relative">
                        <input
                          type="text"
                          placeholder="0"
                          value={exp.amountInput || ''}
                          onChange={e => handleExpenseAmountChange(idx, e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-rose-600 dark:text-rose-400 font-mono font-bold focus:outline-none focus:border-rose-500 placeholder:text-slate-400 text-right pr-3 pl-8"
                        />
                        <span className="text-[11px] text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 font-bold pointer-events-none">Rp</span>
                      </div>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleRemoveExpenseRow(idx)}
                        className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-transparent hover:border-rose-200 dark:hover:border-rose-500/30 transition shrink-0 self-end sm:self-auto"
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
          <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0e1626] flex items-center justify-between shrink-0">
            <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              <span>Perubahan otomatis mengalir ke saldo bulan berikutnya</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-95"
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
