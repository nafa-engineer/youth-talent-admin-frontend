# Youth Talent Admin Frontend — AGENTS.md

<!-- BEGIN:nextjs-agent-rules -->
> **PENTING:** Ini BUKAN Next.js yang Anda kenal — versi ini punya breaking
> changes (proxy.ts, route groups, lint rules). Baca panduan di
> `node_modules/next/dist/docs/` SEBELUM menulis kode (jalankan `npm install`
> dulu agar docs tersedia). Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

Portal admin untuk platform Youth Talent. Next.js 16.2.7, React 19, TypeScript
(strict), Tailwind v4, shadcn (style `base-nova`), Zustand 5, react-hook-form +
zod 4, axios, recharts, sonner.

## Perintah
- `npm run dev` · `npm run build` · `npm run lint` (tidak ada test script;
  `npm run lint` = verifikasi).

## API
- Base: `https://api-dev.youthtalent.id` (`NEXT_PUBLIC_API_BASE_URL`).
- Client axios: `src/lib/api/client.ts`; interceptor tambah Bearer dari
  localStorage `auth-storage`, buka `data` dari `{ status, message, data }`,
  401/403 → clear + redirect `/login?expired=true`.
- Mock: `NEXT_PUBLIC_USE_MOCK_API === 'true'` → `src/lib/api/mock.ts`.
- Endpoint: `API_ROUTES` di `src/lib/constants.ts`; per-domain `XxxApi` di
  `src/lib/api/*.ts`.
- Beberapa endpoint masih stub/no-op (mis. `teamsApi.deleteTeam`); jangan
  berasumsi benar-benar hit backend.

## Struktur
- Pages: `src/app/**/page.tsx` (client component). Route groups: `(auth)`,
  `(coach)`, `(dashboard)`.
- **Ada DUA folder `coach`:** `(coach)/coach/` (login) vs `(dashboard)/coach/`
  (dashboard). `/coach` → dashboard, `/coach/login` → auth. Hati-hati saat edit.
- Komponen: `src/components/<domain>/`; UI primitives `src/components/ui/`;
  `cn()` di `src/lib/utils.ts`. Path alias `src/*`.
- DTO di `src/types/`. State: `src/stores/auth-store.ts` (Zustand, persist
  `auth-storage`). Role guard: `src/hooks/use-role-guard.ts`.

## Konvensi
- Form: react-hook-form + zodResolver (schema zod inline di file komponen).
- Toast: `sonner`. ESLint rule `react-hooks/set-state-in-effect` aktif — guard
  setState di effect.
- Kontrak envelope selalu `{ status, message, data }`.
- Nama file kebab-case, komponen PascalCase, `XxxApi` untuk API modules.
- UI copy & komentar Bahasa Indonesia.

## Verifikasi
- Sebelum selesai: `npm run lint` (dan `npm run build` bila perlu).