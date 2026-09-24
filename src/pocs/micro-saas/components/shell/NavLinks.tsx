"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Icon } from "../world/Icon";
import { NAV, isActive, titleFor } from "./nav";
import styles from "./shell.module.css";

/** Ruled index tabs: a vertical spine on desktop, the bottom tab bar on phones. */
export function NavLinks() {
  const pathname = usePathname();
  return (
    <ul className={styles.navList}>
      {NAV.map((item) => (
        <li key={item.href} className={item.wideOnly ? styles.wideOnly : undefined}>
          <Link href={item.href} className={styles.navItem} aria-current={isActive(item, pathname) ? "page" : undefined}>
            <Icon name={item.icon} />
            <span className={styles.long}>{item.label}</span>
            <span className={styles.short}>{item.short}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function PageTitle() {
  return <h1 className={styles.title}>{titleFor(usePathname())}</h1>;
}

const LEGACY_HASHES: Record<string, string> = {
  "#/dashboard": "/micro-saas",
  "#/calendar": "/micro-saas/calendar",
  "#/customers": "/micro-saas/customers",
  "#/notifications": "/micro-saas/notifications",
  "#/booking": "/micro-saas/book",
  "#/pricing": "/micro-saas/pricing",
};

/** Old POC links (…/03-micro-saas/#/booking) land here with their hash: forward them to the real route. */
export function LegacyHashRedirect() {
  const router = useRouter();
  useEffect(() => {
    const target = LEGACY_HASHES[window.location.hash];
    if (target) router.replace(target);
  }, [router]);
  return null;
}
