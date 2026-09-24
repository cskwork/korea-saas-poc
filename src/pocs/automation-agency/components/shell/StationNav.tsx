"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Route, X } from "lucide-react";
import clsx from "clsx";
import { currentStationIndex, STATIONS } from "./stations";
import styles from "./nav.module.css";

/**
 * Navigation as a metro line: every page is a station, the current one is shown
 * as the white station-name plate. Narrow screens get the platform sign
 * (previous · current · next) plus the full line as a disclosure.
 */
export function StationNav({ brand }: { brand: ReactNode }) {
  const pathname = usePathname();
  const current = currentStationIndex(pathname);
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const prev = STATIONS[current - 1];
  const next = STATIONS[current + 1];

  // Close the line map after navigating.
  const [lastPath, setLastPath] = useState(pathname);
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
    <>
      <div className={styles.bar}>
        {brand}
        <nav className={styles.line} aria-label="AutoMate Pro 메뉴">
          <ol className={styles.stations}>
            {STATIONS.map((station, index) => {
              const isCurrent = index === current;
              return (
                <li key={station.href} className={clsx(styles.station, isCurrent && styles.current)}>
                  <Link
                    href={station.href}
                    aria-current={isCurrent ? "page" : undefined}
                    className={styles.stationLink}
                  >
                    <span className={styles.dot} aria-hidden="true" />
                    <span className={styles.plate}>
                      <span className={styles.stationName}>{station.label}</span>
                      {isCurrent ? <span className={styles.stationEn}>{station.en}</span> : null}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </nav>
        <button
          type="button"
          className={styles.menuButton}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={18} aria-hidden="true" /> : <Route size={18} aria-hidden="true" />}
          <span>전체 노선</span>
        </button>
      </div>

      <div className={styles.platformSign}>
        {prev ? (
          <Link href={prev.href} className={styles.adjacent}>
            <ChevronLeft size={16} aria-hidden="true" />
            <span className={styles.srOnly}>이전 역 </span>
            {prev.label}
          </Link>
        ) : (
          <span className={styles.adjacent} aria-hidden="true" />
        )}
        <span className={styles.platformPlate} aria-hidden="true">
          <span className={styles.stationName}>{STATIONS[current].label}</span>
          <span className={styles.stationEn}>{STATIONS[current].en}</span>
        </span>
        {next ? (
          <Link href={next.href} className={clsx(styles.adjacent, styles.adjacentNext)}>
            <span className={styles.srOnly}>다음 역 </span>
            {next.label}
            <ChevronRight size={16} aria-hidden="true" />
          </Link>
        ) : (
          <span className={styles.adjacent} aria-hidden="true" />
        )}
      </div>

      <nav id={panelId} className={styles.panel} hidden={!open} aria-label="전체 노선">
        <ol className={styles.panelList}>
          {STATIONS.map((station, index) => (
            <li key={station.href} className={clsx(styles.panelStation, index === current && styles.panelCurrent)}>
              <Link href={station.href} aria-current={index === current ? "page" : undefined}>
                <span className={styles.dot} aria-hidden="true" />
                {station.label}
                <span className={styles.panelEn}>{station.en}</span>
              </Link>
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
