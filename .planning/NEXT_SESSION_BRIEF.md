# Next Session Starter Brief

## Objective

- Close remaining release blockers (`signed build`, `cohort execution`, `telemetry sink`) and complete `P7-T4` monitoring validation.

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
- `P7-T3` IN_PROGRESS: release notes/support/telemetry sink are closed; cohort execution and signed build evidence still pending.
- `P7-T4` IN_PROGRESS: rollback rehearsal dry run is complete (`.planning/ROLLBACK_REHEARSAL.md`); monitoring signal validation is partially complete.

## Read First

- `.planning/BETA_PLAYBOOK.md`
- `.planning/RELEASE_READINESS.md`
- `.planning/RELEASE_NOTES_DRAFT.md`
- `.planning/BETA_OPERATIONS.md`
- `.planning/ROLLBACK_REHEARSAL.md`
- `.planning/STATUS_LOG.md`
- `.planning/TASK_BOARD.md`
- `.planning/DECISIONS.md`
- `.planning/TEST_MATRIX.md`

## Suggested First Commands

- `rg -n "BLOCKED|IN_PROGRESS|TODO|target:" .planning/RELEASE_READINESS.md`
- `rg -n "signed|artifact|cohort|invite|monitoring" .planning/RELEASE_READINESS.md .planning/STATUS_LOG.md`
- `rg -n "Rollback Rehearsal|PASS|Gaps Identified" .planning/ROLLBACK_REHEARSAL.md`
- `rg -n "IN_PROGRESS|BLOCKED" .planning/RELEASE_READINESS.md`

## Guardrails

- Keep scope to one slice only (operational closure for remaining readiness blockers).
- Do not start new product feature implementation while signed build/cohort/monitoring evidence is still open.
- Update `.planning` docs at close with blocker movement and linked evidence artifacts.
