import { apiRequest } from '../api/client';
import { WeeklyInsightVM } from '../../types/view-models';

type InsightReadyResponse = {
  week_start: string;
  status: 'ready';
  insight: {
    summary: string;
    top_leak: string;
    improvement_tip: string;
    projected_monthly_overrun_paise?: number;
    win_highlight?: string;
  };
  generated_at: string;
};

type InsightPendingResponse = {
  week_start: string;
  status: 'pending';
  eta_seconds?: number;
};

type InsightFailedResponse = {
  week_start: string;
  status: 'failed';
};

export type WeeklyInsightContract =
  | {
      status: 'ready';
      weekStartISO: string;
      generatedAtISO: string;
      insight: WeeklyInsightVM['required'] & WeeklyInsightVM['optional'];
    }
  | {
      status: 'pending';
      weekStartISO: string;
      etaSeconds?: number;
    }
  | {
      status: 'failed';
      weekStartISO: string;
    };

type InsightApiResponse = InsightReadyResponse | InsightPendingResponse | InsightFailedResponse;

export async function fetchWeeklyInsight(weekStartISO: string): Promise<WeeklyInsightContract> {
  const response = await apiRequest<InsightApiResponse>('/v1/insights/weekly', {
    method: 'GET',
    query: { week_start: weekStartISO }
  });

  if (response.status === 'pending') {
    return {
      status: 'pending',
      weekStartISO: response.week_start,
      etaSeconds: response.eta_seconds
    };
  }

  if (response.status === 'failed') {
    return {
      status: 'failed',
      weekStartISO: response.week_start
    };
  }

  return {
    status: 'ready',
    weekStartISO: response.week_start,
    generatedAtISO: response.generated_at,
    insight: {
      weekStartISO: response.week_start,
      summary: response.insight.summary,
      topLeak: response.insight.top_leak,
      improvementTip: response.insight.improvement_tip,
      projectedMonthlyOverrun: response.insight.projected_monthly_overrun_paise,
      winHighlight: response.insight.win_highlight
    }
  };
}
