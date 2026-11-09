# Desain Peningkatan Fitur Tukar Jadwal & Update Status Piket

**Tanggal:** 2026-09-02  
**Topik:** Penyempurnaan Fitur Tukar Jadwal Piket & Validasi Status Piket Prajurit  
**Status:** Disetujui (Approved)

---

## 1. Ringkasan Eksekutif

Dokumen ini merinci rancangan desain untuk meningkatkan pengalaman pengguna (UX) dan integritas logika pada modul Jadwal Piket Satlak Duktek, mencakup:
1. **Pengelompokan (Grouping) Nama Anggota pada Dropdown Tukar Jadwal** untuk menghilangkan duplikasi nama dan menampilkan tanggal piket secara spesifik.
2. **Riwayat & Pelacakan Status Usulan Tukar Jadwal** agar pengajuan tidak langsung hilang/mereset sebelum diproses oleh Admin.
3. **Validasi Waktu Pengajuan Status Piket** (*Selesai* vs *Tidak Hadir*).
4. **Validasi Tanggal Penukaran Jadwal**.

---

## 2. Arsitektur & Perubahan Komponen

### A. Selector Pengganti Tukar Jadwal (`PiketUpdateModal.jsx`)
- **Struktur Tampilan**: Menggunakan `<optgroup>` berdasarkan nama anggota.
  - **Label Grup**: `[Nama Prajurit] – [Jabatan] ([Pangkat])`
  - **Item Pilihan**: Tanggal piket spesifik milik prajurit tersebut di bulan yang sama yang berstatus `scheduled` dan belum lewat dari hari ini.
  - **Format Opsi**: `Piket: [Hari], [DD MMMM YYYY]` (misal: *Piket: Senin, 05 Oktober 2026*).
- **Backend (`suggestSwapTargets`)**: Memastikan jadwal yang dikembalikan hanya jadwal mendatang ($\ge$ hari ini) dan belum memiliki usulan tukar pending.

### B. Validasi Update Status Piket (`PiketUpdateModal.jsx` & `jadwalPiketController.js`)
- **Aturan Bisnis**:
  - **Status Selesai (`completed`)**: Hanya diizinkan jika `tanggal_piket <= todayDateOnly()`.
  - **Status Tidak Hadir (`absent`)**: Diizinkan sebelum hari H maupun pada/setelah hari H dengan keterangan wajib diisi.
- **Perilaku UI**:
  - Jika pengguna memilih status `Selesai` pada jadwal masa depan, muncul pesan peringatan validasi dan tombol kirim otomatis dinonaktifkan (*disabled*).
- **Proteksi Backend (`ajukanUsulanStatus`)**: Memvalidasi aturan tanggal sebelum menyimpan usulan status.

### C. Riwayat & Pelacakan Pengajuan Tukar Jadwal
1. **Indikator pada Kalender (`MiniCalendar.jsx`)**:
   - Tanggal jadwal yang memiliki `swap_approval_status === 'pending'` ditandai dengan ring/warna khusus (Amber/Menunggu Persetujuan).
   - Panel detail kalender menampilkan detail usulan penukaran (Nama anggota pengganti, tanggal pengganti, dan alasan).
   - Tombol *Update Status* dinonaktifkan sementara usulan tukar masih berstatus *pending*.
2. **Section Riwayat di Dashboard Prajurit (`Dashboard.jsx`)**:
   - Menampilkan card/tabel riwayat usulan penukaran jadwal aktif maupun yang telah diproses.
   - Kolom: Tanggal Jadwal Saya, Anggota & Tanggal Pengganti, Alasan, Status Persetujuan (*Menunggu*, *Disetujui*, *Ditolak*).

### D. Alur Persetujuan Admin (`JadwalPiketManage.jsx` & `reviewUsulanTukar`)
- Admin dapat menyetujui (*approve*) atau menolak (*reject*) usulan tukar jadwal.
- Saat disetujui: Prajurit pada jadwal asal dan jadwal target otomatis bertukar dalam transaksi database (`sequelize.transaction`), dan status diperbarui menjadi *approved*.

---

## 3. Data Flow & Siklus Hidup Usulan Tukar

```
[ Prajurit A ]
   │
   ├─► Memilih Jadwal Target Prajurit B (via Optgroup per nama)
   ├─► Mengisi Alasan Tukar
   └─► Kirim Usulan (swap_approval_status: 'pending')
         │
         ├──► Muncul di Riwayat Pengajuan Prajurit (Status: Menunggu)
         ├──► Ditandai pada Kalender Piket (Badge/Ring Amber)
         │
[ Admin Panel ]
   │
   ├─► Review Usulan Tukar
   │     ├─► [Setujui] ──► Swap soldier_id pada DB ──► Status: Approved ──► Kalender ter-update
   │     └─► [Tolak]   ──► Tidak swap              ──► Status: Rejected ──► Prajurit diberi notifikasi
```

---

## 4. Rencana Pengujian (Testing & Verification)
1. **Dropdown Test**: Verifikasi bahwa prajurit dengan >1 jadwal piket hanya muncul satu kali sebagai header grup dengan daftar tanggal piket di bawahnya.
2. **Future Date Completion Test**: Pastikan pemilihan status *Selesai* pada tanggal di masa depan menampilkan peringatan dan mencegah submit.
3. **Future Date Absence Test**: Pastikan status *Tidak Hadir* pada tanggal di masa depan berhasil diajukan dengan alasan wajib.
4. **Swap Lifecycle Test**: Verifikasi usulan tukar muncul di riwayat dan kalender dengan status pending, kemudian saat diapprove admin, jadwal kedua prajurit bertukar dengan benar.
