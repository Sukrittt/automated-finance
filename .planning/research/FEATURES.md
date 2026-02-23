# Feature Landscape

**Domain:** UPI Payment Tracking / Personal Finance Apps in India
**Researched:** 2026-02-23
**Overall confidence:** MEDIUM

## Table Stakes

Features users expect. Missing = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Automatic transaction capture | Core value prop - manual entry is friction, users churn | High | App already has this via NotificationListenerService |
| Transaction listing with filters | Basic UX - must see history, filter by date/amount | Low | Existing TransactionsScreen covers this |
| Category tagging | Users need to understand spend patterns | Medium | Parser extracts merchant, but categorization is manual review |
| Basic spending insights | Weekly/monthly totals, top categories | Medium | Existing InsightsScreen shows weekly summary |
| Multi-app UPI parsing | GPay, PhonePe, Paytm, BHIM coverage | Medium | Existing template-based parser handles this |
| Transaction deduplication | Notifications can be duplicated | Low | Existing FNV-1a fingerprint approach |
| Offline queue with retry | Network failures happen | Medium | Existing offline queue with exponential backoff |
| Authentication (OTP + Google) | Basic security, personalization | Medium | Existing Supabase + Firebase auth |
| Budget setting | Users want to control spending | Low | Not yet implemented - planned |
| Budget alerts | Notify before overspending | Low | Not yet implemented - planned |

## Differentiators

Features that set product apart. Not expected, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| AI-powered auto-categorization | No manual tagging needed | High | ML model to classify merchant → category |
| Smart merchant recognition | Auto-detect "Swiggy", "Zomato" → Food | Medium | Extend parser with merchant DB |
| Family/group expense sharing | Track family spend, split bills | Medium | BHIM 3.0 launched this in 2025 |
| Subscription tracking | Detect and warn about recurring payments | Medium | Very valuable for Indian users |
| Bill reminders & auto-pay | Proactive bill management | Medium | Jupiter offers this |
| Credit card tracking | Indians use 5+ credit cards | High | Requires bank SMS parsing |
| Financial wellness score | Gamification + motivation | Low | Jupiter, Moneyview offer this |
| Savings goals with progress | Goal-based budgeting | Low | Easy to add |
| Export to Excel/CSV | Power user requirement | Low | Often requested |
| Recurring transaction insights | "Your Netflix increased by 20%" | Medium | Requires pattern detection |
| Split expenses (UPI) | Split bills with friends | Medium | BHIM, PhonePe have this |
| Investment tracking | FD, Mutual Funds, Stocks | High | Out of scope for v1 |
| Tax preparation helper | Categorize as business/personal | Medium | Export with categories |

## Anti-Features

Features to explicitly NOT build.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Manual transaction entry | Violates core value - automatic capture | Focus on capture reliability |
| iOS support | Android-only NotificationListenerService | Stick to Android, can revisit later |
| Investment tracking (v1) | Scope creep, adds significant complexity | Keep focus on UPI spending |
| Bank account aggregation | Requires bank API partnerships, complex | Stay notification-based |
| Peer-to-peer lending | Regulatory complexity, out of scope | Keep to tracking |
| Credit score monitoring | Not core to spending tracking | Integrate later if needed |
| Cryptocurrency tracking | Not relevant for Indian mass market | Skip entirely |

## Feature Dependencies

```
Notification Capture → UPI Parsing → Transaction List → Insights
                                         ↓
                              Category Tagging → Budget Alerts
                                         ↓
                              AI Auto-Categorization (future)

Transaction List → Export
              ↓
Subscription Detection → Bill Reminders

Transaction History → Family Expense Sharing (requires auth/multi-user)
```

## MVP Recommendation

Prioritize:
1. **Automatic transaction capture** - existing, improve reliability
2. **Transaction listing** - existing, add filters
3. **Basic category tagging** - manual first, then AI assist
4. **Budget alerts** - high value, low complexity
5. **Subscription tracking** - highly requested in India

Defer:
- **Credit card tracking**: Requires bank SMS parsing, different from UPI
- **Investment tracking**: Explicitly out of scope for v1
- **Family sharing**: Requires multi-user infrastructure

## Sources

- Budget Beacon: "Top Budgeting Apps for Indian Users in 2026" (Nov 2025)
- The New Indian Express: "UPI app that helps track your spendings" (Jan 2026)
- Jupiter Money: Product features (jupiter.money/money)
- Moneyview: "Best Expense Tracker Apps in India 2026" (Feb 2026)
- CrunchyFin: "Best AI Budgeting Apps and Tools in India (2026 Edition)"
- Economic Times: "BHIM 3.0 launched with new features" (Mar 2025)
- Reddit r/personalfinanceindia: User discussions on expense tracking apps
- Fintech Deepak: "Best Expense Tracker Apps in India 2025"
- SmartGullak: "Best Budgeting & Expense Tracker Apps India 2025"
