import { NotificationIngestService } from '../../../src/services/ingest/notificationIngestService';
import * as ingestApi from '../../../src/services/ingest/api';

describe('NotificationIngestService', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('ingests latest notification and skips duplicate payload', async () => {
    const postedAt = Date.parse('2026-02-22T10:41:23.000Z');
    const notification = {
      packageName: 'com.google.android.apps.nbu.paisa.user',
      title: 'Google Pay',
      body: 'Paid ₹250 to ABC Store via UPI Ref 123456789012',
      postedAt
    };

    const postSpy = jest
      .spyOn(ingestApi, 'postNotificationIngestBatch')
      .mockResolvedValue({
        accepted: 1,
        deduped: 0,
        rejected: 0,
        transactions_created: 1,
        review_queue_added: 0
      });

    const service = new NotificationIngestService({
      isNotificationAccessEnabled: () => true,
      getLastCapturedNotification: () => notification,
      getDeviceId: () => 'device_1'
    });

    await service.runOnce(postedAt);
    await service.runOnce(postedAt + 1000);

    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(service.getQueueSize()).toBe(0);
  });

  it('keeps queue items when no device id is available yet', async () => {
    const postedAt = Date.parse('2026-02-22T10:41:23.000Z');

    const postSpy = jest
      .spyOn(ingestApi, 'postNotificationIngestBatch')
      .mockResolvedValue({
        accepted: 1,
        deduped: 0,
        rejected: 0,
        transactions_created: 1,
        review_queue_added: 0
      });

    const service = new NotificationIngestService({
      isNotificationAccessEnabled: () => true,
      getLastCapturedNotification: () => ({
        packageName: 'com.google.android.apps.nbu.paisa.user',
        title: 'Google Pay',
        body: 'Paid ₹250 to ABC Store via UPI Ref 123456789012',
        postedAt
      }),
      getDeviceId: () => null
    });

    await service.runOnce(postedAt);

    expect(postSpy).toHaveBeenCalledTimes(0);
    expect(service.getQueueSize()).toBe(1);
  });

  it('emits telemetry for parse failures and queue samples', async () => {
    const track = jest.fn();
    const service = new NotificationIngestService({
      isNotificationAccessEnabled: () => true,
      getLastCapturedNotification: () => ({
        packageName: 'com.whatsapp',
        title: 'New message',
        body: 'hello',
        postedAt: Date.parse('2026-02-22T10:41:23.000Z')
      }),
      getDeviceId: () => 'device_1',
      telemetryReporter: { track }
    });

    await service.runOnce();

    expect(track).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'ingest_parse_failed'
      })
    );
    expect(track).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'ingest_queue_size_sample',
        properties: expect.objectContaining({
          queue_size: 0
        })
      })
    );
  });

  it('emits telemetry for enqueue and flush', async () => {
    const postSpy = jest
      .spyOn(ingestApi, 'postNotificationIngestBatch')
      .mockResolvedValue({
        accepted: 1,
        deduped: 0,
        rejected: 0,
        transactions_created: 1,
        review_queue_added: 0
      });
    const track = jest.fn();

    const service = new NotificationIngestService({
      isNotificationAccessEnabled: () => true,
      getLastCapturedNotification: () => ({
        packageName: 'com.google.android.apps.nbu.paisa.user',
        title: 'Google Pay',
        body: 'Paid ₹250 to ABC Store via UPI Ref 123456789012',
        postedAt: Date.parse('2026-02-22T10:41:23.000Z')
      }),
      getDeviceId: () => 'device_1',
      telemetryReporter: { track }
    });

    await service.runOnce();

    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'ingest_event_enqueued'
      })
    );
    expect(track).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'ingest_flush_succeeded',
        properties: expect.objectContaining({
          batch_size: 1
        })
      })
    );
  });
});
