import { describe, expect, it } from "vitest";
import { cancelProblem, countdown, joinProblem, meetupPhase, seatState } from "./meetups";
import type { Viewer } from "./rules";

const free: Viewer = { id: "f", role: "member", tier: "free" };
const premium: Viewer = { id: "p", role: "member", tier: "premium" };
const now = new Date("2026-09-24T10:00:00Z");
const meetup = { startsAt: new Date("2026-09-26T01:00:00Z"), durationMinutes: 180, capacity: 12, access: "open" as const };

describe("meetups", () => {
  it("reads seats like a pitch timer", () => {
    expect(seatState(5, 12)).toBe("open");
    expect(seatState(9, 12)).toBe("closing");
    expect(seatState(12, 12)).toBe("full");
    expect(seatState(7, 8)).toBe("closing");
    expect(seatState(20, 30)).toBe("open");
  });

  it("knows whether a meetup is upcoming, live or over", () => {
    expect(meetupPhase(meetup, now)).toBe("upcoming");
    expect(meetupPhase(meetup, new Date("2026-09-26T02:00:00Z"))).toBe("live");
    expect(meetupPhase(meetup, new Date("2026-09-26T04:00:00Z"))).toBe("ended");
  });

  it("explains why joining is not possible", () => {
    const context = { meetup, viewer: free, going: 3, alreadyGoing: false, now };
    expect(joinProblem(context)).toBeNull();
    expect(joinProblem({ ...context, going: 12 })).toContain("자리가");
    expect(joinProblem({ ...context, alreadyGoing: true })).toContain("이미 참석");
    expect(joinProblem({ ...context, meetup: { ...meetup, access: "premium" } })).toContain("프리미엄");
    expect(joinProblem({ ...context, viewer: premium, meetup: { ...meetup, access: "premium" } })).toBeNull();
    expect(joinProblem({ ...context, now: new Date("2026-09-27T00:00:00Z") })).toContain("시작했거나");
  });

  it("only cancels upcoming RSVPs", () => {
    expect(cancelProblem({ meetup, alreadyGoing: true, now })).toBeNull();
    expect(cancelProblem({ meetup, alreadyGoing: false, now })).toContain("신청한 모임이 아니에요");
    expect(cancelProblem({ meetup, alreadyGoing: true, now: new Date("2026-09-26T02:00:00Z") })).toContain("취소할 수 없어요");
  });

  it("counts down to the start", () => {
    expect(countdown(meetup.startsAt, now)).toEqual({ days: 1, hours: 15, minutes: 0, seconds: 0, done: false });
    expect(countdown(meetup.startsAt, new Date("2026-09-27T00:00:00Z")).done).toBe(true);
  });
});
