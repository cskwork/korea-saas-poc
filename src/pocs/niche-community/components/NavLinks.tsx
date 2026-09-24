"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, ChartColumn, GalleryVerticalEnd, Gem, Lock, Users, type LucideIcon } from "lucide-react";
import styles from "./nav.module.css";

const BASE = "/niche-community";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  match: (pathname: string) => boolean;
  operatorOnly?: boolean;
}

const ITEMS: NavItem[] = [
  { href: BASE, label: "피드", icon: GalleryVerticalEnd, match: (p) => p === BASE || p.startsWith(`${BASE}/posts`) },
  { href: `${BASE}/meetups`, label: "모임", icon: CalendarDays, match: (p) => p.startsWith(`${BASE}/meetups`) },
  { href: `${BASE}/members`, label: "멤버", icon: Users, match: (p) => p === `${BASE}/members` || p.startsWith(`${BASE}/members/`) },
  { href: `${BASE}/membership`, label: "멤버십", icon: Gem, match: (p) => p.startsWith(`${BASE}/membership`) },
  { href: `${BASE}/admin`, label: "운영", icon: ChartColumn, match: (p) => p.startsWith(`${BASE}/admin`), operatorOnly: true },
];

/** The agenda: the current section in ink with the laser dot, the rest dimmed (desktop header). */
export function AgendaNav({ isOperator }: { isOperator: boolean }) {
  const pathname = usePathname();
  return (
    <nav aria-label="커뮤니티 메뉴">
      <ul className={styles.agenda} role="list">
        {ITEMS.map((item) => {
          const current = item.match(pathname);
          return (
            <li key={item.href}>
              <Link href={item.href} className={styles.agendaLink} aria-current={current ? "page" : undefined}>
                <span className={styles.dot} aria-hidden="true" />
                {item.label}
                {item.operatorOnly && !isOperator ? <Lock size={12} aria-label="운영자 전용" className={styles.lock} /> : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** The deck footer on phones: a fixed bottom bar with the same five sections. */
export function FooterNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="커뮤니티 메뉴" className={styles.footerNav}>
      <ul role="list">
        {ITEMS.map((item) => {
          const current = item.match(pathname);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link href={item.href} className={styles.footerLink} aria-current={current ? "page" : undefined}>
                <Icon size={20} strokeWidth={current ? 2.25 : 1.75} aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
