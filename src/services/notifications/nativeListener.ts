import {
  getLastCapturedNotification as getNativeLastCapturedNotification,
  isNotificationAccessEnabled as isNativeNotificationAccessEnabled,
  openNotificationAccessSettings as openNativeNotificationAccessSettings
} from '../../../modules/notification-listener';

import type { CapturedNotification } from '../../../modules/notification-listener';

export { CapturedNotification };

export function isNotificationAccessEnabled(): boolean {
  return isNativeNotificationAccessEnabled();
}

export async function openNotificationAccessSettings(): Promise<void> {
  await openNativeNotificationAccessSettings();
}

export function getLastCapturedNotification(): CapturedNotification | null {
  return getNativeLastCapturedNotification();
}
