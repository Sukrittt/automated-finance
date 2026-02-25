import { Platform, Vibration } from 'react-native';
import { FEEDBACK_MAP, type FeedbackEvent } from './feedbackMap';

interface FeedbackSettings {
  reduceMotion: boolean;
  reduceHaptics: boolean;
}

const DEFAULT_SETTINGS: FeedbackSettings = {
  reduceMotion: false,
  reduceHaptics: false
};

let settings: FeedbackSettings = { ...DEFAULT_SETTINGS };
let lastFeedbackAtByEvent: Partial<Record<FeedbackEvent, number>> = {};

function isHapticSupported(): boolean {
  return Platform.OS === 'android';
}

function shouldTrigger(event: FeedbackEvent, minIntervalMs: number): boolean {
  const now = Date.now();
  const lastAt = lastFeedbackAtByEvent[event] ?? 0;
  if (now - lastAt < minIntervalMs) {
    return false;
  }
  lastFeedbackAtByEvent[event] = now;
  return true;
}

function runVibration(pattern: number | number[]): void {
  if (!isHapticSupported()) {
    return;
  }
  Vibration.vibrate(pattern);
}

export function setFeedbackSettings(next: Partial<FeedbackSettings>): void {
  settings = {
    ...settings,
    ...next
  };
}

export function getFeedbackSettings(): FeedbackSettings {
  return { ...settings };
}

export function resetFeedbackSettings(): void {
  settings = { ...DEFAULT_SETTINGS };
  lastFeedbackAtByEvent = {};
}

export function triggerFeedback(event: FeedbackEvent): void {
  if (settings.reduceHaptics) {
    return;
  }

  const mapping = FEEDBACK_MAP[event];
  if (!shouldTrigger(event, mapping.minIntervalMs)) {
    return;
  }

  if (mapping.hapticPattern === null) {
    return;
  }

  runVibration(mapping.hapticPattern);
}

export function triggerLightHaptic(): void {
  triggerFeedback('tap');
}

export function triggerSuccessHaptic(): void {
  triggerFeedback('success_save');
}

export function triggerWarningHaptic(): void {
  triggerFeedback('warning');
}
