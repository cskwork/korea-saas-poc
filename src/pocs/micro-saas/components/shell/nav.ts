import type { IconName } from "../world/Icon";

export interface NavItem {
  href: string;
  label: string;
  /** Tab-bar label on phones. */
  short: string;
  icon: IconName;
  /** Paths (besides href) that light this tab. */
  also?: string[];
  /** Left out of the phone tab bar (reached from 매장 설정). */
  wideOnly?: boolean;
}

export const NAV: readonly NavItem[] = [
  { href: "/micro-saas", label: "대시보드", short: "대시보드", icon: "book" },
  { href: "/micro-saas/calendar", label: "예약 관리", short: "예약관리", icon: "calendar", also: ["/micro-saas/bookings"] },
  { href: "/micro-saas/customers", label: "고객 관리", short: "고객", icon: "users" },
  { href: "/micro-saas/notifications", label: "알림톡 미리보기", short: "알림톡", icon: "chat" },
  { href: "/micro-saas/book", label: "고객 예약 페이지", short: "예약페이지", icon: "link" },
  { href: "/micro-saas/pricing", label: "요금제", short: "요금제", icon: "won", wideOnly: true },
  { href: "/micro-saas/settings", label: "매장 설정", short: "설정", icon: "settings" },
];

export function isActive(item: NavItem, pathname: string): boolean {
  if (item.href === "/micro-saas") return pathname === "/micro-saas";
  return [item.href, ...(item.also ?? [])].some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

const TITLES: [prefix: string, title: string][] = [
  ["/micro-saas/bookings", "예약 상세"],
  ["/micro-saas/calendar", "예약 관리"],
  ["/micro-saas/customers", "고객 관리"],
  ["/micro-saas/notifications", "알림톡 미리보기"],
  ["/micro-saas/pricing", "요금제"],
  ["/micro-saas/settings", "매장 설정"],
];

export function titleFor(pathname: string): string {
  return TITLES.find(([prefix]) => pathname.startsWith(prefix))?.[1] ?? "대시보드";
}
