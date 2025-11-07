# Railway Deployment Rehberi

Bu döküman Goal Tracker Pro backend'ini Railway'e nasıl deploy edeceğinizi adım adım açıklar.

## 📋 Gereksinimler

1. Railway hesabı ([railway.app](https://railway.app))
2. GitHub hesabı (opsiyonel, önerilen)
3. Anthropic API anahtarı ([console.anthropic.com](https://console.anthropic.com))

## 🚀 Deployment Adımları

### Yöntem 1: GitHub ile Deploy (Önerilen)

#### 1. Kodu GitHub'a Push'layın

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

#### 2. Railway'de Proje Oluşturun

1. [Railway Dashboard](https://railway.app/dashboard)'a gidin
2. "New Project" butonuna tıklayın
3. "Deploy from GitHub repo" seçeneğini seçin
4. Repository'nizi seçin

#### 3. PostgreSQL Database Ekleyin

1. Proje içinde "New" butonuna tıklayın
2. "Database" → "Add PostgreSQL" seçin
3. Railway otomatik olarak `DATABASE_URL` environment variable'ını set edecek

#### 4. Environment Variables'ları Ayarlayın

Proje ayarlarından "Variables" sekmesine gidin ve şunları ekleyin:

```
JWT_SECRET=rastgele-gizli-bir-anahtar-buraya
JWT_EXPIRES_IN=7d
ANTHROPIC_API_KEY=sk-ant-api-anahtarınız
NODE_ENV=production
ENABLE_SCHEDULERS=true
```

**Önemli**: `JWT_SECRET` için güçlü, rastgele bir string kullanın:
```bash
# Terminal'de oluşturmak için:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 5. Deploy'u Başlatın

- Railway otomatik olarak kodu build edip deploy edecek
- Build loglarını "Deployments" sekmesinden takip edebilirsiniz
- İlk deploy 2-3 dakika sürebilir

#### 6. Domain Ayarlayın

1. "Settings" → "Networking" → "Generate Domain"
2. Railway size bir `*.railway.app` domain verecek
3. Custom domain eklemek isterseniz aynı yerden yapabilirsiniz

### Yöntem 2: Railway CLI ile Deploy

#### 1. Railway CLI'yi Yükleyin

```bash
# macOS
brew install railway

# npm ile
npm i -g @railway/cli
```

#### 2. Login Olun

```bash
railway login
```

#### 3. Proje Oluşturun

```bash
railway init
```

#### 4. PostgreSQL Ekleyin

```bash
railway add --database postgresql
```

#### 5. Environment Variables

```bash
railway variables set JWT_SECRET=your-secret-here
railway variables set ANTHROPIC_API_KEY=sk-ant-xxxxx
railway variables set JWT_EXPIRES_IN=7d
railway variables set NODE_ENV=production
railway variables set ENABLE_SCHEDULERS=true
```

#### 6. Deploy

```bash
railway up
```

## 🔍 Deployment'ı Kontrol Etme

### Health Check

Deploy tamamlandıktan sonra:

```bash
curl https://your-app.railway.app/health
```

Başarılı response:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Database Migration

Railway otomatik olarak migration'ları çalıştırır ama manuel kontrol için:

```bash
railway run npx prisma migrate deploy
```

## 🔧 Post-Deployment

### 1. Test Account Oluşturma

```bash
curl -X POST https://your-app.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456",
    "name": "Test User"
  }'
```

### 2. Login Test

```bash
curl -X POST https://your-app.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456"
  }'
```

### 3. Prisma Studio (Opsiyonel)

Database'i görsel olarak incelemek için:

```bash
railway connect postgres
# Yeni terminal'de:
npx prisma studio
```

## 📊 Monitoring

### Railway Dashboard'da

1. **Metrics**: CPU, Memory, Network kullanımı
2. **Logs**: Real-time application logs
3. **Deployments**: Deployment geçmişi ve rollback

### Logs'lara Erişim

```bash
railway logs
```

## 🔄 Auto-Deploy Ayarlama

GitHub ile deploy ettiyseniz, her push otomatik deploy tetikler:

1. Değişiklik yapın
2. Git commit & push
3. Railway otomatik build ve deploy eder

Otomatik deploy'u kapatmak için:
- Settings → Deploy → Disable "Auto Deploy"

## 🌍 Environment-Specific Settings

### Production için Öneriler

```
NODE_ENV=production
ENABLE_SCHEDULERS=true
PORT=3000  # Railway otomatik set eder
```

### Staging için

```
NODE_ENV=staging
ENABLE_SCHEDULERS=false  # Test için schedulers kapalı
```

## 🐛 Troubleshooting

### Build Başarısız

1. Logs'ları kontrol edin: `railway logs`
2. `package.json` script'lerini kontrol edin
3. Node.js version uyumluluğunu kontrol edin

### Database Connection Error

```bash
# DATABASE_URL'i kontrol edin
railway variables

# Database servisinin çalıştığını kontrol edin
railway status
```

### Migration Hataları

```bash
# Migration'ları manuel çalıştırın
railway run npx prisma migrate deploy

# Reset gerekirse (DİKKAT: tüm data silinir!)
railway run npx prisma migrate reset
```

### Application Crash

```bash
# Logs'ları inceleyin
railway logs --tail

# Service'i restart edin
railway restart
```

## 💰 Maliyet

Railway'in ücretsiz tier'ı:
- 500 saat/ay execution time
- 512MB RAM
- 1GB disk
- Shared CPU

Daha fazla resource için [Railway Pricing](https://railway.app/pricing)'e bakın.

## 🔒 Güvenlik

### Önemli Noktalar

1. ✅ `JWT_SECRET` güçlü ve random olmalı
2. ✅ `.env` dosyası Git'e commit edilmemeli
3. ✅ Production'da `NODE_ENV=production` olmalı
4. ✅ Anthropic API key'i güvenli saklanmalı
5. ✅ CORS ayarlarını production için güncelleyin

### CORS Configuration

Production'da `src/server.js` içinde:

```javascript
app.use(cors({
  origin: 'https://your-frontend-domain.com',
  credentials: true
}));
```

## 📈 Scaling

Traffic arttıkça:

1. **Vertical Scaling**: Railway settings'den daha fazla RAM/CPU
2. **Database**: PostgreSQL'i ayrı bir instance'a taşıyın
3. **Caching**: Redis ekleyin
4. **CDN**: Static assets için

## 🔄 Database Backup

Railway otomatik backup yapar ama manuel backup için:

```bash
# Export database
railway run npx prisma db pull

# Dump oluştur
railway run pg_dump $DATABASE_URL > backup.sql
```

## 📞 Destek

- Railway Docs: [docs.railway.app](https://docs.railway.app)
- Railway Discord: [discord.gg/railway](https://discord.gg/railway)
- Proje Issues: GitHub Issues

---

Deploy'unuz başarılı olsun! 🚀

