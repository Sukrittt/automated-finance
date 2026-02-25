# Start Here

## How You Use Codex Efficiently

## Step 1: Open with a tight objective

Paste this at session start:

```md
Goal: <single concrete outcome>
Scope in: <what is included>
Scope out: <what is excluded>
Done when: <measurable acceptance criteria>
Repo: <absolute app repo path>
Relevant docs: .planning/TASK_BOARD.md, .planning/STATUS_LOG.md, .planning/DECISIONS.md
Constraints: <time, tools, dependency limits>
Start by reading: current planning docs only
```

## Step 2: Ask for micro-plan

```md
Read current state from `.planning/STATUS_LOG.md`, `.planning/TASK_BOARD.md`, `.planning/DECISIONS.md`, then propose today’s implementation plan.
```

## Step 3: Run build scope tightly

```md
Implement only Task IDs <IDs>. Do not expand scope.
```

## Step 4: Verify against acceptance criteria

```md
Run required checks and map results to acceptance criteria.
```

## Step 5: Close with handoff

```md
Update docs and produce next-session starter brief.
```

## Step 6: Ship session changes

```md
Use the yeet skill to stage, commit, push, and open PR; then merge to main after checks/review pass.
```

## Session Management Rules

- One feature slice per session.
- Never skip doc updates.
- Never close session without a next first step.
- Log all new decisions in `DECISIONS.md`.
- After every session, use `yeet` and complete merge to `main`.
- Default to app-only iteration mode; defer release/cohort operations until final pre-release pass.
