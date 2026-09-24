"use client";

import {
  ArrowUpRight,
  Briefcase,
  ChartColumn,
  FileText,
  FolderKanban,
  LayoutGrid,
  Menu,
  Settings,
  Tag,
  Timer,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import styles from "./shell.module.css";

const BASE = "/dev-freelancing";

interface NavItem {
  href: string;
  label: string;
  short?: string;
  icon: LucideIcon;
  /** Other route prefixes that belong to this item. */
  also?: string[];
  badge?: "projects" | "invoices";
}

const GROUPS: NavItem[][] = [
  [
    { href: BASE, label: "개요", icon: LayoutGrid },
    { href: `${BASE}/projects`, label: "프로젝트", icon: FolderKanban, badge: "projects" },
    { href: `${BASE}/time`, label: "시간 기록", short: "시간", icon: Timer },
    { href: `${BASE}/documents`, label: "견적 · 청구", short: "청구", icon: FileText, also: [`${BASE}/estimates`, `${BASE}/invoices`], badge: "invoices" },
    { href: `${BASE}/revenue`, label: "수익", icon: ChartColumn },
    { href: `${BASE}/clients`, label: "고객", icon: Users },
  ],
  [
    { href: `${BASE}/portfolio`, label: "포트폴리오", icon: Briefcase },
    { href: `${BASE}/pricing`, label: "요금표", icon: Tag },
  ],
  [{ href: `${BASE}/settings`, label: "설정", icon: Settings }],
];

const TABS = [GROUPS[0][0], GROUPS[0][1], GROUPS[0][2], GROUPS[0][3]];

function isCurrent(pathname: string, item: NavItem) {
  if (item.href === BASE) return pathname === BASE;
  return [item.href, ...(item.also ?? [])].some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export interface NavBadges {
  projects: number;
  invoices: number;
}

/** Desktop rail: every destination, the current one marked with a solid square. */
export function RailNav({ badges }: { badges: NavBadges }) {
  const pathname = usePathname();
  return (
    <nav aria-label="DevFlow 메뉴" className={styles.railNav}>
      {GROUPS.map((group, index) => (
        <ul key={index} role="list" className={styles.railGroup}>
          {group.map((item) => {
            const current = isCurrent(pathname, item);
            const count = item.badge ? badges[item.badge] : 0;
            return (
              <li key={item.href}>
                <Link href={item.href} className={styles.railLink} aria-current={current ? "page" : undefined}>
                  <span className={styles.railCell} aria-hidden="true" />
                  <span className={styles.railLabel}>{item.label}</span>
                  {count > 0 ? (
                    <span className={styles.railCount} aria-label={item.badge === "invoices" ? `미수 ${count}건` : `진행 ${count}건`}>
                      {count}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
          {index === 1 ? (
            <li>
              <a href={`${BASE}/profile`} className={styles.railLink} target="_blank" rel="noopener">
                <span className={styles.railCell} aria-hidden="true" />
                <span className={styles.railLabel}>공개 페이지</span>
                <ArrowUpRight size={14} aria-hidden="true" className={styles.railExternal} />
                <span className={styles.srOnly}>(새 탭)</span>
              </a>
            </li>
          ) : null}
        </ul>
      ))}
    </nav>
  );
}

/** Phone and tablet: four primary tabs plus a sheet with everything else. */
export function TabBar({ badges }: { badges: NavBadges }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Navigating closes the sheet.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  const moreCurrent = !TABS.some((tab) => isCurrent(pathname, tab));
  return (
    <>
      <nav aria-label="주요 메뉴" className={styles.tabBar}>
        {TABS.map((item) => {
          const Icon = item.icon;
          const current = isCurrent(pathname, item);
          const count = item.badge ? badges[item.badge] : 0;
          return (
            <Link key={item.href} href={item.href} className={styles.tab} aria-current={current ? "page" : undefined}>
              <span className={styles.tabIcon}>
                <Icon size={19} strokeWidth={1.75} aria-hidden="true" />
                {count > 0 ? <span className={styles.tabCount}>{count}</span> : null}
              </span>
              {item.short ?? item.label}
            </Link>
          );
        })}
        <button type="button" className={styles.tab} aria-haspopup="dialog" aria-expanded={open} data-current={moreCurrent ? "" : undefined} onClick={() => setOpen(true)}>
          <span className={styles.tabIcon}>
            <Menu size={19} strokeWidth={1.75} aria-hidden="true" />
          </span>
          전체
        </button>
      </nav>
      <dialog ref={dialogRef} className={styles.sheet} aria-label="전체 메뉴" onClose={() => setOpen(false)} onCancel={() => setOpen(false)}>
        <div className={styles.sheetHead}>
          <span className={styles.sheetTitle}>전체 메뉴</span>
          <button type="button" className={styles.sheetClose} onClick={() => setOpen(false)} aria-label="메뉴 닫기">
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        {GROUPS.map((group, index) => (
          <ul key={index} role="list" className={styles.sheetGroup}>
            {group.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link href={item.href} className={styles.sheetLink} aria-current={isCurrent(pathname, item) ? "page" : undefined}>
                    <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
            {index === 1 ? (
              <li>
                <a href={`${BASE}/profile`} className={styles.sheetLink} target="_blank" rel="noopener">
                  <ArrowUpRight size={18} strokeWidth={1.75} aria-hidden="true" />
                  공개 페이지 <span className={styles.srOnly}>(새 탭)</span>
                </a>
              </li>
            ) : null}
          </ul>
        ))}
      </dialog>
    </>
  );
}

/** Keeps a brand mark consistent between the rail and the top bar. */
export function Wordmark() {
  return (
    <span className={styles.wordmark}>
      <span className={styles.mark} aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </span>
      DevFlow
    </span>
  );
}
