import type { CapturedNotification } from '../notifications/nativeListener';
import { getNoopTelemetryReporter, type TelemetryReporter } from '../telemetry/reporter';
import { IngestOfflineQueue } from './offlineQueue';
import { mapCapturedNotificationToIngestEvent } from './payloadMapper';
import { postNotificationIngestBatch } from './api';
import type { IngestNotificationEvent } from './types';

type NotificationIngestDependencies = {
  isNotificationAccessEnabled: () => boolean;
  getLastCapturedNotification: () => CapturedNotification | null;
  getDeviceId: () => string | null;
  getAuthToken?: () => string | undefined;
  pollIntervalMs?: number;
  telemetryReporter?: TelemetryReporter;
};

export class NotificationIngestService {
  private readonly queue = new IngestOfflineQueue();

  private readonly seenFingerprints = new Map<string, number>();

  private readonly pollIntervalMs: number;
  private readonly telemetryReporter: TelemetryReporter;

  private intervalId: ReturnType<typeof setInterval> | null = null;

  private lastNotificationSignature: string | null = null;

  constructor(private readonly deps: NotificationIngestDependencies) {
    this.pollIntervalMs = deps.pollIntervalMs ?? 3000;
    this.telemetryReporter = deps.telemetryReporter ?? getNoopTelemetryReporter();
  }

  start(): void {
    if (this.intervalId) {
      return;
    }

    this.intervalId = setInterval(() => {
      void this.runOnce();
    }, this.pollIntervalMs);

    void this.runOnce();
  }

  stop(): void {
    if (!this.intervalId) {
      return;
    }

    clearInterval(this.intervalId);
    this.intervalId = null;
  }

  async runOnce(nowMs = Date.now()): Promise<void> {
    this.pruneSeenFingerprints(nowMs);

    if (!this.deps.isNotificationAccessEnabled()) {
      return;
    }

    const latest = this.deps.getLastCapturedNotification();

    if (latest) {
      const signature = getNotificationSignature(latest);
      if (signature !== this.lastNotificationSignature) {
        this.lastNotificationSignature = signature;
        this.captureNotification(latest, nowMs);
      }
    }

    const deviceId = this.deps.getDeviceId();

    if (!deviceId) {
      return;
    }

    const token = this.deps.getAuthToken?.();

    await this.queue.flush(async (events: IngestNotificationEvent[]) => {
      await postNotificationIngestBatch(deviceId, events, token);
      this.telemetryReporter.track({
        name: 'ingest_flush_succeeded',
        atISO: new Date().toISOString(),
        properties: {
          batch_size: events.length
        }
      });
    }, nowMs);

    this.telemetryReporter.track({
      name: 'ingest_queue_size_sample',
      atISO: new Date().toISOString(),
      properties: {
        queue_size: this.getQueueSize()
      }
    });
  }

  getQueueSize(): number {
    return this.queue.size();
  }

  private captureNotification(notification: CapturedNotification, nowMs: number): void {
    const mapped = mapCapturedNotificationToIngestEvent(notification);

    if (!mapped) {
      this.telemetryReporter.track({
        name: 'ingest_parse_failed',
        atISO: new Date().toISOString(),
        properties: {
          package_name: notification.packageName
        }
      });
      return;
    }

    if (this.seenFingerprints.has(mapped.dedupeFingerprint)) {
      this.telemetryReporter.track({
        name: 'ingest_duplicate_dropped',
        atISO: new Date().toISOString(),
        properties: {
          source_app: mapped.apiEvent.source_app
        }
      });
      return;
    }

    this.seenFingerprints.set(mapped.dedupeFingerprint, nowMs);
    this.queue.enqueue(mapped.apiEvent, nowMs);
    this.telemetryReporter.track({
      name: 'ingest_event_enqueued',
      atISO: new Date().toISOString(),
      properties: {
        source_app: mapped.apiEvent.source_app,
        review_required: mapped.apiEvent.review_required
      }
    });
  }

  private pruneSeenFingerprints(nowMs: number): void {
    const retentionMs = 6 * 60 * 60 * 1000;

    for (const [fingerprint, seenAt] of this.seenFingerprints.entries()) {
      if (nowMs - seenAt > retentionMs) {
        this.seenFingerprints.delete(fingerprint);
      }
    }
  }
}

export function createNotificationIngestService(deps: NotificationIngestDependencies): NotificationIngestService {
  return new NotificationIngestService(deps);
}

function getNotificationSignature(notification: CapturedNotification): string {
  return [
    notification.packageName,
    String(notification.postedAt),
    notification.title ?? '',
    notification.body ?? ''
  ].join('|');
}
