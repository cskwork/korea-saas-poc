"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./admin.module.css";

const LINKS = [
  { href: "/niche-community/admin", label: "대시보드" },
  { href: "/niche-community/admin/channels", label: "채널 관리" },
  { href: "/niche-community/meetups#new-meetup", label: "모임 열기" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="운영 메뉴" className={styles.adminNav}>
      {LINKS.map((link) => (
        <Link key={link.href} href={link.href} aria-current={pathname === link.href ? "page" : undefined}>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
