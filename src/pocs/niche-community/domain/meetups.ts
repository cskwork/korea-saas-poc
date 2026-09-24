import { hasPremiumAccess, type Access, type Viewer } from "./rules";

/**
 * Meetups (모임): seat states follow a pitch timer — 여유 (green), 임박 (amber), 마감 (red).
 */

export type SeatState = "open" | "closing" | "full";
export type MeetupPhase = "upcoming" | "live" | "ended";

/** "closing" once the last fifth of the seats (at least two) is all that is left. */
export function seatState(going: number, capacity: number): SeatState {
  const left = capacity - going;
  if (left <= 0) return "full";
  if (left <= Math.max(2, Math.ceil(capacity * 0.2))) return "closing";
  return "open";
}

export function meetupPhase(meetup: { startsAt: Date; durationMinutes: number }, now: Date): MeetupPhase {
  const start = meetup.startsAt.getTime();
  const end = start + meetup.durationMinutes * 60_000;
  if (now.getTime() < start) return "upcoming";
  if (now.getTime() < end) return "live";
  return "ended";
}

export interface RsvpContext {
  meetup: { startsAt: Date; durationMinutes: number; capacity: number; access: Access };
  viewer: Viewer;
  going: number;
  alreadyGoing: boolean;
  now: Date;
}

/** Returns a Korean reason when the viewer cannot join, or null when they can. */
export function joinProblem({ meetup, viewer, going, alreadyGoing, now }: RsvpContext): string | null {
  if (meetupPhase(meetup, now) !== "upcoming") return "이미 시작했거나 끝난 모임이에요.";
  if (alreadyGoing) return "이미 참석 신청한 모임이에요.";
  if (meetup.access === "premium" && !hasPremiumAccess(viewer)) return "프리미엄 멤버만 신청할 수 있는 모임이에요.";
  if (going >= meetup.capacity) return "자리가 모두 찼어요.";
  return null;
}

export function cancelProblem({ meetup, alreadyGoing, now }: Pick<RsvpContext, "meetup" | "alreadyGoing" | "now">) {
  if (!alreadyGoing) return "참석 신청한 모임이 아니에요.";
  if (meetupPhase(meetup, now) !== "upcoming") return "시작한 모임은 취소할 수 없어요.";
  return null;
}

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
}

export function countdown(target: Date, now: Date): Countdown {
  const total = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
  return {
    days: Math.floor(total / 86_400),
    hours: Math.floor((total % 86_400) / 3_600),
    minutes: Math.floor((total % 3_600) / 60),
    seconds: total % 60,
    done: total === 0,
  };
}
