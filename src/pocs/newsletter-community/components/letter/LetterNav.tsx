"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./letter.module.css";

const LINKS = [
  { href: "/newsletter-community/letter", label: "지난 호", match: (p: string) => p === "/newsletter-community/letter" || /\/letter\/\d+$/.test(p) },
  { href: "/newsletter-community/letter/plans", label: "구독 안내", match: (p: string) => p.startsWith("/newsletter-community/letter/plans") },
  { href: "/newsletter-community/letter/board", label: "독자 마당", match: (p: string) => p.startsWith("/newsletter-community/letter/board") },
];

export function LetterNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="레터 메뉴" className={styles.nav}>
      {LINKS.map((link) => (
        <Link key={link.href} href={link.href} aria-current={link.match(pathname) ? "page" : undefined}>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
