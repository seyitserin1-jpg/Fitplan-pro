# FitPlan Pro V19 — Android Premium

## GitHub Pages
Yalnızca `web/` klasörünün içindeki dosyaları GitHub Pages kök dizinine yükleyin.

## Android
`android/` klasörü gerçek Android proje iskeletidir. Android Studio ile açılır ve APK/AAB olarak derlenir.

Önemli:
- Health Connect gerçek sağlık verileri için kullanıcı izinleri gerekir.
- Android 13+ bildirim izni gerekir.
- GitHub Pages tek başına uygulama tamamen kapalıyken Health Connect/sensör erişimini garanti edemez.
- Arka plan senkronu WorkManager, zamanlanmış hatırlatıcı AlarmManager ve bildirim kanalı üzerinden native Android katmanında yapılır.
