export interface RewardResult {
  xpGained: number;
  totalXp: number;
  level: number;
  leveledUp: boolean;
}

const BASE_XP_PER_LEVEL = 100;

export function xpRequiredForLevel(level: number): number {
  return BASE_XP_PER_LEVEL * Math.max(1, level);
}

export function getLevelFromXp(totalXp: number): number {
  let level = 1;
  let remaining = Math.max(0, Math.round(totalXp));

  while (remaining >= xpRequiredForLevel(level)) {
    remaining -= xpRequiredForLevel(level);
    level += 1;
  }

  return level;
}

export function awardXp(currentXp: number, xpDelta: number): RewardResult {
  const normalizedCurrent = Math.max(0, Math.round(currentXp));
  const normalizedDelta = Math.max(0, Math.round(xpDelta));
  const nextXp = normalizedCurrent + normalizedDelta;
  const beforeLevel = getLevelFromXp(normalizedCurrent);
  const afterLevel = getLevelFromXp(nextXp);

  return {
    xpGained: normalizedDelta,
    totalXp: nextXp,
    level: afterLevel,
    leveledUp: afterLevel > beforeLevel
  };
}

export function missionXpReward(target: number): number {
  const safeTarget = Math.max(1, Math.round(target));
  return Math.min(80, 20 + safeTarget * 4);
}
