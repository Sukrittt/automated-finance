# UI Revamp Rollout Checklist

## Feature Flags
- `playful_ui_v2`
- `daily_missions_v1`
- `streaks_v1`
- `engagement_notifications_v1`
- `leaderboard_hooks_v1`

## Stage Plan
1. Internal dogfood (100 internal users)
- Enable all flags for internal testers.
- Validate crash-free sessions and review queue completion trends for 3 days.

2. Beta cohort (10%)
- Keep `leaderboard_hooks_v1` on (storage/telemetry only).
- Monitor reminder telemetry (`notification_sent/opened/dismissed`) for delivery quality.

3. Broader rollout (50%)
- Expand only if no regression in auth, ingest, and review flow metrics.

4. Full rollout (100%)
- Keep rollback path active for 7 days post-full rollout.

## Rollback Triggers
- Auth failure rate spike > 2x baseline for 30 minutes.
- Review queue action success drops below 95%.
- App crash signal spike > 1.5x baseline.

## Rollback Actions
- Disable `playful_ui_v2` and `engagement_notifications_v1` first.
- Keep baseline finance surfaces active.
- Re-check telemetry and rerun targeted UI suite.
