# Risks

## Open Risks

| Risk ID | Area | Description | Severity | Mitigation | Trigger | Status |
|---|---|---|---|---|---|---|
| R-001 | Auth | Firebase OTP costs or delivery issues may slow rollout | High | Monitor OTP success/failure and fallback options; enforce retry UX | OTP success rate drops below target | Open |
| R-002 | Parsing | Notification format variance across app versions can reduce extraction accuracy | High | Maintain test corpus and parser confidence routing | Accuracy falls below 95% | Open |
| R-003 | Categorization | Low-confidence category mapping may reduce trust | Medium | Review queue + user correction learning loop | Precision below 90% | Open |
| R-004 | Scope | Full insights MVP could create timeline pressure | Medium | Enforce one-slice sessions and strict scope boundaries | Repeated spillover across sessions | Open |
| R-005 | Repo split | Planning repo and app repo drift | Medium | Canonical status updates in this repo each session | Missing status updates for >1 session | Open |

## Closed Risks

- None yet.

