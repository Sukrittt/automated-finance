# Next Session Starter Brief

## Objective

- Execute one high-impact implementation bundle (not micro-tasks) while cohort onboarding stays deferred to final pre-release pass.

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

## Next Session Bundle (Single Outcome)

- Bundle name: `Summary + Category surface completion`
- Why this bundle:
  - Budgeting slice is now fully closed (`BUD-01/02/03`), so the next highest-impact gap is core requirement surface coverage for summaries/categories.
  - This bundle can close multiple pending Phase-1 requirements in one pass with user-visible UI + tests.
- Deliverables in one session:
  - Close summary requirement surface (`SUM-01..04`) in app UI parity terms.
  - Close category requirement surface (`CAT-02`, `CAT-03`) with clear amount + percentage breakdown UX.
  - Ensure transactions and dashboard states use consistent category labels/totals and no conflicting semantics.
  - Add focused tests to lock summary/category display behavior.

## Read First

- `.planning/BETA_PLAYBOOK.md`
- `.planning/RELEASE_READINESS.md`
- `.planning/RELEASE_NOTES_DRAFT.md`
- `.planning/RELEASE_EXECUTION_RUNBOOK.md`
- `.planning/SIGNED_BUILD_EVIDENCE.md`
- `.planning/COHORT_INVITE_EXECUTION.md`
- `.planning/BETA_OPERATIONS.md`
- `.planning/ROLLBACK_REHEARSAL.md`
- `.planning/STATUS_LOG.md`
- `.planning/TASK_BOARD.md`
- `.planning/DECISIONS.md`
- `.planning/TEST_MATRIX.md`

## Suggested First Commands

- `rg -n "BLOCKED|IN_PROGRESS|DONE|target:" .planning/RELEASE_READINESS.md .planning/TASK_BOARD.md`
- `rg -n "BUD-|VIS-|Not Run|Pending implementation" .planning/TEST_MATRIX.md .planning/REQUIREMENTS.md`
- `rg -n "playful|haptic|motion|Duolingo" .planning/UI_GUIDELINES.md .planning/DECISIONS.md`
- `sed -n '1,220p' .planning/TEST_MATRIX.md`
- `sed -n '1,220p' .planning/REQUIREMENTS.md`
- `sed -n '1,220p' .planning/DECISIONS.md`
- `sed -n '1,220p' .planning/UI_GUIDELINES.md`
- `sed -n '1,220p' .planning/API_CONTRACT.md`

## Guardrails

- Keep scope to one implementation bundle only (3-4 tightly related tasks is acceptable; avoid fragmented micro-tasking).
- Prefer quickly shippable bundles that close one user-visible outcome end-to-end.
- Preserve release-readiness visibility: cohort onboarding stays `BLOCKED` with owner + target date until final pre-release pass.
- Update `.planning` docs at close with implementation evidence and any blocker date/owner movement.
