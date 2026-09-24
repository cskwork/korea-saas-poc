"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActive, STUDIO_NAV } from "./nav";
import styles from "./shell.module.css";

/** Studio navigation; `variant` picks the desktop rail or the phone tab bar. */
export function NavLinks({ variant }: { variant: "rail" | "tabs" }) {
  const pathname = usePathname();
  const items = variant === "tabs" ? STUDIO_NAV.filter((item) => item.tab) : STUDIO_NAV;
  return (
    <ul role="list" className={variant === "rail" ? styles.railNav : styles.tabList}>
      {items.map(({ href, label, short, icon: Icon }) => (
        <li key={href}>
          <Link
            href={href}
            className={variant === "rail" ? styles.railLink : styles.tabLink}
            aria-current={isActive(pathname, href) ? "page" : undefined}
          >
            <span className={styles.navIcon}>
              <Icon size={variant === "rail" ? 17 : 20} strokeWidth={1.9} aria-hidden />
            </span>
            <span>{variant === "rail" ? label : short}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
