# Release Execution Runbook

## Objective

- Close the remaining `P7-T3` blockers (`signed build`, `cohort execution`) with concrete execution output and linked evidence.

## 1) See The App Now (Local Preview)

- Ensure env file exists: `cp .env.example .env`
- Install deps (if needed): `npm install`
- Start app: `npm run start`
- Open on Android:
  - press `a` for emulator, or
  - scan QR using Expo Go on Android device.

## 2) Produce Signed Android Build Evidence

### Prerequisites

- Expo/EAS account access.
- Android signing credentials configured in EAS.

### Commands

- Login: `npx eas login`
- Configure project (first time): `npx eas build:configure`
- Trigger signed AAB build: `npx eas build -p android --profile production --non-interactive`

### Evidence Capture

Fill all `PENDING` fields in:
- `.planning/SIGNED_BUILD_EVIDENCE.md`

Minimum required from build output:
- artifact type (`.aab`)
- artifact filename or download URL
- artifact SHA-256
- version code / build number
- build run URL/ID
- build timestamp (UTC)
- operator

Then update:
- `.planning/RELEASE_READINESS.md` row `Build signed and versioned` -> `DONE`

## 3) Execute Cohort Invite And Roster Lock

### Operational Steps

- Send invite message to planned users (target `20`).
- Share build/install instructions and known limitations.
- Collect acceptance confirmations.
- Lock roster when segment mix target is satisfied.
- Use templates:
  - invite message: `.planning/COHORT_INVITE_TEMPLATE.md`
  - roster tracker: `.planning/COHORT_ROSTER_TEMPLATE.csv`
- After filling roster CSV, generate summary counts:
  - `npm run cohort:summary`
  - Optional machine-readable output: `npm run cohort:summary:json`
- Auto-fill evidence tally fields from roster CSV:
  - `npm run cohort:evidence`

### Evidence Capture

Fill all `PENDING` fields in:
- `.planning/COHORT_INVITE_EXECUTION.md`
  - `npm run cohort:evidence` will auto-fill invited/accepted/onboarded, segment totals, and roster lock timestamp.
  - Fill remaining metadata fields manually (invite run date/operator/channel/evidence links).

Then update:
- `.planning/RELEASE_READINESS.md` row `Test cohort selected and onboarded` -> `DONE`
  - Or run `npm run cohort:closeout` to validate + auto-update readiness/task status when all criteria are satisfied.

## 4) Close `P7-T3`

- When both rows above are `DONE`, set:
  - `.planning/TASK_BOARD.md` -> `P7-T3` status to `DONE`
- Add final session note to:
  - `.planning/STATUS_LOG.md`
- One-command finish (after metadata fields are filled and segment targets are met):
  - `npm run cohort:closeout`
