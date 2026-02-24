# Closed Beta Playbook

## Goal

Ship a stable Android closed beta with measurable parser and insight quality.

## Pre-Beta Checklist

- Parser KPI: >=95% extraction on validation corpus.
- Categorization KPI: >=90% precision.
- Auth funnel validated (request, verify, retry, failure states).
- Crash and event telemetry enabled.
- Privacy baseline confirmed (no raw body retention).

## Release Checklist

- Build signed and versioned.
- Release notes include known limitations.
- Test cohort selected and onboarded.
- Support channel and issue intake path defined.

## Monitoring Checklist

- Crash-free sessions
- OTP success rate
- Parse failure rate by source app
- Review queue backlog
- Budget alert trigger correctness

## Rollback Criteria

- P0 auth failure trend
- Parse KPI severe regression
- Data integrity mismatch in summaries

## Rollback Action

- Halt rollout expansion.
- Revert to last known stable build.
- Publish issue summary and ETA in status log.

