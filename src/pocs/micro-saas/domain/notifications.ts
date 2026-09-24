import type { BookingStatus } from "../db/schema";
import { formatLongDayLabel, formatMinute, relativeDayLabel, type Clock } from "./time";

/**
 * KakaoTalk 알림톡 previews. The shop picks a notice type; the preview is filled from a
 * real upcoming booking. Nothing is sent from this demo.
 */

export const NOTICE_TYPES = ["confirm", "reminder", "cancel"] as const;
export type NoticeType = (typeof NOTICE_TYPES)[number];

export const NOTICE_LABEL: Record<NoticeType, string> = {
  confirm: "예약 확인",
  reminder: "리마인더",
  cancel: "예약 취소",
};

export function isNoticeType(value: unknown): value is NoticeType {
  return typeof value === "string" && (NOTICE_TYPES as readonly string[]).includes(value);
}

interface Candidate {
  id: string;
  date: string;
  startMinute: number;
  status: BookingStatus;
}

/** Status a notice of this type is naturally about. */
const WANTED: Record<NoticeType, BookingStatus> = { confirm: "confirmed", reminder: "confirmed", cancel: "cancelled" };

/** Bookings that can fill a preview: upcoming ones, soonest first. */
export function upcomingCandidates<T extends Candidate>(rows: readonly T[], clock: Clock): T[] {
  return rows
    .filter((r) => r.date > clock.date || (r.date === clock.date && r.startMinute >= clock.minute))
    .sort((a, b) => a.date.localeCompare(b.date) || a.startMinute - b.startMinute);
}

/** The booking a notice type previews by default: the next one in the matching status, else the next active one. */
export function defaultCandidate<T extends Candidate>(type: NoticeType, upcoming: readonly T[]): T | undefined {
  return upcoming.find((r) => r.status === WANTED[type]) ?? upcoming.find((r) => r.status !== "cancelled") ?? upcoming[0];
}

export interface NoticeInput {
  customerName: string;
  date: string;
  startMinute: number;
  serviceName: string;
  shopName: string;
  address: string;
  cancelPolicy: string;
}

export interface KakaoMessage {
  title: string;
  lines: string[];
  details: { label: string; value: string }[];
  /** Details are struck through (a cancelled booking). */
  voided: boolean;
  note: string;
  buttons: string[];
}

export function composeNotice(type: NoticeType, input: NoticeInput, today: string): KakaoMessage {
  const when = [
    { label: "날짜", value: formatLongDayLabel(input.date) },
    { label: "시간", value: formatMinute(input.startMinute) },
    { label: "서비스", value: input.serviceName },
  ];
  const greeting = `안녕하세요, ${input.customerName}님`;
  switch (type) {
    case "confirm":
      return {
        title: "예약 확인 안내",
        lines: [`${greeting}!`, `${input.shopName} 예약이 확정되었습니다.`],
        details: when,
        voided: false,
        note: input.cancelPolicy.trim() || "예약 변경이나 취소는 매장으로 연락해 주세요.",
        buttons: ["예약 확인", "변경/취소"],
      };
    case "reminder": {
      const day = relativeDayLabel(input.date, today);
      const lead = day === "오늘" || day === "내일" || day === "모레" ? `${day} 예약이 있습니다.` : "다가오는 예약이 있습니다.";
      return {
        title: "예약 리마인더",
        lines: [`${greeting}!`, `${lead} 잊지 마세요.`],
        details: [...when, { label: "위치", value: `${input.shopName} (${input.address})` }],
        voided: false,
        note: "방문이 어려우시면 미리 연락 부탁드립니다.",
        buttons: ["길찾기"],
      };
    }
    case "cancel":
      return {
        title: "예약 취소 안내",
        lines: [`${greeting}.`, "아래 예약이 취소되었습니다."],
        details: when,
        voided: true,
        note: "다시 예약을 원하시면 아래 버튼을 눌러 주세요.",
        buttons: ["다시 예약하기"],
      };
  }
}
