"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./studio.module.css";

const SECTIONS = [
  { href: "/newsletter-community", label: "편집실", exact: true },
  { href: "/newsletter-community/issues", label: "발행" },
  { href: "/newsletter-community/subscribers", label: "구독자 명부" },
  { href: "/newsletter-community/board", label: "독자 마당" },
  { href: "/newsletter-community/revenue", label: "수입 장부" },
  { href: "/newsletter-community/settings", label: "설정" },
];

export function StudioNav() {
  const pathname = usePathname();
  return (
    <nav className={styles.nav} aria-label="편집실 메뉴">
      <ul className={styles.navList} role="list">
        {SECTIONS.map((section) => {
          const active = section.exact ? pathname === section.href : pathname.startsWith(section.href);
          return (
            <li key={section.href}>
              <Link href={section.href} className={styles.navLink} aria-current={active ? "page" : undefined}>
                {section.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
