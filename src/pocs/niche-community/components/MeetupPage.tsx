import Link from "next/link";
import { ArrowLeft, Lock, MapPin, Trash2, Video } from "lucide-react";
import { formatMonthDay, formatTime } from "@/core/format";
import { joinProblem, meetupPhase } from "../domain/meetups";
import { hasPremiumAccess, isOperator } from "../domain/rules";
import { seoulDateKey } from "../domain/time";
import { deleteMeetupAction } from "../server/actions";
import type { getMeetupPage } from "../server/queries";
import { ConfirmButton } from "./ActionButtons";
import { Avatar } from "./Avatar";
import { MeetupForm } from "./MeetupForm";
import { RsvpButton } from "./RsvpButton";
import { SeatMeter } from "./SeatMeter";
import { personaLabel } from "./labels";
import styles from "./meetups.module.css";
import ui from "./ui.module.css";

type MeetupData = NonNullable<Awaited<ReturnType<typeof getMeetupPage>>>;

const PHASE_LABEL = { upcoming: "예정", live: "진행 중", ended: "끝난 모임" } as const;

/** One meetup: its title slide on the stage, then the room — seats, RSVP and who is coming. */
export function MeetupPage({ data }: { data: MeetupData }) {
  const { meetup, viewer, now } = data;
  const phase = meetupPhase(meetup, now);
  const ends = new Date(meetup.startsAt.getTime() + meetup.durationMinutes * 60_000);
  const blocked = joinProblem({ meetup, viewer, going: meetup.going, alreadyGoing: meetup.viewerGoing, now });

  return (
    <div className={`${ui.page} ${ui.pageNarrow} ${styles.detail}`}>
      <Link href="/niche-community/meetups" className={styles.back}>
        <ArrowLeft size={16} aria-hidden="true" />
        모임 목록
      </Link>
      <section className={styles.titleSlide} aria-labelledby="nc-meetup-title">
        <p className={styles.titleWhen}>
          <span className={styles.titleClock}>{formatTime(meetup.startsAt)}</span>
          <span>
            {formatMonthDay(meetup.startsAt)} · {formatTime(meetup.startsAt)}–{formatTime(ends)}
          </span>
          <span className={`${ui.tag} ${styles.phase}`} data-phase={phase}>
            {PHASE_LABEL[phase]}
          </span>
        </p>
        <h1 id="nc-meetup-title" className={styles.titleText}>
          {meetup.title}
        </h1>
        <p className={styles.titleWhere}>
          {meetup.format === "online" ? <Video size={16} aria-hidden="true" /> : <MapPin size={16} aria-hidden="true" />}
          {meetup.location}
          {meetup.access === "premium" ? (
            <span className={styles.titleAccess}>
              <Lock size={14} aria-hidden="true" />
              프리미엄 멤버 전용
            </span>
          ) : null}
        </p>
      </section>

      <section className={`${ui.slide} ${styles.room}`} aria-label="참석">
        {meetup.description ? <p className={styles.description}>{meetup.description}</p> : null}
        <div className={styles.roomRow}>
          <SeatMeter going={meetup.going} capacity={meetup.capacity} />
          {phase === "upcoming" ? (
            <RsvpButton
              meetupId={meetup.id}
              going={meetup.viewerGoing}
              blockedReason={blocked}
              needsPremium={meetup.access === "premium" && !hasPremiumAccess(viewer)}
            />
          ) : (
            <p className={ui.status}>{phase === "live" ? "지금 진행 중이에요." : "끝난 모임이에요."}</p>
          )}
        </div>
        <div className={styles.attendees}>
          <h2 className={ui.sectionTitle}>
            {phase === "ended" ? "참석한 멤버" : "참석 명단"} <span className={styles.count}>{meetup.attendees.length}명</span>
          </h2>
          {meetup.attendees.length ? (
            <ul className={styles.attendeeList} role="list">
              {meetup.attendees.map((person) => (
                <li key={person.id}>
                  <Link href={`/niche-community/members/${person.id}`} className={styles.attendee}>
                    <Avatar id={person.id} nickname={person.nickname} size="md" operator={person.role === "operator"} />
                    <span className={styles.attendeeText}>
                      <span className={styles.attendeeName}>{person.nickname}</span>
                      <span className={styles.attendeeRole}>{personaLabel(person)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className={ui.status}>아직 신청한 멤버가 없어요. 첫 번째로 신청해 보세요.</p>
          )}
        </div>
      </section>

      {isOperator(viewer) ? (
        <section className={styles.operator} aria-label="운영자 도구">
          <details className={`${ui.slide} ${styles.create}`}>
            <summary className={styles.createSummary}>모임 정보 고치기</summary>
            <MeetupForm
              draft={{
                id: meetup.id,
                title: meetup.title,
                description: meetup.description,
                date: seoulDateKey(meetup.startsAt),
                time: formatTime(meetup.startsAt),
                durationMinutes: meetup.durationMinutes,
                location: meetup.location,
                format: meetup.format,
                capacity: meetup.capacity,
                access: meetup.access,
              }}
            />
          </details>
          <ConfirmButton
            run={deleteMeetupAction.bind(null, { id: meetup.id })}
            question={`이 모임을 삭제할까요? 신청한 ${meetup.going}명의 명단도 함께 사라져요.`}
            confirmLabel="모임 삭제"
          >
            <Trash2 aria-hidden="true" />
            모임 삭제
          </ConfirmButton>
        </section>
      ) : null}
    </div>
  );
}
