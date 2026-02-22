import type { CapturedNotification } from '../notifications/nativeListener';
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
};

export class NotificationIngestService {
  private readonly queue = new IngestOfflineQueue();

  private readonly seenFingerprints = new Map<string, number>();

  private readonly pollIntervalMs: number;

  private intervalId: ReturnType<typeof setInterval> | null = null;

  private lastNotificationSignature: string | null = null;

  constructor(private readonly deps: NotificationIngestDependencies) {
    this.pollIntervalMs = deps.pollIntervalMs ?? 3000;
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
    }, nowMs);
  }

  getQueueSize(): number {
    return this.queue.size();
  }

  private captureNotification(notification: CapturedNotification, nowMs: number): void {
    const mapped = mapCapturedNotificationToIngestEvent(notification);

    if (!mapped) {
      return;
    }

    if (this.seenFingerprints.has(mapped.dedupeFingerprint)) {
      return;
    }

    this.seenFingerprints.set(mapped.dedupeFingerprint, nowMs);
    this.queue.enqueue(mapped.apiEvent, nowMs);
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
