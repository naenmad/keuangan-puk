export function formatRp(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return "Rp 0";
  return "Rp " + Math.round(amount).toLocaleString('id-ID');
}

export function formatShortRp(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return "Rp 0";
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  if (abs >= 1000000000) {
    return `${sign}Rp ${(abs / 1000000000).toFixed(2)} M`;
  }
  if (abs >= 1000000) {
    return `${sign}Rp ${(abs / 1000000).toFixed(1)} jt`;
  }
  if (abs >= 1000) {
    return `${sign}Rp ${(abs / 1000).toFixed(0)} rb`;
  }
  return `${sign}Rp ${abs.toLocaleString('id-ID')}`;
}

export function formatThousands(val) {
  if (val === undefined || val === null || val === '') return '';
  const num = typeof val === 'number' ? Math.round(val) : parseInt(String(val).replace(/\D/g, ''), 10);
  if (isNaN(num)) return '';
  return num.toLocaleString('id-ID');
}

export function parseThousands(val) {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const clean = String(val).replace(/\D/g, '');
  const num = parseInt(clean, 10);
  return isNaN(num) ? 0 : num;
}

export function parseNumber(val) {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const clean = String(val).replace(/[^0-9.-]+/g, "");
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}

export function calculateMonthTotals(monthData) {
  const pemasukan = parseNumber(monthData.pemasukan) || 0;
  const saldoAwal = parseNumber(monthData.saldoAwal) || 0;
  const totalPengeluaran = (monthData.expenses || []).reduce(
    (sum, item) => sum + (parseNumber(item.amount) || 0),
    0
  );
  const surplusDefisit = pemasukan - totalPengeluaran;
  const saldoAkhir = saldoAwal + surplusDefisit;

  return {
    ...monthData,
    saldoAwal,
    pemasukan,
    totalPengeluaran,
    surplusDefisit,
    saldoAkhir
  };
}

export function recalculateAllMonths(monthlyList) {
  if (!monthlyList || monthlyList.length === 0) return [];
  
  const sorted = [...monthlyList].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return (a.period || "").localeCompare(b.period || "");
  });

  const result = [];
  let prevSaldoAkhir = null;

  for (let i = 0; i < sorted.length; i++) {
    const item = { ...sorted[i] };
    if (i > 0 && prevSaldoAkhir !== null) {
      item.saldoAwal = prevSaldoAkhir;
    }
    const computed = calculateMonthTotals(item);
    prevSaldoAkhir = computed.saldoAkhir;
    result.push(computed);
  }

  return result;
}
