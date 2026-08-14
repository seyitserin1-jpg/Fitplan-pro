# FitPlan Pro V17 Premium — Android Edition

Bu sürüm Android odaklıdır.

## Web/PWA
- Yatay sayfa mimarisi korunur.
- Service Worker + Web Push altyapısı hazırdır.
- Android Chrome'da PWA olarak kurulabilir.
- Bildirim butonu Android izin akışına göre çalışır.

## Gerçek arka plan sağlık
GitHub Pages tek başına Android'in kapalı uygulama halinde adım/sağlık sensörü verisini güvenilir biçimde okuyamaz. Bu nedenle `android/` klasöründe native Android katmanı bulunur.

Native katman:
- Health Connect üzerinden adım verisi okur.
- WorkManager ile periyodik senkron yapar.
- Android bildirim kanalları oluşturur.
- Uygulama kapalıyken de hatırlatıcıların çalışmasına uygun altyapı sağlar.
- Web arayüzünü WebView içinde açar ve native sağlık verisini JavaScript'e aktarır.

## Kurulum
1. `web/` klasöründeki dosyaları GitHub Pages deposuna yükleyin.
2. Android Studio ile `android/` klasörünü açın.
3. Gradle senkronizasyonunu tamamlayın.
4. Android cihazda Health Connect izinlerini verin.
5. Bildirim iznini verin.
6. Uygulama içindeki FitPlan Pro ekranından hedefleri ayarlayın.

Not: Gerçek uzaktan push bildirimleri için ayrıca FCM/Web Push sunucu kimlik bilgileri gerekir. Bu proje gizli anahtarları kaynak koda gömmez.

## Önemli
Android tarafında Health Connect, kullanıcı izni verildikten sonra cihazın adım verilerini arka planda sağlayabilir; Android 14+ cihazlarda Health Connect'in cihaz içi adım sayımı düşük güç tüketimli `TYPE_STEP_COUNTER` sensörünü kullanır. Arka plan okuma için ayrıca Health Connect arka plan okuma izni gerekir. Bu izinler kullanıcı kontrolündedir.  
