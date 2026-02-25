export type StreakStatus = 'active' | 'at_risk' | 'broken';

export interface StreakState {
  currentStreak: number;
  bestStreak: number;
  lastCheckInISO: string | null;
  freezeTokens: number;
  status: StreakStatus;
}

export type DailyMissionType = 'review_queue' | 'open_insights' | 'spend_cap';

export interface DailyMission {
  id: string;
  type: DailyMissionType;
  title: string;
  description: string;
  progress: number;
  target: number;
  completedAtISO?: string;
}
