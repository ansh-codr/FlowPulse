"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectGoogleActivity = exports.getGoogleActivityConnectionStatus = exports.getMobileActivitySummaries = exports.syncGoogleActivityData = exports.googleActivityOAuthCallback = exports.connectGoogleActivity = exports.scheduledMobileActivitySync = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
if (!admin.apps.length)
    admin.initializeApp();
const db = admin.firestore();
const GOOGLE_FIT_SCOPE = "https://www.googleapis.com/auth/fitness.activity.read";
const GOOGLE_AUTH_BASE = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_FIT_AGGREGATE_URL = "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate";
const GOOGLE_FIT_SESSIONS_URL = "https://www.googleapis.com/fitness/v1/users/me/sessions";
function getOAuthConfig() {
    const cfg = functions.config();
    const clientId = cfg?.googlefit?.client_id;
    const clientSecret = cfg?.googlefit?.client_secret;
    const redirectUri = cfg?.googlefit?.redirect_uri;
    if (!clientId || !clientSecret || !redirectUri) {
        throw new functions.https.HttpsError("failed-precondition", "Google Fit OAuth is not configured. Set functions config: googlefit.client_id, googlefit.client_secret, googlefit.redirect_uri");
    }
    return { clientId, clientSecret, redirectUri };
}
function integrationRef(uid) {
    return db.doc(`users/${uid}/integrations/google_activity`);
}
async function updateSyncStatus(uid, result, errorMessage) {
    await integrationRef(uid).set({
        lastSyncAt: admin.firestore.FieldValue.serverTimestamp(),
        lastSyncResult: result,
        lastError: result === "failed" ? (errorMessage ?? "Unknown synchronization error") : admin.firestore.FieldValue.delete(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
}
function mobileSummaryRef(uid, dateStr) {
    return db.doc(`users/${uid}/mobile_activity_summary/${dateStr}`);
}
function toDateStr(d) {
    return d.toISOString().slice(0, 10);
}
function dayBoundsMillis(dateStr) {
    const start = new Date(`${dateStr}T00:00:00.000Z`).getTime();
    const end = new Date(`${dateStr}T23:59:59.999Z`).getTime();
    return {
        startMs: start,
        endMs: end,
        startNs: String(start * 1000000),
        endNs: String(end * 1000000),
    };
}
function buildGoogleAuthUrl(config, state) {
    const params = new URLSearchParams({
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        response_type: "code",
        scope: GOOGLE_FIT_SCOPE,
        access_type: "offline",
        include_granted_scopes: "true",
        prompt: "consent",
        state,
    });
    return `${GOOGLE_AUTH_BASE}?${params.toString()}`;
}
async function exchangeCodeForTokens(code) {
    const config = getOAuthConfig();
    const payload = new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: config.redirectUri,
    });
    const response = await fetch(GOOGLE_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: payload,
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`OAuth token exchange failed: ${text}`);
    }
    return response.json();
}
async function refreshAccessToken(refreshToken) {
    const config = getOAuthConfig();
    const payload = new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
    });
    const response = await fetch(GOOGLE_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: payload,
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`OAuth token refresh failed: ${text}`);
    }
    return response.json();
}
async function ensureAccessToken(uid) {
    const snap = await integrationRef(uid).get();
    if (!snap.exists) {
        throw new functions.https.HttpsError("failed-precondition", "Google activity integration is not connected.");
    }
    const data = snap.data();
    if (!data.connected || !data.refreshToken) {
        throw new functions.https.HttpsError("failed-precondition", "Google activity integration is not connected.");
    }
    const nowMs = Date.now();
    const expiresAtMs = data.accessTokenExpiresAt?.toMillis() ?? 0;
    if (data.accessToken && expiresAtMs > nowMs + 60 * 1000) {
        return data.accessToken;
    }
    const refreshed = await refreshAccessToken(data.refreshToken);
    await integrationRef(uid).set({
        accessToken: refreshed.access_token,
        accessTokenExpiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + refreshed.expires_in * 1000),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    return refreshed.access_token;
}
async function fetchStepCount(accessToken, dateStr) {
    const { startNs, endNs } = dayBoundsMillis(dateStr);
    const response = await fetch(GOOGLE_FIT_AGGREGATE_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            aggregateBy: [{ dataTypeName: "com.google.step_count.delta" }],
            bucketByTime: { durationMillis: 24 * 60 * 60 * 1000 },
            startTimeNanos: startNs,
            endTimeNanos: endNs,
        }),
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Google Fit step fetch failed: ${text}`);
    }
    const payload = (await response.json());
    let steps = 0;
    for (const bucket of payload.bucket ?? []) {
        for (const dataset of bucket.dataset ?? []) {
            for (const point of dataset.point ?? []) {
                for (const value of point.value ?? []) {
                    steps += value.intVal ?? 0;
                }
            }
        }
    }
    return steps;
}
async function fetchSessions(accessToken, dateStr) {
    const { startMs, endMs } = dayBoundsMillis(dateStr);
    const params = new URLSearchParams({
        startTime: String(startMs),
        endTime: String(endMs),
    });
    const response = await fetch(`${GOOGLE_FIT_SESSIONS_URL}?${params.toString()}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Google Fit sessions fetch failed: ${text}`);
    }
    const payload = (await response.json());
    return (payload.session ?? [])
        .map((s) => ({
        startMs: Number(s.startTimeMillis ?? 0),
        endMs: Number(s.endTimeMillis ?? 0),
    }))
        .filter((s) => s.startMs > 0 && s.endMs > s.startMs);
}
async function fetchRawActivityRecords(accessToken, dateStr) {
    const [stepCount, sessions] = await Promise.all([
        fetchStepCount(accessToken, dateStr),
        fetchSessions(accessToken, dateStr),
    ]);
    // Keep a step-point array to preserve a raw-record pipeline before normalization.
    return {
        stepPoints: [stepCount],
        sessions,
    };
}
function normalizeRawRecordsToDailySummary(dateStr, raw) {
    const stepCount = Math.max(0, Math.round(raw.stepPoints.reduce((sum, p) => sum + p, 0)));
    const activeMinutes = Math.max(0, Math.round(raw.sessions.reduce((sum, s) => sum + (s.endMs - s.startMs) / (1000 * 60), 0)));
    return {
        date: dateStr,
        stepCount,
        activeMinutes,
        activitySessions: raw.sessions.length,
    };
}
async function upsertMobileSummary(uid, dateStr, summary) {
    const payload = {
        user_id: uid,
        date: dateStr,
        step_count: Math.max(0, Math.round(summary.step_count)),
        active_minutes: Math.max(0, Math.round(summary.active_minutes)),
        activity_sessions: Math.max(0, Math.round(summary.activity_sessions)),
        created_at: admin.firestore.FieldValue.serverTimestamp(),
    };
    await mobileSummaryRef(uid, dateStr).set(payload, { merge: true });
    // Keep dailyStats correlated so existing analytics can consume mobile data directly.
    await db.doc(`users/${uid}/dailyStats/${dateStr}`).set({
        mobileStepCount: payload.step_count,
        mobileActiveMinutes: payload.active_minutes,
        mobileActivitySessions: payload.activity_sessions,
        updatedAt: new Date().toISOString(),
    }, { merge: true });
}
async function syncDate(uid, dateStr) {
    const accessToken = await ensureAccessToken(uid);
    const rawRecords = await fetchRawActivityRecords(accessToken, dateStr);
    const normalized = normalizeRawRecordsToDailySummary(dateStr, rawRecords);
    await upsertMobileSummary(uid, dateStr, {
        step_count: normalized.stepCount,
        active_minutes: normalized.activeMinutes,
        activity_sessions: normalized.activitySessions,
    });
    return normalized;
}
exports.scheduledMobileActivitySync = functions.pubsub
    .schedule("every 6 hours")
    .timeZone("UTC")
    .onRun(async () => {
    const integrationDocs = await db
        .collectionGroup("integrations")
        .where("connected", "==", true)
        .where("optedIn", "==", true)
        .get();
    let syncedUsers = 0;
    let failedUsers = 0;
    for (const doc of integrationDocs.docs) {
        if (doc.id !== "google_activity")
            continue;
        const uid = doc.ref.path.split("/")[1];
        if (!uid)
            continue;
        try {
            const today = toDateStr(new Date());
            await syncDate(uid, today);
            await updateSyncStatus(uid, "success");
            syncedUsers++;
        }
        catch (error) {
            failedUsers++;
            await updateSyncStatus(uid, "failed", error instanceof Error ? error.message : "Scheduled sync failed");
            functions.logger.error("scheduledMobileActivitySync failed for user", { uid, error });
        }
    }
    functions.logger.info("scheduledMobileActivitySync completed", {
        syncedUsers,
        failedUsers,
        scannedIntegrations: integrationDocs.size,
    });
    return null;
});
exports.connectGoogleActivity = functions.https.onCall(async (data, context) => {
    if (!context.auth?.uid) {
        throw new functions.https.HttpsError("unauthenticated", "Authentication required.");
    }
    if (!data?.optIn) {
        throw new functions.https.HttpsError("failed-precondition", "Explicit opt-in is required before connecting Google activity integration.");
    }
    const uid = context.auth.uid;
    const nonce = Math.random().toString(36).slice(2);
    const state = `${uid}:${nonce}`;
    const authUrl = buildGoogleAuthUrl(getOAuthConfig(), state);
    await integrationRef(uid).set({
        provider: "google_fit",
        connected: false,
        optedIn: true,
        scope: GOOGLE_FIT_SCOPE,
        lastSyncAt: admin.firestore.FieldValue.delete(),
        lastSyncResult: admin.firestore.FieldValue.delete(),
        lastError: admin.firestore.FieldValue.delete(),
        pendingState: state,
        pendingStateExpiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + 10 * 60 * 1000),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    return {
        authUrl,
        scope: GOOGLE_FIT_SCOPE,
        message: "Open authUrl to connect Google activity data. Only activity-recognition data is requested.",
    };
});
exports.googleActivityOAuthCallback = functions.https.onRequest(async (req, res) => {
    try {
        const code = req.query.code;
        const state = req.query.state;
        const oauthError = req.query.error;
        if (oauthError) {
            res.status(400).send(`Google OAuth error: ${oauthError}`);
            return;
        }
        if (!code || !state) {
            res.status(400).send("Missing OAuth code or state.");
            return;
        }
        const uid = state.split(":")[0];
        if (!uid) {
            res.status(400).send("Invalid OAuth state.");
            return;
        }
        const ref = integrationRef(uid);
        const snap = await ref.get();
        if (!snap.exists) {
            res.status(400).send("Integration session not found.");
            return;
        }
        const integration = snap.data();
        const expired = (integration.pendingStateExpiresAt?.toMillis() ?? 0) < Date.now();
        if (!integration.optedIn || integration.pendingState !== state || expired) {
            res.status(400).send("Invalid or expired integration state.");
            return;
        }
        const token = await exchangeCodeForTokens(code);
        await ref.set({
            connected: true,
            scope: token.scope ?? GOOGLE_FIT_SCOPE,
            accessToken: token.access_token,
            accessTokenExpiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + token.expires_in * 1000),
            refreshToken: token.refresh_token,
            connectedAt: admin.firestore.FieldValue.serverTimestamp(),
            pendingState: admin.firestore.FieldValue.delete(),
            pendingStateExpiresAt: admin.firestore.FieldValue.delete(),
            lastSyncAt: admin.firestore.FieldValue.delete(),
            lastSyncResult: admin.firestore.FieldValue.delete(),
            lastError: admin.firestore.FieldValue.delete(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        res.status(200).send("Google activity integration connected successfully. You can return to FlowPulse.");
    }
    catch (error) {
        functions.logger.error("googleActivityOAuthCallback failed", error);
        res.status(500).send("Failed to complete Google activity integration.");
    }
});
exports.syncGoogleActivityData = functions.https.onCall(async (data, context) => {
    if (!context.auth?.uid) {
        throw new functions.https.HttpsError("unauthenticated", "Authentication required.");
    }
    const uid = context.auth.uid;
    const days = Number(data?.days ?? 1);
    const safeDays = Math.min(Math.max(days, 1), 30);
    const baseDate = new Date();
    const synced = [];
    try {
        for (let i = 0; i < safeDays; i++) {
            const d = new Date(baseDate);
            d.setUTCDate(baseDate.getUTCDate() - i);
            const dateStr = toDateStr(d);
            const summary = await syncDate(uid, dateStr);
            synced.push(summary);
        }
        await updateSyncStatus(uid, "success");
    }
    catch (error) {
        await updateSyncStatus(uid, "failed", error instanceof Error ? error.message : "Manual sync failed");
        throw error;
    }
    return {
        syncedDays: synced.length,
        summaries: synced,
    };
});
exports.getMobileActivitySummaries = functions.https.onCall(async (data, context) => {
    if (!context.auth?.uid) {
        throw new functions.https.HttpsError("unauthenticated", "Authentication required.");
    }
    const uid = context.auth.uid;
    const limitDays = Math.min(Math.max(Number(data?.limitDays ?? 14), 1), 90);
    const ref = db.collection(`users/${uid}/mobile_activity_summary`);
    const snap = await ref.orderBy("date", "desc").limit(limitDays).get();
    return {
        summaries: snap.docs.map((doc) => doc.data()),
    };
});
exports.getGoogleActivityConnectionStatus = functions.https.onCall(async (_data, context) => {
    if (!context.auth?.uid) {
        throw new functions.https.HttpsError("unauthenticated", "Authentication required.");
    }
    const uid = context.auth.uid;
    const snap = await integrationRef(uid).get();
    if (!snap.exists) {
        return {
            connected: false,
            optedIn: false,
            provider: "google_fit",
            scope: GOOGLE_FIT_SCOPE,
        };
    }
    const data = snap.data();
    return {
        provider: data.provider ?? "google_fit",
        connected: Boolean(data.connected),
        optedIn: Boolean(data.optedIn),
        scope: data.scope ?? GOOGLE_FIT_SCOPE,
        connectedAt: data.connectedAt?.toDate().toISOString() ?? null,
        updatedAt: data.updatedAt?.toDate().toISOString() ?? null,
        lastSyncAt: data.lastSyncAt?.toDate().toISOString() ?? null,
        lastSyncResult: data.lastSyncResult ?? null,
        lastError: data.lastError ?? null,
    };
});
exports.disconnectGoogleActivity = functions.https.onCall(async (_data, context) => {
    if (!context.auth?.uid) {
        throw new functions.https.HttpsError("unauthenticated", "Authentication required.");
    }
    const uid = context.auth.uid;
    const summaries = await db.collection(`users/${uid}/mobile_activity_summary`).get();
    const batch = db.batch();
    for (const doc of summaries.docs) {
        batch.delete(doc.ref);
    }
    batch.set(integrationRef(uid), {
        connected: false,
        optedIn: false,
        accessToken: admin.firestore.FieldValue.delete(),
        accessTokenExpiresAt: admin.firestore.FieldValue.delete(),
        refreshToken: admin.firestore.FieldValue.delete(),
        pendingState: admin.firestore.FieldValue.delete(),
        pendingStateExpiresAt: admin.firestore.FieldValue.delete(),
        lastSyncAt: admin.firestore.FieldValue.delete(),
        lastSyncResult: admin.firestore.FieldValue.delete(),
        lastError: admin.firestore.FieldValue.delete(),
        disconnectedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    await batch.commit();
    return {
        deletedSummaryCount: summaries.size,
        message: "Google activity integration disconnected and stored mobile summaries deleted.",
    };
});
//# sourceMappingURL=mobileActivity.js.map