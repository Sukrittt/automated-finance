import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyMission } from './types';

const DAILY_MISSIONS_STORAGE_KEY = 'engagement_daily_missions_v1';

interface DailyMissionInputs {
  pendingReviewCount?: number;
  hasOpenedInsightToday?: boolean;
  spendToday?: number;
  spendCap?: number;
}

interface StoredDailyMissions {
  dateISO: string;
  missions: DailyMission[];
}

function toDateOnlyISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function sanitizeMission(mission: DailyMission): DailyMission {
  const target = Math.max(1, Math.round(mission.target));
  const progress = Math.max(0, Math.round(mission.progress));
  const completed = progress >= target;

  return {
    ...mission,
    target,
    progress: Math.min(progress, target),
    completedAtISO: completed ? mission.completedAtISO ?? new Date().toISOString() : undefined
  };
}

export function generateDailyMissions(inputs: DailyMissionInputs = {}, now: Date = new Date()): DailyMission[] {
  const pendingReviewCount = Math.max(0, Math.round(inputs.pendingReviewCount ?? 3));
  const reviewTarget = Math.min(3, Math.max(1, pendingReviewCount || 1));
  const reviewProgress = pendingReviewCount === 0 ? reviewTarget : 0;

  const hasOpenedInsightToday = Boolean(inputs.hasOpenedInsightToday);
  const spendCap = Math.max(500, Math.round(inputs.spendCap ?? 2500));
  const spendToday = Math.max(0, Math.round(inputs.spendToday ?? 0));

  const missions: DailyMission[] = [
    {
      id: 'mission_review_queue',
      type: 'review_queue',
      title: 'Review queue clean-up',
      description: `Confirm ${reviewTarget} pending transactions`,
      progress: reviewProgress,
      target: reviewTarget
    },
    {
      id: 'mission_open_insights',
      type: 'open_insights',
      title: 'Open weekly insight',
      description: 'Read your latest spend story and action tip',
      progress: hasOpenedInsightToday ? 1 : 0,
      target: 1
    },
    {
      id: 'mission_spend_cap',
      type: 'spend_cap',
      title: 'Stay under today\'s cap',
      description: `Keep today\'s spending under Rs ${spendCap.toLocaleString('en-IN')}`,
      progress: Math.min(spendToday, spendCap),
      target: spendCap
    }
  ];

  const stampISO = now.toISOString();
  return missions.map((mission) => {
    const sanitized = sanitizeMission(mission);
    if (sanitized.progress >= sanitized.target) {
      return {
        ...sanitized,
        completedAtISO: sanitized.completedAtISO ?? stampISO
      };
    }
    return sanitized;
  });
}

async function saveDailyMissions(payload: StoredDailyMissions): Promise<void> {
  await AsyncStorage.setItem(DAILY_MISSIONS_STORAGE_KEY, JSON.stringify(payload));
}

export async function loadOrCreateDailyMissions(
  inputs: DailyMissionInputs = {},
  now: Date = new Date()
): Promise<DailyMission[]> {
  const todayISO = toDateOnlyISO(now);

  try {
    const raw = await AsyncStorage.getItem(DAILY_MISSIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<StoredDailyMissions>;
      if (parsed.dateISO === todayISO && Array.isArray(parsed.missions)) {
        return parsed.missions.map((mission) => sanitizeMission(mission));
      }
    }
  } catch {
    // Fall through to generation.
  }

  const missions = generateDailyMissions(inputs, now);
  await saveDailyMissions({ dateISO: todayISO, missions });
  return missions;
}

export async function updateMissionProgress(
  missionId: string,
  progress: number,
  now: Date = new Date()
): Promise<DailyMission[] | null> {
  const raw = await AsyncStorage.getItem(DAILY_MISSIONS_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  const parsed = JSON.parse(raw) as Partial<StoredDailyMissions>;
  if (!Array.isArray(parsed.missions) || typeof parsed.dateISO !== 'string') {
    return null;
  }

  const nextMissions = parsed.missions.map((mission) => {
    if (mission.id !== missionId) {
      return sanitizeMission(mission);
    }

    const nextMission = sanitizeMission({
      ...mission,
      progress
    });

    if (nextMission.progress >= nextMission.target) {
      return {
        ...nextMission,
        completedAtISO: mission.completedAtISO ?? now.toISOString()
      };
    }

    return nextMission;
  });

  await saveDailyMissions({
    dateISO: parsed.dateISO,
    missions: nextMissions
  });

  return nextMissions;
}

export async function resetDailyMissions(): Promise<void> {
  await AsyncStorage.removeItem(DAILY_MISSIONS_STORAGE_KEY);
}
