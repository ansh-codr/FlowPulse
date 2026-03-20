# FlowPulse Health Connect Bridge (Android)

This module shows how to sync minimal daily activity data from Google Health Connect to FlowPulse.

## Data collected (only)
- `step_count`
- `active_minutes`
- `activity_sessions`

No additional health metrics are requested or transmitted.

## Required dependencies
- `androidx.health.connect:connect-client`
- `com.squareup.okhttp3:okhttp`
- `org.jetbrains.kotlinx:kotlinx-serialization-json`

## Required permission records
- `StepsRecord`
- `ExerciseSessionRecord`

## Request payload
`POST /ingestMobileHealthConnectData`

```json
{
  "source": "google_health_connect",
  "consent": true,
  "summaries": [
    {
      "date": "2026-03-20",
      "step_count": 7421,
      "active_minutes": 38,
      "activity_sessions": 3
    }
  ]
}
```

## Authentication
Use Firebase Authentication ID token in the `Authorization` header:
`Authorization: Bearer <firebase_id_token>`

## Security notes
- Always require explicit in-app consent before requesting Health Connect permissions.
- Never upload raw health records, location traces, or heart/biometric data.
- Sync over HTTPS only.
