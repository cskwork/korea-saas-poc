import { CalendarDays, ChartColumn, FileStack, Tag, Users, BookOpen, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  short: string;
  icon: LucideIcon;
  /** Shown in the phone tab bar (the rest live in the top bar). */
  tab: boolean;
}

export const STUDIO_NAV: readonly NavItem[] = [
  { href: "/online-education", label: "이번 주 시간표", short: "시간표", icon: CalendarDays, tab: true },
  { href: "/online-education/courses", label: "강의", short: "강의", icon: BookOpen, tab: true },
  { href: "/online-education/students", label: "수강생", short: "수강생", icon: Users, tab: true },
  { href: "/online-education/products", label: "디지털 상품", short: "상품", icon: FileStack, tab: true },
  { href: "/online-education/revenue", label: "수익 분석", short: "수익", icon: ChartColumn, tab: true },
  { href: "/online-education/pricing", label: "요금제·설정", short: "요금제", icon: Tag, tab: false },
];

export function isActive(pathname: string, href: string): boolean {
  return href === "/online-education" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}
