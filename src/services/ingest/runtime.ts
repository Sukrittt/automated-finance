import { getLastCapturedNotification, isNotificationAccessEnabled } from '../notifications/nativeListener';
import type { TelemetryReporter } from '../telemetry/reporter';
import { createNotificationIngestService, NotificationIngestService } from './notificationIngestService';

let ingestService: NotificationIngestService | null = null;

export function startIngestRuntime(telemetryReporter?: TelemetryReporter): void {
  if (ingestService) {
    return;
  }

  ingestService = createNotificationIngestService({
    isNotificationAccessEnabled,
    getLastCapturedNotification,
    getDeviceId: () => process.env.EXPO_PUBLIC_DEVICE_ID?.trim() || 'local-device',
    telemetryReporter
  });

  ingestService.start();
}

export function stopIngestRuntime(): void {
  if (!ingestService) {
    return;
  }

  ingestService.stop();
  ingestService = null;
}
