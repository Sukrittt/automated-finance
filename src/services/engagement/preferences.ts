import AsyncStorage from '@react-native-async-storage/async-storage';

const ENGAGEMENT_PREFERENCES_KEY = 'engagement_preferences_v1';

export interface EngagementPreferences {
  reduceMotion: boolean;
  reduceHaptics: boolean;
  remindersEnabled: boolean;
}

const DEFAULT_PREFERENCES: EngagementPreferences = {
  reduceMotion: false,
  reduceHaptics: false,
  remindersEnabled: true
};

function sanitizePreferences(input: unknown): EngagementPreferences {
  if (!input || typeof input !== 'object') {
    return { ...DEFAULT_PREFERENCES };
  }

  const candidate = input as Partial<EngagementPreferences>;

  return {
    reduceMotion: Boolean(candidate.reduceMotion),
    reduceHaptics: Boolean(candidate.reduceHaptics),
    remindersEnabled:
      typeof candidate.remindersEnabled === 'boolean'
        ? candidate.remindersEnabled
        : DEFAULT_PREFERENCES.remindersEnabled
  };
}

export async function loadEngagementPreferences(): Promise<EngagementPreferences> {
  try {
    const raw = await AsyncStorage.getItem(ENGAGEMENT_PREFERENCES_KEY);
    if (!raw) {
      return { ...DEFAULT_PREFERENCES };
    }

    return sanitizePreferences(JSON.parse(raw) as unknown);
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

export async function saveEngagementPreferences(
  next: Partial<EngagementPreferences>
): Promise<EngagementPreferences> {
  const current = await loadEngagementPreferences();
  const merged = sanitizePreferences({
    ...current,
    ...next
  });

  await AsyncStorage.setItem(ENGAGEMENT_PREFERENCES_KEY, JSON.stringify(merged));
  return merged;
}
