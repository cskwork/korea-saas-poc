"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { Menu, X } from "lucide-react";
import { NAV_ITEMS, isActive } from "./nav-items";
import styles from "./shell.module.css";

/** The red store band: wordmark, aisle navigation (a directory panel on narrow screens) and the sample sticker. */
export function StoreHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  const panelId = useId();

  // Close the directory after navigating (state adjusted during render, not in an effect).
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link href="/affiliate-marketing" className={styles.wordmark}>
          <svg className={styles.wordmarkTag} viewBox="0 0 26 26" aria-hidden>
            <path d="M3 4.5A1.5 1.5 0 0 1 4.5 3h8.1a1.5 1.5 0 0 1 1.06.44l9.4 9.4a1.5 1.5 0 0 1 0 2.12l-8.1 8.1a1.5 1.5 0 0 1-2.12 0l-9.4-9.4A1.5 1.5 0 0 1 3 12.6Z" fill="currentColor" />
            <circle cx="8.4" cy="8.4" r="2.1" fill="var(--am-red)" />
          </svg>
          링크잇
        </Link>
        <nav aria-label="링크잇 메뉴" className={styles.navDesktop}>
          <ul className={styles.nav} role="list">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={styles.navLink} aria-current={isActive(pathname, item.href) ? "page" : undefined}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.headerEnd}>
          <span className={styles.sampleSticker} title="이 워크스페이스의 데이터는 모두 샘플이에요">
            샘플
          </span>
          <button
            type="button"
            className={styles.menuButton}
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X aria-hidden /> : <Menu aria-hidden />}
            {open ? "닫기" : "메뉴"}
          </button>
        </div>
      </div>
      <div id={panelId} className={styles.directory} data-open={open} hidden={!open}>
        <nav aria-label="링크잇 메뉴 (전체)">
          <ul className={styles.directoryList} role="list">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={styles.directoryLink} aria-current={isActive(pathname, item.href) ? "page" : undefined}>
                  {item.label}
                  <span className={styles.directoryHint}>{item.hint}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
