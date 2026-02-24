# API Contract (v1 Draft)

## Base

- Version: `v1`
- Style: REST JSON
- Auth: Bearer token

## Endpoints

### POST `/v1/ingest/transactions`
- Purpose: upsert parsed transactions from app.
- Request fields (draft):
  - `client_batch_id`
  - `transactions[]`:
    - `source_app`
    - `txn_timestamp`
    - `amount_paise`
    - `merchant_label`
    - `vpa_handle`
    - `dedupe_fingerprint`
    - `parse_confidence`
    - `category_prediction` (optional)
- Response:
  - `accepted_count`
  - `duplicate_count`
  - `review_queue_count`

### GET `/v1/summary`
- Query: `period=daily|weekly|monthly`, `from`, `to`
- Response:
  - `total_spend_paise`
  - `transaction_count`
  - `breakdown[]`

### GET `/v1/categories/breakdown`
- Query: `from`, `to`
- Response:
  - `categories[]` with `amount_paise`, `percentage`

### PATCH `/v1/transactions/:id/category`
- Purpose: manual recategorization.
- Request:
  - `category`
- Response:
  - updated transaction + recalculated prediction metadata

### GET `/v1/insights/weekly`
- Query: `week_start`
- Response:
  - `insights[]`:
    - `title`
    - `reason`
    - `impact_estimate_paise`

### PUT `/v1/budgets/:category`
- Request:
  - `monthly_limit_paise`
- Response:
  - saved budget config

### GET `/v1/budgets/status`
- Query: `month`
- Response:
  - category usage
  - threshold flags (80%, 100%)

## Error Model

- Standard:
  - `code`
  - `message`
  - `details` (optional)
- Common codes:
  - `VALIDATION_ERROR`
  - `UNAUTHORIZED`
  - `DUPLICATE_BATCH`
  - `RATE_LIMITED`
  - `SERVER_ERROR`

