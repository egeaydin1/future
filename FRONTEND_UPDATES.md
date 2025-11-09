# 🔄 Frontend için Yeni Özellikler ve Değişiklikler

## 📅 Tarih: 9 Kasım 2024

---

## ✨ Yeni Özellikler

### 1. 🇹🇷 Türkçe AI Yanıtları
Tüm AI mesajları artık **Türkçe**! Kullanıcı deneyimi için daha samimi ve anlaşılır.

### 2. 🔔 Gelişmiş Bildirim Sistemi

**Yeni Bildirim Tipleri:**
- ✅ **Günlük Değerlendirme** - Her gün AI check-in
- ✅ **Haftalık Değerlendirme** - Pazar akşamları haftalık özet
- ✅ **Deadline Uyarıları** - 3 gün ve 1 gün kala hatırlatma
- ✅ **İlerleme Bildirimleri** - Adım tamamlandığında kutlama
- ✅ **Hareketsizlik Uyarıları** - 48 saat aktivite yoksa nazik hatırlatma
- ✅ **Tamamlama Kutlamaları** - Görev bitince coşkulu kutlama 🎉

### 3. ⚙️ Ayarlar Sayfası (Tamamen Yeni!)

**Yeni Endpoints:**
- `GET /api/settings/profile` - Kullanıcı profili
- `PUT /api/settings/profile` - Profil güncelle
- `POST /api/settings/change-password` - Şifre değiştir
- `GET /api/settings/notifications` - Bildirim ayarları
- `PUT /api/settings/notifications` - Bildirim ayarlarını güncelle
- `GET /api/settings/stats` - Kullanıcı istatistikleri
- `DELETE /api/settings/account` - Hesap sil

### 4. 🎯 Daha Açık Hata Mesajları

**Login Hataları (401):**
```json
// Kullanıcı bulunamadı
{
  "error": "Kullanıcı bulunamadı. Email adresinizi kontrol edin.",
  "errorCode": "USER_NOT_FOUND"
}

// Şifre yanlış
{
  "error": "Şifre yanlış. Lütfen tekrar deneyin.",
  "errorCode": "INVALID_PASSWORD"
}
```

---

## 📝 Detaylı API Dokümantasyonu

### 🔐 Authentication Hata Mesajları

#### Login Endpoint
```
POST /api/auth/login
```

**Responses:**

**200 OK - Başarılı**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name"
  },
  "token": "jwt-token"
}
```

**401 Unauthorized - Kullanıcı Yok**
```json
{
  "error": "Kullanıcı bulunamadı. Email adresinizi kontrol edin.",
  "errorCode": "USER_NOT_FOUND"
}
```

**401 Unauthorized - Şifre Yanlış**
```json
{
  "error": "Şifre yanlış. Lütfen tekrar deneyin.",
  "errorCode": "INVALID_PASSWORD"
}
```

**UI için kullanım:**
```javascript
try {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    // Hata mesajını göster
    if (data.errorCode === 'USER_NOT_FOUND') {
      showError('Email adresi bulunamadı');
    } else if (data.errorCode === 'INVALID_PASSWORD') {
      showError('Şifre yanlış');
    } else {
      showError(data.error);
    }
  }
} catch (error) {
  showError('Bağlantı hatası');
}
```

---

### ⚙️ Ayarlar Endpoints

#### 1. Profil Görüntüleme
```
GET /api/settings/profile
Headers: Authorization: Bearer TOKEN
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "User Name",
  "createdAt": "2024-01-01T00:00:00Z",
  "notificationSettings": {
    "dailyCheckIn": true,
    "weeklyReview": true,
    "deadlineAlerts": true,
    "progressAlerts": true,
    "inactivityAlerts": true,
    "completionCelebrations": true,
    "aiNotifications": true
  }
}
```

#### 2. Profil Güncelleme
```
PUT /api/settings/profile
Headers: Authorization: Bearer TOKEN
```

**Request Body:**
```json
{
  "name": "Yeni İsim",
  "email": "yeni@email.com"
}
```

**Response:** Updated user object

#### 3. Şifre Değiştirme
```
POST /api/settings/change-password
Headers: Authorization: Bearer TOKEN
```

**Request Body:**
```json
{
  "currentPassword": "eski-sifre",
  "newPassword": "yeni-sifre-123"
}
```

**Response:**
```json
{
  "message": "Şifre başarıyla değiştirildi"
}
```

**Error (401):**
```json
{
  "error": "Mevcut şifre yanlış",
  "errorCode": "INVALID_CURRENT_PASSWORD"
}
```

#### 4. Bildirim Ayarları
```
GET /api/settings/notifications
Headers: Authorization: Bearer TOKEN
```

**Response:**
```json
{
  "dailyCheckIn": true,
  "weeklyReview": true,
  "deadlineAlerts": true,
  "progressAlerts": true,
  "inactivityAlerts": true,
  "completionCelebrations": true,
  "aiNotifications": true,
  "deviceToken": null
}
```

#### 5. Bildirim Ayarlarını Güncelle
```
PUT /api/settings/notifications
Headers: Authorization: Bearer TOKEN
```

**Request Body:**
```json
{
  "dailyCheckIn": false,
  "weeklyReview": true,
  "deadlineAlerts": true,
  "progressAlerts": false,
  "inactivityAlerts": true,
  "completionCelebrations": true,
  "aiNotifications": true
}
```

**Response:** Updated settings

#### 6. Kullanıcı İstatistikleri
```
GET /api/settings/stats
Headers: Authorization: Bearer TOKEN
```

**Response:**
```json
{
  "tasks": {
    "total": 15,
    "active": 3,
    "backlog": 8,
    "completed": 4,
    "completedThisWeek": 2,
    "completedThisMonth": 7
  },
  "steps": {
    "total": 45,
    "completed": 28,
    "completionRate": 0.62
  },
  "streak": {
    "current": 5,
    "unit": "days"
  },
  "completionRates": {
    "weekly": 0.66,
    "monthly": 0.46
  }
}
```

#### 7. Hesap Silme
```
DELETE /api/settings/account
Headers: Authorization: Bearer TOKEN
```

**Request Body:**
```json
{
  "password": "kullanici-sifresi",
  "confirmation": "DELETE"
}
```

**Response:**
```json
{
  "message": "Hesap başarıyla silindi"
}
```

---

### 🤖 AI Bildirim Tipleri

#### Türkçe AI Yanıtları

Tüm AI endpoint'leri artık **Türkçe** yanıt veriyor:

**Örnek Günlük Check-in:**
```
Günaydın! 👋

Bugün 3 aktif görevin var ve şu ana kadar harika ilerliyorsun! 
Bu hafta 2 görev tamamladın - süper! 💪

"Portfolio Website" görevinde 2/5 adım tamamlandı. 
Bugün bir adım daha tamamlarsan harika olur!

Motivasyonunu yüksek tut, başarılısın! 🚀
```

**Örnek Deadline Uyarısı:**
```
Merhaba! 📅

"Portfolio Website" görevin için sadece 3 gün kaldı! 
Şu an 2/5 adım tamamlandı.

Son spurt için önerim:
- Bugün: "Build home page" adımını tamamla
- Yarın: "Add projects section" üzerinde çalış
- Son gün: Deploy!

Sen yaparsın! 💪
```

**Örnek Hareketsizlik Uyarısı:**
```
Selam! 😊

"Portfolio Website" görevini 2 gündür görmedik. 
Her şey yolunda mı?

Küçük bir adım atmak ister misin? 
Sadece 10 dakika ayırsan bile ilerleme kaydedersin!

Seni destekliyoruz! 🌟
```

**Örnek Tamamlama Kutlaması:**
```
TEBRIKLER! 🎉🎉🎉

"Portfolio Website" görevini tamamladın! 
Harika bir başarı! 

5 adımın hepsini bitirdin ve hedefe ulaştın! 
Bu azim ve kararlılığınla başaramayacağın hiçbir şey yok!

Sıradaki görevine hazır mısın? 🚀
```

---

## 🎨 UI Tasarım Önerileri

### Ayarlar Sayfası Layout

```
┌─────────────────────────────────────┐
│  ⚙️  Ayarlar                        │
├─────────────────────────────────────┤
│                                     │
│  👤 Profil                          │
│  ├─ Ad: [Text Input]                │
│  ├─ Email: [Text Input]             │
│  └─ [Kaydet] butonu                 │
│                                     │
│  🔒 Güvenlik                        │
│  ├─ Mevcut Şifre: [Password Input] │
│  ├─ Yeni Şifre: [Password Input]   │
│  └─ [Şifre Değiştir] butonu        │
│                                     │
│  🔔 Bildirimler                     │
│  ├─ [✓] Günlük değerlendirme       │
│  ├─ [✓] Haftalık özet              │
│  ├─ [✓] Deadline uyarıları         │
│  ├─ [ ] İlerleme bildirimleri      │
│  ├─ [✓] Hareketsizlik hatırlatma   │
│  ├─ [✓] Tamamlama kutlamaları      │
│  └─ [✓] AI bildirimleri            │
│                                     │
│  📊 İstatistikler                   │
│  ├─ Toplam Görev: 15               │
│  ├─ Tamamlanan: 4                  │
│  ├─ Aktif: 3                       │
│  ├─ Streak: 5 gün 🔥               │
│  ├─ Bu hafta: 2 tamamlandı         │
│  └─ Tamamlama oranı: %66           │
│                                     │
│  🗑️ Hesap                           │
│  └─ [Hesabı Sil] butonu (kırmızı)  │
│                                     │
└─────────────────────────────────────┘
```

### Login Sayfası Error Handling

```javascript
// Error display component
function LoginForm() {
  const [error, setError] = useState(null);
  
  const handleLogin = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Success
        saveToken(data.token);
        navigate('/dashboard');
      } else {
        // Show specific error
        setError(data.error);
      }
    } catch (err) {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.');
    }
  };
  
  return (
    <form>
      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}
      <input type="email" placeholder="Email" />
      <input type="password" placeholder="Şifre" />
      <button onClick={handleLogin}>Giriş Yap</button>
    </form>
  );
}
```

### AI Mesaj Gösterimi

```javascript
// AI Message Component
function AIMessage({ message, type, timestamp }) {
  const getIcon = (type) => {
    switch(type) {
      case 'CHECK_IN': return '👋';
      case 'WEEKLY_REVIEW': return '📊';
      case 'DEADLINE_ALERT': return '⏰';
      case 'INACTIVITY_ALERT': return '😴';
      case 'PROGRESS_UPDATE': return '📈';
      case 'COMPLETION_CELEBRATION': return '🎉';
      case 'MOTIVATION': return '💪';
      case 'ANALYSIS': return '🔍';
      default: return '🤖';
    }
  };
  
  return (
    <div className="ai-message">
      <div className="message-header">
        <span className="icon">{getIcon(type)}</span>
        <span className="timestamp">{formatDate(timestamp)}</span>
      </div>
      <div className="message-content">
        {message}
      </div>
    </div>
  );
}
```

### Bildirim Ayarları Toggle

```javascript
// Notification Settings Component
function NotificationSettings() {
  const [settings, setSettings] = useState({});
  
  useEffect(() => {
    // Fetch settings
    fetch('/api/settings/notifications', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(res => res.json())
    .then(data => setSettings(data));
  }, []);
  
  const handleToggle = async (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    
    // Update on server
    await fetch('/api/settings/notifications', {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newSettings)
    });
  };
  
  return (
    <div className="notification-settings">
      <Toggle 
        label="Günlük değerlendirme" 
        checked={settings.dailyCheckIn}
        onChange={() => handleToggle('dailyCheckIn')}
      />
      <Toggle 
        label="Haftalık özet" 
        checked={settings.weeklyReview}
        onChange={() => handleToggle('weeklyReview')}
      />
      <Toggle 
        label="Deadline uyarıları" 
        checked={settings.deadlineAlerts}
        onChange={() => handleToggle('deadlineAlerts')}
      />
      {/* ... diğer toggles */}
    </div>
  );
}
```

---

## 📊 Yeni TypeScript Types

```typescript
// Notification Settings
interface NotificationSettings {
  dailyCheckIn: boolean;
  weeklyReview: boolean;
  deadlineAlerts: boolean;
  progressAlerts: boolean;
  inactivityAlerts: boolean;
  completionCelebrations: boolean;
  aiNotifications: boolean;
  deviceToken?: string | null;
}

// User Profile
interface UserProfile {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  notificationSettings: NotificationSettings;
}

// User Statistics
interface UserStats {
  tasks: {
    total: number;
    active: number;
    backlog: number;
    completed: number;
    completedThisWeek: number;
    completedThisMonth: number;
  };
  steps: {
    total: number;
    completed: number;
    completionRate: number;
  };
  streak: {
    current: number;
    unit: 'days';
  };
  completionRates: {
    weekly: number;
    monthly: number;
  };
}

// Error Response
interface ErrorResponse {
  error: string;
  errorCode?: 
    | 'USER_NOT_FOUND' 
    | 'INVALID_PASSWORD'
    | 'INVALID_CURRENT_PASSWORD'
    | 'EMAIL_IN_USE';
}

// AI Interaction Types
type AIInteractionType = 
  | 'CHECK_IN' 
  | 'MOTIVATION' 
  | 'ANALYSIS'
  | 'DAILY_REVIEW'
  | 'WEEKLY_REVIEW'
  | 'DEADLINE_ALERT'
  | 'INACTIVITY_ALERT'
  | 'PROGRESS_UPDATE'
  | 'COMPLETION_CELEBRATION';
```

---

## 🎯 Implement Edilmesi Gerekenler

### Yüksek Öncelik
- [ ] Login sayfasında hata mesajlarını göster
- [ ] Ayarlar sayfası oluştur (profil, şifre, bildirimler)
- [ ] Kullanıcı istatistikleri dashboard widget'ı
- [ ] AI mesajlarını Türkçe göster

### Orta Öncelik
- [ ] Bildirim ayarları toggle'ları
- [ ] Şifre değiştirme formu
- [ ] Hesap silme onay modal'ı
- [ ] Streak göstergesi (🔥 5 gün)

### Düşük Öncelik
- [ ] Email değiştirme doğrulama sistemi
- [ ] Profil fotoğrafı upload
- [ ] Export data özelliği
- [ ] Dark mode toggle

---

## 🐛 Bilinen Değişiklikler

### Breaking Changes
Yok - Tüm eski endpoint'ler çalışmaya devam ediyor.

### Yeni Error Codes
- `USER_NOT_FOUND` - Email bulunamadı
- `INVALID_PASSWORD` - Şifre yanlış
- `INVALID_CURRENT_PASSWORD` - Mevcut şifre yanlış (şifre değiştirirken)
- `EMAIL_IN_USE` - Email zaten kullanımda

---

## 📞 Sorular?

Herhangi bir soru veya sorun için:
- GitHub Issues: https://github.com/egeaydin1/future/issues
- API Documentation: `API_DOCUMENTATION.md`
- Frontend Guide: `FRONTEND_GUIDE.md`

---

**Backend URL:** https://your-app.railway.app

**Last Updated:** 9 Kasım 2024

**Version:** 2.0.0

---

İyi çalışmalar! 🚀

