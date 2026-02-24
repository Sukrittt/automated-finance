# Decision Log

## ADR-001: Platform Scope
- Date: 2026-02-24
- Decision: Android-only app for MVP.
- Reason: Notification listener capture is Android-specific.
- Impact: No iOS support in v1.

## ADR-002: Architecture
- Date: 2026-02-24
- Decision: Hybrid model (on-device ingest + server sync/analytics).
- Reason: Balances reliability, offline behavior, and future scale.
- Impact: Requires clear API contracts and reconciliation logic.

## ADR-003: Auth Strategy
- Date: 2026-02-24
- Decision: Firebase phone OTP for MVP.
- Reason: Preferred user UX for India audience.
- Impact: Must monitor OTP reliability and cost on Blaze.

## ADR-004: Backend Direction
- Date: 2026-02-24
- Decision: NestJS REST backbone.
- Reason: Strong scale path and explicit modularity.
- Impact: Contract-first APIs and service boundaries required.

## ADR-005: Privacy Baseline
- Date: 2026-02-24
- Decision: Store normalized fields only; avoid raw notification retention.
- Reason: Lower privacy/compliance risk.
- Impact: Parser debugging needs structured telemetry instead of raw text logs.

## ADR-006: UX Direction
- Date: 2026-02-24
- Decision: Light theme, soft cards, pastel accents, layered summary.
- Reason: Playful but low-overwhelm UX for broad age groups.
- Impact: Design tokens and component system must enforce simplicity.

## ADR-007: Delivery Model
- Date: 2026-02-24
- Decision: One objective per session with mandatory handoff package.
- Reason: Faster iteration with low context loss.
- Impact: Strict planning doc updates every session.

