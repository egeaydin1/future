# 🚀 Quick Start Guide

Goal Tracker Pro Backend'i hızlıca çalıştırmak için bu kılavuzu takip edin.

## 📦 Kurulum (5 dakika)

### 1. Repository'yi Klonlayın

```bash
cd /Users/hientranpc/Desktop/fuels-rs
```

### 2. Dependencies'i Yükleyin

```bash
npm install
```

### 3. Environment Variables

`env.example` dosyasını `.env` olarak kopyalayın:

```bash
cp env.example .env
```

`.env` dosyasını düzenleyin:

```env
# Minimum gerekli ayarlar
DATABASE_URL=postgresql://user:password@localhost:5432/goaltracker
JWT_SECRET=super-secret-key-buraya
ANTHROPIC_API_KEY=sk-ant-your-api-key
```

### 4. Database Setup

PostgreSQL'in çalıştığından emin olun, sonra:

```bash
# Prisma client'i oluştur
npx prisma generate

# Database'i oluştur ve migration'ları çalıştır
npx prisma migrate dev --name init
```

### 5. Başlat! 🎉

```bash
npm run dev
```

Server `http://localhost:3000` adresinde çalışacak.

## ✅ Test Edin

### 1. Health Check

```bash
curl http://localhost:3000/health
```

Beklenen sonuç:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "..."
}
```

### 2. Kullanıcı Oluşturun

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456",
    "name": "Test User"
  }'
```

### 3. Login Olun

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456"
  }'
```

Token'ı kaydedin!

### 4. Task Oluşturun

```bash
curl -X POST http://localhost:3000/api/tasks/backlog \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "İlk Görevim",
    "description": "Bu bir test görevi",
    "priority": "HIGH"
  }'
```

## 🎯 Sonraki Adımlar

### Prisma Studio ile Database'i İnceleyin

```bash
npx prisma studio
```

Browser'da `http://localhost:5555` açılacak.

### API'yi Test Edin

Postman veya Insomnia kullanabilirsiniz. API endpoint'leri için `README.md` dosyasına bakın.

### Railway'e Deploy Edin

Detaylı deployment rehberi için `DEPLOYMENT.md` dosyasına bakın.

Hızlı deploy:

```bash
# Railway CLI yükleyin
npm i -g @railway/cli

# Login
railway login

# Init ve deploy
railway init
railway up
```

## 🔧 Yararlı Komutlar

```bash
# Development server (auto-reload)
npm run dev

# Production server
npm start

# Prisma Studio
npx prisma studio

# Yeni migration
npx prisma migrate dev --name migration_name

# Reset database (DİKKAT: tüm data silinir!)
npx prisma migrate reset

# Prisma client'i yeniden oluştur
npx prisma generate
```

## 📱 AI Features'ı Test Etme

### Check-in

```bash
curl -X POST http://localhost:3000/api/ai/check-in \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Motivation

```bash
curl -X POST http://localhost:3000/api/ai/motivation \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Progress Analysis

```bash
curl -X POST http://localhost:3000/api/ai/analyze-progress \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"taskId": "your-task-uuid"}'
```

## ❓ Sorun mu var?

### Database bağlanamıyor

```bash
# PostgreSQL çalışıyor mu?
pg_isready

# Database var mı?
psql -l
```

### Prisma hataları

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npx prisma generate
```

### Port zaten kullanımda

`.env` dosyasında `PORT` değiştirin:

```env
PORT=3001
```

## 📚 Daha Fazla Bilgi

- **API Dokümantasyonu**: `README.md`
- **Deployment Rehberi**: `DEPLOYMENT.md`
- **Database Schema**: `prisma/schema.prisma`

---

Hazırsınız! 🎉 Başarılar dileriz!

