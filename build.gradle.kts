plugins { id("com.android.application"); id("org.jetbrains.kotlin.android") }

android { namespace = "com.fitplan.pro"; compileSdk = 35
    defaultConfig { applicationId = "com.fitplan.pro"; minSdk = 26; targetSdk = 35; versionCode = 17; versionName = "17.0" }
}

dependencies {
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("androidx.activity:activity-ktx:1.10.1")
    implementation("androidx.work:work-runtime-ktx:2.10.0")
    implementation("androidx.health.connect:connect-client:1.1.0")
}
