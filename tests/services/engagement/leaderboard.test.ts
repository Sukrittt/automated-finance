import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  loadLeaderboardProfile,
  saveLeaderboardProfile
} from '../../../src/services/engagement/leaderboard';

describe('leaderboard readiness hooks', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('loads default profile when unset', async () => {
    const profile = await loadLeaderboardProfile();

    expect(profile.optedIn).toBe(false);
    expect(profile.cohortId).toBeNull();
    expect(profile.percentile).toBeNull();
  });

  it('saves profile updates with sanitized percentile', async () => {
    const saved = await saveLeaderboardProfile({
      optedIn: true,
      cohortId: 'beta-cohort-a',
      percentile: 140
    });

    expect(saved.optedIn).toBe(true);
    expect(saved.cohortId).toBe('beta-cohort-a');
    expect(saved.percentile).toBe(100);
  });
});
