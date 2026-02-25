# Requirements: Auto Finance

**Defined:** 2026-02-24
**Core Value:** Automatically capture and categorize UPI payment notifications to provide users with effortless spending tracking without manual entry.

## v1 Requirements

### Spending Summaries

- [x] **SUM-01**: User can view daily spending summary with total amount and transaction count
- [x] **SUM-02**: User can view weekly spending summary with day-by-day breakdown
- [x] **SUM-03**: User can view monthly spending summary with comparison to previous months
- [x] **SUM-04**: User can switch between time periods (daily/weekly/monthly) via tab or selector

### Transaction Categorization

- [x] **CAT-01**: Transactions are automatically categorized based on UPI merchant/vpa
- [x] **CAT-02**: User can view spending by category (Food, Transport, Shopping, Bills, Entertainment, Others)
- [x] **CAT-03**: User can see category breakdown with percentage and amount
- [x] **CAT-04**: User can manually recategorize a transaction
- [x] **CAT-05**: Category suggestions improve over time based on user corrections

### Spending Insights

- [x] **INS-01**: User receives weekly spending insight (e.g., "You spent 30% more on dining this week")
- [x] **INS-02**: User can view top spending categories ranked by amount
- [x] **INS-03**: User can see spending trends over time (increasing/decreasing)
- [x] **INS-04**: App suggests categories where spending can be reduced

### Visualization

- [x] **VIS-01**: User can view spending as pie/donut chart by category
- [x] **VIS-02**: User can view spending as bar chart over time periods
- [x] **VIS-03**: User can view spending as line chart for trends

### Budgeting

- [x] **BUD-01**: User can set monthly budget limits per category
- [x] **BUD-02**: User receives warning when approaching budget limit (80%)
- [x] **BUD-03**: User receives alert when budget is exceeded

## v2 Requirements

### Advanced Features

- **SPLT-01**: User can split expenses with others via UPI Circle
- **SUBS-01**: User can track recurring subscriptions (OTT, apps, EMIs)
- **FAM-01**: Family mode to track household spending
- **CC-01**: Credit card spending tracking

## Out of Scope

| Feature | Reason |
|---------|--------|
| Manual transaction entry | Focus on auto-capture from notifications |
| Investment tracking | Spending only for v1 |
| iOS support | Android-only (NotificationListenerService) |
| Bill payment reminders | Out of scope for v1 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SUM-01 | Phase 1 | Done |
| SUM-02 | Phase 1 | Done |
| SUM-03 | Phase 1 | Done |
| SUM-04 | Phase 1 | Done |
| CAT-01 | Phase 1 | Done |
| CAT-02 | Phase 1 | Done |
| CAT-03 | Phase 1 | Done |
| CAT-04 | Phase 1 | Done |
| CAT-05 | Phase 1 | Done |
| INS-01 | Phase 1 | Done |
| INS-02 | Phase 1 | Done |
| INS-03 | Phase 1 | Done |
| INS-04 | Phase 1 | Done |
| VIS-01 | Phase 1 | Done |
| VIS-02 | Phase 1 | Done |
| VIS-03 | Phase 1 | Done |
| BUD-01 | Phase 1 | Done |
| BUD-02 | Phase 1 | Done |
| BUD-03 | Phase 1 | Done |

**Coverage:**
- v1 requirements: 19 total
- Mapped to phases: 19
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-24*
*Last updated: 2026-02-25 after requirements/evidence reconciliation pass*
