package com.flowpulse.mobile

import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.records.ExerciseSessionRecord
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import java.time.LocalDate
import java.time.ZoneOffset

data class DailyActivitySummaryPayload(
    val date: String,
    val step_count: Int,
    val active_minutes: Int,
    val activity_sessions: Int
)

class HealthConnectSummaryService(private val healthConnectClient: HealthConnectClient) {

    suspend fun fetchDailySummary(date: LocalDate): DailyActivitySummaryPayload {
        val start = date.atStartOfDay().toInstant(ZoneOffset.UTC)
        val end = date.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC)
        val range = TimeRangeFilter.between(start, end)

        val stepsResponse = healthConnectClient.readRecords(
            ReadRecordsRequest(
                recordType = StepsRecord::class,
                timeRangeFilter = range
            )
        )

        val sessionsResponse = healthConnectClient.readRecords(
            ReadRecordsRequest(
                recordType = ExerciseSessionRecord::class,
                timeRangeFilter = range
            )
        )

        val steps = stepsResponse.records.sumOf { record ->
            record.count.toLong()
        }.toInt().coerceAtLeast(0)

        val activeMinutes = sessionsResponse.records.sumOf { session ->
            val startTime = session.startTime
            val endTime = session.endTime
            val durationMinutes = java.time.Duration.between(startTime, endTime).toMinutes()
            durationMinutes.coerceAtLeast(0)
        }.toInt().coerceAtLeast(0)

        val sessionCount = sessionsResponse.records.count { session ->
            val durationMinutes = java.time.Duration.between(session.startTime, session.endTime).toMinutes()
            durationMinutes > 0
        }

        return DailyActivitySummaryPayload(
            date = date.toString(),
            step_count = steps,
            active_minutes = activeMinutes,
            activity_sessions = sessionCount
        )
    }

    suspend fun fetchRecentSummaries(days: Int, todayUtc: LocalDate = LocalDate.now(ZoneOffset.UTC)): List<DailyActivitySummaryPayload> {
        val safeDays = days.coerceIn(1, 31)
        return (0 until safeDays).map { offset ->
            val targetDate = todayUtc.minusDays(offset.toLong())
            fetchDailySummary(targetDate)
        }
    }
}
