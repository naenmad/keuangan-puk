export const CATEGORIES = [
  "Setor COS & Pengurus",
  "Angsuran Mobil",
  "Aksi & Advokasi",
  "Kendaraan",
  "Kegiatan Organisasi",
  "May Day",
  "Dana Sosial",
  "THR & Bonus",
  "Olahraga & Kegiatan",
  "Perlengkapan & Atribut",
  "Konsumsi & Kegiatan",
  "Aset & Operasional",
  "Pembangunan Gedung",
  "Setor COS TSCUF",
  "Penghargaan Karyawan",
  "Lain-lain"
];

export const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export const DEFAULT_MONTHLY_SEED = [
  // 2023
  {
    period: "2023-03", year: 2023, month: "Maret", saldoAwal: 6738000, pemasukan: 18000000,
    expenses: [
      { name: "Setor COS dan akomodasi pengurus", category: "Setor COS & Pengurus", amount: 9000000 },
      { name: "Angsuran Mobil", category: "Angsuran Mobil", amount: 3800000 },
      { name: "Suka cita dan Duka cita", category: "Dana Sosial", amount: 300000 },
      { name: "Akomodasi aksi DPR RI (tolak perpu cipta kerja)", category: "Aksi & Advokasi", amount: 1500000 }
    ]
  },
  {
    period: "2023-04", year: 2023, month: "April", saldoAwal: 10138000, pemasukan: 18000000,
    expenses: [
      { name: "Setor COS dan akomodasi pengurus", category: "Setor COS & Pengurus", amount: 9000000 },
      { name: "Angsuran Mobil", category: "Angsuran Mobil", amount: 3800000 },
      { name: "Suka cita dan Duka cita", category: "Dana Sosial", amount: 300000 },
      { name: "Service rutin mobil", category: "Kendaraan", amount: 1500000 }
    ]
  },
  {
    period: "2023-05", year: 2023, month: "Mei", saldoAwal: 13538000, pemasukan: 18000000,
    expenses: [
      { name: "Setor COS dan akomodasi pengurus", category: "Setor COS & Pengurus", amount: 9000000 },
      { name: "Angsuran Mobil", category: "Angsuran Mobil", amount: 3800000 },
      { name: "Suka cita dan Duka cita", category: "Dana Sosial", amount: 300000 },
      { name: "Akomodasi May Day", category: "May Day", amount: 2000000 },
      { name: "Pembelian kaos May Day dan spanduk", category: "Perlengkapan & Atribut", amount: 600000 }
    ]
  },
  {
    period: "2023-06", year: 2023, month: "Juni", saldoAwal: 15838000, pemasukan: 18000000,
    expenses: [
      { name: "Setor COS dan akomodasi pengurus", category: "Setor COS & Pengurus", amount: 9000000 },
      { name: "Angsuran Mobil", category: "Angsuran Mobil", amount: 3800000 },
      { name: "Suka cita dan Duka cita", category: "Dana Sosial", amount: 300000 },
      { name: "Pajak mobil", category: "Kendaraan", amount: 3900000 }
    ]
  },
  {
    period: "2023-07", year: 2023, month: "Juli", saldoAwal: 16838000, pemasukan: 18000000,
    expenses: [
      { name: "Setor COS dan akomodasi pengurus", category: "Setor COS & Pengurus", amount: 9000000 },
      { name: "Angsuran Mobil", category: "Angsuran Mobil", amount: 3800000 },
      { name: "Suka cita dan Duka cita", category: "Dana Sosial", amount: 300000 },
      { name: "Akomodasi aksi PTUN Bandung", category: "Aksi & Advokasi", amount: 2000000 }
    ]
  },
  {
    period: "2023-08", year: 2023, month: "Agustus", saldoAwal: 19738000, pemasukan: 18000000,
    expenses: [
      { name: "Setor COS dan akomodasi pengurus", category: "Setor COS & Pengurus", amount: 9000000 },
      { name: "Angsuran Mobil", category: "Angsuran Mobil", amount: 3800000 },
      { name: "Suka cita dan Duka cita", category: "Dana Sosial", amount: 300000 },
      { name: "Biaya daftar futsal DPC CUP", category: "Olahraga & Kegiatan", amount: 300000 },
      { name: "Akomodasi futsal DPC CUP", category: "Olahraga & Kegiatan", amount: 2000000 },
      { name: "Akomodasi pengawalan sidang JR di MK", category: "Aksi & Advokasi", amount: 1000000 }
    ]
  },
  {
    period: "2023-09", year: 2023, month: "September", saldoAwal: 21338000, pemasukan: 18000000,
    expenses: [
      { name: "Setor COS dan akomodasi pengurus", category: "Setor COS & Pengurus", amount: 9000000 },
      { name: "Angsuran Mobil", category: "Angsuran Mobil", amount: 3800000 },
      { name: "Suka cita dan Duka cita", category: "Dana Sosial", amount: 300000 },
      { name: "Akomodasi Aksi KEMNAKER (cabut UU Omnibuslaw)", category: "Aksi & Advokasi", amount: 1500000 }
    ]
  },
  {
    period: "2023-10", year: 2023, month: "Oktober", saldoAwal: 24738000, pemasukan: 18000000,
    expenses: [
      { name: "Setor COS dan akomodasi pengurus", category: "Setor COS & Pengurus", amount: 9000000 },
      { name: "Angsuran Mobil", category: "Angsuran Mobil", amount: 3800000 },
      { name: "Suka cita dan Duka cita", category: "Dana Sosial", amount: 300000 },
      { name: "Service Mobil PUK", category: "Kendaraan", amount: 1500000 },
      { name: "Service dan cuci AC PUK", category: "Aset & Operasional", amount: 500000 }
    ]
  },
  {
    period: "2023-11", year: 2023, month: "November", saldoAwal: 27638000, pemasukan: 18000000,
    expenses: [
      { name: "Setor COS dan akomodasi pengurus", category: "Setor COS & Pengurus", amount: 9000000 },
      { name: "Angsuran Mobil", category: "Angsuran Mobil", amount: 3800000 },
      { name: "Suka cita dan Duka cita", category: "Dana Sosial", amount: 300000 },
      { name: "Ganti dua ban mobil PUK", category: "Kendaraan", amount: 1900000 }
    ]
  },
  {
    period: "2023-12", year: 2023, month: "Desember", saldoAwal: 30638000, pemasukan: 18000000,
    expenses: [
      { name: "Setor COS dan akomodasi pengurus", category: "Setor COS & Pengurus", amount: 9000000 },
      { name: "Angsuran Mobil", category: "Angsuran Mobil", amount: 3800000 },
      { name: "Suka cita dan Duka cita", category: "Dana Sosial", amount: 300000 },
      { name: "Akomodasi aksi upah 2024 PEMDA Karawang", category: "Aksi & Advokasi", amount: 1500000 },
      { name: "Aksi KEMNAKER", category: "Aksi & Advokasi", amount: 2000000 }
    ]
  },

  // 2024
  {
    period: "2024-01", year: 2024, month: "Januari", saldoAwal: 32038000, pemasukan: 18000000,
    expenses: [
      { name: "Setor COS dan akomodasi pengurus", category: "Setor COS & Pengurus", amount: 9000000 },
      { name: "Angsuran Mobil", category: "Angsuran Mobil", amount: 3800000 },
      { name: "Suka cita dan Duka cita", category: "Dana Sosial", amount: 300000 },
      { name: "Aksi DPRD Jabar", category: "Aksi & Advokasi", amount: 1500000 },
      { name: "Akomodasi Bapor longmarch Bandung-Jakarta", category: "Aksi & Advokasi", amount: 2000000 }
    ]
  },
  {
    period: "2024-02", year: 2024, month: "Februari", saldoAwal: 33438000, pemasukan: 18000000,
    expenses: [
      { name: "Setor COS dan akomodasi pengurus", category: "Setor COS & Pengurus", amount: 9000000 },
      { name: "Angsuran Mobil", category: "Angsuran Mobil", amount: 3800000 },
      { name: "Suka Cita dan Duka Cita", category: "Dana Sosial", amount: 300000 },
      { name: "Service mobil PUK", category: "Kendaraan", amount: 1500000 },
      { name: "Akomodasi Aksi PEMPROV JABAR", category: "Aksi & Advokasi", amount: 1500000 }
    ]
  },
  {
    period: "2024-03", year: 2024, month: "Maret", saldoAwal: 35338000, pemasukan: 18000000,
    expenses: [
      { name: "Setor COS dan akomodasi pengurus", category: "Setor COS & Pengurus", amount: 9000000 },
      { name: "Angsuran Mobil", category: "Angsuran Mobil", amount: 3800000 },
      { name: "Suka Cita dan Duka Cita", category: "Dana Sosial", amount: 300000 },
      { name: "Akomodasi aksi DPR RI (cabut omnibuslaw)", category: "Aksi & Advokasi", amount: 2000000 },
      { name: "Sumbangan BUKBER karyawan PT SAI", category: "Konsumsi & Kegiatan", amount: 1000000 },
      { name: "Bukber pengurus dan DPC FSP LEM SPSI", category: "Konsumsi & Kegiatan", amount: 300000 },
      { name: "Bukber pengurus dan manajemen", category: "Konsumsi & Kegiatan", amount: 2000000 }
    ]
  },
  {
    period: "2024-04", year: 2024, month: "April", saldoAwal: 34938000, pemasukan: 18000000,
    expenses: [
      { name: "Setor COS dan akomodasi pengurus", category: "Setor COS & Pengurus", amount: 9000000 },
      { name: "Angsuran Mobil", category: "Angsuran Mobil", amount: 3800000 },
      { name: "Dana sosial suka cita dan duka cita", category: "Dana Sosial", amount: 300000 },
      { name: "THR DPC dan DPD FSP LEM SPSI", category: "THR & Bonus", amount: 5000000 },
      { name: "THR pengurus PUK PT SAI", category: "THR & Bonus", amount: 4000000 },
      { name: "Akomodasi pengantaran jenazah anggota ke Banyuwangi", category: "Dana Sosial", amount: 2000000 }
    ]
  },
  {
    period: "2024-05", year: 2024, month: "Mei", saldoAwal: 28838000, pemasukan: 18000000,
    expenses: [
      { name: "Setor COS dan akomodasi pengurus", category: "Setor COS & Pengurus", amount: 9000000 },
      { name: "Angsuran Mobil", category: "Angsuran Mobil", amount: 3800000 },
      { name: "Suka Cita dan Duka Cita", category: "Dana Sosial", amount: 300000 },
      { name: "Akomodasi May Day", category: "May Day", amount: 3000000 },
      { name: "Beli kaos May Day", category: "Perlengkapan & Atribut", amount: 720000 },
      { name: "Akomodasi menghadiri MUSNIK PUK TMMIN", category: "Kegiatan Organisasi", amount: 1000000 },
      { name: "Akomodasi RAKERCAB DPC", category: "Kegiatan Organisasi", amount: 5000000 },
      { name: "Service mobil", category: "Kendaraan", amount: 1500000 }
    ]
  },
  {
    period: "2024-06", year: 2024, month: "Juni", saldoAwal: 22518000, pemasukan: 18000000,
    expenses: [
      { name: "Setor COS dan akomodasi pengurus", category: "Setor COS & Pengurus", amount: 9000000 },
      { name: "Angsuran Mobil", category: "Angsuran Mobil", amount: 3800000 },
      { name: "Suka Cita dan Duka Cita", category: "Dana Sosial", amount: 300000 },
      { name: "Bayar pajak mobil PUK", category: "Kendaraan", amount: 4000000 },
      { name: "Akomodasi aksi DPRD Karawang", category: "Aksi & Advokasi", amount: 1000000 },
      { name: "Akomodasi aksi DPRD Bandung", category: "Aksi & Advokasi", amount: 2000000 },
      { name: "Dana konsolidasi/perjuangan", category: "Aksi & Advokasi", amount: 5000000 }
    ]
  },
  {
    period: "2024-07", year: 2024, month: "Juli", saldoAwal: 15418000, pemasukan: 18000000,
    expenses: [
      { name: "Setor COS dan akomodasi pengurus", category: "Setor COS & Pengurus", amount: 9000000 },
      { name: "Angsuran Mobil", category: "Angsuran Mobil", amount: 3800000 },
      { name: "Suka Cita dan Duka Cita", category: "Dana Sosial", amount: 300000 },
      { name: "Pembelian aset laptop Advance", category: "Aset & Operasional", amount: 5400000 },
      { name: "Akomodasi aksi Disnakertrans JABAR", category: "Aksi & Advokasi", amount: 2000000 }
    ]
  },
  {
    period: "2024-08", year: 2024, month: "Agustus", saldoAwal: 12918000, pemasukan: 18000000,
    expenses: [
      { name: "Setor COS dan akomodasi pengurus", category: "Setor COS & Pengurus", amount: 9000000 },
      { name: "Angsuran Mobil", category: "Angsuran Mobil", amount: 3800000 },
      { name: "Suka Cita dan Duka Cita", category: "Dana Sosial", amount: 300000 },
      { name: "Pembuatan kaos anggota 50 pcs", category: "Perlengkapan & Atribut", amount: 3000000 },
      { name: "Akomodasi RAKORNAS BAPOR", category: "Kegiatan Organisasi", amount: 2000000 }
    ]
  },
  {
    period: "2024-09", year: 2024, month: "September", saldoAwal: 12818000, pemasukan: 18000000,
    expenses: [
      { name: "Setor COS dan akomodasi pengurus", category: "Setor COS & Pengurus", amount: 9000000 },
      { name: "Angsuran Mobil", category: "Angsuran Mobil", amount: 3800000 },
      { name: "Suka Cita dan Duka Cita", category: "Dana Sosial", amount: 300000 }
    ]
  },
  {
    period: "2024-10", year: 2024, month: "Oktober", saldoAwal: 17718000, pemasukan: 18000000,
    expenses: [
      { name: "Setor COS dan akomodasi pengurus", category: "Setor COS & Pengurus", amount: 9000000 },
      { name: "Angsuran Mobil", category: "Angsuran Mobil", amount: 3800000 },
      { name: "Suka Cita dan Duka Cita", category: "Dana Sosial", amount: 300000 },
      { name: "Dana pembangunan gedung DPD FSP LEM SPSI", category: "Pembangunan Gedung", amount: 2500000 }
    ]
  },
  {
    period: "2024-11", year: 2024, month: "November", saldoAwal: 20118000, pemasukan: 18000000,
    expenses: [
      { name: "Setor COS dan akomodasi pengurus", category: "Setor COS & Pengurus", amount: 9000000 },
      { name: "Angsuran Mobil", category: "Angsuran Mobil", amount: 3800000 },
      { name: "Suka Cita dan Duka Cita", category: "Dana Sosial", amount: 300000 },
      { name: "Servis Rutin Mobil PUK", category: "Kendaraan", amount: 1500000 },
      { name: "Ganti ban mobil", category: "Kendaraan", amount: 2700000 }
    ]
  },
  {
    period: "2024-12", year: 2024, month: "Desember", saldoAwal: 20818000, pemasukan: 18000000,
    expenses: [
      { name: "Setor COS dan akomodasi pengurus", category: "Setor COS & Pengurus", amount: 9000000 },
      { name: "Angsuran Mobil", category: "Angsuran Mobil", amount: 3800000 },
      { name: "Suka Cita dan Duka Cita", category: "Dana Sosial", amount: 300000 },
      { name: "Ganti ban mobil", category: "Kendaraan", amount: 900000 },
      { name: "Aksi PEMDA", category: "Aksi & Advokasi", amount: 1500000 },
      { name: "Aksi PEMPROV", category: "Aksi & Advokasi", amount: 2000000 },
      { name: "Servis printer PUK", category: "Aset & Operasional", amount: 303000 }
    ]
  },

  // 2025
  {
    period: "2025-01", year: 2025, month: "Januari", saldoAwal: 22015000, pemasukan: 18000000,
    expenses: [
      { name: "Setor COS dan akomodasi pengurus", category: "Setor COS & Pengurus", amount: 9000000 },
      { name: "Angsuran Mobil", category: "Angsuran Mobil", amount: 3800000 },
      { name: "Sumbangan suka cita dan duka", category: "Dana Sosial", amount: 300000 },
      { name: "Kunjungan kerja DPC FSP LEM SPSI", category: "Kegiatan Organisasi", amount: 500000 }
    ]
  },
  {
    period: "2025-02", year: 2025, month: "Februari", saldoAwal: 26415000, pemasukan: 18000000,
    expenses: [
      { name: "Setor COS dan akomodasi pengurus", category: "Setor COS & Pengurus", amount: 9000000 },
      { name: "Angsuran Mobil", category: "Angsuran Mobil", amount: 3800000 },
      { name: "Akomodasi HUT KSPSI Ke 52 - Transport", category: "Kegiatan Organisasi", amount: 10000000 },
      { name: "Akomodasi HUT KSPSI Ke 52 - Makan", category: "Konsumsi & Kegiatan", amount: 1800000 },
      { name: "Akomodasi BAPOR", category: "Olahraga & Kegiatan", amount: 1000000 },
      { name: "Sumbangan suka cita dan duka", category: "Dana Sosial", amount: 300000 }
    ]
  },
  {
    period: "2025-03", year: 2025, month: "Maret", saldoAwal: 18515000, pemasukan: 18000000,
    expenses: [
      { name: "Setor COS dan akomodasi pengurus", category: "Setor COS & Pengurus", amount: 9000000 },
      { name: "Angsuran Mobil", category: "Angsuran Mobil", amount: 3800000 },
      { name: "Sumbangan suka cita dan duka", category: "Dana Sosial", amount: 300000 },
      { name: "Mutasi mobil operasional PUK", category: "Kendaraan", amount: 15000000 },
      { name: "Bukber PUK dan Manajemen", category: "Konsumsi & Kegiatan", amount: 3000000 }
    ]
  },
  {
    period: "2025-04", year: 2025, month: "April", saldoAwal: 5442000, pemasukan: 20250000,
    expenses: [
      { name: "Setor COS dan akomodasi pengurus", category: "Setor COS & Pengurus", amount: 10125000 },
      { name: "Agenda pertemuan Pleno", category: "Kegiatan Organisasi", amount: 5000000 },
      { name: "Angsuran Mobil", category: "Angsuran Mobil", amount: 3800000 },
      { name: "Pembuatan kaos anggota 50 pcs", category: "Perlengkapan & Atribut", amount: 3000000 },
      { name: "Sumbangan suka cita dan duka", category: "Dana Sosial", amount: 300000 }
    ]
  },
  {
    period: "2025-05", year: 2025, month: "Mei", saldoAwal: 3467000, pemasukan: 20250000,
    expenses: [
      { name: "Setor COS dan akomodasi pengurus", category: "Setor COS & Pengurus", amount: 10125000 },
      { name: "Angsuran Mobil", category: "Angsuran Mobil", amount: 3800000 },
      { name: "Sumbangan Duka dan suka Cita", category: "Dana Sosial", amount: 300000 },
      { name: "Akomodasi May Day", category: "May Day", amount: 5000000 }
    ]
  },
  {
    period: "2025-06", year: 2025, month: "Juni", saldoAwal: 4492000, pemasukan: 20250000,
    expenses: [
      { name: "Setor COS dan akomodasi pengurus", category: "Setor COS & Pengurus", amount: 10125000 },
      { name: "Angsuran Mobil", category: "Angsuran Mobil", amount: 3800000 },
      { name: "Pembuatan Jersey futsal 15 pcs", category: "Perlengkapan & Atribut", amount: 1500000 },
      { name: "Suka Cita dan Duka Cita", category: "Dana Sosial", amount: 300000 },
      { name: "Service mobil PUK", category: "Kendaraan", amount: 1000000 }
    ]
  },
  {
    period: "2025-07", year: 2025, month: "Juli", saldoAwal: 8017000, pemasukan: 20250000,
    expenses: [
      { name: "Setor COS dan akomodasi pengurus", category: "Setor COS & Pengurus", amount: 10125000 },
      { name: "Angsuran Mobil", category: "Angsuran Mobil", amount: 3800000 },
      { name: "Suka Cita dan Duka Cita", category: "Dana Sosial", amount: 300000 },
      { name: "Pajak Mobil PUK", category: "Kendaraan", amount: 4000000 }
    ]
  },
  {
    period: "2025-08", year: 2025, month: "Agustus", saldoAwal: 10042000, pemasukan: 20250000,
    expenses: [
      { name: "Setor COS dan akomodasi pengurus", category: "Setor COS & Pengurus", amount: 10125000 },
      { name: "Angsuran Mobil", category: "Angsuran Mobil", amount: 3800000 },
      { name: "Suka Cita dan Duka Cita", category: "Dana Sosial", amount: 300000 },
      { name: "Konsolidasi Pleno dan mancing", category: "Olahraga & Kegiatan", amount: 5000000 }
    ]
  },
  {
    period: "2025-09", year: 2025, month: "September", saldoAwal: 11067000, pemasukan: 20250000,
    expenses: [
      { name: "Setor COS dan akomodasi pengurus", category: "Setor COS & Pengurus", amount: 10125000 },
      { name: "Angsuran Mobil", category: "Angsuran Mobil", amount: 3800000 },
      { name: "Suka Cita dan Duka Cita", category: "Dana Sosial", amount: 300000 }
    ]
  },
  {
    period: "2025-10", year: 2025, month: "Oktober", saldoAwal: 17092000, pemasukan: 20250000,
    expenses: [
      { name: "Setor COS dan akomodasi pengurus", category: "Setor COS & Pengurus", amount: 10125000 },
      { name: "Angsuran Mobil", category: "Angsuran Mobil", amount: 3800000 },
      { name: "Suka Cita dan Duka Cita", category: "Dana Sosial", amount: 300000 }
    ]
  },
  {
    period: "2025-11", year: 2025, month: "November", saldoAwal: 23117000, pemasukan: 20250000,
    expenses: [
      { name: "Setor COS dan akomodasi pengurus", category: "Setor COS & Pengurus", amount: 10125000 },
      { name: "Angsuran Mobil", category: "Angsuran Mobil", amount: 3800000 },
      { name: "Suka Cita dan Duka Cita", category: "Dana Sosial", amount: 300000 }
    ]
  },
  {
    period: "2025-12", year: 2025, month: "Desember", saldoAwal: 29142000, pemasukan: 20250000,
    expenses: [
      { name: "Setor COS dan akomodasi pengurus", category: "Setor COS & Pengurus", amount: 10125000 },
      { name: "Angsuran Mobil", category: "Angsuran Mobil", amount: 3800000 },
      { name: "Suka Cita dan Duka Cita", category: "Dana Sosial", amount: 300000 },
      { name: "Pemberian penghargaan karyawan absensi terbaik", category: "Penghargaan Karyawan", amount: 3500000 },
      { name: "Akomodasi dan biaya MUSCAB DPC FSP LEM SPSI", category: "Kegiatan Organisasi", amount: 10850000 }
    ]
  },

  // 2026
  {
    period: "2026-01", year: 2026, month: "Januari", saldoAwal: 20817000, pemasukan: 20250000,
    expenses: [
      { name: "Setor COS dan akomodasi pengurus", category: "Setor COS & Pengurus", amount: 10125000 },
      { name: "Angsuran Mobil", category: "Angsuran Mobil", amount: 3800000 },
      { name: "Suka Cita dan Duka Cita", category: "Dana Sosial", amount: 300000 },
      { name: "Akomodasi aksi upah 2026 Pemda Karawang", category: "Aksi & Advokasi", amount: 1000000 },
      { name: "Akomodasi aksi Upah 2026 Bandung 2 kali", category: "Aksi & Advokasi", amount: 3200000 },
      { name: "Setor COS TSCUF 2025", category: "Setor COS TSCUF", amount: 2430000 }
    ]
  },
  {
    period: "2026-02", year: 2026, month: "Februari", saldoAwal: 20212000, pemasukan: 20250000,
    expenses: [
      { name: "Setor COS dan akomodasi pengurus", category: "Setor COS & Pengurus", amount: 10125000 },
      { name: "Angsuran Mobil", category: "Angsuran Mobil", amount: 3800000 },
      { name: "Suka Cita dan Duka Cita", category: "Dana Sosial", amount: 300000 }
    ]
  },
  {
    period: "2026-03", year: 2026, month: "Maret", saldoAwal: 26237000, pemasukan: 20250000,
    expenses: [
      { name: "Setor COS dan akomodasi pengurus", category: "Setor COS & Pengurus", amount: 10125000 },
      { name: "Angsuran Mobil", category: "Angsuran Mobil", amount: 3800000 },
      { name: "Suka Cita dan Duka Cita", category: "Dana Sosial", amount: 300000 },
      { name: "Akomodasi RAKERCAB", category: "Kegiatan Organisasi", amount: 5000000 },
      { name: "Kompensasi THR pengurus", category: "THR & Bonus", amount: 4500000 },
      { name: "THR DPC dan DPD FSP LEM SPSI", category: "THR & Bonus", amount: 5000000 }
    ]
  }
];
