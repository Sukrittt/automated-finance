# Closed Beta Release Notes (Draft)

## Release

- App: Auto Finance (Android closed beta)
- Build channel: Internal closed beta
- Date: 2026-02-24

## What Is Included

- UPI notification parsing baseline for GPay, PhonePe, Paytm, BHIM.
- Rule-based category prediction with review correction loop.
- Daily/weekly/monthly summary aggregation with reconciliation checks.
- Weekly insight generation baseline with explainable outputs.
- OTP auth hardening with retry, timeout handling, and invalid-code lockout guard.
- Deterministic quality gate with explicit `GO/NO_GO` thresholds.
- Pre-beta telemetry baseline for OTP, ingest pipeline, and crash capture hook.

## Known Limitations

- Crash and event telemetry is currently provider-agnostic with no external sink configured yet.
- Quality gate consumes supplied KPI/issue snapshot inputs; live production metric ingestion is pending.
- Category budget-limit setup (`BUD-01`) is not implemented; current alerts use baseline category limits.
- Backend summary integration is pending for `/v1/summary`; current summary baseline is local aggregation logic.
- Category feedback persistence is currently in-memory baseline only.

## Rollback Reminder

- Stop rollout expansion on: P0 auth failure trend, severe parse regression, or summary data-integrity mismatch.
