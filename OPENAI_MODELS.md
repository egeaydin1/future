# 🤖 OpenAI Model Seçimi

Goal Tracker Pro, OpenAI API ile çalışmak üzere yapılandırılmıştır. İhtiyacınıza göre farklı modeller kullanabilirsiniz.

## 📊 Desteklenen Modeller

### 1. GPT-4 Turbo (Önerilen) ⭐
```env
OPENAI_MODEL=gpt-4-turbo-preview
```

**Özellikler:**
- ✅ En gelişmiş model
- ✅ 128K context window
- ✅ En iyi doğruluk ve anlama
- ✅ Kompleks görevler için ideal
- ❌ Daha yavaş
- ❌ Daha pahalı ($0.01/1K tokens input, $0.03/1K tokens output)

**Ne zaman kullanmalı:**
- Production için en iyisi
- Kaliteli motivasyon mesajları
- Detaylı analiz gerekiyorsa

---

### 2. GPT-4 (Stable)
```env
OPENAI_MODEL=gpt-4
```

**Özellikler:**
- ✅ Çok güvenilir
- ✅ İyi performans
- ✅ 8K context window
- ❌ Turbo'dan daha pahalı

---

### 3. GPT-3.5 Turbo (Ekonomik) 💰
```env
OPENAI_MODEL=gpt-3.5-turbo
```

**Özellikler:**
- ✅ Çok hızlı
- ✅ Çok ucuz ($0.0005/1K tokens input, $0.0015/1K tokens output)
- ✅ 16K context window
- ⚠️ GPT-4'ten daha az yetenekli
- ⚠️ Bazen daha genel cevaplar

**Ne zaman kullanmalı:**
- Development/testing için
- Budget kısıtlı ise
- Basit motivasyon mesajları yeterli

---

### 4. GPT-3.5 Turbo 16K
```env
OPENAI_MODEL=gpt-3.5-turbo-16k
```

Daha uzun context için GPT-3.5 versiyonu.

---

## 💰 Maliyet Karşılaştırması

### Örnek: 100 AI check-in/gün

| Model | Input | Output | Günlük Maliyet | Aylık Maliyet |
|-------|-------|--------|----------------|---------------|
| GPT-4 Turbo | 500 tokens | 200 tokens | ~$0.11 | ~$3.30 |
| GPT-3.5 Turbo | 500 tokens | 200 tokens | ~$0.01 | ~$0.30 |

**Not:** Gerçek maliyetler kullanıma göre değişir.

---

## ⚙️ Model Değiştirme

### Railway'de:
1. Variables → `OPENAI_MODEL` bulun
2. Değeri değiştirin (örn: `gpt-3.5-turbo`)
3. Service otomatik restart olur

### Local'de:
`.env` dosyasında:
```env
OPENAI_MODEL=gpt-3.5-turbo
```

Restart:
```bash
npm run dev
```

---

## 🎯 Önerilerimiz

### Production
```env
OPENAI_MODEL=gpt-4-turbo-preview
```
En iyi kullanıcı deneyimi için.

### Development/Testing
```env
OPENAI_MODEL=gpt-3.5-turbo
```
Hızlı iterasyon ve düşük maliyet.

### Budget-Conscious Production
```env
OPENAI_MODEL=gpt-3.5-turbo
```
Çoğu kullanım senaryosu için yeterli.

---

## 🔧 Advanced: Model Parameters

`src/services/aiService.js` içinde daha fazla kontrol:

```javascript
const completion = await openai.chat.completions.create({
  model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
  max_tokens: 1024,           // Maksimum response uzunluğu
  temperature: 0.7,           // Yaratıcılık (0-2, düşük = tutarlı)
  top_p: 1,                   // Nucleus sampling
  frequency_penalty: 0,       // Tekrar eden kelimeler
  presence_penalty: 0,        // Yeni topic'ler
  messages: [...]
});
```

### Temperature Ayarı

```javascript
temperature: 0.3  // Daha tutarlı, öngörülebilir
temperature: 0.7  // Dengeli (default)
temperature: 1.2  // Daha yaratıcı, çeşitli
```

---

## 📊 Model Performans İstatistikleri

### Response Süreleri (ortalama)

| Model | Check-in | Analysis | Motivation |
|-------|----------|----------|------------|
| GPT-4 Turbo | ~2-3s | ~3-5s | ~2-3s |
| GPT-3.5 Turbo | ~1-2s | ~2-3s | ~1-2s |

---

## 🆕 Yeni Modeller

OpenAI sürekli yeni modeller yayınlıyor:

- `gpt-4-turbo` (latest)
- `gpt-4-turbo-2024-04-09` (specific version)
- `gpt-4o` (gelecek model)

Güncel liste: [platform.openai.com/docs/models](https://platform.openai.com/docs/models)

---

## 🔍 Test Etme

Model değiştirdikten sonra test edin:

```bash
curl -X POST https://your-app.railway.app/api/ai/check-in \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response kalitesini ve süresini karşılaştırın.

---

## ⚠️ Limitler

### Rate Limits (Tier 1)

| Model | RPM | TPM |
|-------|-----|-----|
| GPT-4 | 500 | 10,000 |
| GPT-3.5 | 3,500 | 60,000 |

RPM = Requests Per Minute
TPM = Tokens Per Minute

Daha yüksek limitler için: [platform.openai.com/settings/organization/billing](https://platform.openai.com/settings/organization/billing)

---

## 🎓 Best Practices

1. **Development:** GPT-3.5 kullan
2. **Production:** GPT-4 Turbo ile başla
3. **Monitor:** Maliyetleri takip et
4. **Optimize:** Gerekirse downgrade et
5. **Cache:** Sık kullanılan responses'ları cache'le (gelecek özellik)

---

**Varsayılan:** `gpt-4-turbo-preview` (en iyi kalite)

İhtiyacınıza göre değiştirin! 🚀

