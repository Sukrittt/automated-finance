# Data Model (Draft)

## Principles

- Amounts stored in integer paise.
- Store normalized fields only for privacy baseline.
- Keep provenance for source app and confidence scoring.

## Entities

### `transactions`
- `id`
- `user_id`
- `source_app`
- `txn_timestamp`
- `amount_paise`
- `merchant_label`
- `vpa_handle`
- `dedupe_fingerprint`
- `parse_confidence`
- `category`
- `review_state` (`pending`, `approved`, `corrected`)
- `created_at`
- `updated_at`

### `category_predictions`
- `id`
- `transaction_id`
- `predicted_category`
- `confidence`
- `model_version` (or ruleset version)
- `created_at`

### `user_category_overrides`
- `id`
- `user_id`
- `match_key` (merchant or vpa pattern)
- `assigned_category`
- `applied_count`
- `created_at`
- `updated_at`

### `budget_limits`
- `id`
- `user_id`
- `category`
- `monthly_limit_paise`
- `month_key`
- `created_at`
- `updated_at`

### `budget_events`
- `id`
- `user_id`
- `category`
- `month_key`
- `threshold` (`80`, `100`)
- `triggered_at`

### `insight_snapshots`
- `id`
- `user_id`
- `week_start`
- `insight_type`
- `title`
- `reason`
- `impact_estimate_paise`
- `created_at`

### `parser_failure_events`
- `id`
- `user_id`
- `source_app`
- `reason_code`
- `confidence`
- `created_at`

## Retention and Privacy

- Do not persist raw notification body in long-term storage.
- Log only reason codes and normalized metadata for diagnostics.

