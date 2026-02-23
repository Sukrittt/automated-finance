# Auto Finance

## What This Is

Android-only Expo React Native app that automatically tracks UPI spending in India by capturing payment notifications (GPay, PhonePe, Paytm, BHIM, bank apps) and delivering weekly spending insights. Uses Supabase for auth and a custom REST API backend.

## Core Value

Automatically capture and categorize UPI payment notifications to provide users with effortless spending tracking without manual entry.

## Requirements

### Validated

- ✓ UPI notification capture via Android NotificationListenerService — existing
- ✓ Template-based UPI parser for common apps (GPay, PhonePe, Paytm, BHIM) — existing
- ✓ Deduplication via FNV-1a fingerprint hashing — existing
- ✓ Offline queue with exponential backoff — existing
- ✓ Email OTP authentication — existing
- ✓ Phone OTP authentication (feature-flagged) — existing
- ✓ Google Sign-In via Firebase — existing
- ✓ API client with Bearer token auth — existing
- ✓ Dashboard, Transactions, Review Queue, Insights, Settings screens — existing
- ✓ Tab-based navigation (no router) — existing

### Active

(None yet — define what to build next)

### Out of Scope

- iOS support — Android-only due to NotificationListenerService requirement
- Manual transaction entry — auto-capture focus
- Investment tracking — spending only for v1

## Context

This is an existing brownfield project with mapped codebase. The notification capture pipeline, auth system, and core UI screens are implemented. Planning continues to define next features.

## Constraints

- **Platform**: Android only — NotificationListenerService is Android-specific
- **Auth**: Supabase (email/phone OTP) + Firebase (Google Sign-In)
- **Backend**: Custom REST API (not built in this repo)
- **Amounts**: Always stored as integer paise (1 INR = 100 paise)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Tab-based navigation | Simple app, no router needed | ✓ Good |
| Template-based UPI parsing | Fast to extend for new apps | ✓ Good |
| FNV-1a for dedupe | Fast, good distribution | ✓ Good |
| Dependency injection in ingest service | Testability, flexible deps | ✓ Good |

---
*Last updated: 2026-02-23 after planning initialization*
