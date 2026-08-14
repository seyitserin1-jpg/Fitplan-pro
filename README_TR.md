# FitPlan Pro V18 · Android Premium

V18 iki parçalıdır:

1. `web/` → GitHub Pages için premium yatay PWA arayüzü.
2. `android/` → gerçek Android uygulaması; Health Connect, arka plan senkronu ve native bildirim/hatırlatıcı köprüsü.

## Önemli
GitHub Pages tek başına uygulama kapalıyken telefonun adım sensörüne sürekli erişemez. Gerçek kapalı-uygulama sağlık takibi için Android projesini APK/AAB olarak derleyip telefona kurmak gerekir. Android'in Health Connect sistemi arka planda okuma için ayrı izin destekler ve WorkManager ile periyodik senkron önerilir.

## Android V18
- Health Connect adım okuma
- Arka plan sağlık senkronu için WorkManager
- Android 13+ POST_NOTIFICATIONS izin akışı
- Su/öğün/hareket hatırlatıcıları için AlarmManager
- Yeniden başlatmada planları tekrar kuran BootReceiver
- Web arayüzü ile native JS bridge
- Yatay sayfa geçişi
- Sabit sağlık başlığı
- Premium diyet koçu

### Kurulum
Android Studio'da `android/` klasörünü aç → Gradle senkronizasyonunu tamamla → Run ile Android telefona yükle.

İlk açılışta Bildirim ve Health Connect izinlerini ver. Health Connect Android 14+ cihazlarda sistemin parçasıdır; Android 13 ve altında ayrıca Health Connect uygulaması gerekebilir.
