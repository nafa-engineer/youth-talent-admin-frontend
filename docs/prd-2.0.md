# Product Requirements Document (PRD): Youth Talent - Admin Dashboard

**Dokumen Versi:** 2.0
**Status:** Ready for Development
**Produk:** Youth Talent Management System
**Platform:** Web Application (Responsive Desktop & Mobile)
**Tanggal Revisi:** 2026-06-08

---

## Changelog dari Versi Sebelumnya

| Versi | Perubahan Utama |
| :--- | :--- |
| 1.0 | Dokumen awal — pemetaan fitur ke API. |
| 1.1 | Penambahan Design System & palet warna. |
| **2.0** | **Restrukturisasi menyeluruh berbasis RBAC.** Setiap endpoint dan fitur kini dipetakan secara eksplisit ke *role* yang berhak. Menambahkan Access Control Matrix, aturan UI kondisional per *role*, dan spesifikasi *Frontend Guard*. |

---

## 1. Ringkasan Eksekutif

Sistem **Youth Talent** memerlukan portal *Admin Dashboard* terpusat untuk memfasilitasi pengurus dalam memantau, mengevaluasi, dan mengelola aktivitas pembinaan kepemudaan. Dokumen revisi ini secara menyeluruh mendefinisikan batasan akses berdasarkan *role* (**Admin** dan **Super Admin**) sehingga setiap fitur, halaman, dan tombol aksi memiliki pemetaan otorisasi yang jelas ke masing-masing endpoint API.

## 2. Tujuan & Sasaran

* Menyediakan visualisasi data demografi peserta (Ikhwan/Akhwat per Kampus).
* Memberikan kemudahan pemantauan rekam jejak kehadiran mentoring (fokus 3 bulan terakhir).
* Menampilkan analitik performa *Mutabaah Yaumiyah* peserta.
* Memfasilitasi fleksibilitas administrasi perpindahan anggota antar grup pembinaan.
* **[Baru v2.0]** Menerapkan kontrol akses berbasis *role* (RBAC) secara ketat pada sisi *frontend* sehingga Admin biasa tidak dapat mengakses fitur *Master Data Management*.

---

## 3. User Personas & Hak Akses

### 3.1 Definisi Role

| Role | Deskripsi | Scope Data |
| :--- | :--- | :--- |
| **Admin** (Pengurus Kampus/Regional) | Bertugas memantau performa, melihat rekap kehadiran, dan mengelola grup mentoring **di bawah kampus yang ditugaskan**. | Terbatas pada data kampus yang di-*assign* ke akun admin tersebut (`campusId` dari token JWT). |
| **Super Admin** (Pengurus Pusat) | Memiliki **semua akses Admin**, ditambah wewenang mengelola *Master Data* (Kampus, Akun Admin). | Akses **lintas kampus** — dapat melihat dan mengelola data seluruh kampus. |

### 3.2 Identifikasi Role

Role diidentifikasi dari field `type` pada response `POST /api/v1/auth/admin/login` (`AdminLoginResponseDto`). Nilai yang diharapkan:
* `"ADMIN"` → Role Admin
* `"SUPER_ADMIN"` → Role Super Admin

Frontend harus menyimpan informasi `type`, `campusId`, dan `campusName` dari token login untuk menentukan scope data dan navigasi yang ditampilkan.

---

## 4. Access Control Matrix (ACM)

Matriks di bawah ini mendefinisikan secara eksplisit hak akses setiap endpoint berdasarkan *role*.

### 4.1 Public (Tanpa Autentikasi)

| Endpoint | Method | Deskripsi | Public | Admin | Super Admin |
| :--- | :--- | :--- | :---: | :---: | :---: |
| `/api/v1/auth/admin/login` | `POST` | Login admin | ✅ | — | — |
| `/api/v1/campuses` | `GET` | Daftar semua kampus | ✅ | ✅ | ✅ |
| `/api/v1/campuses/{id}` | `GET` | Detail kampus | ✅ | ✅ | ✅ |

### 4.2 Semua Role (Admin & Super Admin)

Endpoint referensi data yang bersifat *read-only* dan tidak memerlukan pembatasan *role* khusus.

| Endpoint | Method | Deskripsi | Admin | Super Admin |
| :--- | :--- | :--- | :---: | :---: |
| `/api/v1/leaderboard/global` | `GET` | Leaderboard utama | ✅ | ✅ |
| `/api/v1/leaderboard/activity/{activityId}` | `GET` | Leaderboard per amalan | ✅ | ✅ |
| `/api/v1/deed-activities` | `GET` | Daftar jenis amal aktif | ✅ | ✅ |
| `/api/v1/deed-activities/{id}` | `GET` | Detail jenis amal | ✅ | ✅ |
| `/api/v1/weeks/current` | `GET` | Pekan berjalan | ✅ | ✅ |
| `/api/v1/weeks/{id}` | `GET` | Detail pekan tertentu | ✅ | ✅ |

### 4.3 Admin & Super Admin (Fitur Operasional)

Endpoint yang digunakan untuk mengelola data operasional harian.

| Endpoint | Method | Deskripsi | Admin | Super Admin |
| :--- | :--- | :--- | :---: | :---: |
| `/api/v1/admins/profile` | `GET` | Profil admin yang sedang login | ✅ | ✅ |
| `/api/v1/customers` | `GET` | Daftar peserta (paginasi + filter) | ✅ | ✅ |
| `/api/v1/customers/count` | `GET` | Hitung peserta (untuk grafik) | ✅ | ✅ |
| `/api/v1/customers/transfer-team` | `PUT` | Pindahkan peserta antar tim | ✅ | ✅ |
| `/api/v1/teams` | `GET` | Semua tim | ✅ | ✅ |
| `/api/v1/teams/{id}` | `GET` | Detail tim | ✅ | ✅ |
| `/api/v1/teams/campus/{campusId}` | `GET` | Tim berdasarkan kampus | ✅ | ✅ |
| `/api/v1/teams` | `POST` | Buat tim baru | ✅ | ✅ |
| `/api/v1/teams/{id}` | `PUT` | Edit tim | ✅ | ✅ |
| `/api/v1/mentoring/recap` | `GET` | Rekap kehadiran mentoring | ✅ | ✅ |
| `/api/v1/leaderboard/generate` | `POST` | Re-kalkulasi leaderboard | ✅ | ✅ |

> **Catatan Scope Data untuk Admin:** Meskipun Admin dapat mengakses endpoint di atas, data yang dikembalikan oleh server **mungkin** sudah difilter berdasarkan `campusId` yang terkait dengan akun admin tersebut. Frontend wajib mengirimkan parameter `campusId` dari konteks login saat memanggil endpoint yang mendukung filter tersebut (misal: `GET /customers?campusId=X`).

### 4.4 Super Admin Only (Master Data Management)

Endpoint yang **hanya** boleh diakses oleh *Super Admin*. Frontend wajib menyembunyikan menu dan rute terkait dari user Admin biasa.

| Endpoint | Method | Deskripsi | Admin | Super Admin |
| :--- | :--- | :--- | :---: | :---: |
| `/api/v1/campuses` | `POST` | Buat kampus baru | ❌ | ✅ |
| `/api/v1/campuses/{id}` | `PUT` | Edit kampus | ❌ | ✅ |
| `/api/v1/admins` | `GET` | Daftar semua admin | ❌ | ✅ |
| `/api/v1/admins/{id}` | `GET` | Detail admin | ❌ | ✅ |
| `/api/v1/admins` | `POST` | Buat akun admin baru | ❌ | ✅ |
| `/api/v1/admins/{id}/deactivate` | `PUT` | Nonaktifkan akun admin | ❌ | ✅ |
| `/api/v1/admins/{id}/transfer-campus` | `PUT` | Mutasi admin antar kampus | ❌ | ✅ |

---

## 5. Kebutuhan Fitur & Pemetaan API Berbasis Role

### Fitur 1: Autentikasi & Manajemen Sesi

Gerbang masuk untuk seluruh pengguna *Dashboard*.

| Aspek | Detail |
| :--- | :--- |
| **Akses** | Public (halaman login), lalu Semua Role (setelah login) |
| **Halaman** | `/login` |

* **Kriteria Penerimaan:**
    * Halaman *Login* menampilkan form email & password.
    * Setelah login sukses, simpan `accessToken`, `refreshToken`, `type`, `campusId`, dan `campusName` ke *secure storage* (cookie HttpOnly atau state management).
    * Sistem **routing otomatis** mengarahkan user berdasarkan `type`:
        * `ADMIN` → Dashboard tanpa menu Master Data.
        * `SUPER_ADMIN` → Dashboard dengan menu Master Data lengkap.
    * Jika token kadaluarsa, redirect otomatis ke halaman login.
* **Integrasi API:**

| Endpoint | Method | Role |
| :--- | :--- | :--- |
| `/api/v1/auth/admin/login` | `POST` | Public |
| `/api/v1/admins/profile` | `GET` | Admin, Super Admin |

---

### Fitur 2: Dashboard & Demografi Kampus

Menampilkan gambaran umum total peserta dengan pemecahan data visual berdasarkan gender dan kampus.

| Aspek | Detail |
| :--- | :--- |
| **Akses** | Admin ✅, Super Admin ✅ |
| **Halaman** | `/dashboard` |

* **Kriteria Penerimaan:**
    * Terdapat grafik *Pie Chart* yang menampilkan rasio Ikhwan vs Akhwat.
    * Terdapat *Bar Chart* yang menampilkan jumlah peserta per kampus.
    * **Admin:** Filter kampus **ter-lock** ke kampus yang di-assign (otomatis `campusId` dari login). Tidak bisa melihat data kampus lain.
    * **Super Admin:** *Dropdown* filter kampus menampilkan **semua kampus**, default menampilkan data agregat lintas kampus.
* **Integrasi API:**

| Endpoint | Method | Role | Catatan |
| :--- | :--- | :--- | :--- |
| `/api/v1/customers/count` | `GET` | Admin, Super Admin | Query param: `?gender=PRIA`, `?campusId=X`, dll. |
| `/api/v1/campuses` | `GET` | Public | Untuk populasi dropdown filter kampus. |

---

### Fitur 3: Rekapitulasi Kehadiran Mentoring

Modul untuk memantau kedisiplinan peserta dalam mengikuti halaqah/mentoring.

| Aspek | Detail |
| :--- | :--- |
| **Akses** | Admin ✅, Super Admin ✅ |
| **Halaman** | `/mentoring/recap` |

* **Kriteria Penerimaan:**
    * Menampilkan tabel data rekap kehadiran peserta (nama, tim, kampus, jumlah kehadiran, total sesi).
    * Secara *default*, sistem menampilkan data untuk **3 bulan terakhir** (dihitung dari pekan berjalan).
    * Menyediakan filter *dropdown* untuk memilih rentang pekan (*startDate* & *endDate*) tertentu.
    * Filter tambahan: kampus, tim, gender.
    * **Admin:** Data otomatis terfilter sesuai `campusId` milik admin yang bersangkutan.
    * **Super Admin:** Dapat melihat dan memfilter data dari **semua kampus**.
* **Integrasi API:**

| Endpoint | Method | Role | Catatan |
| :--- | :--- | :--- | :--- |
| `/api/v1/mentoring/recap` | `GET` | Admin, Super Admin | Param wajib: `startDate`, `endDate`. Opsional: `campusId`, `teamId`, `gender`. |
| `/api/v1/weeks/current` | `GET` | Semua Role | Menentukan pekan saat ini untuk *default view*. |
| `/api/v1/weeks/{id}` | `GET` | Semua Role | Referensi detail pekan. |
| `/api/v1/campuses` | `GET` | Public | Untuk dropdown filter kampus. |
| `/api/v1/teams/campus/{campusId}` | `GET` | Admin, Super Admin | Untuk dropdown filter tim sesuai kampus. |

---

### Fitur 4: Performa Mutabaah Yaumiyah (Amal Harian)

Modul analitik untuk mengevaluasi konsistensi amalan yaumiyah peserta.

| Aspek | Detail |
| :--- | :--- |
| **Akses** | Admin ✅, Super Admin ✅ |
| **Halaman** | `/leaderboard` |

* **Kriteria Penerimaan:**
    * Menampilkan *Leaderboard* global untuk melihat peserta dengan performa amal harian terbaik.
    * Menampilkan performa berdasarkan jenis amalan tertentu melalui filter *dropdown*.
    * Terdapat tombol bagi Admin/Super Admin untuk memicu kalkulasi ulang (*refresh/generate*) data leaderboard terbaru.
    * Tabel leaderboard menampilkan: peringkat, nama peserta, nama tim, nama kampus, dan skor.
* **Integrasi API:**

| Endpoint | Method | Role | Catatan |
| :--- | :--- | :--- | :--- |
| `/api/v1/leaderboard/global` | `GET` | Semua Role | Klasemen utama. |
| `/api/v1/leaderboard/activity/{activityId}` | `GET` | Semua Role | Filter per jenis amalan. |
| `/api/v1/deed-activities` | `GET` | Semua Role | Daftar jenis amal untuk populasi dropdown filter. |
| `/api/v1/deed-activities/{id}` | `GET` | Semua Role | Detail jenis amal jika diperlukan. |
| `/api/v1/leaderboard/generate` | `POST` | Admin, Super Admin | Tombol aksi: *"Refresh Leaderboard"*. |

---

### Fitur 5: Manajemen Grup & Transfer Anggota

Antarmuka untuk mengatur dan memindahkan peserta dari satu tim/grup ke tim lainnya.

| Aspek | Detail |
| :--- | :--- |
| **Akses** | Admin ✅, Super Admin ✅ |
| **Halaman** | `/teams`, `/teams/{id}` |

* **Kriteria Penerimaan:**
    * Menampilkan daftar tim/grup mentoring beserta anggotanya.
    * Admin dapat memilih (*checkbox*) satu atau beberapa peserta dari sebuah grup.
    * Admin dapat memilih "Grup Tujuan" dan menekan tombol konfirmasi untuk memindahkan peserta secara instan.
    * Admin dan Super Admin dapat **membuat tim baru** dan **mengedit tim** yang ada.
    * **Admin:** Hanya melihat tim di kampus yang di-assign.
    * **Super Admin:** Dapat melihat dan mengelola tim dari **semua kampus**.
* **Integrasi API:**

| Endpoint | Method | Role | Catatan |
| :--- | :--- | :--- | :--- |
| `/api/v1/teams` | `GET` | Admin, Super Admin | Semua tim (server mungkin filter berdasarkan token). |
| `/api/v1/teams/{id}` | `GET` | Admin, Super Admin | Detail tim tertentu. |
| `/api/v1/teams/campus/{campusId}` | `GET` | Admin, Super Admin | Filter tim per kampus. |
| `/api/v1/teams` | `POST` | Admin, Super Admin | Buat tim baru. |
| `/api/v1/teams/{id}` | `PUT` | Admin, Super Admin | Edit tim. |
| `/api/v1/customers` | `GET` | Admin, Super Admin | Daftar peserta (paginasi). |
| `/api/v1/customers/transfer-team` | `PUT` | Admin, Super Admin | Eksekusi transfer peserta. |
| `/api/v1/campuses` | `GET` | Public | Untuk dropdown filter kampus saat buat/edit tim. |

---

### Fitur 6: Master Data — Manajemen Kampus ⛔ Super Admin Only

Menu otorisasi khusus bagi pengurus pusat untuk mengelola data kampus.

| Aspek | Detail |
| :--- | :--- |
| **Akses** | Admin ❌, Super Admin ✅ |
| **Halaman** | `/master/campuses` |

* **Kriteria Penerimaan:**
    * Menampilkan tabel daftar seluruh kampus.
    * Terdapat tombol *"Tambah Kampus"* yang membuka form/modal untuk membuat kampus baru (field: `name`).
    * Setiap baris kampus memiliki tombol *"Edit"* yang membuka form/modal untuk mengubah data kampus.
    * **Halaman, menu, dan rute ini HARUS disembunyikan sepenuhnya dari Admin biasa.**
    * Jika Admin biasa mencoba mengakses rute `/master/*` secara langsung (via URL), sistem harus me-*redirect* ke halaman Dashboard atau menampilkan halaman *403 Forbidden*.
* **Integrasi API:**

| Endpoint | Method | Role | Catatan |
| :--- | :--- | :--- | :--- |
| `/api/v1/campuses` | `GET` | Public | Menampilkan daftar kampus. |
| `/api/v1/campuses` | `POST` | **Super Admin Only** | Buat kampus baru. |
| `/api/v1/campuses/{id}` | `PUT` | **Super Admin Only** | Edit kampus. |

---

### Fitur 7: Master Data — Manajemen Akun Admin ⛔ Super Admin Only

Menu untuk mengelola siklus hidup akun Admin.

| Aspek | Detail |
| :--- | :--- |
| **Akses** | Admin ❌, Super Admin ✅ |
| **Halaman** | `/master/admins`, `/master/admins/{id}` |

* **Kriteria Penerimaan:**
    * Menampilkan tabel daftar seluruh akun admin (nama, email, role group, kampus, status aktif, tanggal kadaluarsa).
    * Terdapat tombol *"Tambah Admin"* yang membuka form/modal:
        * Field wajib: `name`, `email`, `password`, `adminGroupId`.
        * Field opsional: `campusId` (tidak wajib jika role Super Admin).
    * Setiap baris admin memiliki tombol aksi:
        * **"Nonaktifkan"** — Menonaktifkan akun admin. Tampilkan dialog konfirmasi sebelum eksekusi.
        * **"Mutasi Kampus"** — Membuka modal untuk memilih kampus tujuan dan memindahkan admin ke kampus tersebut.
    * Dapat melihat detail admin tertentu.
    * **Halaman, menu, dan rute ini HARUS disembunyikan sepenuhnya dari Admin biasa.**
* **Integrasi API:**

| Endpoint | Method | Role | Catatan |
| :--- | :--- | :--- | :--- |
| `/api/v1/admins` | `GET` | **Super Admin Only** | Daftar semua admin. |
| `/api/v1/admins/{id}` | `GET` | **Super Admin Only** | Detail admin. |
| `/api/v1/admins` | `POST` | **Super Admin Only** | Buat akun admin baru. |
| `/api/v1/admins/{id}/deactivate` | `PUT` | **Super Admin Only** | Nonaktifkan admin. |
| `/api/v1/admins/{id}/transfer-campus` | `PUT` | **Super Admin Only** | Mutasi admin antar kampus. |
| `/api/v1/campuses` | `GET` | Public | Dropdown kampus untuk form & mutasi. |

---

## 6. Spesifikasi Frontend Guard (Kontrol Akses UI)

### 6.1 Strategi Navigasi Berbasis Role

```
Navigasi Admin:
├── Dashboard (Demografi)
├── Rekap Mentoring
├── Leaderboard (Mutabaah Yaumiyah)
├── Manajemen Tim & Transfer
└── Profil Saya

Navigasi Super Admin:
├── Dashboard (Demografi)
├── Rekap Mentoring
├── Leaderboard (Mutabaah Yaumiyah)
├── Manajemen Tim & Transfer
├── Master Data                     ← ⛔ Hanya Super Admin
│   ├── Manajemen Kampus
│   └── Manajemen Admin
└── Profil Saya
```

### 6.2 Aturan Guard

| Aturan | Implementasi |
| :--- | :--- |
| **Route Guard** | Middleware/HOC yang mengecek `type` dari state auth sebelum rendering halaman `/master/*`. Jika `type !== "SUPER_ADMIN"`, redirect ke `/dashboard`. |
| **Navigation Guard** | Menu sidebar *Master Data* di-render secara kondisional: hanya muncul jika `type === "SUPER_ADMIN"`. |
| **Component Guard** | Tombol atau elemen aksi yang terkait endpoint Super Admin Only (misal: "Tambah Kampus") harus di-render kondisional atau di-disable untuk Admin biasa. |
| **API Fallback** | Meskipun frontend sudah memblokir, jika Admin biasa berhasil memanggil endpoint Super Admin Only, server akan mengembalikan `403 Forbidden`. Frontend harus menangani respons ini dengan *toast/alert* "Anda tidak memiliki akses untuk melakukan aksi ini." |

### 6.3 Aturan Scope Data untuk Admin

| Komponen | Perilaku Admin | Perilaku Super Admin |
| :--- | :--- | :--- |
| Filter Kampus (dropdown) | Otomatis ter-set ke kampus sendiri, **disabled/readonly**. | Menampilkan semua kampus, dapat dipilih bebas. |
| Data Tabel (peserta, tim, rekap) | Otomatis terfilter ke `campusId` admin. | Menampilkan data seluruh kampus (default), bisa difilter. |
| Buat Tim Baru | `campusId` otomatis terisi dari konteks login. | Dapat memilih kampus tujuan mana saja. |

---

## 7. Arsitektur & Infrastruktur Teknis

* **Frontend:** Next.js / React (selaras dengan Vercel deployment pada antarmuka *customer*).
* **Backend:** REST API (Java Spring Boot).
* **Autentikasi:** JWT Bearer Token. Token disertakan pada header `Authorization: Bearer <accessToken>` untuk setiap request ke endpoint yang memerlukan autentikasi.
* **Environment:** Containerization via Docker untuk standarisasi lingkungan rilis.
* **Base URL API:** `https://api-dev.youthtalent.id` (development), production TBD.

---

## 8. UI/UX & Design System

Sistem *Admin Dashboard* mengadopsi tema **Nature-Inspired Islamic** yang sudah diterapkan pada aplikasi *Customer*. Konsep *mobile-first* (max-width `28rem`) dipertahankan pada tampilan seluler, namun antarmuka diformat menjadi susunan grid yang lebih luas untuk tampilan *Desktop/Tablet*.

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
| Token / Kategori | Hex | Deskripsi |
| :--- | :--- | :--- |
| `--chart-1` (Prayer) | `#2D7A4F` | Metrik kehadiran / ibadah wajib. |
| `--chart-2` (Character)| `#6BB892` | Metrik perbaikan diri / akhlak. |
| `--chart-3` (Quran) | `#3B8DB8` | Metrik tilawah (Biru Laut). |
| `--chart-4` (Charity) | `#D4AF37` | Metrik infaq (Emas). |

### C. Indikator Visual Role

Untuk membantu pengguna mengenali *role* aktif mereka:

| Elemen | Admin | Super Admin |
| :--- | :--- | :--- |
| Badge di Header/Sidebar | 🟢 **Admin** | 🔷 **Super Admin** |
| Warna Aksen Sidebar | `--primary` (hijau standar) | Tambahkan garis aksen `--accent` (emas) pada item *Master Data*. |

---

## 9. Ringkasan Pemetaan Halaman ↔ Role ↔ Endpoint

| # | Halaman | Rute | Admin | Super Admin | Endpoint Utama |
| :---: | :--- | :--- | :---: | :---: | :--- |
| 1 | Login | `/login` | — | — | `POST /auth/admin/login` |
| 2 | Dashboard | `/dashboard` | ✅ | ✅ | `GET /customers/count`, `GET /campuses` |
| 3 | Rekap Mentoring | `/mentoring/recap` | ✅ | ✅ | `GET /mentoring/recap`, `GET /weeks/*`, `GET /campuses` |
| 4 | Leaderboard | `/leaderboard` | ✅ | ✅ | `GET /leaderboard/*`, `GET /deed-activities`, `POST /leaderboard/generate` |
| 5 | Manajemen Tim | `/teams` | ✅ | ✅ | `GET/POST/PUT /teams/*`, `GET /customers`, `PUT /customers/transfer-team`, `GET /campuses` |
| 6 | Manajemen Kampus | `/master/campuses` | ❌ | ✅ | `GET /campuses`, `POST /campuses`, `PUT /campuses/{id}` |
| 7 | Manajemen Admin | `/master/admins` | ❌ | ✅ | `GET/POST /admins`, `PUT /admins/{id}/*`, `GET /campuses` |
| 8 | Profil | `/profile` | ✅ | ✅ | `GET /admins/profile` |

---

## 10. Catatan Integrasi Backend

1. **Endpoint `GET /api/v1/customers/count`:** Harus sudah mengimplementasikan *query parameter* khusus (*grouping*), misalnya `?groupBy=gender` atau `?groupBy=campusId`, untuk mendukung visualisasi chart di Dashboard.

2. **Data Scoping Server-Side:** Backend diharapkan juga menerapkan filter berdasarkan `campusId` yang ada pada JWT token untuk role `ADMIN`, sehingga walaupun Admin mengirimkan request tanpa filter kampus, data yang dikembalikan tetap sesuai scope-nya (defense in depth).

3. **Response Code untuk Unauthorized Access:** Server harus mengembalikan HTTP `403 Forbidden` ketika Admin biasa mencoba memanggil endpoint Super Admin Only, dengan body response yang informatif untuk ditampilkan di frontend.
