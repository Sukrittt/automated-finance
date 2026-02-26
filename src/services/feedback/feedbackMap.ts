export type FeedbackEvent =
  | 'tap'
  | 'toggle'
  | 'mission_progress'
  | 'mission_complete'
  | 'success_save'
  | 'warning'
  | 'error';

export interface FeedbackMapping {
  hapticPattern: number | number[] | null;
  minIntervalMs: number;
}

const DEFAULT_MIN_INTERVAL_MS = 250;

export const FEEDBACK_MAP: Record<FeedbackEvent, FeedbackMapping> = {
  tap: {
    hapticPattern: 10,
    minIntervalMs: DEFAULT_MIN_INTERVAL_MS
  },
  toggle: {
    hapticPattern: 10,
    minIntervalMs: DEFAULT_MIN_INTERVAL_MS
  },
  mission_progress: {
    hapticPattern: null,
    minIntervalMs: DEFAULT_MIN_INTERVAL_MS
  },
  mission_complete: {
    hapticPattern: [0, 16, 28, 16],
    minIntervalMs: DEFAULT_MIN_INTERVAL_MS
  },
  success_save: {
    hapticPattern: [0, 16, 28, 16],
    minIntervalMs: DEFAULT_MIN_INTERVAL_MS
  },
  warning: {
    hapticPattern: [0, 24, 36, 24],
    minIntervalMs: DEFAULT_MIN_INTERVAL_MS
  },
  error: {
    hapticPattern: [0, 24, 36, 24],
    minIntervalMs: DEFAULT_MIN_INTERVAL_MS
  }
};
