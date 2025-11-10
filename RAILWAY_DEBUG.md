# 🔍 Railway Debug Guide

## Healthcheck Failed? Adım Adım Çözüm

### 1. Railway Logs Kontrol Et

```bash
railway logs
```

veya Railway Dashboard → Deployments → Son deployment → Logs

---

### 2. Common Problems & Solutions

#### Problem: "Healthcheck failed - service unavailable"

**Olası Sebepler:**

1. **Database bağlantısı yok**
   - ✅ `DATABASE_URL` Railway'de ayarlı mı?
   - ✅ PostgreSQL service oluşturuldu mu?
   - ✅ Database URL doğru mu?

2. **OpenAI API key eksik**
   - ✅ `OPENAI_API_KEY` Railway'de ayarlı mı?
   - ✅ Key doğru mu? (`sk-` ile başlamalı)

3. **Migration başarısız**
   - ✅ Migration dosyaları commit edildi mi?
   - ✅ `prisma/migrations/` klasörü var mı?

4. **JWT_SECRET eksik**
   - ✅ `JWT_SECRET` Railway'de ayarlı mı?

5. **Seed başarısız oluyor**
   - ⚠️ Seed artık optional (başarısız olsa bile server başlar)

---

### 3. Railway Environment Variables Checklist

#### ✅ Zorunlu Variables

```env
DATABASE_URL=postgresql://...  # Railway otomatik ekler
PORT=3000                       # Railway otomatik ekler
JWT_SECRET=your-secret-key      # Manuel ekle!
OPENAI_API_KEY=sk-...          # Manuel ekle!
```

#### 🔧 Optional Variables

```env
OPENAI_MODEL=gpt-4-turbo-preview
NODE_ENV=production
ENABLE_SCHEDULERS=true
AI_SYSTEM_PROMPT=Custom prompt...
```

---

### 4. Test Health Endpoint

Deploy tamamlandıktan sonra:

```bash
curl https://your-app.railway.app/health
```

**Healthy Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "openai": "configured",
  "timestamp": "2024-11-10T...",
  "version": "1.0.0"
}
```

**Unhealthy Response:**
```json
{
  "status": "unhealthy",
  "database": "disconnected",
  "error": "..."
}
```

---

### 5. Debug Commands

Railway terminal'de çalıştır:

```bash
# Database tabloları kontrol et
railway run npx prisma studio

# Migration durumu
railway run npx prisma migrate status

# Manuel migration
railway run npx prisma migrate deploy

# Manuel seed (optional)
railway run npx prisma db seed

# Logs stream
railway logs --follow
```

---

### 6. Common Error Messages

#### "Error: P1001: Can't reach database server"
→ `DATABASE_URL` yanlış veya PostgreSQL service down

#### "Error: Invalid API key"
→ `OPENAI_API_KEY` yanlış veya eksik

#### "Error: secret or public key must be provided"
→ `JWT_SECRET` eksik

#### "Cannot find module 'openai'"
→ Dependencies yüklenmedi, rebuild gerekli

---

### 7. Emergency Fix: Skip Seed

Eğer seed sürekli başarısız oluyorsa:

**Option 1:** Railway Variables'a ekle:
```env
SKIP_SEED=true
```

**Option 2:** Seed script'i düzenle (geçici):
```bash
railway run sh
# İçinde
npx prisma migrate deploy
node src/server.js
```

---

### 8. Successful Deploy Logs Örneği

```
✅ Dependencies installed
✅ Prisma generated
✅ Running migration...
✅ Migration completed
✅ Running seed...
✅ Seed completed (or skipped)
✅ Server starting...
🚀 Server running on port 3000
📊 Environment: production
✅ Healthcheck passed
```

---

### 9. Railway Dashboard Checklist

1. **Services** tab:
   - ✅ PostgreSQL service var mı?
   - ✅ Database bağlantısı aktif mi?

2. **Variables** tab:
   - ✅ `DATABASE_URL` (auto)
   - ✅ `JWT_SECRET` (manual)
   - ✅ `OPENAI_API_KEY` (manual)

3. **Deployments** tab:
   - ✅ Son deployment "Active" durumda mı?
   - ✅ Logs'da error var mı?

4. **Settings** tab:
   - ✅ Health check path: `/health`
   - ✅ Start command doğru mu?

---

### 10. Quick Fix Script

Tüm değişkenleri toplu kontrol et:

```bash
# Railway CLI ile
railway variables

# Eksik olanları ekle
railway variables set JWT_SECRET="your-secret-key-here"
railway variables set OPENAI_API_KEY="sk-your-key-here"

# Redeploy
railway up
```

---

## 🆘 Hala Çalışmıyor mu?

1. **Railway Logs'u kopyala** → Hatayı belirle
2. **GitHub'a push** → Yeni deployment tetikle
3. **Railway Discord** → Community'den yardım al
4. **Lokal test** → `npm start` ile çalışıyor mu?

---

## ✅ Working Configuration

```env
# .env (local)
DATABASE_URL="postgresql://postgres:password@localhost:5432/goaltracker"
JWT_SECRET="super-secret-key-change-in-production"
OPENAI_API_KEY="sk-your-actual-key"
OPENAI_MODEL="gpt-4-turbo-preview"
NODE_ENV="development"
PORT="3000"
```

```env
# Railway Variables
DATABASE_URL → (auto from PostgreSQL service)
JWT_SECRET → "random-64-char-string"
OPENAI_API_KEY → "sk-..."
OPENAI_MODEL → "gpt-4-turbo-preview"
NODE_ENV → "production"
```

---

## 📚 Useful Links

- [Railway Docs - Healthcheck](https://docs.railway.app/deploy/healthchecks)
- [Prisma Deploy Docs](https://www.prisma.io/docs/guides/deployment)
- [OpenAI API Keys](https://platform.openai.com/api-keys)

---

**Son güncelleme:** Railway healthcheck improved + optional seed

