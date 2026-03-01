/**
 * FlowPulse Cloud Functions
 *
 * - dailyAggregation  – scheduled 3 AM UTC, rolls activityLogs → dailyStats
 * - computeLeaderboard – scheduled 3:15 AM UTC, ranks users by weekly focus score
 * - generateNudges     – Firestore trigger on dailyStats write, creates nudge docs
 * - eventsIngest       – HTTPS callable for batch-writing activity events (future)
 */

export { dailyAggregation } from "./dailyAggregation";
export { computeLeaderboard } from "./leaderboard";
export { generateNudges } from "./nudges";
