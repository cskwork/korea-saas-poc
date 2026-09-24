import { describe, expect, it } from "vitest";
import { FEED_PAGE_SIZE, feedSearch, meetupInput, parseFeedQuery, postInput, profileInput } from "./inputs";

const channelId = "5b8a1a5e-2a55-4f79-9b7a-1d0bb6c2f3a1";

describe("feed query", () => {
  it("parses search params tolerantly", () => {
    expect(parseFeedQuery({})).toEqual({ channelId: null, sort: "latest", q: "", limit: FEED_PAGE_SIZE });
    expect(parseFeedQuery({ channel: "not-a-uuid", sort: "weird", limit: "-3" })).toEqual({
      channelId: null,
      sort: "latest",
      q: "",
      limit: FEED_PAGE_SIZE,
    });
    expect(parseFeedQuery({ channel: channelId, sort: "popular", q: "  투자  ", limit: "999" })).toEqual({
      channelId,
      sort: "popular",
      q: "투자",
      limit: 120,
    });
  });

  it("round-trips through the URL, omitting defaults", () => {
    expect(feedSearch({ sort: "latest", limit: FEED_PAGE_SIZE })).toBe("");
    const search = feedSearch({ channelId, sort: "popular", q: "IR 자료", limit: 24 });
    expect(parseFeedQuery(Object.fromEntries(new URLSearchParams(search)))).toEqual({
      channelId,
      sort: "popular",
      q: "IR 자료",
      limit: 24,
    });
  });
});

describe("input validation", () => {
  it("validates posts with Korean messages and checkbox values", () => {
    const ok = postInput.safeParse({ channelId, title: " 첫 글 ", body: "본문입니다", premiumOnly: "on" });
    expect(ok.success && ok.data).toEqual({ channelId, title: "첫 글", body: "본문입니다", premiumOnly: true });
    const bad = postInput.safeParse({ channelId: "x", title: "한", body: "" });
    expect(bad.success).toBe(false);
    const messages = bad.error?.issues.map((issue) => issue.message) ?? [];
    expect(messages).toEqual(expect.arrayContaining(["채널을 선택해 주세요.", "제목은 2자 이상 입력해 주세요."]));
  });

  it("uses the right particle for each field", () => {
    const result = profileInput.safeParse({ nickname: "가", headline: "", bio: "" });
    expect(result.error?.issues[0].message).toBe("닉네임은 2자 이상 입력해 주세요.");
    const bio = profileInput.safeParse({ nickname: "가나", bio: "가".repeat(201) });
    expect(bio.error?.issues[0].message).toBe("소개는 200자까지 입력할 수 있어요.");
  });

  it("coerces meetup numbers and checks times", () => {
    const input = {
      title: "월간 데모데이",
      date: "2026-10-02",
      time: "19:30",
      durationMinutes: "150",
      location: "성수",
      format: "offline",
      capacity: "30",
      access: "open",
    };
    const ok = meetupInput.safeParse(input);
    expect(ok.success && ok.data).toMatchObject({ durationMinutes: 150, capacity: 30, description: "" });
    expect(meetupInput.safeParse({ ...input, time: "25:00" }).success).toBe(false);
    expect(meetupInput.safeParse({ ...input, capacity: "1" }).success).toBe(false);
  });
});
