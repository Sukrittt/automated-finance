# Roadmap: Auto Finance

**Created:** 2026-02-23
**Depth:** Quick (3-5 phases)
**Coverage:** 12/12 v1 requirements mapped

## Phases

- [ ] **Phase 1: Core Reliability** - Fix Android 15+ notification handling, battery optimization, permission monitoring, and parser confidence scoring
- [ ] **Phase 2: Transaction Management** - Complete transaction list with filtering, search, pull-to-refresh, and detail views

---

## Phase Details

### Phase 1: Core Reliability

**Goal:** App works reliably on modern Android (15+) with proper permission handling and parser quality signals

**Depends on:** Nothing (first phase)

**Requirements:** CREL-01, CREL-02, CREL-03, CREL-04, CREL-05

**Success Criteria** (what must be TRUE):

1. App captures UPI notifications on Android 15+ when user has "Enhanced notifications" enabled (CREL-01)
2. User can request battery optimization exemption from in-app settings with clear explanation (CREL-02)
3. App shows persistent warning when notification permission is revoked with one-tap re-enable (CREL-03)
4. Parser reports confidence score (0-100%) for each parsed transaction (CREL-04)
5. Offline queue automatically removes transactions older than 7 days to prevent stale data (CREL-05)

**Plans:** TBD

---

### Phase 2: Transaction Management

**Goal:** Users can view, filter, search, and examine their captured transactions

**Depends on:** Phase 1

**Requirements:** TXNM-01, TXNM-02, TXNM-03, TXNM-04, TXNM-05, TXNM-06, TXNM-07

**Success Criteria** (what must be TRUE):

1. User sees list of all transactions sorted by date (newest first) (TXNM-01)
2. User can filter transactions by date range (TXNM-02)
3. User can filter transactions by amount range (TXNM-03)
4. User can search transactions by merchant name (TXNM-04)
5. User can filter transactions by direction (debit/credit/all) (TXNM-05)
6. User can pull-to-refresh to sync latest transactions (TXNM-06)
7. User can tap any transaction to view full details: amount (in rupees), merchant, UPI reference, exact timestamp (TXNM-07)

**Plans:** TBD

---

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Core Reliability | 0/N | Not started | - |
| 2. Transaction Management | 0/N | Not started | - |

---

## Requirements Coverage

| Requirement | Phase | Status |
|-------------|-------|--------|
| CREL-01 | Phase 1 | Pending |
| CREL-02 | Phase 1 | Pending |
| CREL-03 | Phase 1 | Pending |
| CREL-04 | Phase 1 | Pending |
| CREL-05 | Phase 1 | Pending |
| TXNM-01 | Phase 2 | Pending |
| TXNM-02 | Phase 2 | Pending |
| TXNM-03 | Phase 2 | Pending |
| TXNM-04 | Phase 2 | Pending |
| TXNM-05 | Phase 2 | Pending |
| TXNM-06 | Phase 2 | Pending |
| TXNM-07 | Phase 2 | Pending |

---

*Roadmap created: 2026-02-23*
