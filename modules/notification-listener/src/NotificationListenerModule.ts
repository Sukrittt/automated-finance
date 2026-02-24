import { requireNativeModule } from 'expo-modules-core';
import { Platform } from 'react-native';

import type { CapturedNotification, NotificationListenerModuleApi } from './NotificationListener.types';

let nativeModule: NotificationListenerModuleApi | null = null;

if (Platform.OS === 'android') {
  try {
    nativeModule = requireNativeModule<NotificationListenerModuleApi>('NotificationListener');
  } catch {
    nativeModule = null;
  }
}

export function isNotificationAccessEnabled(): boolean {
  return nativeModule?.isNotificationAccessEnabled() ?? false;
}

export async function openNotificationAccessSettings(): Promise<void> {
  if (!nativeModule) {
    return;
  }
  await nativeModule.openNotificationAccessSettings();
}

export function getLastCapturedNotification(): CapturedNotification | null {
  return nativeModule?.getLastCapturedNotification() ?? null;
}
