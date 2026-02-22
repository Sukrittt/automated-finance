import type { SourceApp } from '../parsing/upiParser';

export interface IngestNotificationEvent {
  event_id: string;
  source_app: SourceApp;
  received_at: string;
  notification_title: string;
  notification_body: string;
  raw_payload_hash: string;
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
