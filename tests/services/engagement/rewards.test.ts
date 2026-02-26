import { awardXp, getLevelFromXp, missionXpReward, xpRequiredForLevel } from '../../../src/services/engagement/rewards';

describe('engagement rewards', () => {
  it('computes level thresholds deterministically', () => {
    expect(xpRequiredForLevel(1)).toBe(100);
    expect(xpRequiredForLevel(2)).toBe(200);
    expect(getLevelFromXp(0)).toBe(1);
    expect(getLevelFromXp(100)).toBe(2);
  });

  it('awards xp and reports level-up state', () => {
    const noLevelUp = awardXp(20, 30);
    expect(noLevelUp.level).toBe(1);
    expect(noLevelUp.leveledUp).toBe(false);

    const leveledUp = awardXp(90, 20);
    expect(leveledUp.level).toBe(2);
    expect(leveledUp.leveledUp).toBe(true);
  });

  it('scales mission xp with target size and clamps maximum', () => {
    expect(missionXpReward(1)).toBe(24);
    expect(missionXpReward(8)).toBe(52);
    expect(missionXpReward(100)).toBe(80);
  });
});
