# Roadmap YouthTalent Admin FE Development

**Dokumen Versi:** 1.0
**Status:** Approved — Ready for Execution
**Tanggal:** 2026-06-09
**Referensi:** [prd-2.0.md](./prd-2.0.md) | [api-docs.md](./api-docs.md)

---

## Ringkasan Proyek

Membangun **Admin Dashboard** dari nol untuk platform Youth Talent. Dashboard ini digunakan oleh 2 tipe role (**Admin** dan **Super Admin**) untuk mengelola data pembinaan kepemudaan melalui integrasi ke REST API yang sudah tersedia.

---

## Technology Stack

| Kategori | Teknologi | Alasan |
| :--- | :--- | :--- |
| **Framework** | Next.js 15 (App Router) | SSR/SSG, file-based routing, middleware untuk auth guard |
| **Styling** | Tailwind CSS v4 | Utility-first, konsisten, cepat |
| **UI Components** | shadcn/ui | Komponen headless, customizable, cocok untuk admin dashboard |
| **Charts** | Recharts | Ringan, React-native, support Pie/Bar chart |
| **State Management** | Zustand | Lightweight store untuk auth state & global state |
| **HTTP Client** | Axios | Interceptor untuk JWT token, error handling |
| **Form** | React Hook Form + Zod | Validasi form yang type-safe |
| **Icons** | Lucide React | Sudah bundled dengan shadcn/ui |
| **Font** | Inter (Google Fonts) | Modern, clean, cocok untuk dashboard |

---

## Keputusan Teknis (Design Decisions)

| Topik | Keputusan |
| :--- | :--- |
| **Nilai `type` dari login response** | Menggunakan `"ADMIN"` dan `"SUPER_ADMIN"`. Jika backend berbeda, cukup ubah enum di `src/types/auth.ts`. |
| **`GET /customers/count` — groupBy** | Endpoint **tidak support** `groupBy`. Untuk visualisasi chart, frontend akan melakukan **multiple calls** dengan filter berbeda (misal: `?gender=PRIA`, `?gender=WANITA`, `?campusId=X`). |
| **Bahasa Antarmuka** | Bahasa Indonesia. |

---

## Folder Structure (Target)

```
youth-talent-admin-frontend/
├── docs/                          # PRD, API docs, dan roadmap ini
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (auth)/                # Route group: halaman publik
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/           # Route group: halaman terautentikasi
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── mentoring/
│   │   │   │   └── recap/
│   │   │   │       └── page.tsx
│   │   │   ├── leaderboard/
│   │   │   │   └── page.tsx
│   │   │   ├── teams/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── master/            # ⛔ Super Admin Only
│   │   │   │   ├── campuses/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── admins/
│   │   │   │       ├── page.tsx
│   │   │   │       └── [id]/
│   │   │   │           └── page.tsx
│   │   │   ├── profile/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx         # Sidebar + header + auth check
│   │   ├── layout.tsx             # Root layout (fonts, providers)
│   │   ├── globals.css            # Design system tokens
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   ├── layout/                # Sidebar, Header, Role Badge
│   │   ├── auth/                  # Login form
│   │   ├── dashboard/             # Chart components
│   │   ├── mentoring/             # Recap table
│   │   ├── leaderboard/           # Leaderboard table
│   │   ├── teams/                 # Team list, forms, transfer modal
│   │   ├── master/                # Campus & Admin CRUD components
│   │   └── shared/                # Reusable: campus filter, data table, etc.
│   ├── lib/
│   │   ├── api/                   # API service layer (1 file per controller)
│   │   ├── utils.ts
│   │   └── constants.ts
│   ├── stores/
│   │   └── auth-store.ts          # Zustand auth store
│   ├── hooks/                     # Custom hooks (auth, role guard)
│   ├── types/                     # TypeScript interfaces (DTOs, auth)
│   └── middleware.ts              # Next.js route protection
├── .env.local
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Fase Pengembangan

Pengembangan dibagi ke dalam **6 fase** yang berurutan. Setiap fase membangun fondasi untuk fase berikutnya.

---

### FASE 1: Project Setup & Foundation

**Tujuan:** Setup project Next.js, install dependencies, konfigurasi design system, dan buat fondasi kode.

#### Deliverables

| # | File / Task | Deskripsi |
| :---: | :--- | :--- |
| 1.1 | **Project Init** | `npx create-next-app@latest` dengan App Router, TypeScript, Tailwind CSS, ESLint |
| 1.2 | **Install Dependencies** | `shadcn/ui`, `recharts`, `zustand`, `axios`, `react-hook-form`, `zod`, `lucide-react` |
| 1.3 | **`.env.local`** | `NEXT_PUBLIC_API_BASE_URL=https://api-dev.youthtalent.id` |
| 1.4 | **`src/app/globals.css`** | CSS custom properties (color tokens) dari PRD §8.B: `--primary: #2D7A4F`, `--secondary: #4A9D6F`, `--accent: #D4AF37`, dst. Typography base styles. |
| 1.5 | **`src/types/api.ts`** | TypeScript interfaces untuk semua DTO: `AdminLoginResponseDto`, `AdminDto`, `CustomerDto`, `PageCustomerDto`, `TeamDto`, `CampusDto`, `MentoringAttendanceRecapDto`, `DeedLeaderboardResponseDto`, `DeedLeaderboardItemDto`, `DeedActivityDto`, `WeekDto`, dan semua Request DTOs. |
| 1.6 | **`src/types/auth.ts`** | `AuthUser` interface, `UserRole` enum (`ADMIN`, `SUPER_ADMIN`) |
| 1.7 | **`src/lib/constants.ts`** | Route paths, API endpoint paths, Gender enum, Education level enum |
| 1.8 | **`src/lib/utils.ts`** | `cn()` class merge, date formatting, number formatting helpers |
| 1.9 | **`src/lib/api/client.ts`** | Axios instance + interceptors (inject JWT, handle 401/403) |

#### Kriteria Selesai
- [ ] `npm run dev` berjalan tanpa error di `localhost:3000`
- [ ] Design tokens (warna, font Inter) tampil sesuai PRD §8
- [ ] TypeScript build (`npm run build`) sukses tanpa error

---

### FASE 2: Authentication & RBAC System

**Tujuan:** Implementasi login, auth state management, route protection, dan layout dashboard dengan sidebar kondisional berdasarkan role.

#### Deliverables

| # | File / Task | Deskripsi |
| :---: | :--- | :--- |
| 2.1 | **`src/stores/auth-store.ts`** | Zustand store: `user`, `isAuthenticated`, `isSuperAdmin`. Actions: `login()`, `logout()`, `setProfile()`. Persist ke localStorage. |
| 2.2 | **`src/hooks/use-auth.ts`** | Custom hook wrapping auth store. Helpers: `isSuperAdmin()`, `getCampusId()`, `getUserType()`. |
| 2.3 | **`src/hooks/use-role-guard.ts`** | Hook untuk cek akses role pada level komponen. Redirect ke `/dashboard` jika unauthorized. |
| 2.4 | **`src/middleware.ts`** | Next.js Middleware: `/login` → redirect jika sudah login. `/(dashboard)/*` → redirect ke `/login` jika belum login. `/master/*` → cek role Super Admin. |
| 2.5 | **`src/lib/api/auth.ts`** | `loginAdmin(email, password)` → `POST /auth/admin/login`. `getAdminProfile()` → `GET /admins/profile`. |
| 2.6 | **`src/components/auth/login-form.tsx`** | Form login: React Hook Form + Zod. Loading state, error handling, toast. Desain: card centered, tema hijau islami. |
| 2.7 | **`src/app/(auth)/layout.tsx`** | Layout publik: centered, background pattern islami. |
| 2.8 | **`src/app/(auth)/login/page.tsx`** | Render `<LoginForm />`. |
| 2.9 | **`src/components/layout/sidebar.tsx`** | Sidebar navigasi kondisional (PRD §6.1). Admin: 5 menu. Super Admin: 5 menu + Master Data (dengan aksen emas). Collapsible di mobile. |
| 2.10 | **`src/components/layout/header.tsx`** | Top bar: judul halaman, role badge, nama user, tombol logout. Hamburger menu di mobile. |
| 2.11 | **`src/components/layout/role-badge.tsx`** | Badge: 🟢 Admin / 🔷 Super Admin. |
| 2.12 | **`src/app/(dashboard)/layout.tsx`** | Layout dashboard: sidebar + header + main content. Auth check. |
| 2.13 | **`src/components/shared/forbidden-page.tsx`** | Halaman 403: "Anda tidak memiliki akses". Tombol kembali ke Dashboard. |

#### Kriteria Selesai
- [ ] Login berhasil dengan kredensial valid → redirect ke `/dashboard`
- [ ] Login gagal → error message yang sesuai
- [ ] Token tersimpan di localStorage setelah login
- [ ] Redirect ke `/login` saat token expired / tidak ada
- [ ] Sidebar Admin **tidak** menampilkan menu Master Data
- [ ] Sidebar Super Admin menampilkan menu Master Data dengan aksen emas
- [ ] Admin mengakses `/master/*` → redirect ke `/dashboard`
- [ ] Super Admin mengakses `/master/*` → halaman tampil normal
- [ ] Tombol logout berfungsi → redirect ke `/login`

---

### FASE 3: Dashboard & Visualisasi Data

**Tujuan:** Halaman utama setelah login dengan summary cards dan chart demografi peserta.

#### Deliverables

| # | File / Task | Deskripsi |
| :---: | :--- | :--- |
| 3.1 | **`src/lib/api/customers.ts`** | `getCustomers(params)`, `getCustomerCount(params)`, `transferTeam(data)` |
| 3.2 | **`src/lib/api/campuses.ts`** | `getCampuses()`, `getCampusById(id)`, `createCampus(data)`, `updateCampus(id, data)` |
| 3.3 | **`src/components/shared/campus-filter.tsx`** | Dropdown filter kampus reusable. Admin → locked/disabled ke kampus sendiri. Super Admin → dropdown semua kampus dari `GET /campuses`. |
| 3.4 | **`src/components/dashboard/gender-pie-chart.tsx`** | Recharts PieChart: rasio Ikhwan vs Akhwat. Warna: `--chart-1`, `--chart-2`. Data dari 2x call `GET /customers/count` (`?gender=PRIA` dan `?gender=WANITA`). |
| 3.5 | **`src/components/dashboard/campus-bar-chart.tsx`** | Recharts BarChart: peserta per kampus. Data dari N call `GET /customers/count` (`?campusId=X` per kampus). Warna bar: `--primary`. |
| 3.6 | **`src/app/(dashboard)/dashboard/page.tsx`** | Grid layout: summary cards (total peserta, ikhwan, akhwat) + Pie Chart + Bar Chart. Filter kampus. Loading skeleton. |

#### Catatan Teknis: Strategi Data Chart
Karena `GET /customers/count` **tidak support `groupBy`**, data chart diambil dengan strategi:
```
Pie Chart (Gender):
  count_pria   = GET /customers/count?gender=PRIA
  count_wanita = GET /customers/count?gender=WANITA

Bar Chart (Per Kampus):
  campuses     = GET /campuses
  for each campus:
    count      = GET /customers/count?campusId={campus.id}
```
Semua call dilakukan secara **parallel** (`Promise.all`) untuk performa optimal.

#### Kriteria Selesai
- [ ] Summary cards menampilkan total peserta, total ikhwan, total akhwat
- [ ] Pie Chart menampilkan rasio gender dengan warna sesuai design token
- [ ] Bar Chart menampilkan peserta per kampus
- [ ] Admin: filter kampus ter-lock ke kampus sendiri
- [ ] Super Admin: filter kampus bisa dipilih bebas, default semua
- [ ] Loading skeleton tampil saat data sedang dimuat

---

### FASE 4: Fitur Operasional (Admin & Super Admin)

**Tujuan:** Implementasi 3 fitur operasional utama: Rekap Mentoring, Leaderboard, dan Manajemen Tim.

#### 4A. API Service Layer

| # | File / Task | Deskripsi |
| :---: | :--- | :--- |
| 4A.1 | **`src/lib/api/weeks.ts`** | `getCurrentWeek()`, `getWeekById(id)` |
| 4A.2 | **`src/lib/api/mentoring.ts`** | `getMentoringRecap(params)` |
| 4A.3 | **`src/lib/api/leaderboard.ts`** | `getGlobalLeaderboard()`, `getActivityLeaderboard(activityId)`, `generateLeaderboard()` |
| 4A.4 | **`src/lib/api/deed-activities.ts`** | `getDeedActivities()`, `getDeedActivityById(id)` |
| 4A.5 | **`src/lib/api/teams.ts`** | `getTeams()`, `getTeamById(id)`, `getTeamsByCampus(campusId)`, `createTeam(data)`, `updateTeam(id, data)` |

---

#### 4B. Rekap Mentoring (`/mentoring/recap`)

| # | File / Task | Deskripsi |
| :---: | :--- | :--- |
| 4B.1 | **`src/components/shared/data-table.tsx`** | Komponen tabel reusable (shadcn Table). Support: sorting, pagination, empty state, loading skeleton. |
| 4B.2 | **`src/components/mentoring/recap-table.tsx`** | Tabel rekap kehadiran: nama, gender, tim, kampus, kehadiran/total sesi, persentase. Color coding hijau (hadir tinggi) / merah (rendah). Filter bar: date range picker, campus dropdown, team dropdown, gender dropdown. |
| 4B.3 | **`src/app/(dashboard)/mentoring/recap/page.tsx`** | Default: 3 bulan terakhir (dari `GET /weeks/current`). Integrasi filter + tabel. |

**Kriteria Selesai:**
- [ ] Tabel rekap tampil dengan data 3 bulan terakhir secara default
- [ ] Filter tanggal, kampus, tim, gender berfungsi
- [ ] Admin: data auto-filter sesuai kampus sendiri
- [ ] Super Admin: bisa filter semua kampus
- [ ] Persentase kehadiran dengan color coding

---

#### 4C. Leaderboard (`/leaderboard`)

| # | File / Task | Deskripsi |
| :---: | :--- | :--- |
| 4C.1 | **`src/components/leaderboard/leaderboard-table.tsx`** | Tabel klasemen: rank (🥇🥈🥉 untuk top 3), nama, tim, kampus, skor. Filter dropdown jenis amalan. Tombol "Refresh Leaderboard" → `POST /leaderboard/generate`. Info "Terakhir di-generate: {generatedAt}". |
| 4C.2 | **`src/app/(dashboard)/leaderboard/page.tsx`** | Integrasi filter + leaderboard table + refresh button. |

**Kriteria Selesai:**
- [ ] Leaderboard global tampil dengan ranking
- [ ] Top 3 highlight (🥇🥈🥉)
- [ ] Filter per jenis amalan berfungsi
- [ ] Tombol Refresh Leaderboard berhasil trigger generate
- [ ] Timestamp "Terakhir di-generate" tampil

---

#### 4D. Manajemen Tim (`/teams`)

| # | File / Task | Deskripsi |
| :---: | :--- | :--- |
| 4D.1 | **`src/components/teams/team-list.tsx`** | Card/grid daftar tim: nama, kode, grade, kampus. Filter kampus (reusable). Tombol "Buat Tim Baru". |
| 4D.2 | **`src/components/teams/team-form-modal.tsx`** | Modal form create & edit: nama, kode, grade, kampus (dropdown). Validasi Zod. |
| 4D.3 | **`src/components/teams/transfer-modal.tsx`** | Modal transfer peserta: daftar terpilih + dropdown "Grup Tujuan". Konfirmasi → eksekusi. Success toast. |
| 4D.4 | **`src/app/(dashboard)/teams/page.tsx`** | Integrasi team list + filter + form modal. |
| 4D.5 | **`src/app/(dashboard)/teams/[id]/page.tsx`** | Detail tim: info + tabel anggota. Multi-select checkbox + tombol Transfer. Tombol Edit Tim. |

**Kriteria Selesai:**
- [ ] Daftar tim tampil sesuai scope kampus
- [ ] Buat tim baru berfungsi (dengan validasi)
- [ ] Edit tim berfungsi
- [ ] Transfer peserta antar tim berfungsi (multi-select + konfirmasi)
- [ ] Admin: hanya tim di kampus sendiri
- [ ] Super Admin: semua kampus

---

### FASE 5: Master Data — Super Admin Only

**Tujuan:** Implementasi halaman Manajemen Kampus dan Manajemen Admin. Halaman-halaman ini **hanya** bisa diakses oleh Super Admin.

#### 5A. Manajemen Kampus (`/master/campuses`)

| # | File / Task | Deskripsi |
| :---: | :--- | :--- |
| 5A.1 | **`src/components/master/campus-table.tsx`** | Tabel kampus: ID, nama, tombol Edit. Tombol "Tambah Kampus" di atas tabel. |
| 5A.2 | **`src/components/master/campus-form-modal.tsx`** | Modal form create & edit: field `name`. Validasi: required, min 1 char. |
| 5A.3 | **`src/app/(dashboard)/master/campuses/page.tsx`** | Role guard (redirect jika bukan Super Admin). Integrasi table + modals. |

**Kriteria Selesai:**
- [ ] Admin mengakses halaman → redirect ke `/dashboard`
- [ ] Super Admin: tabel kampus tampil
- [ ] Tambah kampus berfungsi
- [ ] Edit kampus berfungsi

---

#### 5B. Manajemen Admin (`/master/admins`)

| # | File / Task | Deskripsi |
| :---: | :--- | :--- |
| 5B.1 | **`src/lib/api/admins.ts`** | `getAdminProfile()`, `getAdmins()`, `getAdminById(id)`, `createAdmin(data)`, `deactivateAdmin(id)`, `transferAdminCampus(id, data)` |
| 5B.2 | **`src/components/master/admin-table.tsx`** | Tabel admin: nama, email, group, kampus, status (badge aktif/nonaktif), expired, aksi. Tombol "Tambah Admin". Aksi per baris: "Nonaktifkan", "Mutasi Kampus". |
| 5B.3 | **`src/components/master/admin-form-modal.tsx`** | Modal form: `name`, `email`, `password`, `adminGroupId` (dropdown), `campusId` (dropdown, opsional). Validasi Zod. |
| 5B.4 | **`src/components/master/admin-deactivate-dialog.tsx`** | Dialog konfirmasi: "Apakah Anda yakin ingin menonaktifkan admin {name}?" Tombol: Batal / Nonaktifkan. |
| 5B.5 | **`src/components/master/admin-transfer-modal.tsx`** | Modal: info admin saat ini + dropdown kampus tujuan. Tombol: Batal / Mutasi. |
| 5B.6 | **`src/app/(dashboard)/master/admins/page.tsx`** | Role guard. Integrasi table + semua modals. |
| 5B.7 | **`src/app/(dashboard)/master/admins/[id]/page.tsx`** | Detail admin: card profil. Tombol: Nonaktifkan, Mutasi Kampus. |

**Kriteria Selesai:**
- [ ] Admin mengakses halaman → redirect ke `/dashboard`
- [ ] Super Admin: tabel admin tampil lengkap
- [ ] Buat admin baru berfungsi
- [ ] Nonaktifkan admin berfungsi (dengan dialog konfirmasi)
- [ ] Mutasi admin antar kampus berfungsi
- [ ] Detail admin tampil

---

### FASE 6: Profile, Polish & QA

**Tujuan:** Halaman profil, responsive design, polishing UI, dan verifikasi keseluruhan.

#### Deliverables

| # | File / Task | Deskripsi |
| :---: | :--- | :--- |
| 6.1 | **`src/app/(dashboard)/profile/page.tsx`** | Card profil admin: nama, email, role group, kampus, status. Data dari `GET /admins/profile`. |
| 6.2 | **Responsive Review** | Semua halaman: Desktop (1280px+), Tablet (768px), Mobile (375px). Sidebar collapsible, tabel scroll horizontal. |
| 6.3 | **Loading & Error States** | Skeleton loading setiap halaman. Empty state untuk tabel kosong. Error boundary. Toast notification sukses/gagal. |
| 6.4 | **Micro-animations** | Sidebar open/close transition. Hover effects card & tombol. Fade-in page load. Smooth chart animations. |
| 6.5 | **`src/app/not-found.tsx`** | Halaman 404 custom. |
| 6.6 | **Final Build Check** | `npm run build` sukses. `npm run lint` bersih. |

#### Kriteria Selesai
- [ ] Halaman profil tampil dengan data dari API
- [ ] Semua halaman responsive (desktop, tablet, mobile)
- [ ] Loading skeleton tampil saat data dimuat
- [ ] Empty state tampil untuk tabel tanpa data
- [ ] Error 401 → redirect login. Error 403 → toast "Tidak memiliki akses"
- [ ] Animasi smooth pada interaksi UI
- [ ] Build production sukses tanpa error

---

## Ringkasan Total Deliverables

| Fase | Judul | File Baru | Fokus Utama |
| :---: | :--- | :---: | :--- |
| 1 | Project Setup & Foundation | ~9 | Inisialisasi, types, API client, design tokens |
| 2 | Authentication & RBAC | ~13 | Login, auth store, middleware, sidebar, header |
| 3 | Dashboard & Visualisasi | ~6 | Charts, summary cards, campus filter |
| 4 | Fitur Operasional | ~12 | Mentoring, Leaderboard, Teams (CRUD + transfer) |
| 5 | Master Data (Super Admin) | ~10 | Campus CRUD, Admin CRUD + deactivate + transfer |
| 6 | Profile, Polish & QA | ~3 | Profil, responsive, animations, error handling |
| | **Total** | **~53** | |

---

## Catatan Penting

1. **Setiap fase bersifat self-contained** — Fase sebelumnya harus selesai dan berfungsi sebelum lanjut ke fase berikutnya.

2. **API Base URL** — Development: `https://api-dev.youthtalent.id`. Production: TBD.

3. **CORS** — Pastikan server backend mengizinkan origin dari `localhost:3000` (development) dan domain production nantinya.

4. **Design System Reference** — Seluruh warna, token CSS, dan visual guidelines mengacu ke [prd-2.0.md §8](./prd-2.0.md).

5. **RBAC Reference** — Seluruh aturan akses role mengacu ke [prd-2.0.md §4 (ACM)](./prd-2.0.md) dan [prd-2.0.md §6 (Frontend Guard)](./prd-2.0.md).

6. **API Reference** — Seluruh endpoint, payload, dan response type mengacu ke [api-docs.md](./api-docs.md).
