package com.flowpulse.mobile

import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody

@Serializable
data class MobileSyncRequest(
    val source: String = "google_health_connect",
    val consent: Boolean,
    val summaries: List<DailyActivitySummaryPayloadSerializable>
)

@Serializable
data class DailyActivitySummaryPayloadSerializable(
    val date: String,
    val step_count: Int,
    val active_minutes: Int,
    val activity_sessions: Int
)

class FlowPulseSyncApi(
    private val baseUrl: String,
    private val httpClient: OkHttpClient = OkHttpClient(),
    private val json: Json = Json { ignoreUnknownKeys = true }
) {

    fun syncDailySummaries(firebaseIdToken: String, consentGranted: Boolean, summaries: List<DailyActivitySummaryPayload>): Boolean {
        if (!consentGranted) {
            return false
        }

        val requestBody = MobileSyncRequest(
            consent = true,
            summaries = summaries.map {
                DailyActivitySummaryPayloadSerializable(
                    date = it.date,
                    step_count = it.step_count,
                    active_minutes = it.active_minutes,
                    activity_sessions = it.activity_sessions
                )
            }
        )

        val payload = json.encodeToString(requestBody)
        val request = Request.Builder()
            .url("$baseUrl/ingestMobileHealthConnectData")
            .post(payload.toRequestBody("application/json".toMediaType()))
            .addHeader("Authorization", "Bearer $firebaseIdToken")
            .build()

        httpClient.newCall(request).execute().use { response ->
            return response.isSuccessful
        }
    }
}
