"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Plus, X } from "lucide-react";
import { BASE, NAV_ITEMS, paths } from "./paths";
import styles from "./nav.module.css";

function isActive(pathname: string, href: string) {
  return href === BASE ? pathname === BASE : pathname === href || pathname.startsWith(`${href}/`);
}

/** Nav cells of the printed top bar; on narrow screens they fold into a 목차 panel. */
export function StudioNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState({ at: pathname, value: false });
  // The panel closes whenever the route changes.
  const isOpen = open.value && open.at === pathname;

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen({ at: pathname, value: false });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, pathname]);

  return (
    <nav className={styles.nav} aria-label="크리에이트잇 메뉴">
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={isOpen}
        aria-controls="studio-nav-cells"
        onClick={() => setOpen({ at: pathname, value: !isOpen })}
      >
        {isOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
        목차
      </button>
      <ul id="studio-nav-cells" role="list" className={styles.cells} data-open={isOpen}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link href={item.href} className={styles.cell} aria-current={active ? "page" : undefined}>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <Link href={paths.newOrder} className={styles.cta}>
        <Plus size={17} strokeWidth={2.4} aria-hidden="true" />
        <span>
          새 주문<span className={styles.ctaLong}> 접수</span>
        </span>
      </Link>
    </nav>
  );
}
