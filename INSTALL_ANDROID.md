# V18 Android kurulum

## Gerçek otomatik mod için
GitHub Pages'e sadece `web/` klasörünü atmak V18 tasarımını günceller ama uygulama kapalıyken sağlık sensörü erişimi sağlamaz.

Gerçek arka plan özellikleri için `android/` klasörünü Android Studio ile açıp telefona kur.

### İlk açılış
1. Bildirim iznini **İzin ver**.
2. Health Connect ekranında **Adımlar** ve **Arka planda sağlık verisi okuma** izinlerini ver.
3. Hatırlatıcılar için uygulamanın oluşturduğu bildirim kanalını açık bırak.
4. Android pil ayarlarında FitPlan Pro'yu "kısıtlanmamış" yapman bazı üreticilerde arka plan güvenilirliğini artırabilir.

### GitHub Pages
`web/` içindeki dosyaların tamamını repo köküne kopyala. Önceki `index.html`, `app.js`, `style.css`, `manifest.json`, `sw.js` dosyalarının tamamını V18 ile değiştir.
