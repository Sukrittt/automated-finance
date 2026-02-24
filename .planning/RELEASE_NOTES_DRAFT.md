# Closed Beta Release Notes (Draft)

## Release

- App: Auto Finance (Android closed beta)
- Build channel: Internal closed beta
- Date: 2026-02-24

## What Is Included

- UPI notification parsing baseline for GPay, PhonePe, Paytm, BHIM.
- Rule-based category prediction with review correction loop.
- Daily/weekly/monthly summary aggregation with reconciliation checks.
- Dashboard summary surface now clearly exposes Day/Week/Month range summaries and range switching.
- Category split now includes explicit amount + percentage breakdown rows for selected range.
- Weekly insight generation baseline with explainable outputs.
- Monthly budget setup/edit with local persistence for category limits.
- OTP auth hardening with retry, timeout handling, and invalid-code lockout guard.
- Deterministic quality gate with explicit `GO/NO_GO` thresholds.
- Pre-beta telemetry baseline for OTP, ingest pipeline, and crash capture hook.
- Playful interaction baseline on primary actions (haptic taps/success + subtle spring feedback + friendlier confirmations).

## Known Limitations

- Crash and event telemetry is currently provider-agnostic with no external sink configured yet.
- Quality gate consumes supplied KPI/issue snapshot inputs; live production metric ingestion is pending.
- Backend summary integration is pending for `/v1/summary`; current summary baseline is local aggregation logic.
- Category feedback persistence is currently in-memory baseline only.

## Rollback Reminder

- Stop rollout expansion on: P0 auth failure trend, severe parse regression, or summary data-integrity mismatch.
