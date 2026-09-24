import Link from "next/link";
import { CalendarPlus, Lock, MapPin, Video } from "lucide-react";
import { formatMonthDay, formatTime } from "@/core/format";
import { joinProblem } from "../domain/meetups";
import { hasPremiumAccess, isOperator, type Viewer } from "../domain/rules";
import type { MeetupView } from "../server/types";
import { Countdown } from "./Countdown";
import { RsvpButton } from "./RsvpButton";
import { SeatMeter } from "./SeatMeter";
import styles from "./stage.module.css";
import ui from "./ui.module.css";

interface StageBandProps {
  meetup: MeetupView | null;
  viewer: Viewer;
  now: Date;
  /** The meetups page shows the band as its own opening, with a heading level of 2. */
  headingLevel?: 2 | 3;
}

/** The dark stage under the deck chrome: the next meetup and its pitch-timer countdown. */
export function StageBand({ meetup, viewer, now, headingLevel = 2 }: StageBandProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  if (!meetup) {
    return (
      <section className={styles.stage} aria-label="다음 모임">
        <div className={styles.inner}>
          <div className={styles.text}>
            <Heading className={styles.title}>예정된 모임이 없어요</Heading>
            <p className={styles.meta}>다음 데모데이나 모각작이 열리면 여기에서 카운트다운이 시작돼요.</p>
          </div>
          {isOperator(viewer) ? (
            <Link href="/niche-community/meetups#new-meetup" className={`${ui.button} ${ui.accent}`}>
              <CalendarPlus aria-hidden="true" />
              모임 열기
            </Link>
          ) : null}
        </div>
      </section>
    );
  }

  const blocked = joinProblem({ meetup, viewer, going: meetup.going, alreadyGoing: meetup.viewerGoing, now });
  return (
    <section className={styles.stage} aria-label="다음 모임">
      <div className={styles.inner}>
        <Countdown target={meetup.startsAt.toISOString()} serverNow={now.toISOString()} />
        <div className={styles.text}>
          <Heading className={styles.title}>
            <Link href={`/niche-community/meetups/${meetup.id}`} className={styles.titleLink}>
              {meetup.title}
            </Link>
          </Heading>
          <p className={styles.meta}>
            <span>
              {formatMonthDay(meetup.startsAt)} {formatTime(meetup.startsAt)}
            </span>
            <span className={styles.metaItem}>
              {meetup.format === "online" ? <Video size={14} aria-hidden="true" /> : <MapPin size={14} aria-hidden="true" />}
              {meetup.location}
            </span>
            {meetup.access === "premium" ? (
              <span className={styles.metaItem}>
                <Lock size={14} aria-hidden="true" />
                프리미엄 멤버 전용
              </span>
            ) : null}
          </p>
        </div>
        <SeatMeter going={meetup.going} capacity={meetup.capacity} tone="stage" />
        <RsvpButton
          meetupId={meetup.id}
          going={meetup.viewerGoing}
          blockedReason={blocked}
          needsPremium={meetup.access === "premium" && !hasPremiumAccess(viewer)}
          tone="stage"
        />
      </div>
    </section>
  );
}
