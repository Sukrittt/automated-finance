import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  generateDailyMissions,
  loadOrCreateDailyMissions,
  resetDailyMissions,
  updateMissionProgress
} from '../../../src/services/engagement/missions';

describe('daily missions', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('generates three stable missions', () => {
    const missions = generateDailyMissions(
      { pendingReviewCount: 4, hasOpenedInsightToday: false, spendToday: 500, spendCap: 3000 },
      new Date('2026-02-26T09:00:00Z')
    );

    expect(missions).toHaveLength(3);
    expect(missions.map((mission) => mission.type)).toEqual(['review_queue', 'open_insights', 'spend_cap']);
  });

  it('loads same-day stored missions', async () => {
    const now = new Date('2026-02-26T09:00:00Z');
    const first = await loadOrCreateDailyMissions({ pendingReviewCount: 2 }, now);
    const second = await loadOrCreateDailyMissions({ pendingReviewCount: 0 }, now);

    expect(second).toEqual(first);
  });

  it('regenerates missions for next day', async () => {
    const first = await loadOrCreateDailyMissions({}, new Date('2026-02-26T09:00:00Z'));
    const second = await loadOrCreateDailyMissions({}, new Date('2026-02-27T09:00:00Z'));

    expect(second).toHaveLength(3);
    expect(second[0]?.id).toBe(first[0]?.id);
    const raw = await AsyncStorage.getItem('engagement_daily_missions_v1');
    expect(raw).toContain('"dateISO":"2026-02-27"');
  });

  it('updates mission progress and completion stamp', async () => {
    await loadOrCreateDailyMissions({}, new Date('2026-02-26T09:00:00Z'));
    const next = await updateMissionProgress('mission_open_insights', 1, new Date('2026-02-26T10:00:00Z'));

    const mission = next?.find((item) => item.id === 'mission_open_insights');
    expect(mission?.progress).toBe(1);
    expect(mission?.completedAtISO).toBeDefined();
  });

  it('reset clears mission storage', async () => {
    await loadOrCreateDailyMissions({}, new Date('2026-02-26T09:00:00Z'));
    await resetDailyMissions();

    const raw = await AsyncStorage.getItem('engagement_daily_missions_v1');
    expect(raw).toBeNull();
  });
});
