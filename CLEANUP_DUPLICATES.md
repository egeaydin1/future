# 🧹 Duplicate Task'ları Temizleme

## Sorun
Railway'de her deploy'da seed script çalışıp aynı task'ları tekrar oluşturuyordu.

## Çözüm

### 1. Seed Script Düzeltildi ✅
```javascript
// Artık task'ları sadece yoksa oluşturur
const existingTasks = await prisma.task.count({
  where: { userId: user.id }
});

if (existingTasks > 0) {
  console.log('⏭️  Sample tasks already exist, skipping...');
}
```

### 2. Task Oluşturma Endpoint'i Güçlendirildi ✅
```javascript
// Aynı isimde task varsa hata verir
POST /api/tasks/backlog
{
  "title": "Learn Node.js",
  "description": "..."
}

// Response (409 Conflict):
{
  "error": "Bu isimde bir görev zaten mevcut.",
  "errorCode": "DUPLICATE_TASK",
  "existingTask": {
    "id": "xxx",
    "title": "Learn Node.js",
    "status": "BACKLOG"
  }
}
```

---

## Railway'deki Duplicate'leri Silme

### Option 1: Railway Console'dan SQL
```sql
-- Duplicate task'ları listele
SELECT title, COUNT(*) as count 
FROM "Task" 
WHERE title = 'Learn Node.js and Express' 
GROUP BY title;

-- En eskiler hariç tümünü sil
DELETE FROM "Task" 
WHERE title = 'Learn Node.js and Express' 
AND id NOT IN (
  SELECT id FROM "Task" 
  WHERE title = 'Learn Node.js and Express' 
  ORDER BY "createdAt" ASC 
  LIMIT 1
);
```

### Option 2: API'den Silme (curl)
```bash
# 1. Login
TOKEN=$(curl -X POST https://your-app.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@goaltracker.com","password":"demo123456"}' \
  | jq -r '.token')

# 2. Backlog task'ları listele
curl -X GET https://your-app.railway.app/api/tasks/backlog \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.[] | select(.title == "Learn Node.js and Express") | .id'

# 3. Duplicate'leri tek tek sil
curl -X DELETE https://your-app.railway.app/api/tasks/backlog/{TASK_ID} \
  -H "Authorization: Bearer $TOKEN"
```

### Option 3: Prisma Studio (Local)
```bash
# Railway database'e bağlan
railway connect

# Prisma Studio'yu aç
npx prisma studio
```

---

## Frontend Uyarı Mesajı

```typescript
try {
  await axios.post('/api/tasks/backlog', { title, description });
} catch (error) {
  if (error.response?.status === 409) {
    // Duplicate task
    const existing = error.response.data.existingTask;
    alert(`"${existing.title}" zaten ${existing.status} listesinde mevcut!`);
  }
}
```

---

## Test

### ✅ Seed Script Kontrolü
```bash
# Railway logs'u izle
railway logs

# Görmelisin:
# "⏭️  Sample tasks already exist, skipping creation..."
```

### ✅ API Duplicate Kontrolü
```bash
# Aynı task'ı 2 kez oluşturmaya çalış
curl -X POST https://your-app.railway.app/api/tasks/backlog \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Task","description":"Test"}'

# İkinci istekte 409 Conflict almalısın
```

---

## Özet

| Öncesi | Sonrası |
|--------|---------|
| ❌ Her deploy'da duplicate task'lar | ✅ Seed skip edilir |
| ❌ Aynı isimde task oluşabilir | ✅ 409 Conflict hata verir |
| ❌ Backlog karışık | ✅ Temiz ve organize |

