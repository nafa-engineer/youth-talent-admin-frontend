# Product Requirements Document (PRD): Youth Talent - Admin Dashboard

**Dokumen Versi:** 1.1
**Status:** Ready for Development
**Produk:** Youth Talent Management System
**Platform:** Web Application (Responsive Desktop & Mobile)

---

## 1. Ringkasan Eksekutif
Sistem **Youth Talent** memerlukan portal *Admin Dashboard* terpusat untuk memfasilitasi pengurus dalam memantau, mengevaluasi, dan mengelola aktivitas pembinaan kepemudaan. Dokumen ini merangkum kebutuhan pengembangan antarmuka (UI/UX) dengan adaptasi sistem desain aplikasi utama, serta integrasi fungsi ke RESTful API yang telah disiapkan.

## 2. Tujuan & Sasaran
* Menyediakan visualisasi data demografi peserta (Ikhwan/Akhwat per Kampus).
* Memberikan kemudahan pemantauan rekam jejak kehadiran mentoring (fokus 3 bulan terakhir).
* Menampilkan analitik performa *Mutabaah Yaumiyah* peserta.
* Memfasilitasi fleksibilitas administrasi perpindahan anggota antar grup pembinaan.

## 3. User Personas
1.  **Admin (Pengurus Kampus/Regional):** Bertugas memantau performa, melihat rekap kehadiran, dan mengelola grup mentoring di bawah wewenangnya.
2.  **Super Admin (Pengurus Pusat):** Memiliki semua akses Admin, ditambah wewenang mengelola *Master Data* (Kampus, Akun Admin, dan Hak Akses).

---

## 4. Kebutuhan Fitur & Pemetaan API

### Fitur 1: Dashboard & Demografi Kampus
Menampilkan gambaran umum total peserta dengan pemecahan data visual berdasarkan gender dan kampus.
* **Kriteria Penerimaan:** Terdapat grafik *Pie Chart* untuk rasio gender dan *Bar Chart* untuk jumlah peserta per kampus. Tersedia filter data berdasarkan kampus.
* **Integrasi API:** `GET /api/v1/customers/count`, `GET /api/v1/campuses`

### Fitur 2: Rekapitulasi Kehadiran Mentoring
Modul untuk memantau kedisiplinan peserta dalam mengikuti halaqah/mentoring.
* **Kriteria Penerimaan:** Menampilkan tabel data rekap kehadiran peserta untuk 3 bulan terakhir. Menyediakan filter *dropdown* untuk rentang pekan tertentu.
* **Integrasi API:** `GET /api/v1/mentoring/recap`, `GET /api/v1/weeks/current`, `GET /api/v1/weeks/{id}`

### Fitur 3: Performa Mutabaah Yaumiyah
Modul analitik untuk mengevaluasi konsistensi amalan yaumiyah peserta.
* **Kriteria Penerimaan:** Menampilkan *Leaderboard* performa amal harian. Menampilkan performa spesifik per jenis amalan. Terdapat tombol untuk *refresh/generate* data terbaru.
* **Integrasi API:** `GET /api/v1/leaderboard/global`, `GET /api/v1/leaderboard/activity/{activityId}`, `GET /api/v1/deed-activities`, `POST /api/v1/leaderboard/generate`

### Fitur 4: Manajemen Grup & Transfer Anggota
Antarmuka untuk mengatur dan memindahkan peserta dari satu tim/grup ke tim lainnya.
* **Kriteria Penerimaan:** Menampilkan daftar grup beserta anggota. Admin dapat memilih peserta secara *multi-select* dan memindahkannya ke Grup Tujuan melalui eksekusi instan.
* **Integrasi API:** `GET /api/v1/teams`, `GET /api/v1/teams/campus/{campusId}`, `GET /api/v1/customers`, `PUT /api/v1/customers/transfer-team`

---

## 5. Fitur Super Admin (Master Data Management)
Menu otorisasi khusus bagi pengurus pusat.
* **Manajemen Kampus:** `POST /api/v1/campuses` (Tambah), `PUT /api/v1/campuses/{id}` (Edit).
* **Manajemen Akun Admin:** `GET /api/v1/admins` (Lihat), `POST /api/v1/admins` (Buat Baru), `PUT /api/v1/admins/{id}/deactivate` (Nonaktifkan), `PUT /api/v1/admins/{id}/transfer-campus` (Mutasi).

---

## 6. Autentikasi & Keamanan
* **Alur Kerja:** Validasi kredensial melalui form *Login*. Manajemen sesi menggunakan JWT. *Routing* sistem membatasi rute Super Admin dari Admin biasa.
* **Integrasi API:** `POST /api/v1/auth/admin/login`, `POST /api/v1/auth/forgot-password`, `POST /api/v1/auth/reset-password`, `GET /api/v1/admins/profile`.

---

## 7. Arsitektur & Infrastruktur Teknis
* **Frontend:** Next.js / React (selaras dengan Vercel deployment pada antarmuka *customer*).
* **Backend:** REST API (Java Spring Boot / Laravel).
* **Environment:** Containerization via Docker untuk standarisasi lingkungan rilis.

---

## 8. UI/UX & Design System

Sistem *Admin Dashboard* akan mengadopsi tema **Nature-Inspired Islamic** yang sudah diterapkan pada aplikasi *Customer*. Konsep *mobile-first* (max-width `28rem`) akan dipertahankan pada tampilan seluler, namun antarmuka akan diformat menjadi susunan grid yang lebih luas untuk tampilan *Desktop/Tablet* agar penyajian tabel dan analitik lebih maksimal.

### A. Konsep Desain
| Aspek | Deskripsi |
| :--- | :--- |
| **Tema** | Islami modern dengan nuansa alam (hijau dominan). |
| **Gaya Visual** | *Clean, minimalis, card-based* UI. |
| **Adaptasi Admin** | Elemen gamifikasi dialihfungsikan menjadi instrumen *monitoring* performa (visualisasi *badge* menjadi metrik data). |

### B. Palet Warna (Color System)
Menggunakan token CSS yang diekstrak dari basis kode utama untuk menjaga konsistensi.

**1. Primary & Secondary Colors**
| Token | Hex | Deskripsi |
| :--- | :--- | :--- |
| `--primary` | `#2D7A4F` | Hijau Islami — warna dominan (Tombol, Header). |
| `--secondary` | `#4A9D6F` | Hijau pelengkap. |
| `--accent` | `#D4AF37` | Emas/Gold — sorotan data penting atau elemen *ranking*. |

**2. Background & Surface**
| Token | Hex | Deskripsi |
| :--- | :--- | :--- |
| `--background` | `#F8FAF9` | Off-white hijau lembut untuk *canvas* dashboard. |
| `--foreground` | `#1A2E1A` | Hijau sangat gelap untuk teks utama. |
| `--card` / `--popover` | `#FFFFFF` | Latar belakang tabel, kartu grafik, dan *dropdown*. |
| `--muted` | `#E8F3ED` | Hijau sangat pucat untuk area non-fokus. |
| `--muted-foreground`| `#5A7A65` | Hijau medium untuk teks deskripsi tambahan. |

**3. Utility & Status**
| Token | Hex | Deskripsi |
| :--- | :--- | :--- |
| `--destructive` | `#D4183D` | Merah untuk status error atau *warning* (kehadiran rendah). |
| `--border` | `#2D7A4F26` | Garis pemisah tabel dengan 15% opacity hijau. |

**4. Kategori Grafik & Chart (Mutabaah Analytics)**
Warna ini didedikasikan untuk metrik visual pada `Fitur 1` dan `Fitur 3`.
| Token / Kategori | Hex | Deskripsi |
| :--- | :--- | :--- |
| `--chart-1` (Prayer) | `#2D7A4F` | Metrik kehadiran / ibadah wajib. |
| `--chart-2` (Character)| `#6BB892` | Metrik perbaikan diri / akhlak. |
| `--chart-3` (Quran) | `#3B8DB8` | Metrik tilawah (Biru Laut). |
| `--chart-4` (Charity) | `#D4AF37` | Metrik infaq (Emas). |