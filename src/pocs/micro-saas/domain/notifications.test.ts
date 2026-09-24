import { describe, expect, it } from "vitest";
import { composeNotice, defaultCandidate, isNoticeType, upcomingCandidates } from "./notifications";

const clock = { date: "2026-09-24", minute: 720 };
const c = (id: string, date: string, startMinute: number, status: "confirmed" | "pending" | "cancelled") => ({
  id,
  date,
  startMinute,
  status,
});
const input = {
  customerName: "김미영",
  date: "2026-09-25",
  startMinute: 840,
  serviceName: "커트",
  shopName: "뷰티헤어살롱",
  address: "서울시 강남구 역삼동 123-45",
  cancelPolicy: "변경·취소는 방문 1시간 전까지 가능합니다.",
};

describe("알림톡 previews", () => {
  it("fills from upcoming bookings, soonest first, matching the notice's status", () => {
    const upcoming = upcomingCandidates(
      [c("past", "2026-09-24", 600, "confirmed"), c("later", "2026-09-26", 600, "confirmed"), c("soon", "2026-09-24", 780, "pending"), c("void", "2026-09-25", 600, "cancelled")],
      clock,
    );
    expect(upcoming.map((u) => u.id)).toEqual(["soon", "void", "later"]);
    expect(defaultCandidate("confirm", upcoming)?.id).toBe("later");
    expect(defaultCandidate("cancel", upcoming)?.id).toBe("void");
    expect(defaultCandidate("reminder", [c("p", "2026-09-25", 600, "pending")])?.id).toBe("p");
    expect(defaultCandidate("confirm", [])).toBeUndefined();
  });

  it("writes the confirmation with the shop's own cancellation rule", () => {
    const message = composeNotice("confirm", input, "2026-09-24");
    expect(message.lines).toEqual(["안녕하세요, 김미영님!", "뷰티헤어살롱 예약이 확정되었습니다."]);
    expect(message.details).toEqual([
      { label: "날짜", value: "2026년 9월 25일 (금)" },
      { label: "시간", value: "14:00" },
      { label: "서비스", value: "커트" },
    ]);
    expect(message.note).toBe(input.cancelPolicy);
    expect(composeNotice("confirm", { ...input, cancelPolicy: " " }, "2026-09-24").note).toContain("매장으로 연락");
  });

  it("says when the reminded booking is, and voids a cancellation", () => {
    expect(composeNotice("reminder", input, "2026-09-24").lines[1]).toBe("내일 예약이 있습니다. 잊지 마세요.");
    expect(composeNotice("reminder", input, "2026-09-20").lines[1]).toBe("다가오는 예약이 있습니다. 잊지 마세요.");
    expect(composeNotice("cancel", input, "2026-09-24")).toMatchObject({ voided: true, buttons: ["다시 예약하기"] });
    expect(isNoticeType("reminder")).toBe(true);
    expect(isNoticeType("sms")).toBe(false);
  });
});
