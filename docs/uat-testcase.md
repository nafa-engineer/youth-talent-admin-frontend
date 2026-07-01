# UAT Checklist - Admin App (FE x BE Integration)

Dokumen ini berisi daftar skenario pengujian integrasi antara Frontend (FE) dan Backend (BE) untuk Aplikasi Admin platform manajemen monitoring ibadah dan akademik.

---

## 1. Login & Role-Based Access

| ID | Fitur / Skenario Pengujian | Ekspektasi Hasil (FE x BE Integration) | Status (Pass/Fail) | Catatan |
| :--- | :--- | :--- | :---: | :--- |
| UAT-LOG-01 | Login Valid (Super Admin / Admin) | BE mengembalikan JWT Token & Role. FE mengarahkan ke Dashboard sesuai hak akses. | v | Sesuai. Token & Role berhasil disimpan di Zustand (auth-storage) dan diredirect ke dashboard. |
| UAT-LOG-02 | Login Invalid (Password Salah / Email Tidak Terdaftar) | BE mengembalikan error `401 Unauthorized` atau `404 Not Found`. FE menampilkan pesan galat yang informatif. | v | Sesuai. Interceptor mengabaikan redirect 401 jika di `/login` dan form login menampilkan pesan error toast. |
| UAT-LOG-03 | Validasi Token Kedaluwarsa (Expired Token) | Saat token habis, request ke BE mengembalikan `401`. FE otomatis melakukan logout dan mengarahkan ke halaman Login. | v | Sesuai. Interceptor Axios menghapus `auth-storage` dan meredirect ke `/login?expired=true` jika mendapat status 401/403. |
| UAT-LOG-04 | Pembatasan Hak Akses Menu (Role-Based) | Menu "Manajemen Admin" & "Manajemen Kampus" hanya muncul dan bisa diakses oleh Super Admin. Admin biasa tidak dapat melihat/mengaksesnya. | v | Sesuai. Menu disembunyikan di sidebar dan dilindungi dengan middleware `useRoleGuard(true)`. |

---

## 2. Manajemen Admin (Super Admin Only)

| ID | Fitur / Skenario Pengujian | Ekspektasi Hasil (FE x BE Integration) | Status (Pass/Fail) | Catatan |
| :--- | :--- | :--- | :---: | :--- |
| UAT-ADM-01 | Menampilkan Daftar Admin | FE mengirimkan request GET. BE mengembalikan list data admin. Data terender di tabel dengan benar (Nama, Email, Kampus, Status). | v | Sesuai. Ditampilkan dalam tabel admin dengan kolom Nama, Email, Peran, Kampus Penugasan, dan Status Aktif. |
| UAT-ADM-02 | Tambah Admin Baru (Valid) | Form diisi lengkap. Klik simpan -> BE mengembalikan `201 Created`. Daftar admin terperbarui otomatis di FE. | v | Sesuai. Data dikirim ke API dan tabel ter-refresh otomatis melalui callback `onSuccess`. |
| UAT-ADM-03 | Tambah Admin (Email Duplikat) | BE mendeteksi email sudah terdaftar, mengembalikan error `400 Bad Request`. FE menampilkan pesan "Email sudah digunakan". | v | Sesuai. Pesan error dari backend ditangkap dan ditampilkan via toast.error. |
| UAT-ADM-04 | Ubah Status Admin (Aktif/Non-Aktif) | Mengubah toggle status admin. BE memperbarui database. Admin yang dinonaktifkan tidak akan bisa login lagi pada percobaan berikutnya. | v | Sesuai. Menggunakan API `/deactivate` untuk menonaktifkan. Catatan: Di UI hanya ada tombol nonaktifkan (satu arah), tidak ada toggle untuk mengaktifkan kembali. |

---

## 3. Manajemen Kampus (Super Admin Only)

| ID | Fitur / Skenario Pengujian | Ekspektasi Hasil (FE x BE Integration) | Status (Pass/Fail) | Catatan |
| :--- | :--- | :--- | :---: | :--- |
| UAT-KMP-01 | CRUD Data Kampus / Sekolah | Proses Create, Read, Update, dan Delete kampus berjalan mulus dari UI ke DB melalui API endpoint `/api/v1/campuses`. | x | Gagal. Fitur Create, Read, dan Update sudah berfungsi, tetapi tombol **Delete** belum diimplementasikan di halaman dan API client hanya berisi stub. |
| UAT-KMP-02 | Relasi Admin ke Kampus Spesifik | Saat Super Admin membuat Admin baru, pilihan Kampus harus dinamis mengambil data dari master kampus di BE. | v | Sesuai. Dropdown mengambil data secara dinamis dari API master kampus. |

---

## 4. Manajemen Customer

| ID | Fitur / Skenario Pengujian | Ekspektasi Hasil (FE x BE Integration) | Status (Pass/Fail) | Catatan |
| :--- | :--- | :--- | :---: | :--- |
| UAT-CST-01 | Menampilkan Data Mahasiswa / Santri | Menampilkan list customer berdasarkan filter Kampus dari admin yang sedang login. Admin Kampus A tidak boleh melihat Customer Kampus B. | x | Halaman khusus Manajemen Customer tidak ada dalam navigasi/halaman. List peserta hanya bisa dilihat per tim di detail tim. |
| UAT-CST-02 | Pencarian & Filter Customer | Fitur pencarian berdasarkan Nama/Nomor Induk dan filter status aktif bekerja secara server-side (pagination & query param BE). | x | Tidak ada halaman Manajemen Customer, sehingga fitur pencarian/filter server-side seluruh customer tidak tersedia. Customer hanya bisa dilihat dari |

---

## 5. Manajemen Tim (Teams)

| ID | Fitur / Skenario Pengujian | Ekspektasi Hasil (FE x BE Integration) | Status (Pass/Fail) | Catatan |
| :--- | :--- | :--- | :---: | :--- |
| UAT-TMS-01 | Pembentukan Kelompok / Tim | Admin dapat membuat kelompok mentoring baru, memilih Mentor, dan memasukkan beberapa Customer ke dalam tim tersebut. | x | Gagal. Form pembuatan tim hanya berisi nama, kode, kelas, dan kampus. Tidak ada dropdown pilihan Mentor dan tidak ada fitur memasukkan anggota secara langsung saat pembuatan. |
| UAT-TMS-02 | Validasi Anggota Ganda | Mengurangi risiko duplikasi; Customer yang sudah memiliki tim aktif tidak muncul lagi di pilihan anggota tim baru (kondisi di-filter oleh BE). | x | Gagal. Tidak ada fitur untuk memilih/menambahkan peserta umum langsung dari detail tim (hanya ada pemindahan peserta yang sudah ada di tim lain). |

---

## 6. Rekap Mentoring

| ID | Fitur / Skenario Pengujian | Ekspektasi Hasil (FE x BE Integration) | Status (Pass/Fail) | Catatan |
| :--- | :--- | :--- | :---: | :--- |
| UAT-MNT-01 | Melihat Histori Jurnal Mentoring | FE menampilkan daftar pertemuan, materi yang dibahas, dan absensi yang diinput oleh Mentor. Data ditarik via API rekap mentoring. | x | Gagal. Halaman `/mentoring/recap` hanya menampilkan rekap angka kehadiran peserta secara akumulatif, bukan list pertemuan, jurnal, atau materi. |
| UAT-MNT-02 | Verifikasi / Approval Jurnal Admin | Admin memberikan status 'Verified' pada jurnal mentoring. BE mengubah status dan mengunci data agar tidak bisa diedit mentor lagi. | x | Gagal. Fitur verifikasi/approval jurnal oleh Admin belum diimplementasikan di FE maupun API client. |

---

## 7. Rata-Rata Skor Ibadah

| ID | Fitur / Skenario Pengujian | Ekspektasi Hasil (FE x BE Integration) | Status (Pass/Fail) | Catatan |
| :--- | :--- | :--- | :---: | :--- |
| UAT-SKR-01 | Agregasi Nilai Amalan Yaumiyah | Menampilkan grafik atau tabel rata-rata skor ibadah harian/mingguan per kelompok atau per kampus secara akurat berdasarkan kalkulasi BE. | v | Sesuai. Di dashboard menampilkan chart rata-rata skor ibadah per gender, grade, dan kampus menggunakan data agregasi BE. |
| UAT-SKR-02 | Filter Rentang Tanggal | Mengubah parameter tanggal di FE meredirect query ke BE, menghasilkan rata-rata skor yang disesuaikan dengan rentang waktu terpilih. | v | Sesuai. Filter pekan di dashboard memperbarui `weekParams` yang dikirim ke API rata-rata skor. |

---

## 8. Leaderboard (Admin View)

| ID | Fitur / Skenario Pengujian | Ekspektasi Hasil (FE x BE Integration) | Status (Pass/Fail) | Catatan |
| :--- | :--- | :--- | :---: | :--- |
| UAT-LDB-01 | Tampilan Peringkat Customer | Menampilkan top peringkat customer berdasarkan kepatuhan pengisian amalan yaumiyah terkumpul. Urutan sesuai sorting DESC dari BE. | v | Sesuai. Menampilkan tabel peringkat peserta teratas secara global maupun per aktivitas yang disortir DESC dari backend. |
| UAT-LDB-02 | Sistem Caching Leaderboard | Memastikan performa: BE menggunakan mekanisme caching (misal: Redis). Data di FE termuat cepat (< 1 detik) saat di-refresh. | v | Sesuai. Caching berada di BE, FE mengonsumsi API secara responsif. |

---

## 9. Dashboard & Analitik Umum

| ID | Fitur / Skenario Pengujian | Ekspektasi Hasil (FE x BE Integration) | Status (Pass/Fail) | Catatan |
| :--- | :--- | :--- | :---: | :--- |
| UAT-DSH-01 | Ringkasan Total Data (Cards Analytics) | Menampilkan total Kampus, Total Admin, Total Mentor, dan Total Customer aktif secara real-time di halaman utama dashboard. | x | Gagal. Dashboard hanya menampilkan Total Peserta (Customer) aktif dan Total Kelompok (Teams). Total Kampus, Admin, dan Mentor tidak ditampilkan. |

---

## 10. Edge Case & Stabilitas

| ID | Fitur / Skenario Pengujian | Ekspektasi Hasil (FE x BE Integration) | Status (Pass/Fail) | Catatan |
| :--- | :--- | :--- | :---: | :--- |
| UAT-STB-01 | Penanganan Network Error / Server Down | Jika API BE mati (502/503), FE tidak crash melainkan menampilkan halaman / komponen penanda "Server sedang maintenance". | x | Gagal. Tidak ada halaman/komponen penanda "Server sedang maintenance" jika BE mati. Hanya memunculkan toast error default. |
| UAT-STB-02 | Validasi Input Khusus (XSS/SQLi injection) | UI memvalidasi karakter aneh, dan BE melakukan sanitasi ketat. Tidak ada celah tembus data mentah ke database melalui form admin. | v | Sesuai. Validasi ketat dilakukan di UI menggunakan skema Zod (tipe data, format email, minimal panjang string). |

---

## Ringkasan

* **Total Skenario:** 22 Skenario Pengujian
* **Kriteria Kelulusan Minimal:** 100% Skenario Utama (Critical Path) berstatus **Pass**.
* **Penguji:** Admin QA Team / Lead Developer
* **Tanggal Pengujian:** 28 Juni 2026