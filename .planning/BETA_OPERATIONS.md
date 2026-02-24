# Closed Beta Operations

## Test Cohort Plan

- Cohort size: 20 users
- Mix:
  - 10 active UPI users (daily usage)
  - 6 moderate UPI users (3 to 5 days/week)
  - 4 edge-case users (multiple apps and frequent refunds/credits)
- Onboarding path:
  - Share install instructions and OTP sign-in steps.
  - Request explicit consent for beta feedback and issue reporting.
  - Provide known limitations and expected behavior checklist.

## Support Channel And Intake

- Primary channel: dedicated private group chat `#auto-finance-beta-support` (owner: Product Ops).
- Escalation path:
  - P0: immediate escalation to Engineering on-call
  - P1: same-day triage in issue board
  - P2+: batched for weekly review
- Intake template:
  - device model + Android version
  - app version/build
  - timestamp and flow (onboarding/ingest/review/insights)
  - expected vs actual behavior
  - screenshot/screen recording if available

## Triage SLA

- P0: acknowledge within 30 minutes, mitigation within 4 hours.
- P1: acknowledge within 4 hours, action plan within 1 business day.
- P2/P3: acknowledge within 1 business day, schedule by next sprint.

## Monitoring Ownership

- OTP success trend: Engineering
- Parse failure rate by source app: Data/Engineering
- Review queue backlog: Product Ops
- Crash-free sessions: Engineering

