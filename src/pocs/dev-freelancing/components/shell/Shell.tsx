import Link from "next/link";
import type { PickerProject, RunningTimer } from "../../server/data/time";
import theme from "../theme.module.css";
import { RailNav, TabBar, Wordmark, type NavBadges } from "./Navigation";
import { TimerDock } from "./TimerDock";
import styles from "./shell.module.css";

interface ShellProps {
  children: React.ReactNode;
  displayName: string;
  badges: NavBadges;
  timer: RunningTimer | null;
  projects: PickerProject[];
  todayMinutes: number;
}

/** The developer's workspace frame: rail (desktop) or top bar + tabs (phone), and the timer dock. */
export function Shell({ children, displayName, badges, timer, projects, todayMinutes }: ShellProps) {
  return (
    <div className={styles.shell}>
      <a href="#df-main" className={theme.skip}>
        본문으로 건너뛰기
      </a>
      <aside className={styles.rail}>
        <Link href="/dev-freelancing" className={styles.railBrand} aria-label="DevFlow 개요">
          <Wordmark />
        </Link>
        <p className={styles.railWho}>
          {displayName}
          <span>샘플 작업공간</span>
        </p>
        <RailNav badges={badges} />
        <p className={styles.railFoot}>
          <a href="/">한국형 1인 SaaS 10선</a>
        </p>
      </aside>
      <header className={styles.topBar}>
        <Link href="/dev-freelancing" className={styles.railBrand} aria-label="DevFlow 개요">
          <Wordmark />
        </Link>
        <span className={styles.topWho}>{displayName} · 샘플</span>
      </header>
      <main id="df-main" className={styles.main} tabIndex={-1}>
        {children}
      </main>
      <TimerDock timer={timer} projects={projects} todayMinutes={todayMinutes} />
      <TabBar badges={badges} />
    </div>
  );
}
