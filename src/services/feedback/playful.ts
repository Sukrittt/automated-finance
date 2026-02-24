import { Platform, Vibration } from 'react-native';

function vibrate(durationMs: number): void {
  if (Platform.OS !== 'android') {
    return;
  }
  Vibration.vibrate(durationMs);
}

export function triggerLightHaptic(): void {
  vibrate(10);
}

export function triggerSuccessHaptic(): void {
  Vibration.vibrate([0, 16, 28, 16]);
}

export function triggerWarningHaptic(): void {
  Vibration.vibrate([0, 24, 36, 24]);
}
