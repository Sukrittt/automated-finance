import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  completeDailyCheckIn,
  loadStreakState,
  resetStreakState
} from '../../../src/services/engagement/streak';

describe('engagement streak', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('starts streak at 1 on first check-in', async () => {
    const state = await completeDailyCheckIn({ now: new Date('2026-02-26T09:00:00Z') });

    expect(state.currentStreak).toBe(1);
    expect(state.bestStreak).toBe(1);
    expect(state.status).toBe('active');
  });

  it('increments streak on consecutive days', async () => {
    await completeDailyCheckIn({ now: new Date('2026-02-26T09:00:00Z') });
    const next = await completeDailyCheckIn({ now: new Date('2026-02-27T09:00:00Z') });

    expect(next.currentStreak).toBe(2);
    expect(next.bestStreak).toBe(2);
  });

  it('resets streak on missed days when freeze is not used', async () => {
    await completeDailyCheckIn({ now: new Date('2026-02-20T09:00:00Z') });
    const next = await completeDailyCheckIn({ now: new Date('2026-02-23T09:00:00Z') });

    expect(next.currentStreak).toBe(1);
  });

  it('awards a freeze token at 7-day milestone', async () => {
    for (let day = 0; day < 7; day += 1) {
      await completeDailyCheckIn({ now: new Date(`2026-03-${String(day + 1).padStart(2, '0')}T09:00:00Z`) });
    }

    const loaded = await loadStreakState(new Date('2026-03-07T10:00:00Z'));
    expect(loaded.currentStreak).toBe(7);
    expect(loaded.freezeTokens).toBe(1);
  });

  it('reset clears streak state', async () => {
    await completeDailyCheckIn({ now: new Date('2026-02-26T09:00:00Z') });
    const reset = await resetStreakState();

    expect(reset.currentStreak).toBe(0);
    expect(reset.status).toBe('broken');
  });
});
