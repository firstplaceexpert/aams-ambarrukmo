# AAMS — Ambarrukmo Asset Management System

Sistem manajemen aset terpadu untuk **Ambarrukmo Group Yogyakarta** yang mencakup Hotel, Mall/Retail, dan Properti/Kondotel. Dibangun dengan Next.js 14 App Router, Supabase, dan Tailwind CSS.

---

## ✅ Fitur Fase 1 (Fondasi)

- **Auth** — Login email/password via Supabase Auth, middleware proteksi route
- **RBAC** — 5 level role: `super_admin`, `corporate_admin`, `unit_admin`, `field_officer`, `viewer`
- **RLS** — Row Level Security aktif di semua tabel; data terisolasi per unit bisnis
- **Business Units** — CRUD (hanya corporate admin)
- **Locations** — CRUD dengan tampilan hierarki tree (expand/collapse)
- **Asset Categories** — CRUD sederhana
- **Assets** — CRUD lengkap: upload foto, dokumen legal, auto-generate kode aset & QR UUID
- **User Management** — Assign role & unit bisnis ke user (hanya corporate admin)
- **Dashboard** — Statistik aset, distribusi per unit, kondisi aset, aksi cepat

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Styling | Tailwind CSS |
| Forms | React Hook Form + Zod |
| Deployment | Vercel-ready |

---

## 🚀 Setup & Cara Menjalankan

### 1. Install Dependencies

```bash
cd aams
npm install
```

### 2. Setup Supabase Project

1. Buka [supabase.com](https://supabase.com) dan buat project baru
2. Buka **SQL Editor** di dashboard Supabase
3. Jalankan migration secara berurutan:
   - Copy dan paste isi `supabase/migrations/001_schema.sql` → Run
   - Copy dan paste isi `supabase/migrations/002_rls.sql` → Run

### 3. Setup Storage Buckets

Di dashboard Supabase → **Storage** → buat 2 bucket:

| Bucket Name | Public | Deskripsi |
|---|---|---|
| `asset-photos` | ✅ Ya | Foto aset |
| `asset-documents` | ❌ Tidak | Dokumen legal |

Tambahkan RLS policy untuk bucket `asset-photos`:
```sql
CREATE POLICY "Public read asset photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'asset-photos');

CREATE POLICY "Authenticated upload asset photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'asset-photos' AND auth.uid() IS NOT NULL);
```

### 4. Buat User Super Admin Pertama

1. Dashboard Supabase → **Authentication** → **Users** → **Add User**
2. Masukkan email dan password
3. Jalankan di **SQL Editor**:

```sql
UPDATE public.profiles
SET role = 'super_admin', full_name = 'Administrator'
WHERE id = (SELECT id FROM auth.users WHERE email = 'email-anda@domain.com');
```

### 5. Jalankan Seed Data (Opsional)

Di **SQL Editor**, jalankan isi file `supabase/seed.sql` untuk mendapatkan:
- Unit bisnis resmi Ambarrukmo Group (Royal Ambarrukmo, Plaza Ambarrukmo Mall, Ambarrukmo Property, dll)
- ~20 lokasi multi-level
- 10 kategori aset
- 25 dummy assets

### 6. Setup Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

Nilai ini ada di: Supabase Dashboard → **Settings** → **API**.

### 7. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) → login dengan akun super_admin.

---

## 📁 Struktur Project

```
aams/
├── app/
│   ├── (auth)/login/            # Halaman login
│   ├── (dashboard)/
│   │   ├── layout.tsx           # Sidebar + Header
│   │   ├── page.tsx             # Dashboard overview
│   │   ├── assets/              # CRUD Aset + upload foto
│   │   ├── locations/           # CRUD Lokasi (tree view)
│   │   ├── business-units/      # CRUD Unit Bisnis
│   │   ├── asset-categories/    # CRUD Kategori
│   │   └── settings/users/      # Manajemen User
│   └── unauthorized/            # Halaman 403
├── components/layout/           # Sidebar, Header components
├── lib/
│   ├── auth/permissions.ts      # RBAC helpers (requireRole, getCurrentUser)
│   ├── supabase/                # Client, Server, Middleware helpers
│   └── validations/             # Zod schemas
├── types/
│   ├── database.ts              # TypeScript types semua 14 tabel
│   └── index.ts                 # Computed & joined types
├── supabase/
│   ├── migrations/001_schema.sql  # Full schema DDL
│   ├── migrations/002_rls.sql     # RLS policies
│   └── seed.sql                   # Data dummy
├── middleware.ts                # Route protection
└── .env.example                 # Template environment variables
```

---

## 🔐 Role & Permission Matrix

| Aksi | super_admin | corporate_admin | unit_admin | field_officer | viewer |
|---|:---:|:---:|:---:|:---:|:---:|
| Lihat aset semua unit | ✅ | ✅ | ❌ | ❌ | ❌ |
| Lihat aset unit sendiri | ✅ | ✅ | ✅ | ✅ | ✅ |
| Tambah / edit aset | ✅ | ✅ | ✅ | ✅ | ❌ |
| Hapus aset (soft) | ✅ | ✅ | ✅ | ❌ | ❌ |
| CRUD Business Units | ✅ | ✅ | ❌ | ❌ | ❌ |
| CRUD Locations | ✅ | ✅ | ✅ | ❌ | ❌ |
| CRUD Asset Categories | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manajemen User | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## 📝 Catatan Developer

- **Server Actions** digunakan untuk semua operasi database
- **RLS** memastikan isolasi data di level database; `requireRole()` validasi tambahan di aplikasi
- `asset_code` di-generate DB trigger otomatis (format: `AMB-00001`)
- `qr_code_uuid` di-generate `gen_random_uuid()` saat INSERT aset
- Foto → bucket `asset-photos` (public URL), Dokumen → `asset-documents` (private)

---

## 🗓️ Roadmap Fase Berikutnya

- [ ] QR Code generation & scan (kamera mobile)
- [ ] Maintenance Module (jadwal preventif/korektif)
- [ ] Opname Module (stock opname via QR)
- [ ] Depreciation Engine (kalkulasi penyusutan bulanan)
- [ ] Disposal Workflow (approval berjenjang)
- [ ] Reports (export Excel/PDF)
- [ ] Notifications (email/push untuk maintenance overdue)
