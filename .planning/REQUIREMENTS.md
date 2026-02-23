# Requirements: Auto Finance

**Defined:** 2026-02-23
**Core Value:** Automatically capture and categorize UPI payment notifications to provide users with effortless spending tracking without manual entry.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Core Reliability

- [ ] **CREL-01**: App works on Android 15+ with "Enhanced notifications" enabled
- [ ] **CREL-02**: User can request battery optimization exemption from settings
- [ ] **CREL-03**: App detects and warns when notification permission is revoked
- [ ] **CREL-04**: Parser reports confidence score for each transaction
- [ ] **CREL-05**: Offline transactions queue has TTL to prevent stale data

### Transaction Management

- [ ] **TXNM-01**: User can view list of all transactions sorted by date
- [ ] **TXNM-02**: User can filter transactions by date range
- [ ] **TXNM-03**: User can filter transactions by amount range
- [ ] **TXNM-04**: User can search transactions by merchant name
- [ ] **TXNM-05**: User can filter transactions by debit/credit direction
- [ ] **TXNM-06**: Transaction list supports pull-to-refresh
- [ ] **TXNM-07**: User can view transaction details (amount, merchant, UPI ref, timestamp)

### Categorization (v2)

- **[CAT-01**: User can manually assign category to transactions]
- **[CAT-02**: User can create custom categories]
- **[CAT-03**: System auto-categorizes based on merchant rules]

### Budgets (v2)

- **[BUDG-01**: User can set monthly budget limit]
- **[BUDG-02**: User can set per-category budget limits]
- **[BUDG-03**: User receives alert when approaching budget limit]
- **[BUDG-04**: User receives alert when exceeding budget]

### Insights (v2)

- **[INSG-01**: User can view spending by category (pie chart)]
- **[INSG-02**: User can view spending over time (line chart)]
- **[INSG-03**: User receives weekly spending digest]

## Out of Scope

| Feature | Reason |
|---------|--------|
| Manual transaction entry | Core value is automatic capture |
| iOS support | Android-only due to NotificationListenerService |
| Investment tracking | Separate domain, defer to v2+ |
| Bank account aggregation | Requires partnerships, not in scope |
| Credit card tracking | Requires SMS parsing beyond UPI notifications |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

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

**Coverage:**
- v1 requirements: 12 total
- Mapped to phases: 12
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-23*
*Last updated: 2026-02-23 after initial definition*
