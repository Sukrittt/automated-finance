# Rollback Rehearsal (Dry Run)

## Context

- Date: 2026-02-24
- Type: Tabletop dry run
- Scope: Closed beta rollback criteria and action path from `.planning/BETA_PLAYBOOK.md`

## Scenarios Rehearsed

1. P0 auth failure trend
- Trigger: OTP failures spike above expected baseline with repeated sign-in failures.
- Decision: Trigger rollback immediately.
- Actions rehearsed:
  - Halt rollout expansion.
  - Revert to last known stable build.
  - Publish issue summary and ETA in status log.
- Outcome: Runbook sequence is clear and executable; requires only release artifact pointers at execution time.

2. Parse KPI severe regression
- Trigger: Parser extraction KPI falls below `95%` gate for current corpus.
- Decision: Trigger rollback and freeze further rollout.
- Actions rehearsed:
  - Stop beta expansion.
  - Revert to last stable build.
  - Post status summary with current KPI delta and mitigation ETA.
- Outcome: Criteria and operator actions are explicit and aligned with quality gate rules.

3. Summary data integrity mismatch
- Trigger: reconciliation failures detected in summary aggregation checks.
- Decision: Trigger rollback pending data integrity fix.
- Actions rehearsed:
  - Freeze new rollout cohort activation.
  - Revert to last stable build.
  - Publish issue update and ETA.
- Outcome: Monitoring-to-decision path is deterministic.

## Gaps Identified

- Need signed build artifact metadata to shorten rollback execution time.

## Follow-up Status (2026-02-24)

- Monitoring signal validation completed with focused suite run (`5/5` suites, `18/18` tests).
- Runtime telemetry sink is now active for auth/ingest/crash flows; external provider integration is optional post-beta hardening, not a current blocker.

## Re-validation Checkpoint (2026-02-25)

- Re-ran focused monitoring + quality-gate suite:
  - `npm test -- tests/services/auth/auth.integration.test.ts tests/services/ingest/notificationIngestService.test.ts tests/services/telemetry/crash.test.ts tests/services/telemetry/runtimeReporter.test.ts tests/services/qualityGate/evaluator.test.ts`
- Result: `5/5` suites passed, `18/18` tests passed.
- Outcome: rollback trigger signals and monitoring ownership checkpoints remain valid with current code state.

## Rehearsal Verdict

- `PASS` for process readiness: rollback criteria and action sequence are documented and reproducible.
- Follow-up required: attach real build/version references once signing is complete.
