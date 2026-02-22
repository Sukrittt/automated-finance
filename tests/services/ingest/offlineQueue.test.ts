import { HttpError } from '../../../src/services/api/client';
import { IngestOfflineQueue } from '../../../src/services/ingest/offlineQueue';

describe('IngestOfflineQueue', () => {
  const event = {
    event_id: 'evt_1',
    source_app: 'gpay' as const,
    received_at: '2026-02-22T10:41:23.000Z',
    notification_title: 'Google Pay',
    notification_body: 'Paid ₹250 to ABC Store via UPI Ref 123456789012',
    raw_payload_hash: 'fnv1a:abc123'
  };

  it('flushes due events on successful send', async () => {
    const queue = new IngestOfflineQueue({ jitterMs: 0 });
    queue.enqueue(event, 1000);

    const sendBatch = jest.fn(async () => undefined);
    const result = await queue.flush(sendBatch, 1000);

    expect(sendBatch).toHaveBeenCalledTimes(1);
    expect(result.sent).toBe(1);
    expect(result.queued).toBe(0);
    expect(queue.size()).toBe(0);
  });

  it('schedules retry for retryable failures and succeeds later', async () => {
    const queue = new IngestOfflineQueue({ jitterMs: 0, initialBackoffMs: 2000 });
    queue.enqueue(event, 1000);

    const sendBatch = jest
      .fn()
      .mockRejectedValueOnce(new HttpError(503, 'UNAVAILABLE', 'temporary outage'))
      .mockResolvedValueOnce(undefined);

    const first = await queue.flush(sendBatch, 1000);
    expect(first.retryScheduled).toBe(1);
    expect(first.queued).toBe(1);

    const tooEarly = await queue.flush(sendBatch, 2999);
    expect(tooEarly.sent).toBe(0);
    expect(sendBatch).toHaveBeenCalledTimes(1);

    const second = await queue.flush(sendBatch, 3000);
    expect(second.sent).toBe(1);
    expect(second.queued).toBe(0);
    expect(queue.size()).toBe(0);
  });

  it('drops non-retryable errors immediately', async () => {
    const queue = new IngestOfflineQueue({ jitterMs: 0 });
    queue.enqueue(event, 1000);

    const sendBatch = jest.fn().mockRejectedValue(new HttpError(400, 'BAD_REQUEST', 'invalid payload'));
    const result = await queue.flush(sendBatch, 1000);

    expect(result.dropped).toBe(1);
    expect(result.queued).toBe(0);
    expect(queue.size()).toBe(0);
  });
});
