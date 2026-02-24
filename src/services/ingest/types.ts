import type { SourceApp } from '../parsing/upiParser';

export interface IngestNotificationEvent {
  event_id: string;
  source_app: SourceApp;
  received_at: string;
  notification_title: string;
  notification_body: string;
  raw_payload_hash: string;
  parsed_amount_paise: number;
  parsed_direction: 'debit' | 'credit';
  parsed_merchant_raw: string;
  parsed_merchant_normalized: string;
  parsed_upi_ref?: string;
  parser_template: string;
  parse_confidence: number;
  review_required: boolean;
  category_prediction?: string;
  category_prediction_confidence?: number;
}

export interface IngestBatchRequest {
  device_id: string;
  events: IngestNotificationEvent[];
}

export interface IngestBatchResponse {
  accepted: number;
  deduped: number;
  rejected: number;
  transactions_created: number;
  review_queue_added: number;
}

export interface MappedIngestEvent {
  apiEvent: IngestNotificationEvent;
  dedupeFingerprint: string;
}
