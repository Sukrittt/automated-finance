import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TelemetryReporter } from '../telemetry/reporter';
import type { DailyMission, StreakState } from './types';

const REMINDER_STATE_KEY = 'engagement_reminders_v1';

type ReminderType = 'streak_risk' | 'win_recap';

type ReminderVariant = 'A' | 'B';

export interface ReminderCandidate {
  id: string;
  type: ReminderType;
  message: string;
  variant: ReminderVariant;
  atISO: string;
}

interface ReminderState {
  lastSentByType: Partial<Record<ReminderType, string>>;
}

interface ReminderInputs {
  userId: string;
  streak: StreakState;
  missions: DailyMission[];
  remindersEnabled: boolean;
  now?: Date;
  telemetryReporter?: TelemetryReporter;
}

const COPY: Record<ReminderType, Record<ReminderVariant, string>> = {
  streak_risk: {
    A: 'Your streak is at risk. One quick check-in keeps it alive.',
    B: 'Don\'t lose momentum. Open Auto Finance to protect today\'s streak.'
  },
  win_recap: {
    A: 'Great progress today. Check your win recap and tomorrow\'s focus.',
    B: 'Nice discipline today. Open your recap to lock in the habit.'
  }
};

function toDateOnlyISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function chooseVariant(userId: string, dateISO: string): ReminderVariant {
  let hash = 0;
  const input = `${userId}:${dateISO}`;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 33 + input.charCodeAt(i)) >>> 0;
  }
  return hash % 2 === 0 ? 'A' : 'B';
}

async function loadReminderState(): Promise<ReminderState> {
  try {
    const raw = await AsyncStorage.getItem(REMINDER_STATE_KEY);
    if (!raw) {
      return { lastSentByType: {} };
    }

    const parsed = JSON.parse(raw) as Partial<ReminderState>;
    return {
      lastSentByType: parsed.lastSentByType ?? {}
    };
  } catch {
    return { lastSentByType: {} };
  }
}

async function saveReminderState(state: ReminderState): Promise<void> {
  await AsyncStorage.setItem(REMINDER_STATE_KEY, JSON.stringify(state));
}

function todayMissionCompletionRatio(missions: DailyMission[]): number {
  if (!missions.length) {
    return 0;
  }
  const completed = missions.filter((mission) => mission.progress >= mission.target).length;
  return completed / missions.length;
}

function canSendToday(lastSentISO: string | undefined, todayISO: string): boolean {
  return lastSentISO !== todayISO;
}

export async function evaluateReminderCandidates(input: ReminderInputs): Promise<ReminderCandidate[]> {
  const now = input.now ?? new Date();
  const todayISO = toDateOnlyISO(now);
  const state = await loadReminderState();

  if (!input.remindersEnabled) {
    return [];
  }

  const variant = chooseVariant(input.userId, todayISO);
  const candidates: ReminderCandidate[] = [];

  if (
    input.streak.status === 'at_risk' &&
    canSendToday(state.lastSentByType.streak_risk, todayISO)
  ) {
    candidates.push({
      id: `streak-risk-${todayISO}`,
      type: 'streak_risk',
      message: COPY.streak_risk[variant],
      variant,
      atISO: now.toISOString()
    });
  }

  if (
    todayMissionCompletionRatio(input.missions) >= 0.66 &&
    canSendToday(state.lastSentByType.win_recap, todayISO)
  ) {
    candidates.push({
      id: `win-recap-${todayISO}`,
      type: 'win_recap',
      message: COPY.win_recap[variant],
      variant,
      atISO: now.toISOString()
    });
  }

  if (!candidates.length) {
    return [];
  }

  const nextState: ReminderState = {
    lastSentByType: {
      ...state.lastSentByType
    }
  };

  candidates.forEach((candidate) => {
    nextState.lastSentByType[candidate.type] = todayISO;
    input.telemetryReporter?.track({
      name: 'notification_sent',
      atISO: candidate.atISO,
      properties: {
        notification_type: candidate.type,
        variant: candidate.variant
      }
    });
  });

  await saveReminderState(nextState);
  return candidates;
}

export function trackReminderOpened(
  telemetryReporter: TelemetryReporter,
  type: ReminderType,
  variant: ReminderVariant,
  atISO: string = new Date().toISOString()
): void {
  telemetryReporter.track({
    name: 'notification_opened',
    atISO,
    properties: {
      notification_type: type,
      variant
    }
  });
}

export function trackReminderDismissed(
  telemetryReporter: TelemetryReporter,
  type: ReminderType,
  variant: ReminderVariant,
  atISO: string = new Date().toISOString()
): void {
  telemetryReporter.track({
    name: 'notification_dismissed',
    atISO,
    properties: {
      notification_type: type,
      variant
    }
  });
}
