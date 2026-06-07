# Sehemistan 2.0

Sehemistan'ın PHP/MySQL sürümünden modern Full-Stack TypeScript mimarisine taşınmış, deploy edilebilir çekirdeği.

## Teknoloji

- React 19, Vite, Tailwind CSS ve Framer Motion
- PixiJS 8 taktik şehir haritası
- Node.js, Fastify 5 ve WebSockets
- PostgreSQL ve Prisma ORM
- Strict TypeScript monorepo
- Railway, Render, Docker ve Cloudflare uyumlu yapı

## Çalıştırma

Gereksinimler: Node.js 22+ ve PostgreSQL 16+.

```bash
cp .env.example .env
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Web arayüzü: `http://localhost:5173`

API sağlık kontrolü: `http://localhost:3001/health`

Seed hesapları:

- Oyuncu: `sehem` / `Sehemistan!2026`
- Yönetici: `admin` / `Sehemistan!2026`

Üretimde seed parolalarını ve `JWT_SECRET` değerini mutlaka değiştirin.

## Kritik Kurallar

- Saatlik sığınak bedeli varsayılan olarak `10.000.000` oyun parasıdır.
- VIP olmayan oyuncu 1-6 saati oyun parasıyla kiralar.
- VIP olmayan oyuncu tam 9 saati altınla kiralar.
- 7 ve 8 saat standart hesaplar için geçersizdir.
- VIP oyuncu 720 saatlik teknik güvenlik üst sınırına kadar oyun parasıyla kiralar.
- 9 saatlik altın bedeli `SHELTER_NINE_HOUR_GOLD_COST` ile ayarlanır.
- Süresi dolan VIP, her kimlikli HTTP isteğinde ve WebSocket bağlantısında otomatik kapatılır.

## Komutlar

```bash
npm run typecheck
npm test
npm run build
npm run db:migrate
npm run db:seed
```

## Deployment

Railway `railway.json`, Render `render.yaml`, bütün platformlar ise kökteki `Dockerfile` ile çalışabilir. PostgreSQL servisinin `DATABASE_URL` değişkenini, en az 32 karakterli `JWT_SECRET` değerini ve gerçek frontend alan adını `CORS_ORIGIN` olarak tanımlayın.

Cloudflare ayarları için [docs/CLOUDFLARE.md](docs/CLOUDFLARE.md), eski veri geçişi için [docs/LEGACY_MIGRATION.md](docs/LEGACY_MIGRATION.md) dosyasına bakın.
