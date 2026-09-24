export interface NavItem {
  href: string;
  label: string;
  hint: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/affiliate-marketing", label: "대시보드", hint: "이번 달" },
  { href: "/affiliate-marketing/links", label: "링크", hint: "진열대" },
  { href: "/affiliate-marketing/conversions", label: "판매 기록", hint: "주문·수수료" },
  { href: "/affiliate-marketing/analytics", label: "분석", hint: "기간별" },
  { href: "/affiliate-marketing/content", label: "콘텐츠", hint: "리뷰·리스트" },
  { href: "/affiliate-marketing/social", label: "SNS", hint: "게시물" },
  { href: "/affiliate-marketing/programs", label: "프로그램 비교", hint: "조건·성과" },
];

export function isActive(pathname: string, href: string): boolean {
  if (href === "/affiliate-marketing") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}
