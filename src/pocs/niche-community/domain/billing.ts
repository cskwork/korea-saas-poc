import { addDays, addMonths, seoulDateKey, seoulInstant } from "./time";
import type { Tier, TierChange } from "./rules";

/**
 * Premium billing: monthly periods anchored on the day a member upgraded.
 * Period n runs from anchor + n months through the day before anchor + n + 1 months,
 * always computed from the anchor so short months never make the cycle drift.
 */

export interface BillingPeriod {
  periodStart: string;
  periodEnd: string;
}

export function billingPeriod(anchorDayKey: string, index: number): BillingPeriod {
  return {
    periodStart: addMonths(anchorDayKey, index),
    periodEnd: addDays(addMonths(anchorDayKey, index + 1), -1),
  };
}

/** Every period that has started on or before `todayKey` (the charges owed so far). */
export function duePeriods(anchorDayKey: string, todayKey: string): BillingPeriod[] {
  const periods: BillingPeriod[] = [];
  for (let index = 0; ; index++) {
    const period = billingPeriod(anchorDayKey, index);
    if (period.periodStart > todayKey) return periods;
    periods.push(period);
  }
}

/** The period containing `todayKey`, or null before the anchor. */
export function currentPeriod(anchorDayKey: string, todayKey: string): BillingPeriod | null {
  return duePeriods(anchorDayKey, todayKey).at(-1) ?? null;
}

export interface Charge extends BillingPeriod {
  paidAt: Date;
}

/**
 * The charges a premium stint owes from its upgrade through `throughDayKey`: the first
 * at the moment of upgrade, each renewal at 09:00 Seoul on its period's first day.
 */
export function chargesFor(upgradedAt: Date, throughDayKey: string, now: Date): Charge[] {
  return duePeriods(seoulDateKey(upgradedAt), throughDayKey).map((period, index) => {
    const renewal = seoulInstant(period.periodStart, "09:00");
    const paidAt = index === 0 ? upgradedAt : renewal.getTime() > now.getTime() ? now : renewal;
    return { ...period, paidAt };
  });
}

export interface TierChangeEvent {
  kind: TierChange;
  occurredAt: Date;
}

/** Tier at an instant, replaying changes from the default (everyone joins free). */
export function tierAt(changes: readonly TierChangeEvent[], at: Date): Tier {
  let tier: Tier = "free";
  const ordered = [...changes].sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime());
  for (const change of ordered) {
    if (change.occurredAt.getTime() > at.getTime()) break;
    tier = change.kind === "upgrade" ? "premium" : "free";
  }
  return tier;
}
