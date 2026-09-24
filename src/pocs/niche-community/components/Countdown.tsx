"use client";

import { useEffect, useState } from "react";
import { countdown } from "../domain/meetups";
import styles from "./stage.module.css";

const pad = (value: number) => String(value).padStart(2, "0");

/**
 * The pitch timer: dot-matrix digits counting down to the next meetup.
 * The first render uses the server's clock so hydration matches, then it ticks each second.
 */
export function Countdown({ target, serverNow }: { target: string; serverNow: string }) {
  const [now, setNow] = useState(() => new Date(serverNow));
  const targetDate = new Date(target);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const left = countdown(targetDate, now);
  const clock = `${pad(left.hours)}:${pad(left.minutes)}:${pad(left.seconds)}`;
  const spoken = left.done
    ? "곧 시작해요"
    : `시작까지 ${left.days ? `${left.days}일 ` : ""}${left.hours}시간 ${left.minutes}분 남음`;

  return (
    <div className={styles.timer} role="timer" aria-label={spoken}>
      <span className={styles.ledDay} aria-hidden="true">
        {left.done ? "NOW" : `D-${left.days}`}
      </span>
      <span className={styles.led} aria-hidden="true">
        <span className={styles.ledGhost}>88:88:88</span>
        <span className={styles.ledLit}>{clock}</span>
      </span>
    </div>
  );
}
