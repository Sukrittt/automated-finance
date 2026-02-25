import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  evaluateReminderCandidates,
  trackReminderDismissed,
  trackReminderOpened
} from '../../../src/services/engagement/reminders';
import type { DailyMission, StreakState } from '../../../src/services/engagement/types';

function buildStreak(status: StreakState['status']): StreakState {
  return {
    currentStreak: 4,
    bestStreak: 8,
    lastCheckInISO: '2026-02-26',
    freezeTokens: 0,
    status
  };
}

const missions: DailyMission[] = [
  {
    id: 'm1',
    type: 'review_queue',
    title: 'Review queue clean-up',
    description: 'Confirm 2 transactions',
    progress: 2,
    target: 2
  },
  {
    id: 'm2',
    type: 'open_insights',
    title: 'Open weekly insight',
    description: 'Read insights',
    progress: 1,
    target: 1
  },
  {
    id: 'm3',
    type: 'spend_cap',
    title: 'Stay under cap',
    description: 'Cap spend',
    progress: 2000,
    target: 3000
  }
];

describe('engagement reminders', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('emits streak risk and recap reminders with telemetry', async () => {
    const track = jest.fn();

    const candidates = await evaluateReminderCandidates({
      userId: 'user-1',
      streak: buildStreak('at_risk'),
      missions,
      remindersEnabled: true,
      now: new Date('2026-02-26T18:00:00Z'),
      telemetryReporter: { track }
    });

    expect(candidates.map((item) => item.type).sort()).toEqual(['streak_risk', 'win_recap']);
    expect(track).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'notification_sent'
      })
    );
  });

  it('does not resend same reminder type on same day', async () => {
    await evaluateReminderCandidates({
      userId: 'user-1',
      streak: buildStreak('at_risk'),
      missions,
      remindersEnabled: true,
      now: new Date('2026-02-26T10:00:00Z')
    });

    const second = await evaluateReminderCandidates({
      userId: 'user-1',
      streak: buildStreak('at_risk'),
      missions,
      remindersEnabled: true,
      now: new Date('2026-02-26T11:00:00Z')
    });

    expect(second).toHaveLength(0);
  });

  it('tracks reminder open and dismiss events', () => {
    const track = jest.fn();

    trackReminderOpened({ track }, 'streak_risk', 'A', '2026-02-26T10:00:00Z');
    trackReminderDismissed({ track }, 'win_recap', 'B', '2026-02-26T10:00:05Z');

    expect(track).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'notification_opened'
      })
    );
    expect(track).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'notification_dismissed'
      })
    );
  });
});
