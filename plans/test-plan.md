# Test Plan

## UI regression scenarios
1. Theme consistency snapshots across onboarding, dashboard, transactions, review, insights, settings.
2. Accessibility baseline: contrast, font scaling at 1.2x and 1.4x, touch targets >= 44px.
3. Small-screen checks: 360x800 and 412x915 Android viewport behavior.
4. Loading/empty/error state rendering on each core screen.
5. Chart readability and axis/label overlap checks.
6. Review queue interactions: accept/edit path and sheet open/close behavior.

## Functional scenarios (upcoming milestones)
1. Notification permission state transitions.
2. Notification parse -> transaction record path.
3. Dedupe behavior for repeated notifications.
4. Category correction feedback loop.
5. Offline capture and delayed sync retry.

## Release gates
- No critical UI clipping on small screens.
- Crash-free session target achieved in beta.
- Primary parse and categorization metrics pass thresholds.

## QA-T1 Baseline Setup
- Snapshot runner: Jest (`jest-expo` preset) via `npm test`.
- Baseline file: `tests/ui/__snapshots__/screens.snapshot.test.tsx.snap`.
- Source snapshots: `tests/ui/screens.snapshot.test.tsx`.
- Update snapshots intentionally with `npm run test:update`.
