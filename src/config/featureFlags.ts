export type FeatureFlagKey =
  | 'playful_ui_v2'
  | 'daily_missions_v1'
  | 'streaks_v1'
  | 'engagement_notifications_v1'
  | 'leaderboard_hooks_v1';

export interface FeatureFlagContext {
  userId?: string;
}

export interface FeatureFlagConfig {
  enabled: boolean;
  rolloutPct: number;
}

const DEFAULT_FLAGS: Record<FeatureFlagKey, FeatureFlagConfig> = {
  playful_ui_v2: { enabled: true, rolloutPct: 100 },
  daily_missions_v1: { enabled: true, rolloutPct: 100 },
  streaks_v1: { enabled: true, rolloutPct: 100 },
  engagement_notifications_v1: { enabled: true, rolloutPct: 100 },
  leaderboard_hooks_v1: { enabled: true, rolloutPct: 100 }
};

function hashToPercent(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash % 100;
}

export function isFeatureEnabled(key: FeatureFlagKey, context: FeatureFlagContext = {}): boolean {
  const config = DEFAULT_FLAGS[key];
  if (!config.enabled) {
    return false;
  }

  const rolloutPct = Math.max(0, Math.min(100, Math.round(config.rolloutPct)));
  if (rolloutPct >= 100) {
    return true;
  }

  if (!context.userId) {
    return false;
  }

  return hashToPercent(`${key}:${context.userId}`) < rolloutPct;
}

export function getFeatureFlagsForUser(context: FeatureFlagContext = {}): Record<FeatureFlagKey, boolean> {
  return {
    playful_ui_v2: isFeatureEnabled('playful_ui_v2', context),
    daily_missions_v1: isFeatureEnabled('daily_missions_v1', context),
    streaks_v1: isFeatureEnabled('streaks_v1', context),
    engagement_notifications_v1: isFeatureEnabled('engagement_notifications_v1', context),
    leaderboard_hooks_v1: isFeatureEnabled('leaderboard_hooks_v1', context)
  };
}
