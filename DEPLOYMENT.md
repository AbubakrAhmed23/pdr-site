# Deployment (Vercel + Neon Postgres)

## 1) Veritabanı (Neon — ücretsiz Postgres)
1. https://neon.tech → yeni proje oluştur (bölge: Frankfurt önerilir).
2. Connection string'i (pooled, `?sslmode=require`) kopyala → `DATABASE_URL`.

## 2) GitHub
Proje git deposu hazır. Boş bir GitHub reposu oluşturduktan sonra:
```bash
git remote add origin https://github.com/<kullanıcı>/<repo>.git
git branch -M main
git push -u origin main
```

## 3) Vercel
1. https://vercel.com → **Add New → Project** → GitHub reposunu seç (Import).
2. Framework: **Next.js** (otomatik algılanır). Build/Install ayarlarına dokunma.
   - `postinstall` script'i Prisma client'ı otomatik üretir.
3. **Environment Variables** ekle (Production + Preview):

| Değişken | Açıklama |
|----------|----------|
| `DATABASE_URL` | Neon Postgres bağlantı dizesi |
| `AUTH_SECRET` | `openssl rand -base64 32` ile üret |
| `AUTH_TRUST_HOST` | `true` |
| `ENCRYPTION_KEY` | `openssl rand -base64 32` (hassas veri şifreleme) |
| `ANTHROPIC_API_KEY` | (ops.) gerçek AI özetleri için; boşsa güvenli yedek çalışır |
| `RESEND_API_KEY` | (ops.) e-posta bildirimleri |
| `EMAIL_FROM` | `PDR Danışmanlık <noreply@alanadiniz.com>` |
| `NEXT_PUBLIC_SITE_URL` | `https://<vercel-domaininiz>` |
| `OWNER_EMAIL` / `OWNER_PASSWORD` / `OWNER_WHATSAPP` | seed için (ilk kurulum) |

4. **Deploy**.

## 4) İlk kurulum (veritabanı şeması + başlangıç verisi)
İlk deploy sonrası, şemayı veritabanına uygula ve seed'i çalıştır (lokalden, `.env`'de Neon `DATABASE_URL` ile):
```bash
npx prisma db push      # tabloları oluştur
npm run db:seed         # owner/admin + içerik + fiyat + örnek blog
```
> Seed sonrası **WhatsApp numarasını** ve metinleri admin panelden (`/tr/admin/settings`) güncelle ve
> ilk girişin ardından owner parolasını değiştir.

## Notlar
- `npm run dev` çalışırken `npm run build` ÇALIŞTIRMA (aynı `.next`'i paylaşıp bozarlar). Vercel'de bu sorun yoktur.
- Yasal metinler (KVKK/sözleşme) taslaktır; yayından önce bir hukuk danışmanınca gözden geçirilmelidir.
