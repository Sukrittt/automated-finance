import { getFeatureFlagsForUser, isFeatureEnabled } from '../../src/config/featureFlags';

describe('feature flags', () => {
  it('returns deterministic flag set for a user', () => {
    const first = getFeatureFlagsForUser({ userId: 'user-1' });
    const second = getFeatureFlagsForUser({ userId: 'user-1' });
    expect(second).toEqual(first);
  });

  it('keeps all default flags enabled in full rollout', () => {
    expect(isFeatureEnabled('playful_ui_v2', { userId: 'u' })).toBe(true);
    expect(isFeatureEnabled('daily_missions_v1', { userId: 'u' })).toBe(true);
    expect(isFeatureEnabled('streaks_v1', { userId: 'u' })).toBe(true);
    expect(isFeatureEnabled('engagement_notifications_v1', { userId: 'u' })).toBe(true);
    expect(isFeatureEnabled('leaderboard_hooks_v1', { userId: 'u' })).toBe(true);
  });
});
