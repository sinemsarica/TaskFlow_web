# TaskFlow 🗂️

Trello benzeri Kanban proje yönetim aracı. Next.js, Prisma, dnd-kit ile yapılmıştır.

## Özellikler

- ✅ Kullanıcı kayıt & giriş (NextAuth.js)
- ✅ Board oluşturma, silme
- ✅ Sütun oluşturma, silme, yeniden sıralama
- ✅ Kart oluşturma, silme, düzenleme (başlık + açıklama)
- ✅ Sürükle-bırak (kart & sütun) — dnd-kit
- ✅ Sıralama sayfa yenilemesinde korunur (fractional-indexing)
- ✅ Otomatik kayıt (kart detayı)
- ✅ Mobil dokunmatik desteği
- ✅ Karanlık tema

## Kurulum

### 1. Bağımlılıkları yükle

```bash
npm install
```

### 2. Supabase'de veritabanı oluştur

1. [supabase.com](https://supabase.com) → New Project
2. Settings → Database → Connection String → **URI** kopyala
3. Ayrıca **Direct connection** string'i de kopyala

### 3. Environment variables

`.env.example` dosyasını `.env` olarak kopyala:

```bash
cp .env.example .env
```

`.env` dosyasını doldur:

```env
DATABASE_URL="postgresql://..."         # Supabase pooler URL
DIRECT_URL="postgresql://..."           # Supabase direct URL
NEXTAUTH_SECRET="uzun-rastgele-string"  # openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
```

> **NEXTAUTH_SECRET üretmek için:**
> ```bash
> openssl rand -base64 32
> ```

### 4. Prisma schema'sını güncelle (DIRECT_URL için)

`prisma/schema.prisma` dosyasında:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")    // Bu satırı ekle
}
```

### 5. Veritabanı tablolarını oluştur

```bash
npm run db:push
```

### 6. Geliştirme sunucusunu başlat

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) adresini aç.

---

## Vercel'a Deploy

1. Kodu GitHub'a push et
2. [vercel.com](https://vercel.com) → Import Project → GitHub repo'yu seç
3. Environment Variables bölümüne `.env` içindeki değerleri ekle:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` → Vercel'ın verdiği URL (örn: `https://taskflow-xxx.vercel.app`)
4. Deploy et
5. Deploy sonrası Supabase'de migration çalıştır:
   ```bash
   DATABASE_URL="..." npx prisma db push
   ```

---

## Tech Stack

| Katman | Teknoloji |
|--------|-----------|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS |
| Auth | NextAuth.js v4 |
| ORM | Prisma |
| Veritabanı | PostgreSQL (Supabase) |
| Drag & Drop | dnd-kit |
| Sıralama | fractional-indexing |

---

## Proje Yapısı

```
src/
├── app/
│   ├── (auth)/login/       # Login sayfası
│   ├── (auth)/register/    # Kayıt sayfası
│   ├── dashboard/          # Board listesi
│   ├── board/[id]/         # Kanban board
│   └── api/                # REST API routes
│       ├── auth/           # NextAuth + register
│       ├── boards/         # Board CRUD
│       ├── columns/        # Column CRUD
│       └── cards/          # Card CRUD + move
├── components/
│   ├── KanbanBoard.tsx     # Ana board + DnD context
│   ├── KanbanColumn.tsx    # Sütun + droppable
│   ├── KanbanCard.tsx      # Kart + sortable
│   ├── CardModal.tsx       # Kart detay modal
│   └── DashboardClient.tsx # Dashboard UI
├── lib/
│   ├── prisma.ts           # Prisma client singleton
│   └── auth.ts             # NextAuth config
└── types/index.ts          # TypeScript tipleri
```
