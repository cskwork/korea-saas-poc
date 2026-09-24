import { describe, expect, it } from "vitest";
import { earnedBadges, evaluateBadges, nextBadge, type BadgeInput } from "./badges";

const day = (n: number) => new Date(Date.UTC(2026, 0, 1) + n * 86_400_000);
const days = (count: number, from = 40) => Array.from({ length: count }, (_, index) => day(from + index));

const base: BadgeInput = {
  role: "member",
  tier: "free",
  joinedAt: day(60),
  premiumSince: null,
  communityOpenedAt: day(0),
  postDates: [],
  commentDates: [],
  likeReceivedDates: [],
  attendedMeetupDates: [],
};

const keys = (input: BadgeInput) => earnedBadges(evaluateBadges(input)).map((badge) => badge.key);

describe("badges", () => {
  it("earns nothing without activity after the founder window", () => {
    expect(keys(base)).toEqual([]);
  });

  it("marks early joiners as 파운더 and the operator as 운영자 and premium", () => {
    expect(keys({ ...base, joinedAt: day(29) })).toEqual(["founder"]);
    expect(keys({ ...base, joinedAt: day(31) })).toEqual([]);
    expect(keys({ ...base, role: "operator", joinedAt: day(0) })).toEqual(["operator", "founder", "premium"]);
  });

  it("dates each count badge by the event that crossed its threshold", () => {
    const statuses = evaluateBadges({ ...base, postDates: [...days(9, 70), day(65)].reverse() });
    const first = statuses.find((badge) => badge.key === "firstPost");
    const writer = statuses.find((badge) => badge.key === "writer");
    expect(first?.earnedAt).toEqual(day(65));
    expect(writer?.earnedAt).toEqual(day(78));
    expect(writer?.current).toBe(10);
  });

  it("orders earned badges as a timeline and tracks progress on the rest", () => {
    const statuses = evaluateBadges({
      ...base,
      tier: "premium",
      premiumSince: day(90),
      postDates: [day(61)],
      commentDates: days(12),
      likeReceivedDates: days(50, 62),
      attendedMeetupDates: [day(70), day(80)],
    });
    expect(earnedBadges(statuses).map((badge) => badge.key)).toEqual(["firstPost", "premium", "popular"]);
    const next = nextBadge(statuses);
    // 현장파 needs 1 more of 3; 소통왕 18 more of 30; 작가 9 more of 10.
    expect(next).toMatchObject({ key: "regular", remaining: 1 });
  });

  it("loses the premium badge on downgrade (badges are derived, not stored)", () => {
    expect(keys({ ...base, tier: "free", premiumSince: day(90) })).not.toContain("premium");
  });
});
