# Signed Build Evidence

## Objective

- Capture the minimum evidence required to close `Build signed and versioned` in `.planning/RELEASE_READINESS.md`.

## Current Candidate Metadata (Prepared 2026-02-24)

- App name: `Auto Finance`
- App ID (Android package): `com.automatedfinance.app`
- App version: `0.1.0`
- Source commit: `26a2768b66985a0e1b44a2f537b4aa3ecff17fe9`
- Branch: `main`
- Metadata capture time: `2026-02-24 23:19:17 IST`

## Required Signing Evidence (Fill During Release Run)

- Build system used (e.g., EAS/CI pipeline): `EAS Build (Expo cloud)`
- Signed artifact type (`.aab`/`.apk`): `.aab` (profile: `production`)
- Artifact filename: `thgsgi4ctNz4Qm355Gig4T.aab` (local copy: `/tmp/auto-finance-production-1.aab`)
- Artifact SHA-256: `4b075c44bfcf7fc1c9c61b9f49946275df289c60ede4ea3ed2c5f0e1a859dfc0`
- Version code / build number: `1`
- Signing profile / key reference: `Expo server-managed Android keystore (generated 2026-02-24)`
- Build run URL or pipeline ID: `https://expo.dev/accounts/sukrit04/projects/auto-finance/builds/dcec2ad2-d908-4750-87e4-511c7e1fb9a5`
- Build timestamp (UTC): `2026-02-24T18:48:02.774Z`
- Operator: `sukrit04`

## Current Build Status

- Build ID: `dcec2ad2-d908-4750-87e4-511c7e1fb9a5`
- Status: `FINISHED` (completed at `2026-02-24T18:53:56.080Z`)
- Project ID: `162d1820-aa81-477d-8b1e-30bb94ce8881`
- Git commit: `26a2768b66985a0e1b44a2f537b4aa3ecff17fe9`

## Closure Rule

- The release-readiness row can move to `DONE` only when all `PENDING` fields above are filled with real build output and artifact hash evidence.
