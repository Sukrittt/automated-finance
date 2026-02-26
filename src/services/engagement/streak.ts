import AsyncStorage from '@react-native-async-storage/async-storage';
import { StreakState, StreakStatus } from './types';

const STREAK_STORAGE_KEY = 'engagement_streak_v1';
const MAX_FREEZE_TOKENS = 3;

const DEFAULT_STREAK_STATE: StreakState = {
  currentStreak: 0,
  bestStreak: 0,
  lastCheckInISO: null,
  freezeTokens: 0,
  status: 'broken'
};

interface CompleteCheckInOptions {
  now?: Date;
  useFreezeTokenOnMiss?: boolean;
}

function toDateOnlyISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toDateFromISO(dateISO: string): Date {
  return new Date(`${dateISO}T00:00:00`);
}

function isStreakState(value: unknown): value is Omit<StreakState, 'status'> {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<StreakState>;
  const validLastCheckIn = candidate.lastCheckInISO === null || typeof candidate.lastCheckInISO === 'string';

  return (
    Number.isFinite(candidate.currentStreak) &&
    Number.isFinite(candidate.bestStreak) &&
    Number.isFinite(candidate.freezeTokens) &&
    validLastCheckIn
  );
}

function computeStatus(lastCheckInISO: string | null, now: Date): StreakStatus {
  if (!lastCheckInISO) {
    return 'broken';
  }

  const todayISO = toDateOnlyISO(now);
  if (lastCheckInISO === todayISO) {
    return 'active';
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (lastCheckInISO === toDateOnlyISO(yesterday)) {
    return 'at_risk';
  }

  return 'broken';
}

function sanitizeState(state: Omit<StreakState, 'status'>, now: Date): StreakState {
  const currentStreak = Math.max(0, Math.round(state.currentStreak));
  const bestStreak = Math.max(currentStreak, Math.round(state.bestStreak));
  const freezeTokens = Math.max(0, Math.min(MAX_FREEZE_TOKENS, Math.round(state.freezeTokens)));
  const lastCheckInISO = state.lastCheckInISO ?? null;

  return {
    currentStreak,
    bestStreak,
    freezeTokens,
    lastCheckInISO,
    status: computeStatus(lastCheckInISO, now)
  };
}

async function saveState(state: StreakState): Promise<StreakState> {
  const persistable = {
    currentStreak: state.currentStreak,
    bestStreak: state.bestStreak,
    freezeTokens: state.freezeTokens,
    lastCheckInISO: state.lastCheckInISO
  };
  await AsyncStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(persistable));
  return state;
}

export async function loadStreakState(now: Date = new Date()): Promise<StreakState> {
  try {
    const raw = await AsyncStorage.getItem(STREAK_STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_STREAK_STATE };
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!isStreakState(parsed)) {
      return { ...DEFAULT_STREAK_STATE };
    }

    return sanitizeState(parsed, now);
  } catch {
    return { ...DEFAULT_STREAK_STATE };
  }
}

export async function completeDailyCheckIn(options: CompleteCheckInOptions = {}): Promise<StreakState> {
  const now = options.now ?? new Date();
  const todayISO = toDateOnlyISO(now);
  const useFreezeTokenOnMiss = options.useFreezeTokenOnMiss ?? false;
  const state = await loadStreakState(now);

  if (state.lastCheckInISO === todayISO) {
    return state;
  }

  let nextStreak = 1;
  let nextFreezeTokens = state.freezeTokens;

  if (state.lastCheckInISO) {
    const lastDate = toDateFromISO(state.lastCheckInISO);
    const dayDiff = Math.floor((toDateFromISO(todayISO).getTime() - lastDate.getTime()) / 86400000);

    if (dayDiff === 1) {
      nextStreak = state.currentStreak + 1;
    } else if (dayDiff > 1 && useFreezeTokenOnMiss && state.freezeTokens > 0) {
      nextStreak = state.currentStreak + 1;
      nextFreezeTokens -= 1;
    }
  }

  if (nextStreak > 0 && nextStreak % 7 === 0) {
    nextFreezeTokens = Math.min(MAX_FREEZE_TOKENS, nextFreezeTokens + 1);
  }

  return saveState(
    sanitizeState(
      {
        currentStreak: nextStreak,
        bestStreak: Math.max(state.bestStreak, nextStreak),
        freezeTokens: nextFreezeTokens,
        lastCheckInISO: todayISO
      },
      now
    )
  );
}

export async function resetStreakState(): Promise<StreakState> {
  await AsyncStorage.removeItem(STREAK_STORAGE_KEY);
  return { ...DEFAULT_STREAK_STATE };
}
