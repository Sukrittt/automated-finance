import { Platform } from 'react-native';
import type { CapturedNotification } from './nativeListener';
import {
  getLastCapturedNotification,
  isNotificationAccessEnabled,
  openNotificationAccessSettings as openNativeNotificationAccessSettings
} from './nativeListener';

export type NotificationHealthStatus = 'healthy' | 'attention' | 'unsupported';

export interface NotificationHealthState {
  platformSupported: boolean;
  notificationAccessEnabled: boolean;
  lastCapturedNotification: CapturedNotification | null;
  status: NotificationHealthStatus;
  checkedAt: number;
}

export function readNotificationHealthState(): NotificationHealthState {
  const platformSupported = Platform.OS === 'android';
  const notificationAccessEnabled = platformSupported ? isNotificationAccessEnabled() : false;
  const lastCapturedNotification = platformSupported ? getLastCapturedNotification() : null;
  const status = getNotificationHealthStatus(platformSupported, notificationAccessEnabled, lastCapturedNotification);

  return {
    platformSupported,
    notificationAccessEnabled,
    lastCapturedNotification,
    status,
    checkedAt: Date.now()
  };
}

export async function openNotificationAccessSettings(): Promise<void> {
  await openNativeNotificationAccessSettings();
}

export function formatLastCaptureAgo(lastCapturedNotification: CapturedNotification | null, nowMs: number): string {
  if (!lastCapturedNotification) {
    return 'No captured notifications yet';
  }

  const diffMs = Math.max(0, nowMs - lastCapturedNotification.postedAt);
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) {
    return 'Last capture just now';
  }

  if (diffMinutes < 60) {
    return `Last capture ${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `Last capture ${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `Last capture ${diffDays}d ago`;
}

function getNotificationHealthStatus(
  platformSupported: boolean,
  notificationAccessEnabled: boolean,
  lastCapturedNotification: CapturedNotification | null
): NotificationHealthStatus {
  if (!platformSupported) {
    return 'unsupported';
  }

  if (!notificationAccessEnabled) {
    return 'attention';
  }

  if (!lastCapturedNotification) {
    return 'attention';
  }

  return 'healthy';
}
