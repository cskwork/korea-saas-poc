import { describe, expect, it } from "vitest";
import { CODE_ALPHABET, generateCode, isPlausibleCode, normalizeCustomCode, shortPath } from "./codes";
import {
  classifyChannel,
  classifyDevice,
  inAppChannel,
  isBotUserAgent,
  isSafeDestination,
  referrerHostOf,
  resolveClickChannel,
} from "./tracking";

const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
const DESKTOP = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36";

describe("short codes", () => {
  it("generates codes from the unambiguous alphabet", () => {
    let i = 0;
    const code = generateCode(() => i++ % CODE_ALPHABET.length);
    expect(code).toBe("234567");
    expect(generateCode()).toMatch(/^[23456789abcdefghjkmnpqrstuvwxyz]{6}$/);
  });

  it("normalises custom codes and explains rejections", () => {
    expect(normalizeCustomCode(" Buds3-Review ")).toEqual({ ok: true, code: "buds3-review" });
    expect(normalizeCustomCode("ab").ok).toBe(false);
    expect(normalizeCustomCode("-start").ok).toBe(false);
    expect(normalizeCustomCode("end-").ok).toBe(false);
    expect(normalizeCustomCode("한글코드").ok).toBe(false);
    expect(normalizeCustomCode("new").ok).toBe(false);
  });

  it("recognises plausible codes before touching the database", () => {
    expect(isPlausibleCode("pdn4x9")).toBe(true);
    expect(isPlausibleCode("<script>")).toBe(false);
    expect(isPlausibleCode("a".repeat(30))).toBe(false);
  });

  it("builds the tracked path with an optional channel tag", () => {
    expect(shortPath("abc123")).toBe("/affiliate-marketing/go/abc123");
    expect(shortPath("abc123", "ig")).toBe("/affiliate-marketing/go/abc123?c=ig");
  });
});

describe("click classification", () => {
  it("prefers an explicit channel tag over the referrer", () => {
    expect(classifyChannel("ig", "blog.naver.com")).toBe("instagram");
    expect(classifyChannel("unknown", "blog.naver.com")).toBe("naver_blog");
  });

  it("maps Korean and global referrer hosts", () => {
    expect(classifyChannel(null, "m.blog.naver.com")).toBe("naver_blog");
    expect(classifyChannel(null, "someone.tistory.com")).toBe("tistory");
    expect(classifyChannel(null, "l.instagram.com")).toBe("instagram");
    expect(classifyChannel(null, "l.threads.com")).toBe("threads");
    expect(classifyChannel(null, "t.co")).toBe("x");
    expect(classifyChannel(null, "youtu.be")).toBe("youtube");
    expect(classifyChannel(null, "www.google.com")).toBe("other");
    expect(classifyChannel(null, null)).toBe("direct");
  });

  it("uses in-app browsers when there is no referrer", () => {
    expect(inAppChannel(`${IPHONE} KAKAOTALK 10.8.0`)).toBe("kakao");
    expect(inAppChannel(`${IPHONE} Instagram 300.0`)).toBe("instagram");
    expect(resolveClickChannel({ tag: null, referrerHost: null, userAgent: `${IPHONE} KAKAOTALK` })).toBe("kakao");
    expect(resolveClickChannel({ tag: "x", referrerHost: "blog.naver.com", userAgent: IPHONE })).toBe("x");
    expect(resolveClickChannel({ tag: null, referrerHost: "blog.naver.com", userAgent: `${IPHONE} Instagram` })).toBe("naver_blog");
    expect(resolveClickChannel({ tag: null, referrerHost: null, userAgent: DESKTOP })).toBe("direct");
  });

  it("keeps only the referrer host and drops same-site or invalid referrers", () => {
    expect(referrerHostOf("https://blog.naver.com/user/223?x=1")).toBe("blog.naver.com");
    expect(referrerHostOf("https://linkit.example/affiliate-marketing", "linkit.example")).toBeNull();
    expect(referrerHostOf("android-app://com.kakao.talk")).toBeNull();
    expect(referrerHostOf("not a url")).toBeNull();
  });

  it("does not count link-preview bots and crawlers", () => {
    for (const bot of ["facebookexternalhit/1.1", "Twitterbot/1.0", "kakaotalk-scrap/1.0", "Mozilla/5.0 (compatible; Yeti/1.1; +https://naver.me/spd)", "Slackbot-LinkExpanding 1.0", "curl/8.4.0", ""]) {
      expect(isBotUserAgent(bot)).toBe(true);
    }
    expect(isBotUserAgent(IPHONE)).toBe(false);
    expect(isBotUserAgent(DESKTOP)).toBe(false);
  });

  it("classifies devices", () => {
    expect(classifyDevice(IPHONE)).toBe("mobile");
    expect(classifyDevice("Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X)")).toBe("tablet");
    expect(classifyDevice(DESKTOP)).toBe("desktop");
  });

  it("only redirects to absolute http(s) destinations", () => {
    expect(isSafeDestination("https://link.coupang.com/a/abc")).toBe(true);
    expect(isSafeDestination("http://example.com")).toBe(true);
    for (const bad of ["javascript:alert(1)", "data:text/html,hi", "//evil.com", "/relative", "ftp://x.com", "https://user:pw@x.com", ""]) {
      expect(isSafeDestination(bad)).toBe(false);
    }
  });
});
