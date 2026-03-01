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
exports.generateNudges = exports.computeLeaderboard = exports.dailyAggregation = void 0;
var dailyAggregation_1 = require("./dailyAggregation");
Object.defineProperty(exports, "dailyAggregation", { enumerable: true, get: function () { return dailyAggregation_1.dailyAggregation; } });
var leaderboard_1 = require("./leaderboard");
Object.defineProperty(exports, "computeLeaderboard", { enumerable: true, get: function () { return leaderboard_1.computeLeaderboard; } });
var nudges_1 = require("./nudges");
Object.defineProperty(exports, "generateNudges", { enumerable: true, get: function () { return nudges_1.generateNudges; } });
//# sourceMappingURL=index.js.map