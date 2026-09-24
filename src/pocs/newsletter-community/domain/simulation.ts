import type { Tier } from "./tiers";

/**
 * Simulated engagement. No email leaves this product, so opens and clicks are
 * sample timestamps derived deterministically from the issue and recipient:
 * the same send always produces the same numbers, and they "arrive" over the
 * hours after sending (only timestamps at or before now count).
 */

/** FNV-1a: a stable pseudo-random number in [0, 1) for a seed string. */
export function unitHash(seed: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0) / 0x1_0000_0000;
}

const OPEN_PROBABILITY: Record<Tier, number> = { free: 0.41, basic: 0.57, pro: 0.66 };
const CLICK_GIVEN_OPEN = 0.31;
const MEAN_OPEN_DELAY_MINUTES = 240;
const MAX_OPEN_DELAY_MINUTES = 60 * 60;

export interface SimulatedEngagement {
  openedAt: Date | null;
  clickedAt: Date | null;
}

export function simulateEngagement(input: {
  issueId: string;
  recipientKey: string;
  tier: Tier;
  sentAt: Date;
}): SimulatedEngagement {
  const seed = `${input.issueId}:${input.recipientKey}`;
  if (unitHash(`${seed}:open`) >= OPEN_PROBABILITY[input.tier]) return { openedAt: null, clickedAt: null };

  const delay = Math.min(MAX_OPEN_DELAY_MINUTES, Math.max(2, -Math.log(1 - unitHash(`${seed}:delay`)) * MEAN_OPEN_DELAY_MINUTES));
  const openedAt = new Date(input.sentAt.getTime() + Math.round(delay) * 60_000);
  const clicked = unitHash(`${seed}:click`) < CLICK_GIVEN_OPEN;
  const clickedAt = clicked ? new Date(openedAt.getTime() + Math.round(1 + unitHash(`${seed}:dwell`) * 14) * 60_000) : null;
  return { openedAt, clickedAt };
}

export interface EngagementSummary {
  recipients: number;
  opens: number;
  clicks: number;
  openRate: number;
  clickRate: number;
}

export function summarizeEngagement(
  sends: readonly { openedAt: Date | null; clickedAt: Date | null }[],
  now: Date,
): EngagementSummary {
  const recipients = sends.length;
  const opens = sends.filter((s) => s.openedAt !== null && s.openedAt <= now).length;
  const clicks = sends.filter((s) => s.clickedAt !== null && s.clickedAt <= now).length;
  return {
    recipients,
    opens,
    clicks,
    openRate: recipients ? opens / recipients : 0,
    clickRate: recipients ? clicks / recipients : 0,
  };
}

/** Cumulative opens at the end of each hour after sending, up to now. */
export function cumulativeOpensByHour(
  sends: readonly { openedAt: Date | null }[],
  sentAt: Date,
  now: Date,
  hours: number,
): number[] {
  const elapsed = Math.max(0, Math.min(hours, Math.ceil((now.getTime() - sentAt.getTime()) / 3_600_000)));
  const buckets = new Array<number>(hours).fill(0);
  for (const send of sends) {
    if (!send.openedAt || send.openedAt > now) continue;
    const hour = Math.floor((send.openedAt.getTime() - sentAt.getTime()) / 3_600_000);
    if (hour >= 0 && hour < hours) buckets[hour] += 1;
  }
  let running = 0;
  return buckets.slice(0, elapsed).map((count) => (running += count));
}
