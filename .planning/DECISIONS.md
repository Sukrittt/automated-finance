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

## ADR-008: Parser Quality Gate
- Date: 2026-02-24
- Decision: Use a fixed parser corpus (top 4 apps with success + edge samples) as the extraction quality gate for Phase 1.
- Reason: Prevent parser regressions and make KPI progress measurable per session.
- Impact: Corpus test must stay green and amount extraction KPI must remain >=95%.

## ADR-009: Confidence-to-Review Routing
- Date: 2026-02-24
- Decision: Mark events with `review_required` when parse confidence is below `0.90`.
- Reason: Route ambiguous parser outputs into review queue while allowing high-confidence events to flow directly.
- Impact: Ingest payload now includes parsed fields, confidence, and review routing signal.

## ADR-010: Category Baseline + Feedback Loop
- Date: 2026-02-24
- Decision: Use deterministic merchant-keyword rules for `Food/Transport/Shopping/Bills/Entertainment/Others`, default credits to `Income`, and apply review corrections as merchant-level feedback overrides.
- Reason: Delivers immediate category coverage and creates a lightweight learning loop without waiting for ML infrastructure.
- Impact: Ingest payload now includes optional category prediction + confidence, and review edits improve future categorization for matching merchants.

## ADR-011: Summary Reconciliation Baseline
- Date: 2026-02-24
- Decision: Build daily/weekly/monthly summaries from ledger debit entries only, and mark each summary as reconciled only when aggregate totals equal breakdown totals.
- Reason: Ensures summary correctness is explicitly testable before layering advanced visual/insight logic.
- Impact: New summary aggregation service enforces reconciliation checks; dashboard time range taxonomy aligned to `day/week/month`.

## ADR-012: Deterministic Weekly Insight Generation
- Date: 2026-02-24
- Decision: Generate weekly insights from reconciled summary metrics using deterministic templates (week-over-week delta, top category share, and actionable reduction tip), with optional projected monthly overrun.
- Reason: Keeps insight output explainable and testable without introducing opaque heuristics or model dependencies in MVP.
- Impact: Added local insight generator and API contract tests; insight copy now ties directly to measurable values.

## ADR-013: OTP Reliability Guardrails
- Date: 2026-02-24
- Decision: Add auth timeout + transient retry handling to OTP request flow, classify network/timeout errors explicitly, and enforce short lockout after repeated invalid OTP attempts in onboarding.
- Reason: Reduce auth drop-off from flaky networks/timeouts while limiting repeated invalid code loops.
- Impact: OTP funnel now has deterministic retry/error behavior with integration test coverage for retry and timeout paths.

## ADR-014: Release Gate Criteria
- Date: 2026-02-24
- Decision: Use a deterministic quality-gate evaluator with hard thresholds (`parser >=95%`, `category >=90%`, auth/summary/insight validations true, `P0=0`, `P1<=3`) to produce a `GO` or `NO_GO` decision.
- Reason: Makes release readiness explicit, testable, and auditable instead of relying on ad-hoc judgement.
- Impact: Added quality-gate service + tests; go/no-go can be computed consistently from current KPI snapshots and issue counts.

## ADR-015: Pre-Beta Event Telemetry Baseline
- Date: 2026-02-24
- Decision: Instrument OTP request/verify outcomes and ingest pipeline signals (parse failures, queue size, enqueue, flush success) through a shared telemetry reporter interface with default no-op behavior.
- Reason: Closed beta monitoring checklist requires OTP and parse-failure observability; lightweight instrumentation is needed without forcing a concrete vendor yet.
- Impact: Auth and ingest services now emit structured telemetry events with test coverage; crash telemetry vendor integration remains a separate follow-up task.

## ADR-016: Crash Telemetry Integration Strategy
- Date: 2026-02-24
- Decision: Install crash capture at app startup via React Native `ErrorUtils` global handler, emitting `app_crash_captured` telemetry events through the same reporter interface and forwarding to the existing handler.
- Reason: Enables deterministic crash observability immediately while remaining vendor-agnostic and minimizing integration risk in the current pre-beta slice.
- Impact: App startup now installs crash telemetry when `ErrorUtils` is available; concrete external crash backend wiring can be layered without changing app call sites.

## ADR-017: Release Readiness Ownership Model
- Date: 2026-02-24
- Decision: Track release-readiness checklist ownership by function (`Engineering`, `Product`, `Product Ops`) until named individuals are assigned.
- Reason: Keeps operational tasks actionable now without blocking on staffing details.
- Impact: `RELEASE_READINESS.md` now carries owner + target-date fields suitable for immediate execution and later handoff to specific people.

## ADR-018: Closed-Beta Telemetry Sink Choice
- Date: 2026-02-24
- Decision: Use a runtime structured console telemetry reporter as the immediate sink for auth/ingest/crash events, with recent-event in-memory retention for local diagnostics.
- Reason: Closes telemetry-readiness blocker quickly without introducing external provider setup risk in the current release-readiness slice.
- Impact: Telemetry events are now emitted in runtime by default through app wiring; future external backend integration can be layered by swapping reporter implementation.
