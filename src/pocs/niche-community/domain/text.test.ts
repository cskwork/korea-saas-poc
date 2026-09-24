import { describe, expect, it } from "vitest";
import { hasBatchim, withObject, withTopic } from "./korean";
import { excerpt, likePattern } from "./text";

describe("Korean particles", () => {
  it("picks 을/를 and 은/는 by the final consonant", () => {
    expect(withObject("제목")).toBe("제목을");
    expect(withObject("소개")).toBe("소개를");
    expect(withTopic("닉네임")).toBe("닉네임은");
    expect(withTopic("장소")).toBe("장소는");
    expect(hasBatchim("3")).toBe(true);
    expect(hasBatchim("2")).toBe(false);
  });
});

describe("text helpers", () => {
  it("flattens and shortens bodies at a word boundary", () => {
    expect(excerpt("첫 줄\n\n둘째 줄")).toBe("첫 줄 둘째 줄");
    const long = "가나다 ".repeat(60);
    const short = excerpt(long, 50);
    expect(short.endsWith("…")).toBe(true);
    expect(short.length).toBeLessThanOrEqual(51);
  });

  it("escapes LIKE wildcards", () => {
    expect(likePattern("100%_완료")).toBe("%100\\%\\_완료%");
  });
});
