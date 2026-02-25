# UI Revamp Task Board (Playful v2)

## Legend
- Status: TODO | IN_PROGRESS | BLOCKED | DONE
- Priority: P0 (must) | P1 (important) | P2 (later)

## Phase RV0 — Foundations
| ID | Priority | Task | Status | Dependency | Acceptance |
|---|---|---|---|---|---|
| RV0-T1 | P0 | Lock v2 color + typography tokens | DONE | None | Tokens added and referenced by core text/theme primitives |
| RV0-T2 | P0 | Add motion/haptic design map | DONE | RV0-T1 | Event-to-feedback map added with shared wrapper wiring |
| RV0-T3 | P0 | Add playful component primitives (StreakPill, MissionCard, CoachBubble, ProgressRing) | DONE | RV0-T1 | Components added and lightly integrated on dashboard |

## Phase RV1 — Core Loop (Home/Review/Insights/Nav)
| ID | Priority | Task | Status | Dependency | Acceptance |
|---|---|---|---|---|---|
| RV1-T1 | P0 | Implement daily streak state model + storage | DONE | RV0-T2 | Streak survives app restarts and day rollover |
| RV1-T2 | P0 | Implement daily mission generator (2-3/day) | DONE | RV1-T1 | Missions generated based on available data |
| RV1-T3 | P0 | Revamp dashboard into progress board | IN_PROGRESS | RV0-T3 | Home shows streak, missions, spend pulse |
| RV1-T4 | P0 | Revamp review queue into quick-win flow + celebrations | DONE | RV1-T2 | Completion feedback includes counter + haptic |
| RV1-T5 | P0 | Revamp insights into weekly story cards | DONE | RV1-T2 | Story, win, next-action blocks visible |
| RV1-T6 | P1 | Animated bottom nav with badges (streak/review count) | DONE | RV0-T3 | Badge state updates live |

## Phase RV2 — Expansion (Transactions/Budgets/Onboarding/Settings)
| ID | Priority | Task | Status | Dependency | Acceptance |
|---|---|---|---|---|---|
| RV2-T1 | P1 | Transactions visual rhythm + playful filters | DONE | RV1-T6 | Improved scanability, no behavior regressions |
| RV2-T2 | P1 | Budget progress tracks + warning visuals | DONE | RV1-T2 | Budget state clearly encoded by thresholds |
| RV2-T3 | P1 | Onboarding refresh with value + coach intro | DONE | RV0-T3 | Permission/value story clearer and faster |
| RV2-T4 | P1 | Settings: motion/haptic/notification controls | DONE | RV0-T2 | User can tune intensity/accessibility |

## Phase RV3 — Re-engagement
| ID | Priority | Task | Status | Dependency | Acceptance |
|---|---|---|---|---|---|
| RV3-T1 | P0 | Smart reminder notifications (streak risk + recap) | DONE | RV1-T1 | Reminder logic and copy shipped |
| RV3-T2 | P1 | Notification A/B copy variants | DONE | RV3-T1 | CTR and return-open tracked |

## Phase RV4 — Quality + Rollout
| ID | Priority | Task | Status | Dependency | Acceptance |
|---|---|---|---|---|---|
| RV4-T1 | P0 | Unit tests for streak/missions/rewards | DONE | RV1-T1 | Deterministic test coverage complete |
| RV4-T2 | P0 | UI tests for new core screens/states | DONE | RV1-T3 | Snapshot + behavior tests passing |
| RV4-T3 | P0 | Feature flags + staged rollout | DONE | RV4-T1 | Flags wired and rollout checklist ready |
| RV4-T4 | P1 | Post-MVP leaderboard readiness hooks (no UI launch) | DONE | RV3-T1 | Event/schema hooks in place |

## Explicit Out of Scope (for this revamp)
- Full social leaderboard launch
- Competitive ranking UX
- Public profile system
