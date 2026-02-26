import AsyncStorage from '@react-native-async-storage/async-storage';

const LEADERBOARD_PROFILE_KEY = 'leaderboard_profile_v1';

export interface LeaderboardProfile {
  optedIn: boolean;
  cohortId: string | null;
  percentile: number | null;
  updatedAtISO: string;
}

const DEFAULT_PROFILE: LeaderboardProfile = {
  optedIn: false,
  cohortId: null,
  percentile: null,
  updatedAtISO: new Date(0).toISOString()
};

function sanitizeProfile(input: unknown): LeaderboardProfile {
  if (!input || typeof input !== 'object') {
    return { ...DEFAULT_PROFILE };
  }

  const candidate = input as Partial<LeaderboardProfile>;
  return {
    optedIn: Boolean(candidate.optedIn),
    cohortId: typeof candidate.cohortId === 'string' ? candidate.cohortId : null,
    percentile:
      typeof candidate.percentile === 'number' && Number.isFinite(candidate.percentile)
        ? Math.max(0, Math.min(100, candidate.percentile))
        : null,
    updatedAtISO:
      typeof candidate.updatedAtISO === 'string' && candidate.updatedAtISO.length > 0
        ? candidate.updatedAtISO
        : DEFAULT_PROFILE.updatedAtISO
  };
}

export async function loadLeaderboardProfile(): Promise<LeaderboardProfile> {
  try {
    const raw = await AsyncStorage.getItem(LEADERBOARD_PROFILE_KEY);
    if (!raw) {
      return { ...DEFAULT_PROFILE };
    }

    return sanitizeProfile(JSON.parse(raw) as unknown);
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

export async function saveLeaderboardProfile(
  next: Partial<Omit<LeaderboardProfile, 'updatedAtISO'>>
): Promise<LeaderboardProfile> {
  const current = await loadLeaderboardProfile();
  const updated = sanitizeProfile({
    ...current,
    ...next,
    updatedAtISO: new Date().toISOString()
  });

  await AsyncStorage.setItem(LEADERBOARD_PROFILE_KEY, JSON.stringify(updated));
  return updated;
}
