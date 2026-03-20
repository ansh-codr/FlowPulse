"use strict";
/**
 * FlowPulse Cloud Functions
 *
 * - dailyAggregation  – scheduled 3 AM UTC, rolls activityLogs → dailyStats
 * - computeLeaderboard – scheduled 3:15 AM UTC, ranks users by weekly focus score
 * - generateNudges     – Firestore trigger on dailyStats write, creates nudge docs
 * - eventsIngest       – HTTPS callable for batch-writing activity events (future)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createR2UploadUrl = exports.disconnectGoogleActivity = exports.getGoogleActivityConnectionStatus = exports.getMobileActivitySummaries = exports.scheduledMobileActivitySync = exports.ingestMobileHealthConnectData = exports.syncGoogleActivityData = exports.googleActivityOAuthCallback = exports.connectGoogleActivity = exports.generateHealthAlerts = exports.generateNudges = exports.computeLeaderboard = exports.dailyAggregation = void 0;
var dailyAggregation_1 = require("./dailyAggregation");
Object.defineProperty(exports, "dailyAggregation", { enumerable: true, get: function () { return dailyAggregation_1.dailyAggregation; } });
var leaderboard_1 = require("./leaderboard");
Object.defineProperty(exports, "computeLeaderboard", { enumerable: true, get: function () { return leaderboard_1.computeLeaderboard; } });
var nudges_1 = require("./nudges");
Object.defineProperty(exports, "generateNudges", { enumerable: true, get: function () { return nudges_1.generateNudges; } });
var healthAlerts_1 = require("./healthAlerts");
Object.defineProperty(exports, "generateHealthAlerts", { enumerable: true, get: function () { return healthAlerts_1.generateHealthAlerts; } });
var mobileActivity_1 = require("./mobileActivity");
Object.defineProperty(exports, "connectGoogleActivity", { enumerable: true, get: function () { return mobileActivity_1.connectGoogleActivity; } });
Object.defineProperty(exports, "googleActivityOAuthCallback", { enumerable: true, get: function () { return mobileActivity_1.googleActivityOAuthCallback; } });
Object.defineProperty(exports, "syncGoogleActivityData", { enumerable: true, get: function () { return mobileActivity_1.syncGoogleActivityData; } });
Object.defineProperty(exports, "ingestMobileHealthConnectData", { enumerable: true, get: function () { return mobileActivity_1.ingestMobileHealthConnectData; } });
Object.defineProperty(exports, "scheduledMobileActivitySync", { enumerable: true, get: function () { return mobileActivity_1.scheduledMobileActivitySync; } });
Object.defineProperty(exports, "getMobileActivitySummaries", { enumerable: true, get: function () { return mobileActivity_1.getMobileActivitySummaries; } });
Object.defineProperty(exports, "getGoogleActivityConnectionStatus", { enumerable: true, get: function () { return mobileActivity_1.getGoogleActivityConnectionStatus; } });
Object.defineProperty(exports, "disconnectGoogleActivity", { enumerable: true, get: function () { return mobileActivity_1.disconnectGoogleActivity; } });
var r2Storage_1 = require("./r2Storage");
Object.defineProperty(exports, "createR2UploadUrl", { enumerable: true, get: function () { return r2Storage_1.createR2UploadUrl; } });
//# sourceMappingURL=index.js.map