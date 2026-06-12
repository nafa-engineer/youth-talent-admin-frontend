# Product Requirements Document (PRD): Youth Talent - Admin Dashboard

**Dokumen Versi:** 1.0
**Status:** Ready for Development
**Produk:** Youth Talent Management System
**Platform:** Web Application

---

## 1. Ringkasan Eksekutif
Sistem **Youth Talent** memerlukan portal *Admin Dashboard* terpusat untuk memfasilitasi pengurus dalam memantau, mengevaluasi, dan mengelola aktivitas pembinaan kepemudaan. Dokumen ini merangkum kebutuhan pengembangan antarmuka (UI/UX) dan integrasi fungsi ke RESTful API yang telah disiapkan oleh tim Back-end.

## 2. Tujuan & Sasaran
* Menyediakan visualisasi data demografi peserta (Ikhwan/Akhwat per Kampus).
* Memberikan kemudahan pemantauan rekam jejak kehadiran mentoring (fokus 3 bulan terakhir).
* Menampilkan analitik performa *Mutabaah Yaumiyah* peserta.
* Memfasilitasi fleksibilitas administrasi perpindahan anggota antar grup pembinaan.

## 3. User Personas
Terdapat dua level otorisasi pada *Dashboard* ini:
1.  **Admin (Pengurus Kampus/Regional):** Bertugas memantau performa, melihat rekap kehadiran, dan mengelola grup mentoring di bawah wewenangnya.
2.  **Super Admin (Pengurus Pusat):** Memiliki semua akses Admin, ditambah wewenang mengelola *Master Data* (Kampus, Akun Admin, dan Hak Akses).

---

## 4. Kebutuhan Fitur & Pemetaan API (Scope of Work)

### Fitur 1: Dashboard & Demografi Kampus
Menampilkan gambaran umum total peserta dengan pemecahan data visual berdasarkan gender dan kampus.

* **Kriteria Penerimaan (Acceptance Criteria):**
    * Terdapat grafik visual (misal: *Pie Chart*) yang menampilkan rasio Ikhwan vs Akhwat.
    * Terdapat *Bar Chart* yang menampilkan jumlah peserta per kampus.
    * Admin dapat melakukan filter data berdasarkan kampus tertentu.
* **Integrasi API:**
    * `GET /api/v1/customers/count` (Endpoint utama untuk data visualisasi jumlah user)
    * `GET /api/v1/campuses` (Untuk *dropdown* filter kampus)

### Fitur 2: Rekapitulasi Kehadiran Mentoring
Modul untuk memantau kedisiplinan peserta dalam mengikuti halaqah/mentoring.

* **Kriteria Penerimaan (Acceptance Criteria):**
    * Menampilkan tabel data rekap kehadiran peserta.
    * Secara *default*, sistem menampilkan data untuk **3 bulan terakhir**.
    * Menyediakan filter *dropdown* untuk memilih rentang pekan (*week*) tertentu.
* **Integrasi API:**
    * `GET /api/v1/mentoring/recap` (Endpoint utama rekap kehadiran)
    * `GET /api/v1/weeks/current` (Menentukan pekan saat ini untuk *default view*)
    * `GET /api/v1/weeks/{id}` (Mendapatkan referensi pekan untuk filter)

### Fitur 3: Performa Mutabaah Yaumiyah (Amal Harian)
Modul analitik untuk mengevaluasi konsistensi amalan yaumiyah peserta.

* **Kriteria Penerimaan (Acceptance Criteria):**
    * Menampilkan *Leaderboard* untuk melihat peserta dengan performa amal harian terbaik.
    * Menampilkan performa berdasarkan jenis amalan tertentu.
    * Terdapat tombol bagi Admin untuk memicu kalkulasi ulang (*refresh/generate*) data *leaderboard* terbaru.
* **Integrasi API:**
    * `GET /api/v1/leaderboard/global` (Menampilkan klasemen utama)
    * `GET /api/v1/leaderboard/activity/{activityId}` (Filter klasemen per amalan)
    * `GET /api/v1/deed-activities` (Mendapatkan daftar jenis amal untuk filter)
    * `POST /api/v1/leaderboard/generate` (Action *button* untuk re-kalkulasi data)

### Fitur 4: Manajemen Grup & Transfer Anggota
Antarmuka untuk mengatur dan memindahkan peserta dari satu tim/grup ke tim lainnya.

* **Kriteria Penerimaan (Acceptance Criteria):**
    * Menampilkan daftar tim/grup mentoring beserta anggotanya.
    * Admin dapat memilih (*checkbox*) satu atau beberapa peserta dari sebuah grup.
    * Admin dapat memilih "Grup Tujuan" dan menekan tombol konfirmasi untuk memindahkan peserta secara instan.
* **Integrasi API:**
    * `GET /api/v1/teams` & `GET /api/v1/teams/campus/{campusId}` (Menampilkan list tim)
    * `GET /api/v1/customers` (Menampilkan daftar peserta untuk dipilih)
    * `PUT /api/v1/customers/transfer-team` (Eksekusi pemindahan tim)

---

## 5. Fitur Super Admin (Master Data Management)
Menu khusus (*Restricted Area*) bagi pemegang *role* Super Admin.

* **Manajemen Kampus:**
    * `POST /api/v1/campuses` (Tambah kampus baru)
    * `PUT /api/v1/campuses/{id}` (Edit data kampus)
* **Manajemen Akun Admin:**
    * `GET /api/v1/admins` & `GET /api/v1/admins/{id}` (Lihat daftar admin)
    * `POST /api/v1/admins` (Buat akun admin baru)
    * `PUT /api/v1/admins/{id}/deactivate` (Nonaktifkan akun admin)
    * `PUT /api/v1/admins/{id}/transfer-campus` (Mutasi admin antar kampus)

---

## 6. Autentikasi & Keamanan (Sistem Core)
Akses menuju Dashboard wajib diamankan dengan protokol yang memadai.

* **Alur Kerja:**
    * Pengguna memasukkan kredensial di halaman *Login*.
    * Validasi sesi tersimpan dengan aman menggunakan standar JWT.
    * *Routing* sistem secara otomatis membedakan *role* pengguna dan membatasi rute Super Admin bagi Admin biasa.
* **Integrasi API:**
    * `POST /api/v1/auth/admin/login`
    * `POST /api/v1/auth/forgot-password` & `POST /api/v1/auth/reset-password`
    * `GET /api/v1/admins/profile`

---

## 7. Arsitektur & Infrastruktur Teknis

Sebagai acuan untuk memastikan ekosistem pengembangan berjalan bersih dan terukur dari awal proyek hingga rilis:

*   **Frontend:** Dibangun menggunakan **Next.js / React**, menjaga konsistensi dengan *stack* UI *customer* yang sudah berjalan dan di-*deploy* di **Vercel**.
*   **Backend:** Sistem API ini direkomendasikan berjalan pada lingkungan **Java (Spring Boot)** atau **Laravel**, yang solid untuk menangani logika manajemen pengguna yang kompleks.
*   **Version Control:** Menggunakan **Git** dan **GitHub** untuk mengelola sinkronisasi *repository*.
*   **Deployment & Environment:** Mengadopsi pendekatan *Containerization* menggunakan **Docker**. Hal ini akan membuat manajemen infrastruktur server jauh lebih bersih dibandingkan metode *upload* FTP konvensional.

## 8. Catatan Integrasi Back-end
Untuk memastikan performa *rendering* di sisi *frontend* tetap ringan, *endpoint* `GET /api/v1/customers/count` harus sudah mengimplementasikan *query parameter* khusus (*grouping*), misalnya `?groupBy=gender` atau `?groupBy=campusId`.