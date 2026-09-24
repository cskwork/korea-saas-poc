import { describe, expect, it } from "vitest";
import { draftEstimateFromBrief } from "./estimate-draft";

describe("estimate draft template", () => {
  it("turns feature keywords into hour lines at the given rate", () => {
    const draft = draftEstimateFromBrief("카카오 로그인과 정기결제가 되는 예약 앱, 관리자 페이지 필요", 70_000);
    const titles = draft.items.map((item) => item.title);
    expect(titles[0]).toBe("요구사항 정리 · 화면 설계");
    expect(titles).toContain("회원가입 · 로그인 (소셜 포함)");
    expect(titles).toContain("결제 · 구독 연동");
    expect(titles).toContain("예약 · 일정 관리");
    expect(titles).toContain("관리자 페이지");
    expect(titles).toContain("앱 빌드 · 스토어 등록");
    expect(titles.at(-1)).toBe("QA · 배포 · 인수인계");
    expect(draft.items.every((item) => item.unit === "hour" && item.unitPrice === 70_000)).toBe(true);
  });

  it("falls back to a core block when nothing matches", () => {
    const draft = draftEstimateFromBrief("잘 부탁드립니다", 60_000);
    expect(draft.items.map((item) => item.title)).toEqual(["요구사항 정리 · 화면 설계", "핵심 기능 개발", "QA · 배포 · 인수인계"]);
    expect(draft.summary).toContain("찾지 못해");
  });

  it("scales planning and QA with the size of the job", () => {
    const small = draftEstimateFromBrief("랜딩 페이지", 60_000);
    const large = draftEstimateFromBrief("디자인, 로그인, 결제, 관리자, 채팅, 예약 기능", 60_000);
    expect(small.items[0].quantity).toBe(8);
    expect(large.items[0].quantity).toBe(16);
    expect(large.items.at(-1)!.quantity).toBeGreaterThan(small.items.at(-1)!.quantity);
  });
});
