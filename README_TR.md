# FitPlan Pro Unique v4

Bu paket, iPhone'da GitHub Pages üzerinden PWA olarak çalışabilecek daha gelişmiş bir sürümdür.

## V4'te gelenler
- Mobil uygulama görünümü ve PWA kurulumu
- Offline cache (service worker)
- Profil / hedef / BMR / TDEE / yaklaşık kalori / protein hesabı
- Günlük uyum skoru
- Öğün tamamlama ve kalori/protein toplamı
- Gıda arama: Open Food Facts internet verisi
- Barkod ile ürün sorgulama
- Gıdayı günlük kayda ekleme
- Fotoğraf analiz ekranı ve güvenli backend bağlantı noktası
- AI Koç: yerel cevaplar + isteğe bağlı gerçek AI backend
- Günlük program
- Veri cihazda localStorage
- API anahtarlarını frontend'e koymayan backend şablonu

## iPhone'da çalıştırma
1. Bu klasördeki dosyaları GitHub repository köküne yükle.
2. GitHub Pages -> Deploy from a branch -> main -> /(root) -> Save.
3. Yayınlanan siteyi iPhone Safari'de aç.
4. Paylaş -> Ana Ekrana Ekle.

## Gerçek AI'ı açmak
GitHub Pages statik frontend'dir. API anahtarını `app.js` içine koyma.

1. `backend` klasörünü bir Node.js sunucusuna deploy et.
2. `.env.example` dosyasını `.env` olarak ayarla.
3. `AI_API_URL`, `AI_API_KEY`, `AI_MODEL` değişkenlerini sunucuda tanımla.
4. `config.js` içindeki `backendUrl` alanına backend adresini yaz.
5. Frontend'i tekrar GitHub'a yükle.

Backend şu uçları sağlar:
- `GET /health`
- `POST /api/coach`
- `POST /api/analyze-image`

## Besin internet verisi
V4, gıda araması ve barkod için Open Food Facts web API'sini kullanır. Sonuçlar ürün veri tabanının kapsamına bağlıdır; değerler ürün etiketindeki gerçek değerlerle kontrol edilmelidir.

## Önemli sağlık notu
Bu uygulamadaki enerji, BMI, protein ve porsiyon hesapları genel tahminlerdir. Hastalık, ilaç kullanımı, gebelik, yeme bozukluğu öyküsü veya başka özel durumlarda kişisel beslenme planı için sağlık profesyoneline danışılmalıdır.
