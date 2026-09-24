"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./shell.module.css";

const BASE = "/ai-content-agency";

const ITEMS = [
  { href: BASE, label: "현황" },
  { href: `${BASE}/orders`, label: "의뢰 게시대" },
  { href: `${BASE}/write`, label: "시안 쓰기" },
  { href: `${BASE}/drafts`, label: "원고함" },
  { href: `${BASE}/portfolio`, label: "사례" },
  { href: `${BASE}/pricing`, label: "요금제" },
] as const;

function isCurrent(pathname: string, href: string): boolean {
  if (href === BASE) return pathname === BASE;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MastheadNav() {
  const pathname = usePathname();
  return (
    <nav className={styles.nav} aria-label="글품 메뉴">
      <ul className={styles.navList} role="list">
        {ITEMS.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={styles.navLink}
              aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
