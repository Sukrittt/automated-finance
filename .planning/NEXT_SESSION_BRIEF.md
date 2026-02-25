# Next Session Starter Brief

## Objective

- Execute one high-impact app implementation bundle (not micro-tasks). Release/cohort operations stay parked until final pre-release pass.

## Current State

- `P1-T1` DONE: parser corpus for GPay/PhonePe/Paytm/BHIM is in place.
- `P1-T2` DONE: extraction validation KPI `>=95%` (currently `100%`, `12/12`).
- `P2-T1` DONE: rule-based category baseline + review-correction feedback loop.
- `P3-T1` DONE: daily/weekly/monthly aggregation baseline with reconciliation checks and Day/Week/Month selector alignment.
- `P4-T1` DONE: deterministic weekly insight generation with explainable metric-backed outputs + API contract tests.
- `P5-T1` DONE: OTP timeout/retry hardening + repeated invalid-OTP lockout guard + retry/timeout integration coverage.
- `P6-T1` DONE: deterministic quality-gate evaluator with explicit KPI/issue thresholds and tested `GO/NO_GO` decisions.
- Checkpoint review DONE: focused gate suite passed (`21/21`) and final decision is `GO` with snapshot inputs `P0=0`, `P1=0`.
- `P7-T1` DONE: OTP + ingest event telemetry baseline is instrumented and test-validated.
- `P7-T2` DONE: crash telemetry handler is installed at app startup and test-validated.
- `P7-T3` DONE (tracking complete): release notes/support/telemetry sink and signed build evidence are closed; cohort onboarding is explicitly deferred as a release-readiness blocker.
- `P7-T4` DONE: rollback rehearsal plus monitoring signal validation evidence is complete (`.planning/ROLLBACK_REHEARSAL.md`, `.planning/TEST_MATRIX.md`).
- `BUD-01` DONE: monthly budget setup/edit UI with local persistence is implemented and dashboard budget alerts now respect saved limits.
- Playful UX baseline DONE: button spring/tap feedback + success/warning haptics + friendly action confirmations are live on key flows.
- `SUM-01..04` DONE: dashboard now presents explicit Day/Week/Month summaries and range switching behavior with UI coverage.
- `CAT-02/CAT-03` DONE: category split includes amount + percentage breakdown for selected range.
- Dashboard preview-mode fallback DONE: when live summary API fails, realistic mock visuals now render instead of a blank/error-only screen.
- `CAT-05` DONE: review-driven category overrides now persist locally and reload at startup.
- `INS-02` DONE: ranked top spending categories are visible in dashboard + insights views.
- Operations handoff tasks are parked for now; app iteration is the active track.
- Core preview fallback parity DONE: transactions/review queue/insights now stay usable with demo-mode content when live APIs fail.
- UX tightening DONE: review-queue recategorization now supports quick category chips for faster edits.
- Transactions flow polish DONE: direction chips + filter-aware empty state are implemented with UI coverage.
- Insights freshness polish DONE: ready-state now shows `Last updated` timestamp for generated insight confidence.
- Cross-screen freshness polish DONE: Dashboard/Transactions/Review Queue now surface `Last updated` after each load/fallback refresh.
- Retry CTA consistency polish DONE: live reload action copy is aligned to `Retry live data` across core app screens.
- Emulator run pipeline unblock DONE: Android debug build/install/open now succeeds locally with Expo-compatible AsyncStorage + JDK17 runtime.
- Device walkthrough loop DONE: emulator walkthrough capture was executed and top two friction fixes are implemented with focused tests.

## Next Session Bundle (Single Outcome)

- Bundle name: `Final pre-release operations pass`
- Why this bundle:
  - Core app implementation bundle is complete; remaining work is release/cohort closeout.
  - This closes the final blocked readiness item before release decision.
- Deliverables in one session:
  - Execute cohort onboarding evidence flow (`cohort:summary`, `cohort:evidence`, `cohort:closeout`).
  - Fill remaining cohort execution metadata/evidence links.
  - Move release-readiness cohort row from `BLOCKED` to `DONE` if evidence is complete.
  - Update planning evidence docs at close.

## Read First

- `.planning/STATUS_LOG.md`
- `.planning/TASK_BOARD.md`
- `.planning/DECISIONS.md`
- `.planning/UI_GUIDELINES.md`
- `.planning/API_CONTRACT.md`
- `.planning/TEST_MATRIX.md`

## Suggested First Commands

- `rg -n "DONE|IN_PROGRESS|TODO|APP-ITER" .planning/TASK_BOARD.md .planning/STATUS_LOG.md`
- `rg -n "Preview mode|fallback|Retry live data" src/screens tests/ui`
- `rg -n "playful|haptic|motion|Duolingo" .planning/UI_GUIDELINES.md .planning/DECISIONS.md`
- `sed -n '1,220p' .planning/TEST_MATRIX.md`
- `sed -n '1,220p' .planning/DECISIONS.md`
- `sed -n '1,220p' .planning/UI_GUIDELINES.md`
- `sed -n '1,220p' .planning/API_CONTRACT.md`

## Guardrails

- Keep scope to one implementation bundle only (3-4 tightly related tasks is acceptable; avoid fragmented micro-tasking).
- Prefer quickly shippable bundles that close one user-visible outcome end-to-end.
- Defer release/cohort operations and avoid spending implementation sessions on those items until final pre-release pass.
- Update `.planning` docs at close with implementation evidence and any blocker date/owner movement.
