package com.fitplan.pro

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.webkit.JavascriptInterface
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts
import androidx.lifecycle.lifecycleScope
import androidx.core.content.ContextCompat
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.PermissionController
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.util.concurrent.TimeUnit

class MainActivity : ComponentActivity() {
    private lateinit var web: WebView
    private val healthPermissions = setOf(HealthPermission.getReadPermission(StepsRecord::class))
    private val notificationPermission = registerForActivityResult(ActivityResultContracts.RequestPermission()) {}
    private val healthPermissionLauncher = registerForActivityResult(HealthConnectClient.createRequestPermissionResultContract()) { loadSteps() }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        web = WebView(this)
        web.settings.javaScriptEnabled = true
        web.settings.domStorageEnabled = true
        web.settings.cacheMode = WebSettings.LOAD_DEFAULT
        web.webViewClient = WebViewClient()
        web.addJavascriptInterface(Bridge(), "FitPlanNative")
        setContentView(web)
        web.loadUrl("https://seyitserin1-jpg.github.io/")
        requestNotifications()
        scheduleSync()
    }

    private fun requestNotifications() {
        if (android.os.Build.VERSION.SDK_INT >= 33 && ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED)
            notificationPermission.launch(Manifest.permission.POST_NOTIFICATIONS)
    }

    private fun scheduleSync() {
        val req = PeriodicWorkRequestBuilder<HealthSyncWorker>(15, TimeUnit.MINUTES).build()
        WorkManager.getInstance(this).enqueueUniquePeriodicWork("fitplan-health-sync", ExistingPeriodicWorkPolicy.UPDATE, req)
    }

    private fun loadSteps() {
        val client = HealthConnectClient.getOrCreate(this)
        lifecycleScope.launchWhenStarted {
            try {
                val granted = client.permissionController.getGrantedPermissions()
                if (!granted.containsAll(healthPermissions)) return@launchWhenStarted
                val start = LocalDate.now().atStartOfDay(ZoneId.systemDefault()).toInstant()
                val end = Instant.now()
                val result = client.readRecords(ReadRecordsRequest(StepsRecord::class, TimeRangeFilter.between(start, end)))
                val total = result.records.sumOf { it.count }
                web.evaluateJavascript("window.__fitplanNativeSteps && window.__fitplanNativeSteps($total)", null)
            } catch (_: Exception) { }
        }
    }

    inner class Bridge {
        @JavascriptInterface fun requestHealthAccess() {
            runOnUiThread { healthPermissionLauncher.launch(healthPermissions) }
        }
        @JavascriptInterface fun requestNotifications() { runOnUiThread { requestNotifications() } }
        @JavascriptInterface fun syncNow() { runOnUiThread { loadSteps() } }
    }
}
