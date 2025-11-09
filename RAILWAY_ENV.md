# 🚂 Railway Environment Variables

Railway Dashboard'da ayarlamanız gereken environment variables.

## 📋 Gerekli Variables

Railway Dashboard → Projeniz → Backend Service → **Variables** sekmesi

### 1. JWT_SECRET (Zorunlu)

```bash
# Terminal'de oluşturun:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Railway'de:
```
Variable: JWT_SECRET
Value: <yukarıdaki-komuttan-oluşan-64-karakterlik-string>
```

**Örnek değer:**
```
a3f9d8e7b6c5a4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9
```

---

### 2. JWT_EXPIRES_IN

```
Variable: JWT_EXPIRES_IN
Value: 7d
```

---

### 3. OPENAI_API_KEY (Zorunlu)

**Nereden alınır:** [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

1. OpenAI Dashboard'a gidin
2. "Create new secret key" tıklayın
3. Key'i kopyalayın (bir daha gösterilmeyecek!)

Railway'de:
```
Variable: OPENAI_API_KEY
Value: sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### 4. OPENAI_MODEL

```
Variable: OPENAI_MODEL
Value: gpt-4-turbo-preview
```

**Alternatifler:**
- `gpt-4-turbo-preview` - En iyi kalite (önerilen)
- `gpt-3.5-turbo` - Ekonomik (10x daha ucuz)

---

### 5. NODE_ENV

```
Variable: NODE_ENV
Value: production
```

---

### 6. ENABLE_SCHEDULERS

```
Variable: ENABLE_SCHEDULERS
Value: true
```

Bu değişken AI check-in'leri ve schedulers'ı kontrol eder:
- `true` - Günlük check-in, haftalık review aktif
- `false` - Scheduler'lar devre dışı (sadece manuel API çağrıları)

---

## ✅ Otomatik Eklenen Variables

Bu değişkenleri **eklemenize gerek yok**, Railway otomatik halleder:

### DATABASE_URL
PostgreSQL database eklediğinizde Railway otomatik set eder.

### PORT
Railway otomatik port atar.

---

## 📋 Tüm Variables Özeti

Railway Variables sekmesinde şunları görmelisiniz:

```
DATABASE_URL                    (otomatik - PostgreSQL'den)
PORT                           (otomatik - Railway'den)
JWT_SECRET                     (manuel - sizin eklediğiniz)
JWT_EXPIRES_IN                 (manuel - 7d)
OPENAI_API_KEY                 (manuel - OpenAI'dan)
OPENAI_MODEL                   (manuel - gpt-4-turbo-preview)
NODE_ENV                       (manuel - production)
ENABLE_SCHEDULERS              (manuel - true)
```

**Toplam:** 6 manuel + 2 otomatik = 8 environment variable

---

## 🎯 Adım Adım Railway Setup

### 1. PostgreSQL Ekle

Railway Dashboard → Projeniz → **New** → **Database** → **PostgreSQL**

✅ `DATABASE_URL` otomatik eklenir

### 2. Variables Ekle

Backend service'i seçin → **Variables** sekmesi

Her bir variable için **"+ New Variable"** tıklayın ve ekleyin:

```
JWT_SECRET=<32-byte-hex-string>
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=sk-proj-xxxxx
OPENAI_MODEL=gpt-4-turbo-preview
NODE_ENV=production
ENABLE_SCHEDULERS=true
```

### 3. Deploy

Variables eklendikten sonra:
- **Deployments** → Son deployment → **⋮** → **Redeploy**

Ya da yeni commit push'layın:
```bash
git commit --allow-empty -m "Trigger redeploy"
git push
```

### 4. Health Check

Deploy tamamlandıktan sonra (2-3 dakika):

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

---

## 🔐 Güvenlik Notları

### ❌ YAPMAYIN:
- JWT_SECRET'i GitHub'a commit etmeyin
- OpenAI API key'i paylaşmayın
- Zayıf/tahmin edilebilir JWT_SECRET kullanmayın

### ✅ YAPIN:
- Railway'de Variables'ı encryption ile saklayın
- OpenAI key'i sadece gerekli yerlerde kullanın
- Güçlü, rastgele JWT_SECRET oluşturun
- Environment variables'ı düzenli kontrol edin

---

## 💰 Maliyet Tahmini

### OpenAI API Kullanımı

**GPT-4 Turbo:**
- 100 kullanıcı/gün: ~$3-5/ay
- 1000 kullanıcı/gün: ~$30-50/ay

**GPT-3.5 Turbo:**
- 100 kullanıcı/gün: ~$0.30-0.50/ay
- 1000 kullanıcı/gün: ~$3-5/ay

### Railway

**Hobby Plan (Ücretsiz):**
- 500 saat/ay execution
- 512MB RAM
- 1GB disk
- Shared CPU

**Developer Plan ($5/ay):**
- Unlimited execution
- 512MB RAM
- 1GB disk
- Dedicated CPU

---

## 🧪 Test Etme

Variables eklendikten sonra test edin:

### 1. Register
```bash
curl -X POST https://your-app.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456",
    "name": "Test User"
  }'
```

### 2. AI Check-in
```bash
curl -X POST https://your-app.railway.app/api/ai/check-in \
  -H "Authorization: Bearer YOUR_TOKEN"
```

OpenAI API çalışıyorsa motivasyon mesajı alacaksınız! 🎉

---

## ❓ Troubleshooting

### "Invalid OpenAI API Key"

- API key'i doğru kopyaladınız mı?
- OpenAI hesabınızda kredi var mı?
- Key `sk-proj-` ile başlıyor mu?

### "Database connection failed"

- PostgreSQL service'i çalışıyor mu?
- `DATABASE_URL` doğru set edilmiş mi?
- Migration'lar çalıştı mı?

### "Invalid JWT"

- `JWT_SECRET` set edilmiş mi?
- Token'ı doğru formatta gönderiyor musunuz? (`Bearer TOKEN`)

---

## 🎓 İyi Bilmekte Fayda Var

### Model Değiştirme

`OPENAI_MODEL` variable'ını istediğiniz zaman değiştirebilirsiniz:

```
gpt-4-turbo-preview    → En iyi kalite
gpt-4                  → Stable
gpt-3.5-turbo         → Ekonomik
gpt-3.5-turbo-16k     → Uzun context
```

Değiştirdikten sonra service otomatik restart olur.

### Scheduler'ları Kapatma

Test için scheduler'ları kapatmak isterseniz:

```
ENABLE_SCHEDULERS=false
```

Bu durumda:
- ❌ Günlük check-in çalışmaz
- ❌ Haftalık review çalışmaz
- ✅ Manuel API çağrıları çalışır
- ✅ `/api/ai/check-in` hala kullanılabilir

---

**Tüm variables hazır olunca Railway otomatik deploy edecek!** 🚀

Sorularınız için: `RAILWAY_SETUP.md` dosyasına bakın.

