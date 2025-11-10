# ⚙️ Ayarlar Sayfası - Tüm Fonksiyonlar

## 📋 Mevcut Endpoint'ler

### 1. 👤 Profil Yönetimi

#### Profil Görüntüle
```
GET /api/settings/profile
Authorization: Bearer TOKEN
```
**Ne yapar:** Kullanıcı profil bilgilerini getirir (ad, email, bildirim ayarları)

#### Profil Güncelle
```
PUT /api/settings/profile
Authorization: Bearer TOKEN
Body: { "name": "Yeni İsim", "email": "yeni@email.com" }
```
**Ne yapar:** Kullanıcı adını ve/veya email'ini günceller

---

### 2. 🔒 Güvenlik

#### Şifre Değiştir
```
POST /api/settings/change-password
Authorization: Bearer TOKEN
Body: {
  "currentPassword": "eski-sifre",
  "newPassword": "yeni-sifre-123"
}
```
**Ne yapar:** Mevcut şifreyi doğrular, yeni şifre belirler

---

### 3. 🔔 Bildirim Ayarları

#### Bildirim Ayarlarını Görüntüle
```
GET /api/settings/notifications
Authorization: Bearer TOKEN
```
**Dönen ayarlar:**
- `dailyCheckIn` - Günlük değerlendirme (09:00)
- `weeklyReview` - Haftalık özet (Pazar 20:00)
- `deadlineAlerts` - Deadline uyarıları (3 gün & 1 gün kala)
- `progressAlerts` - İlerleme bildirimleri (adım tamamlanınca)
- `inactivityAlerts` - Hareketsizlik uyarıları (48 saat sonra)
- `completionCelebrations` - Tamamlama kutlamaları
- `aiNotifications` - Tüm AI bildirimleri (master switch)
- `deviceToken` - Push notification için cihaz token'ı

#### Bildirim Ayarlarını Güncelle
```
PUT /api/settings/notifications
Authorization: Bearer TOKEN
Body: {
  "dailyCheckIn": true,
  "weeklyReview": false,
  "deadlineAlerts": true,
  "progressAlerts": true,
  "inactivityAlerts": true,
  "completionCelebrations": true,
  "aiNotifications": true,
  "deviceToken": "push-token-buraya"
}
```
**Ne yapar:** Kullanıcının bildirim tercihlerini günceller

---

### 4. 📊 İstatistikler

#### Kullanıcı İstatistikleri
```
GET /api/settings/stats
Authorization: Bearer TOKEN
```
**Dönen veriler:**
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

---

### 5. 🗑️ Hesap Yönetimi

#### Hesap Sil
```
DELETE /api/settings/account
Authorization: Bearer TOKEN
Body: {
  "password": "kullanici-sifresi",
  "confirmation": "DELETE"
}
```
**Ne yapar:** Kullanıcı hesabını ve tüm verilerini kalıcı olarak siler

---

## 🎨 UI Bileşenleri

### Profil Bölümü
- Ad değiştir input
- Email değiştir input
- Kaydet butonu

### Güvenlik Bölümü
- Mevcut şifre input
- Yeni şifre input
- Şifre değiştir butonu

### Bildirim Tercihleri
- 7 adet toggle switch
- Her biri açık/kapalı ayarlanabilir

### İstatistikler Dashboard
- Görev sayıları (total, active, backlog, completed)
- Bu hafta/ay tamamlanan
- Streak göstergesi 🔥
- Tamamlama oranları

### Tehlikeli Alan
- Hesap sil butonu (kırmızı, onay gerektirir)

---

## 🔄 Veri Akışı

1. Sayfa yüklenince → `GET /api/settings/profile` → Profil bilgileri göster
2. Toggle değişince → `PUT /api/settings/notifications` → Ayarı kaydet
3. İstatistik widget → `GET /api/settings/stats` → Grafikleri göster
4. Şifre değiştir → `POST /api/settings/change-password` → Başarı mesajı

---

## ✅ İmplement Edilmesi Gerekenler

- [ ] Ayarlar sayfası route'u oluştur
- [ ] Profil form componenti
- [ ] Şifre değiştir form componenti
- [ ] Bildirim toggle'ları (7 adet)
- [ ] İstatistik kartları
- [ ] Hesap sil onay modal'ı

