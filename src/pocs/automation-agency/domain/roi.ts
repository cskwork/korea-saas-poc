/**
 * ROI of an automation, as arithmetic a client can check:
 * hours saved × hourly labour cost, against the one-off build fee and the monthly maintenance fee.
 */

/** Average weeks per month (52 weeks ÷ 12 months). */
export const WEEKS_PER_MONTH = 52 / 12;

export interface RoiInput {
  /** Hours per week spent on the repetitive work today. */
  weeklyHours: number;
  /** Fully loaded labour cost per hour, in won. */
  hourlyCost: number;
  /** Share of that work the automation takes over, 0–100. */
  automationRate: number;
  /** One-off build fee, in won. */
  investment: number;
  /** Monthly maintenance fee, in won. */
  monthlyFee: number;
}

export interface RoiResult {
  monthlyHoursSaved: number;
  yearlyHoursSaved: number;
  /** Labour cost freed per month (before fees). */
  monthlySavings: number;
  yearlySavings: number;
  /** Savings left each month after the maintenance fee. */
  monthlyNet: number;
  /** Build fee plus twelve months of maintenance. */
  firstYearCost: number;
  /** First-year return: (yearly savings − first-year cost) ÷ first-year cost. `null` when nothing is spent. */
  roi: number | null;
  /** Months until cumulative net savings cover the build fee. `null` when the automation never pays back. */
  paybackMonths: number | null;
}

export const ROI_LIMITS = {
  weeklyHours: { min: 1, max: 120, step: 1 },
  hourlyCost: { min: 10_000, max: 150_000, step: 1_000 },
  automationRate: { min: 5, max: 95, step: 5 },
  investment: { min: 0, max: 30_000_000, step: 100_000 },
  monthlyFee: { min: 0, max: 5_000_000, step: 10_000 },
} as const satisfies Record<keyof RoiInput, { min: number; max: number; step: number }>;

export const ROI_DEFAULTS: RoiInput = {
  weeklyHours: 30,
  hourlyCost: 25_000,
  automationRate: 60,
  investment: 2_000_000,
  monthlyFee: 300_000,
};

export function computeRoi(input: RoiInput): RoiResult {
  const rate = clamp(input.automationRate, 0, 100) / 100;
  const monthlyHoursSaved = Math.max(0, input.weeklyHours) * WEEKS_PER_MONTH * rate;
  const monthlySavings = Math.round(monthlyHoursSaved * Math.max(0, input.hourlyCost));
  const monthlyNet = monthlySavings - input.monthlyFee;
  const yearlySavings = monthlySavings * 12;
  const firstYearCost = input.investment + input.monthlyFee * 12;

  let paybackMonths: number | null;
  if (input.investment <= 0) paybackMonths = monthlyNet >= 0 ? 0 : null;
  else paybackMonths = monthlyNet > 0 ? Math.ceil(input.investment / monthlyNet) : null;

  return {
    monthlyHoursSaved,
    yearlyHoursSaved: monthlyHoursSaved * 12,
    monthlySavings,
    yearlySavings,
    monthlyNet,
    firstYearCost,
    roi: firstYearCost > 0 ? (yearlySavings - firstYearCost) / firstYearCost : null,
    paybackMonths,
  };
}

export interface JourneyPoint {
  month: number;
  /** Cumulative net position in won: savings minus fees minus the build fee. */
  balance: number;
}

/** Cumulative net position month by month, starting at −investment on month 0. */
export function roiJourney(input: RoiInput, months = 24): JourneyPoint[] {
  const { monthlyNet } = computeRoi(input);
  return Array.from({ length: months + 1 }, (_, month) => ({ month, balance: monthlyNet * month - input.investment }));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
