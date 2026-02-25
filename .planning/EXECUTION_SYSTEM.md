# Codex Execution System

## Purpose

Use this repo as the canonical planning and execution control center while implementation happens in the app code repo.

## Session Workflow

### 1. Start with one objective

Use this format at the beginning of every session:

```md
Goal:
Scope in:
Scope out:
Done when:
Repo:
Relevant docs:
Constraints:
Start by reading:
```

### 2. Request micro-plan before coding

Use this exact prompt:

```md
Read current state from `.planning/STATUS_LOG.md`, `.planning/TASK_BOARD.md`, `.planning/DECISIONS.md`, then propose today’s implementation plan.
```

Micro-plan must include:
- 3 to 8 steps
- risks/blockers
- env/dependency checks
- exact tests to run

### 3. Execute in small batches

- One feature slice or one bug cluster per batch.
- After each batch:
  - run tests/checks
  - summarize evidence
  - update planning docs

### 3.5 Ship each completed section before starting the next

- If a full section/outcome bundle is completed, immediately ship it:
  - create branch + commit + push
  - open PR
  - merge to `main` once checks/review are green
- Do not start the next major section while previous completed section is still unmerged.

### 4. Close with handoff package

Use this exact prompt:

```md
Update docs and produce next-session starter brief.
```

Required closeout sections:
- Completed
- Not completed
- Tests run + result
- Docs updated
- Open risks
- Next session first step
- PR + merge status (`yeet` flow)

## Allowed Prompt Set Per Session

1. Planning
- `Read current state from .planning docs and propose today’s implementation plan.`

2. Build
- `Implement only Task IDs X, Y, Z. Do not expand scope.`

3. Verify
- `Run required checks and map results to acceptance criteria.`

4. Closeout
- `Update docs and produce next-session starter brief.`

5. Ship
- `Use the yeet skill to stage, commit, push, and open PR; then merge to main after checks/review pass.`

## Documentation Rules (Non-Negotiable)

- `TASK_BOARD.md`: status + dependencies
- `STATUS_LOG.md`: dated update + evidence + next step
- `DECISIONS.md`: every new product/architecture decision
- `RISKS.md`: blockers + mitigation
- `TEST_MATRIX.md`: scenarios covered + gaps

## Branch and Commit Rules

- Branch naming: `codex/<feature-slice>`
- Keep commits small and mapped to task IDs.
- After every session closeout, run the `yeet` skill for commit/push/PR creation.
- Do not leave session work unshipped: merge the session PR to `main` once checks/review are green.
- For every completed full section, PR + merge is mandatory before moving to the next section.
- PR must include:
  - implemented tasks
  - test evidence
  - risk notes
  - rollback note

## Cadence

- Session A (Plan + Setup): 30 to 60 min
- Session B (Implementation): 60 to 120 min
- Session C (Verification + Docs): 30 to 60 min
- Milestone cycle: every 3 to 5 days

## Anti-Patterns

- Multiple unrelated features in one session
- Coding before acceptance criteria
- Session close without doc updates
- Implicit decisions not written in `DECISIONS.md`

## Defaults

- Canonical docs stay in this planning repo.
- Implementation occurs in separate app repo path.
- One milestone slice per session for speed and quality.

## Current Mode (App-Only Iteration)

- Active priority: app development and UX iteration only.
- Defer release/cohort/beta-ops execution tasks until final pre-release pass.
- During this mode, prefer screen-level implementation + tests over operational checklist work.
