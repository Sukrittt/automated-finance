import { HttpError } from '../api/client';
import type { IngestNotificationEvent } from './types';

interface QueuedIngestEvent {
  enqueuedAt: number;
  nextAttemptAt: number;
  attemptCount: number;
  event: IngestNotificationEvent;
}

type QueueOptions = {
  maxAttempts?: number;
  initialBackoffMs?: number;
  maxBackoffMs?: number;
  jitterMs?: number;
};

type FlushResult = {
  sent: number;
  queued: number;
  retryScheduled: number;
  dropped: number;
};

export class IngestOfflineQueue {
  private readonly queue: QueuedIngestEvent[] = [];

  private readonly maxAttempts: number;

  private readonly initialBackoffMs: number;

  private readonly maxBackoffMs: number;

  private readonly jitterMs: number;

  constructor(options: QueueOptions = {}) {
    this.maxAttempts = options.maxAttempts ?? 5;
    this.initialBackoffMs = options.initialBackoffMs ?? 2000;
    this.maxBackoffMs = options.maxBackoffMs ?? 5 * 60 * 1000;
    this.jitterMs = options.jitterMs ?? 500;
  }

  enqueue(event: IngestNotificationEvent, nowMs = Date.now()): void {
    this.queue.push({
      event,
      enqueuedAt: nowMs,
      nextAttemptAt: nowMs,
      attemptCount: 0
    });
  }

  size(): number {
    return this.queue.length;
  }

  async flush(
    sendBatch: (events: IngestNotificationEvent[]) => Promise<void>,
    nowMs = Date.now(),
    maxBatchSize = 20
  ): Promise<FlushResult> {
    const dueIndexes = this.queue
      .map((entry, index) => ({ entry, index }))
      .filter(({ entry }) => entry.nextAttemptAt <= nowMs)
      .slice(0, maxBatchSize);

    if (dueIndexes.length === 0) {
      return {
        sent: 0,
        queued: this.queue.length,
        retryScheduled: 0,
        dropped: 0
      };
    }

    try {
      await sendBatch(dueIndexes.map(({ entry }) => entry.event));

      this.removeIndexes(dueIndexes.map(({ index }) => index));

      return {
        sent: dueIndexes.length,
        queued: this.queue.length,
        retryScheduled: 0,
        dropped: 0
      };
    } catch (error) {
      const retryable = isRetryableError(error);
      let retryScheduled = 0;
      let dropped = 0;

      for (const { entry } of dueIndexes) {
        entry.attemptCount += 1;

        if (!retryable || entry.attemptCount >= this.maxAttempts) {
          dropped += 1;
          continue;
        }

        retryScheduled += 1;
        const delay = getBackoffMs(entry.attemptCount, this.initialBackoffMs, this.maxBackoffMs, this.jitterMs);
        entry.nextAttemptAt = nowMs + delay;
      }

      this.removeIndexes(
        dueIndexes
          .filter(({ entry }) => !retryable || entry.attemptCount >= this.maxAttempts)
          .map(({ index }) => index)
      );

      return {
        sent: 0,
        queued: this.queue.length,
        retryScheduled,
        dropped
      };
    }
  }

  private removeIndexes(indexes: number[]): void {
    if (indexes.length === 0) {
      return;
    }

    const indexSet = new Set(indexes);
    const kept = this.queue.filter((_, index) => !indexSet.has(index));
    this.queue.length = 0;
    this.queue.push(...kept);
  }
}

function isRetryableError(error: unknown): boolean {
  if (error instanceof HttpError) {
    return error.status >= 500 || error.status === 429;
  }

  return true;
}

function getBackoffMs(attemptCount: number, initialMs: number, maxMs: number, jitterMs: number): number {
  const exponential = Math.min(maxMs, initialMs * 2 ** Math.max(0, attemptCount - 1));
  const jitter = jitterMs <= 0 ? 0 : Math.floor(Math.random() * jitterMs);
  return exponential + jitter;
}
