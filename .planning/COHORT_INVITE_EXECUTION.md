# Cohort Invite Execution Evidence

## Objective

- Capture concrete execution evidence for `Test cohort selected and onboarded` in `.planning/RELEASE_READINESS.md`.

## Planned Cohort (Reference)

- Target size: `20`
- Mix target:
  - `10` active UPI users
  - `6` moderate UPI users
  - `4` edge-case users
- Support channel: `#auto-finance-beta-support`

## Invite Run Metadata

- Invite run date (IST): `PENDING`
- Invite operator: `PENDING`
- Invite channel(s): `PENDING`
- Build/version shared with testers: `0.1.0 (build 1), artifact thgsgi4ctNz4Qm355Gig4T.aab`
- Consent + known-limitations message sent: `PENDING`

## Execution Tally

- Invited testers count: `PENDING`
- Accepted testers count: `PENDING`
- Onboarded testers count: `PENDING`
- Roster lock timestamp (UTC): `PENDING`

## Segment Coverage

- Active UPI users onboarded: `PENDING`
- Moderate UPI users onboarded: `PENDING`
- Edge-case users onboarded: `PENDING`

## Evidence Links

- Invite message/export artifact: `.planning/COHORT_INVITE_TEMPLATE.md` + `PENDING (actual sent message link/screenshot)`
- Final roster reference (internal): `.planning/COHORT_ROSTER_TEMPLATE.csv` + `PENDING (filled roster location)`
- First-day onboarding issues summary: `PENDING`

## Fast Update Command

- After updating `.planning/COHORT_ROSTER_TEMPLATE.csv`, run:
  - `npm run cohort:evidence`
- This command auto-fills:
  - invited/accepted/onboarded counts
  - segment coverage counts
  - roster lock timestamp (latest onboarded timestamp converted to UTC)

## Closure Rule

- Move `Test cohort selected and onboarded` to `DONE` only when all `PENDING` fields above are filled and segment coverage totals match the target cohort mix.
- Recommended flow: `npm run cohort:summary` -> `npm run cohort:evidence` -> fill remaining metadata fields -> `npm run cohort:closeout`.
