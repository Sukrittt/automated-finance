import { MonthlySummary, WeeklySummary } from '../summary/aggregation';
import { WeeklyInsightVM } from '../../types/view-models';

export interface WeeklyInsightGenerationInput {
  currentWeek: WeeklySummary;
  previousWeek?: WeeklySummary;
  monthToDate?: MonthlySummary;
}

export interface GeneratedWeeklyInsight {
  weekStartISO: string;
  generatedAtISO: string;
  insight: WeeklyInsightVM['required'] & WeeklyInsightVM['optional'];
}

export function generateWeeklyInsight(input: WeeklyInsightGenerationInput): GeneratedWeeklyInsight {
  const week = input.currentWeek;
  const previousWeekTotal = input.previousWeek?.totalSpendPaise ?? 0;
  const currentWeekTotal = week.totalSpendPaise;
  const deltaPct = computeDeltaPct(currentWeekTotal, previousWeekTotal);
  const topCategory = week.categoryTotals[0];
  const topCategorySharePct = currentWeekTotal > 0
    ? Number(((topCategory?.amountPaise ?? 0) / currentWeekTotal * 100).toFixed(1))
    : 0;

  const projectedMonthlyOverrun = computeProjectedOverrun(input.monthToDate);
  const isSpendDown = previousWeekTotal > 0 && currentWeekTotal < previousWeekTotal;

  const summary = buildSummary(deltaPct, currentWeekTotal, topCategory?.category);
  const topLeak = topCategory
    ? `Top leak: ${topCategory.category} at ${formatRupees(topCategory.amountPaise)} (${topCategorySharePct}% of weekly spend).`
    : 'Top leak: No dominant spend category this week.';
  const improvementTip = buildImprovementTip(topCategory?.category, topCategory?.amountPaise ?? 0);
  const winHighlight = isSpendDown
    ? `Great control: spend reduced by ${Math.abs(deltaPct).toFixed(1)}% vs last week.`
    : undefined;

  return {
    weekStartISO: week.fromISO,
    generatedAtISO: new Date().toISOString(),
    insight: {
      weekStartISO: week.fromISO,
      summary,
      topLeak,
      improvementTip,
      projectedMonthlyOverrun: projectedMonthlyOverrun > 0 ? projectedMonthlyOverrun : undefined,
      winHighlight
    }
  };
}

function buildSummary(deltaPct: number, currentWeekTotalPaise: number, topCategory?: string): string {
  if (currentWeekTotalPaise === 0) {
    return 'No debit spend captured this week yet. Keep notifications enabled for complete tracking.';
  }

  if (deltaPct > 0) {
    return `You spent ${deltaPct.toFixed(1)}% more this week vs last week, led by ${topCategory ?? 'mixed categories'}.`;
  }

  if (deltaPct < 0) {
    return `You spent ${Math.abs(deltaPct).toFixed(1)}% less this week vs last week while keeping essentials covered.`;
  }

  return `Your weekly spend stayed flat vs last week, with ${topCategory ?? 'mixed categories'} still on top.`;
}

function buildImprovementTip(topCategory: string | undefined, topCategoryAmountPaise: number): string {
  if (!topCategory || topCategoryAmountPaise <= 0) {
    return 'Set one small spending cap for the upcoming week and review it daily.';
  }

  const targetCutPaise = Math.round(topCategoryAmountPaise * 0.1);
  return `Try reducing ${topCategory} by ${formatRupees(targetCutPaise)} next week to lower total spend without large habit changes.`;
}

function computeDeltaPct(current: number, previous: number): number {
  if (previous <= 0) {
    return current > 0 ? 100 : 0;
  }

  return Number((((current - previous) / previous) * 100).toFixed(1));
}

function computeProjectedOverrun(monthToDate: MonthlySummary | undefined): number {
  if (!monthToDate || monthToDate.comparison.previousMonthTotalPaise <= 0) {
    return 0;
  }

  const elapsedDays = getElapsedDaysInclusive(monthToDate.fromISO, monthToDate.toISO);
  const totalDaysInMonth = getDaysInMonth(monthToDate.toISO);

  if (elapsedDays <= 0 || totalDaysInMonth <= 0 || monthToDate.totalSpendPaise <= 0) {
    return 0;
  }

  const projectedTotal = Math.round((monthToDate.totalSpendPaise / elapsedDays) * totalDaysInMonth);
  return Math.max(0, projectedTotal - monthToDate.comparison.previousMonthTotalPaise);
}

function getElapsedDaysInclusive(fromISO: string, toISO: string): number {
  const from = new Date(`${fromISO}T00:00:00.000Z`);
  const to = new Date(`${toISO}T00:00:00.000Z`);
  const deltaMs = to.getTime() - from.getTime();
  return Math.floor(deltaMs / (24 * 60 * 60 * 1000)) + 1;
}

function getDaysInMonth(dateISO: string): number {
  const date = new Date(`${dateISO}T00:00:00.000Z`);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

function formatRupees(amountPaise: number): string {
  const rupees = amountPaise / 100;
  return `Rs ${rupees.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}
