# Next Session Starter Brief

## Objective
- Start `P2-T1`: category rules engine baseline using parsed UPI fields and review queue feedback loop.

## Current State
- `P1-T1` DONE: parser corpus for GPay/PhonePe/Paytm/BHIM is in place.
- `P1-T2` DONE: extraction validation test enforces amount KPI `>=95%` (currently `100%`, `12/12`).
- Ingest payload now carries parse confidence and review routing signal:
  - `review_required = parse_confidence < 0.90`

## Read First
- `.planning/STATUS_LOG.md`
- `.planning/TASK_BOARD.md`
- `.planning/DECISIONS.md`
- `.planning/TEST_MATRIX.md`

## Suggested First Commands
- `npm test -- tests/services/parsing/upiParser.corpus.test.ts tests/services/ingest/payloadMapper.test.ts`
- `rg -n "category|suggestedCategory|review_status|confidence" src tests`

## Guardrails
- Keep scope to one feature slice only (`P2-T1`).
- Do not change UI polish/budgeting/insights.
- Update `.planning` docs at close with evidence and KPI impact.
