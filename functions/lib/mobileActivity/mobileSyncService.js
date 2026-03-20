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
exports.authenticateMobileIngestRequest = authenticateMobileIngestRequest;
exports.validateMobileIngestRequestBody = validateMobileIngestRequestBody;
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
const types_1 = require("./types");
if (!admin.apps.length)
    admin.initializeApp();
const ALLOWED_TOP_LEVEL_KEYS = new Set(["source", "consent", "summaries"]);
const ALLOWED_SUMMARY_KEYS = new Set(["date", "step_count", "active_minutes", "activity_sessions"]);
function isRecord(value) {
    return typeof value === "object" && value !== null;
}
function getBearerToken(req) {
    const authHeader = req.header("authorization") ?? req.header("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
        throw new functions.https.HttpsError("unauthenticated", "Missing Bearer token.");
    }
    return authHeader.slice("Bearer ".length).trim();
}
function rejectUnexpectedKeys(obj, allowed, location) {
    for (const key of Object.keys(obj)) {
        if (!allowed.has(key)) {
            throw new functions.https.HttpsError("invalid-argument", `${location} contains unsupported field '${key}'. Only minimal activity fields are accepted.`);
        }
    }
}
function toSafeNumber(value, field, max) {
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
        throw new functions.https.HttpsError("invalid-argument", `${field} must be a non-negative number.`);
    }
    return Math.min(Math.round(value), max);
}
function validateSummary(input) {
    if (!isRecord(input)) {
        throw new functions.https.HttpsError("invalid-argument", "Each summary must be an object.");
    }
    rejectUnexpectedKeys(input, ALLOWED_SUMMARY_KEYS, "summary");
    const date = input.date;
    if (typeof date !== "string" || !(0, types_1.isIsoDate)(date)) {
        throw new functions.https.HttpsError("invalid-argument", "summary.date must be YYYY-MM-DD.");
    }
    return {
        date,
        step_count: toSafeNumber(input.step_count, "summary.step_count", 200000),
        active_minutes: toSafeNumber(input.active_minutes, "summary.active_minutes", 1440),
        activity_sessions: toSafeNumber(input.activity_sessions, "summary.activity_sessions", 400),
    };
}
async function authenticateMobileIngestRequest(req) {
    const token = getBearerToken(req);
    const decoded = await admin.auth().verifyIdToken(token);
    return decoded.uid;
}
function validateMobileIngestRequestBody(body) {
    if (!isRecord(body)) {
        throw new functions.https.HttpsError("invalid-argument", "Request body must be a JSON object.");
    }
    rejectUnexpectedKeys(body, ALLOWED_TOP_LEVEL_KEYS, "request body");
    if (body.source !== "google_health_connect") {
        throw new functions.https.HttpsError("invalid-argument", "source must be 'google_health_connect'.");
    }
    if (body.consent !== true) {
        throw new functions.https.HttpsError("failed-precondition", "Explicit user consent is required before syncing Health Connect data.");
    }
    if (!Array.isArray(body.summaries) || body.summaries.length === 0) {
        throw new functions.https.HttpsError("invalid-argument", "summaries must be a non-empty array.");
    }
    if (body.summaries.length > 31) {
        throw new functions.https.HttpsError("invalid-argument", "At most 31 daily summaries are allowed per request.");
    }
    const summaries = body.summaries.map(validateSummary);
    return {
        source: "google_health_connect",
        consent: true,
        summaries,
    };
}
//# sourceMappingURL=mobileSyncService.js.map