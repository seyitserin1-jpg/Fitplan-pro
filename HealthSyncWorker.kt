package com.fitplan.pro

import android.content.Context
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId

class HealthSyncWorker(appContext: Context, params: WorkerParameters) : CoroutineWorker(appContext, params) {
    override suspend fun doWork(): Result {
        return try {
            val client = HealthConnectClient.getOrCreate(applicationContext)
            val start = LocalDate.now().atStartOfDay(ZoneId.systemDefault()).toInstant()
            val result = client.readRecords(ReadRecordsRequest(StepsRecord::class, TimeRangeFilter.between(start, Instant.now())))
            val total = result.records.sumOf { it.count }
            applicationContext.getSharedPreferences("fitplan", Context.MODE_PRIVATE).edit().putLong("steps", total).apply()
            Result.success()
        } catch (_: Exception) { Result.retry() }
    }
}
