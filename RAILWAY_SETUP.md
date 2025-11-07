# 🚂 Railway Deployment - Adım Adım Kurulum

Bu döküman Goal Tracker Pro'yu Railway'e deploy etmek için takip edilmesi gereken **tüm adımları** içerir.

## 📋 Checklist

Başlamadan önce bunlara sahip olduğunuzdan emin olun:

- [ ] Railway hesabı ([railway.app](https://railway.app))
- [ ] GitHub repository (kodu push'layın)
- [ ] OpenAI API key ([platform.openai.com/api-keys](https://platform.openai.com/api-keys))
- [ ] JWT secret key (rastgele, güvenli bir string)

## 🎯 Railway Deployment (15 dakika)

### Adım 1: Railway'e Giriş

1. [railway.app](https://railway.app) adresine gidin
2. "Login" → GitHub ile giriş yapın
3. Railway'in GitHub repo'larınıza erişim iznini verin

### Adım 2: Yeni Proje Oluştur

1. Dashboard'da **"New Project"** butonuna tıklayın
2. **"Deploy from GitHub repo"** seçeneğini seçin
3. Repository'nizi listeden bulun ve seçin
4. Railway otomatik olarak deploy'u başlatacak (ilk deploy başarısız olabilir - normal!)

### Adım 3: PostgreSQL Database Ekle

1. Project view'da **"New"** butonuna tıklayın
2. **"Database"** → **"Add PostgreSQL"** seçin
3. PostgreSQL servisi otomatik başlatılacak
4. Railway `DATABASE_URL` environment variable'ını otomatik ekleyecek

✅ Database hazır!

### Adım 4: Environment Variables Ayarla

1. Backend service'inize tıklayın (repo adınızla gösterilir)
2. **"Variables"** sekmesine gidin
3. **"+ New Variable"** butonuna tıklayın
4. Aşağıdaki değişkenleri **tek tek** ekleyin:

#### Gerekli Variables (Mutlaka Ekleyin)

```env
JWT_SECRET
```
**Değer:** Rastgele, güvenli bir string (en az 32 karakter)

**Oluşturmak için:**
```bash
# Terminal'de çalıştırın:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

```env
OPENAI_API_KEY
```
**Değer:** `sk-xxxxxxxxxxxxxxxxxxxxxxxx` (OpenAI'dan aldığınız key)

**Nereden alınır:** [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

```env
OPENAI_MODEL
```
**Değer:** `gpt-4-turbo-preview` (ya da `gpt-3.5-turbo` daha ucuz)

```env
NODE_ENV
```
**Değer:** `production`

```env
JWT_EXPIRES_IN
```
**Değer:** `7d`

```env
ENABLE_SCHEDULERS
```
**Değer:** `true`

#### Opsiyonel Variables (APNs için - sonra eklenebilir)

```env
APNS_KEY
APNS_KEY_ID
APNS_TEAM_ID
APNS_BUNDLE_ID
APNS_PRODUCTION
```

> 💡 **Not:** APNs bilgilerini şimdilik atlayabilirsiniz. iOS push notification olmadan da API çalışır.

### Adım 5: Variables'ı Doğrulayın

Tüm variables ekledikten sonra kontrol edin:

✅ `DATABASE_URL` - Otomatik eklendi (PostgreSQL'den)
✅ `JWT_SECRET` - Elle eklediniz
✅ `OPENAI_API_KEY` - Elle eklediniz
✅ `OPENAI_MODEL` - gpt-4-turbo-preview
✅ `NODE_ENV` - production
✅ `JWT_EXPIRES_IN` - 7d
✅ `ENABLE_SCHEDULERS` - true

### Adım 6: Redeploy

1. **"Deployments"** sekmesine gidin
2. Son deployment'ın yanındaki **"⋮"** menüsüne tıklayın
3. **"Redeploy"** seçeneğini seçin

Ya da yeni bir commit push'layın:

```bash
git commit --allow-empty -m "Trigger Railway deploy"
git push
```

### Adım 7: Deploy Loglarını İzleyin

1. **"Deployments"** sekmesinde en son deployment'a tıklayın
2. **"View Logs"** ile build sürecini izleyin

Başarılı bir deploy şöyle görünür:

```
✓ Installing dependencies...
✓ Prisma generating...
✓ Build successful
✓ Starting server...
🚀 Server running on port 3000
```

### Adım 8: Domain Oluştur

1. **"Settings"** sekmesine gidin
2. **"Networking"** bölümünü bulun
3. **"Generate Domain"** butonuna tıklayın
4. Railway size bir domain verecek: `your-app.up.railway.app`

✅ API artık canlı!

### Adım 9: Health Check

Terminal'de test edin:

```bash
curl https://your-app.up.railway.app/health
```

Başarılı response:

```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

✅ Deploy başarılı!

## 🧪 API'yi Test Edin

### 1. Demo User ile Login

Railway otomatik seed çalıştırır. Demo kullanıcı:

```bash
curl -X POST https://your-app.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@goaltracker.com",
    "password": "demo123456"
  }'
```

Token'ı kaydedin!

### 2. Tasks Listesini Alın

```bash
curl https://your-app.up.railway.app/api/tasks/active \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. AI Check-in Test

```bash
curl -X POST https://your-app.up.railway.app/api/ai/check-in \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🔧 Troubleshooting

### ❌ Build Failed

**Sorun:** "Build failed" hatası

**Çözüm:**
1. Deployment logs'u inceleyin
2. `package.json` script'lerini kontrol edin
3. Node.js version uyumlu mu? (.nvmrc dosyasında 18)

### ❌ Database Connection Error

**Sorun:** "Database connection failed"

**Çözüm:**
1. PostgreSQL service'inin çalıştığını kontrol edin
2. `DATABASE_URL` variable'ının set olduğunu doğrulayın
3. Railway'de PostgreSQL service'i restart edin

### ❌ Migration Error

**Sorun:** "Prisma migration failed"

**Çözüm:**

Railway'de terminal açın ve manuel migration:

1. Service'e tıklayın
2. **"⋮"** → **"Terminal"**
3. Çalıştırın:

```bash
npx prisma migrate deploy
```

### ❌ 503 Service Unavailable

**Sorun:** API yanıt vermiyor

**Çözüm:**
1. Deployment'ın tamamlandığını kontrol edin
2. Logs'da error var mı?
3. Environment variables doğru mu?
4. Service'i restart edin

### ❌ JWT Error

**Sorun:** "Invalid token" hatası

**Çözüm:**
1. `JWT_SECRET` environment variable'ı set mi?
2. Token'ı doğru formatta mı gönderiyorsunuz? (`Bearer TOKEN`)
3. Token expired olmamış mı?

## 📊 Railway Dashboard

### Önemli Sekmeler

1. **Deployments** - Build history ve logs
2. **Metrics** - CPU, Memory, Network kullanımı
3. **Variables** - Environment variables
4. **Settings** - Domain, scaling, restart policy

### Useful Commands

```bash
# Logs'ları canlı izle
railway logs --tail

# Service'i restart et
railway restart

# Variables listele
railway variables

# Production database'e bağlan
railway connect postgres
```

## 🔐 Güvenlik Kontrolleri

Deploy'dan sonra:

- [ ] `JWT_SECRET` güçlü ve rastgele
- [ ] `NODE_ENV` production olarak set
- [ ] `OPENAI_API_KEY` doğru ve çalışıyor
- [ ] CORS ayarları production domain'e göre yapılandırılmış
- [ ] Database backups aktif (Railway otomatik yapar)

## 🚀 Production Optimizasyonları

### 1. CORS'u Güncelle

`src/server.js` dosyasında:

```javascript
// Geliştirme (herkese açık)
app.use(cors());

// Production (sadece frontend domain'e)
app.use(cors({
  origin: 'https://your-frontend-domain.com',
  credentials: true
}));
```

Deploy için commit & push:

```bash
git add src/server.js
git commit -m "Update CORS for production"
git push
```

### 2. Rate Limiting Ekle (Opsiyonel)

```bash
npm install express-rate-limit
```

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100 // max 100 request
});

app.use('/api/', limiter);
```

## 📈 Monitoring

### Railway Metrics

Dashboard'da:
- CPU kullanımı
- Memory kullanımı
- Network traffic
- Request count

### Custom Logging

Logs'ları Railway dashboard'dan takip edin:

```bash
railway logs --tail
```

## 💡 İpuçları

1. **Auto-Deploy:** Her git push otomatik deploy tetikler
2. **Preview Deploys:** Branch'ler için preview environment'lar oluşturabilirsiniz
3. **Scaling:** Settings'den horizontal/vertical scaling yapabilirsiniz
4. **Backups:** PostgreSQL otomatik daily backup alır
5. **Rollback:** Deployments'dan eski versiyona geri dönebilirsiniz

## 📞 Destek

- Railway Docs: [docs.railway.app](https://docs.railway.app)
- Railway Discord: [discord.gg/railway](https://discord.gg/railway)
- Railway Status: [status.railway.app](https://status.railway.app)

---

## ✅ Final Checklist

Deploy tamamlandı mı?

- [x] PostgreSQL database eklendi
- [x] Environment variables set edildi
- [x] Domain oluşturuldu
- [x] Health check başarılı
- [x] API endpoints test edildi
- [x] Demo user ile login yapılabildi
- [x] AI integration çalışıyor
- [x] Logs clean (error yok)

🎉 **Tebrikler! Goal Tracker Pro başarıyla Railway'de live!**

---

Backend URL'inizi frontend ekibine iletin: `https://your-app.up.railway.app`

🚀 Happy deploying!

