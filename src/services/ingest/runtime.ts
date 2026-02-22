import { getLastCapturedNotification, isNotificationAccessEnabled } from '../notifications/nativeListener';
import { createNotificationIngestService, NotificationIngestService } from './notificationIngestService';

let ingestService: NotificationIngestService | null = null;

export function startIngestRuntime(): void {
  if (ingestService) {
    return;
  }

  ingestService = createNotificationIngestService({
    isNotificationAccessEnabled,
    getLastCapturedNotification,
    getDeviceId: () => process.env.EXPO_PUBLIC_DEVICE_ID?.trim() || 'local-device'
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
