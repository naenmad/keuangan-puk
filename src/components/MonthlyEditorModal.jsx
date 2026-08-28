import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Save, 
  Calendar, 
  AlertCircle
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
  const [pemasukanInput, setPemasukanInput] = useState('9.000.000');
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setYear(initialData.year);
      setMonth(initialData.month);
      setSaldoAwalInput(formatThousands(initialData.saldoAwal ?? 0));
      setPemasukanInput(formatThousands(initialData.pemasukan ?? 0));
      setExpenses(
        initialData.expenses && initialData.expenses.length > 0
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
      const exists = (allMonthlyData || []).some(d => d.period === period);
      if (exists) {
        setError(`Periode ${month} ${year} (${period}) sudah ada dalam daftar. Pilih bulan/tahun lain atau edit data yang sudah ada.`);
        return;
      }
    }

    // STRICT VALIDATION 1: Cannot save if all nominals are 0
    if (numPemasukan <= 0 && expenses.length === 0) {
      setError('Nominal Pemasukan tidak boleh Rp 0. Mohon masukkan nominal yang valid.');
      return;
    }

    // STRICT VALIDATION 2: Check all expense rows
    for (let i = 0; i < expenses.length; i++) {
      const exp = expenses[i];
      const amountVal = parseThousands(exp.amountInput);
      const nameVal = (exp.name || '').trim();

      if (!nameVal && amountVal <= 0) {
        // If an empty row exists, reject or ask user to delete row
        setError(`Baris pengeluaran ke-${i + 1} masih kosong. Mohon isi nama dan nominal lebih dari Rp 0, atau hapus baris tersebut.`);
        return;
      }

      if (!nameVal) {
        setError(`Mohon isi nama transaksi untuk baris pengeluaran ke-${i + 1}.`);
        return;
      }

      if (amountVal <= 0) {
        setError(`Nominal pengeluaran untuk "${nameVal}" tidak boleh Rp 0. Mohon isi nominal lebih dari Rp 0.`);
        return;
      }
    }

    const cleanedExpenses = expenses.map(e => ({
      name: e.name.trim(),
      category: e.category || 'Lain-lain',
      amount: parseThousands(e.amountInput)
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
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Bulan
                </label>
                <select
                  value={month}
                  onChange={e => setMonth(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 cursor-pointer"
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
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Tahun
                </label>
                <input
                  type="number"
                  min="2020"
                  max="2035"
                  value={year}
                  onChange={e => setYear(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              {/* Saldo Awal */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Saldo Awal (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                  <input
                    type="text"
                    value={saldoAwalInput}
                    onChange={e => setSaldoAwalInput(formatThousands(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm font-bold font-mono text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Pemasukan Kas */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Pemasukan Kas (Rp) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-600">Rp</span>
                  <input
                    type="text"
                    value={pemasukanInput}
                    onChange={e => setPemasukanInput(formatThousands(e.target.value))}
                    className={`w-full bg-slate-50 dark:bg-slate-900 border rounded-xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-blue-600 ${
                      numPemasukan <= 0 ? 'border-rose-300 dark:border-rose-500' : 'border-slate-300 dark:border-slate-700'
                    }`}
                    placeholder="9.000.000"
                    required
                  />
                </div>
                {numPemasukan <= 0 && (
                  <span className="text-[11px] text-rose-500 font-semibold mt-1 block">
                    Nominal harus lebih dari Rp 0
                  </span>
                )}
              </div>
            </div>

            {/* Expenses List Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Pos Transaksi Pengeluaran Kas
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Setiap pos wajib memiliki nama dan nominal lebih dari Rp 0
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddExpenseRow}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-600 text-blue-600 dark:text-cyan-400 hover:text-white border border-blue-200 dark:border-blue-500/20 transition active:scale-95 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Baris Pos</span>
                </button>
              </div>

              {expenses.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <p className="text-xs sm:text-sm text-slate-400 font-medium mb-3">
                    Belum ada pos pengeluaran untuk bulan ini.
                  </p>
                  <button
                    type="button"
                    onClick={handleAddExpenseRow}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-sm"
                  >
                    Tambah Pos Pengeluaran Pertama
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {expenses.map((exp, idx) => {
                    const rowAmount = parseThousands(exp.amountInput);
                    const isZero = !exp.amountInput || rowAmount <= 0;

                    return (
                      <div
                        key={idx}
                        className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-3 rounded-2xl border transition-all ${
                          isZero 
                            ? 'bg-rose-50/30 dark:bg-rose-500/5 border-rose-200 dark:border-rose-500/30' 
                            : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <span className="w-6 text-center text-xs font-bold text-slate-400 shrink-0 hidden sm:inline">
                          {idx + 1}.
                        </span>

                        {/* Name Input */}
                        <div className="flex-1">
                          <input
                            type="text"
                            value={exp.name}
                            onChange={e => handleExpenseNameOrCategoryChange(idx, 'name', e.target.value)}
                            placeholder="Keterangan pengeluaran (cth: Konsumsi rapat)"
                            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                            required
                          />
                        </div>

                        {/* Category Selector */}
                        <div className="w-full sm:w-52 shrink-0">
                          <select
                            value={exp.category}
                            onChange={e => handleExpenseNameOrCategoryChange(idx, 'category', e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-600 cursor-pointer"
                          >
                            {CATEGORIES.filter(c => c !== 'Pemasukan Kas').map(cat => (
                              <option key={cat} value={cat} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                                {cat}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Amount Input with Thousand Separator */}
                        <div className="w-full sm:w-44 shrink-0 relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-rose-500">Rp</span>
                          <input
                            type="text"
                            value={exp.amountInput || ''}
                            onChange={e => handleExpenseAmountChange(idx, e.target.value)}
                            placeholder="0"
                            className={`w-full bg-white dark:bg-slate-900 border rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm font-bold font-mono text-rose-600 dark:text-rose-400 focus:outline-none focus:border-blue-600 ${
                              isZero ? 'border-rose-400 dark:border-rose-500' : 'border-slate-300 dark:border-slate-700'
                            }`}
                            required
                          />
                        </div>

                        {/* Delete Row Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveExpenseRow(idx)}
                          title="Hapus baris ini"
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition shrink-0 self-end sm:self-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Calculated Monthly Summary Preview */}
            <div className="bg-slate-50 dark:bg-slate-900/80 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs sm:text-sm font-mono">
                <div>
                  <span className="text-slate-400 block mb-1">Saldo Awal:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{formatRp(numSaldoAwal)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Pemasukan:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">+{formatRp(numPemasukan)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Total Belanja:</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">-{formatRp(totalExpense)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Saldo Akhir:</span>
                  <span className="font-black text-blue-600 dark:text-cyan-400 text-sm">{formatRp(saldoAkhir)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer / Actions */}
          <div className="p-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-[#0e1626] shrink-0">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Surplus Periode: <span className={`font-mono font-bold ${surplus >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                {surplus >= 0 ? '+' : ''}{formatRp(surplus)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Periode Bulanan</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
