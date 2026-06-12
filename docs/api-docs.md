# Dokumentasi API - Youth Talent Admin Dashboard

Dokumen ini berisi spesifikasi endpoint API, pengelompokkan role akses, dan struktur data (*Data Transfer Object* / DTO) yang digunakan untuk integrasi *Admin Dashboard* Youth Talent.

**Versi:** 2.0
**Base URL:** `https://api-dev.youthtalent.id`
**Autentikasi:** JWT Bearer Token (`Authorization: Bearer <accessToken>`)

---

## Klasifikasi Akses Endpoint

Seluruh endpoint dikelompokkan berdasarkan level otorisasi yang diperlukan.

### 🔓 Public (Tanpa Autentikasi)

| Endpoint | Method | Deskripsi |
| :--- | :--- | :--- |
| `/api/v1/auth/admin/login` | `POST` | Login admin |
| `/api/v1/campuses` | `GET` | Daftar semua kampus |
| `/api/v1/campuses/{id}` | `GET` | Detail kampus |

### 🔑 Semua Role (Admin & Super Admin)

| Endpoint | Method | Deskripsi |
| :--- | :--- | :--- |
| `/api/v1/leaderboard/global` | `GET` | Leaderboard utama |
| `/api/v1/leaderboard/activity/{activityId}` | `GET` | Leaderboard per amalan |
| `/api/v1/deed-activities` | `GET` | Daftar jenis amal aktif |
| `/api/v1/deed-activities/{id}` | `GET` | Detail jenis amal |
| `/api/v1/weeks/current` | `GET` | Pekan berjalan |
| `/api/v1/weeks/{id}` | `GET` | Detail pekan tertentu |

### 🛡️ Admin & Super Admin (Fitur Operasional)

| Endpoint | Method | Deskripsi |
| :--- | :--- | :--- |
| `/api/v1/admins/profile` | `GET` | Profil admin yang sedang login |
| `/api/v1/customers` | `GET` | Daftar peserta (paginasi + filter) |
| `/api/v1/customers/count` | `GET` | Hitung peserta (untuk grafik) |
| `/api/v1/customers/transfer-team` | `PUT` | Pindahkan peserta antar tim |
| `/api/v1/teams` | `GET` | Semua tim |
| `/api/v1/teams/{id}` | `GET` | Detail tim |
| `/api/v1/teams/campus/{campusId}` | `GET` | Tim berdasarkan kampus |
| `/api/v1/teams` | `POST` | Buat tim baru |
| `/api/v1/teams/{id}` | `PUT` | Edit tim |
| `/api/v1/mentoring/recap` | `GET` | Rekap kehadiran mentoring |
| `/api/v1/leaderboard/generate` | `POST` | Re-kalkulasi leaderboard |

### ⛔ Super Admin Only (Master Data)

| Endpoint | Method | Deskripsi |
| :--- | :--- | :--- |
| `/api/v1/campuses` | `POST` | Buat kampus baru |
| `/api/v1/campuses/{id}` | `PUT` | Edit kampus |
| `/api/v1/admins` | `GET` | Daftar semua admin |
| `/api/v1/admins/{id}` | `GET` | Detail admin |
| `/api/v1/admins` | `POST` | Buat akun admin baru |
| `/api/v1/admins/{id}/deactivate` | `PUT` | Nonaktifkan akun admin |
| `/api/v1/admins/{id}/transfer-campus` | `PUT` | Mutasi admin antar kampus |

---

## Detail Endpoint & Data Structure

### 1. Authentication Controller

**Akses:** 🔓 Public

| Endpoint | Method | Payload / Query Params | Response Type |
| :--- | :--- | :--- | :--- |
| `/api/v1/auth/admin/login` | `POST` | Body: `LoginRequestDto` (`email`, `password` - wajib) | Object (`AdminLoginResponseDto`) |

**LoginRequestDto**
* `email`: `string`
* `password`: `string`

**AdminLoginResponseDto**
* `email`: `string`
* `name`: `string`
* `type`: `string` — **Nilai role: `"ADMIN"` atau `"SUPER_ADMIN"`**
* `campusId`: `integer` (int64) — Kampus yang di-assign (null untuk Super Admin tanpa kampus spesifik)
* `campusName`: `string`
* `accessToken`: `string` — JWT token untuk autentikasi
* `refreshToken`: `string` — Token untuk memperbarui sesi

---

### 2. Leaderboard Controller

**Akses:** 🔑 Semua Role (GET) | 🛡️ Admin & Super Admin (POST)

| Endpoint | Method | Payload / Query Params | Response Type | Akses |
| :--- | :--- | :--- | :--- | :--- |
| `/api/v1/leaderboard/global` | `GET` | None | Object (`DeedLeaderboardResponseDto`) | Semua Role |
| `/api/v1/leaderboard/activity/{activityId}` | `GET` | Path Param: `activityId` (integer) | Object (`DeedLeaderboardResponseDto`) | Semua Role |
| `/api/v1/leaderboard/generate` | `POST` | None | `string` (Pesan status sukses) | Admin, Super Admin |

**DeedLeaderboardResponseDto**
* `scope`: `string`
* `deedActivityId`: `integer` (int64)
* `deedActivityName`: `string`
* `generatedAt`: `string` (date-time)
* `items`: array of `DeedLeaderboardItemDto`

**DeedLeaderboardItemDto**
* `rank`: `integer` (int32)
* `customerName`: `string`
* `teamName`: `string`
* `campusName`: `string`
* `score`: `number` (floating-point/double)

---

### 3. Deed Activity Controller

**Akses:** 🔑 Semua Role

| Endpoint | Method | Payload / Query Params | Response Type |
| :--- | :--- | :--- | :--- |
| `/api/v1/deed-activities` | `GET` | None | Array of `DeedActivityDto` |
| `/api/v1/deed-activities/{id}` | `GET` | Path Param: `id` (integer) | Object (`DeedActivityDto`) |

**DeedActivityDto**
* `id`: `integer` (int64)
* `name`: `string`
* `code`: `string`
* `unit`: `string`
* `maxValue`: `number`
* `allowDecimal`: `boolean`
* `sequence`: `integer` (int32)
* `isActive`: `boolean`

---

### 4. Week Controller

**Akses:** 🔑 Semua Role

| Endpoint | Method | Payload / Query Params | Response Type |
| :--- | :--- | :--- | :--- |
| `/api/v1/weeks/current` | `GET` | None | Object (`WeekDto`) |
| `/api/v1/weeks/{id}` | `GET` | Path Param: `id` (integer) | Object (`WeekDto`) |

**WeekDto**
* `id`: `integer` (int64)
* `year`: `integer` (int32)
* `weekNumber`: `integer` (int32)
* `startDate`: `string` (date format: YYYY-MM-DD)
* `endDate`: `string` (date format: YYYY-MM-DD)

---

### 5. Customer Controller

**Akses:** 🛡️ Admin & Super Admin

| Endpoint | Method | Payload / Query Params | Response Type |
| :--- | :--- | :--- | :--- |
| `/api/v1/customers` | `GET` | Query Params: `campusId`, `teamId`, `grade`, `entryYear`, `gender`, `educationLevel`, `page` (default: 0), `size` (default: 10) | Object (`PageCustomerDto`) |
| `/api/v1/customers/count` | `GET` | Query Params: `campusId`, `teamId`, `grade`, `entryYear`, `gender`, `educationLevel` | `integer` (int64) |
| `/api/v1/customers/transfer-team` | `PUT` | Body: `CustomerTransferTeamRequestDto` (`customerId`, `teamId` - required) | Object (`CustomerDto`) |

**PageCustomerDto**
* `totalElements`: `integer` (int64)
* `totalPages`: `integer` (int32)
* `size`: `integer` (int32)
* `number`: `integer` (int32)
* `numberOfElements`: `integer` (int32)
* `first`: `boolean`
* `last`: `boolean`
* `empty`: `boolean`
* `content`: array of `CustomerDto`

**CustomerDto**
* `id`: `integer` (int64)
* `name`: `string`
* `email`: `string`
* `gender`: `string` (Enum: `PRIA`, `WANITA`)
* `educationLevel`: `string` (Enum: `SD`, `SMP`, `SMA`, `D1`, `D2`, `D3`, `S1`, `S2`, `S3`, `OTHER`)
* `entryYear`: `integer` (int32)
* `institutionName`: `string`
* `origin`: `string`
* `domicile`: `string`
* `birthDate`: `string` (date)
* `teamId`: `integer` (int64)
* `teamName`: `string`
* `campusId`: `integer` (int64)
* `campusName`: `string`
* `createdAt`: `string` (date-time)

**CustomerTransferTeamRequestDto**
* `customerId`: `integer` (int64) — wajib
* `teamId`: `integer` (int64) — wajib

---

### 6. Team Controller

**Akses:** 🛡️ Admin & Super Admin

| Endpoint | Method | Payload / Query Params | Response Type |
| :--- | :--- | :--- | :--- |
| `/api/v1/teams` | `GET` | None | Array of `TeamDto` |
| `/api/v1/teams/{id}` | `GET` | Path Param: `id` (integer) | Object (`TeamDto`) |
| `/api/v1/teams/campus/{campusId}` | `GET` | Path Param: `campusId` (integer) | Array of `TeamDto` |
| `/api/v1/teams` | `POST` | Body: `TeamRequestDto` (`name`, `code`, `grade`, `campusId` - semua wajib) | Object (`TeamDto`) |
| `/api/v1/teams/{id}` | `PUT` | Path Param: `id` (integer), Body: `TeamRequestDto` | Object (`TeamDto`) |

**TeamDto**
* `id`: `integer` (int64)
* `name`: `string`
* `code`: `string`
* `grade`: `integer` (int64)
* `campusId`: `integer` (int64)
* `campusName`: `string`

**TeamRequestDto**
* `name`: `string` (wajib, min 1 karakter)
* `code`: `string` (wajib, min 1 karakter)
* `grade`: `integer` (int64, wajib)
* `campusId`: `integer` (int64, wajib)

---

### 7. Mentoring Controller

**Akses:** 🛡️ Admin & Super Admin

| Endpoint | Method | Payload / Query Params | Response Type |
| :--- | :--- | :--- | :--- |
| `/api/v1/mentoring/recap` | `GET` | Query Params: `campusId`, `teamId`, `gender`, `startDate` (wajib), `endDate` (wajib) | Array of `MentoringAttendanceRecapDto` |

**MentoringAttendanceRecapDto**
* `customerId`: `integer` (int64)
* `customerName`: `string`
* `gender`: `string`
* `teamId`: `integer` (int64)
* `teamName`: `string`
* `campusId`: `integer` (int64)
* `campusName`: `string`
* `totalAttendance`: `integer` (int32)
* `totalSessions`: `integer` (int32)

---

### 8. Campus Controller

**Akses:** 🔓 Public (GET) | ⛔ Super Admin Only (POST, PUT)

| Endpoint | Method | Payload / Query Params | Response Type | Akses |
| :--- | :--- | :--- | :--- | :--- |
| `/api/v1/campuses` | `GET` | None | Array of `CampusDto` | Public |
| `/api/v1/campuses/{id}` | `GET` | Path Param: `id` (integer) | Object (`CampusDto`) | Public |
| `/api/v1/campuses` | `POST` | Body: `CampusRequestDto` (atribut `name` wajib) | Object (`CampusDto`) | **Super Admin Only** |
| `/api/v1/campuses/{id}` | `PUT` | Path Param: `id` (integer), Body: `CampusRequestDto` | Object (`CampusDto`) | **Super Admin Only** |

**CampusDto**
* `id`: `integer` (int64)
* `name`: `string`

**CampusRequestDto**
* `name`: `string` (wajib, min 1 karakter)

---

### 9. Admin Controller

**Akses:** 🛡️ Admin & Super Admin (profile) | ⛔ Super Admin Only (management)

| Endpoint | Method | Payload / Query Params | Response Type | Akses |
| :--- | :--- | :--- | :--- | :--- |
| `/api/v1/admins/profile` | `GET` | None | Object (`AdminDto`) | Admin, Super Admin |
| `/api/v1/admins` | `GET` | None | Array of `AdminDto` | **Super Admin Only** |
| `/api/v1/admins/{id}` | `GET` | Path Param: `id` (integer) | Object (`AdminDto`) | **Super Admin Only** |
| `/api/v1/admins` | `POST` | Body: `AdminRequestDto` (`name`, `email`, `password`, `adminGroupId`, `campusId`. Semua wajib kecuali `campusId`) | Object (`AdminDto`) | **Super Admin Only** |
| `/api/v1/admins/{id}/deactivate` | `PUT` | Path Param: `id` (integer) | Object (`AdminDto`) | **Super Admin Only** |
| `/api/v1/admins/{id}/transfer-campus` | `PUT` | Path Param: `id` (integer), Body: `AdminTransferCampusRequestDto` (`campusId` wajib) | Object (`AdminDto`) | **Super Admin Only** |

**AdminDto**
* `id`: `integer` (int64)
* `name`: `string`
* `email`: `string`
* `adminGroupCode`: `string`
* `adminGroupName`: `string`
* `campusId`: `integer` (int64)
* `campusName`: `string`
* `isActive`: `boolean`
* `expiredAt`: `string` (date-time)
* `createdAt`: `string` (date-time)

**AdminRequestDto**
* `name`: `string` (wajib, min 1 karakter)
* `email`: `string` (wajib, min 1 karakter)
* `password`: `string` (wajib, min 1 karakter)
* `adminGroupId`: `integer` (int64, wajib)
* `campusId`: `integer` (int64, opsional)

**AdminTransferCampusRequestDto**
* `campusId`: `integer` (int64, wajib)