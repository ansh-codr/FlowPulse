package com.flowpulse.mobile

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import androidx.health.connect.client.HealthConnectClient

/**
 * Periodic worker that syncs privacy-safe daily activity summaries to FlowPulse.
 */
class MobileActivitySyncWorker(
    context: Context,
    workerParams: WorkerParameters,
    private val tokenProvider: suspend () -> String,
    private val consentProvider: suspend () -> Boolean,
    private val api: FlowPulseSyncApi
) : CoroutineWorker(context, workerParams) {

    override suspend fun doWork(): Result {
        val consentGranted = consentProvider()
        if (!consentGranted) {
            return Result.success()
        }

        val token = tokenProvider()
        if (token.isBlank()) {
            return Result.retry()
        }

        val healthClient = HealthConnectClient.getOrCreate(applicationContext)
        val summaryService = HealthConnectSummaryService(healthClient)
        val summaries = summaryService.fetchRecentSummaries(days = 1)

        val ok = api.syncDailySummaries(
            firebaseIdToken = token,
            consentGranted = true,
            summaries = summaries
        )

        return if (ok) Result.success() else Result.retry()
    }
}
