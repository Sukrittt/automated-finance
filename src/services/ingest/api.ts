import { apiRequest } from '../api/client';
import type { IngestBatchRequest, IngestBatchResponse, IngestNotificationEvent } from './types';

export async function postNotificationIngestBatch(
  deviceId: string,
  events: IngestNotificationEvent[],
  token?: string
): Promise<IngestBatchResponse> {
  const payload: IngestBatchRequest = {
    device_id: deviceId,
    events
  };

  return apiRequest<IngestBatchResponse>('/v1/ingest/notifications/batch', {
    method: 'POST',
    body: payload,
    token
  });
}
