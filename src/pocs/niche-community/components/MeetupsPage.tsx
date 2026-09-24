import Link from "next/link";
import { Lock, MapPin, Plus, Video } from "lucide-react";
import { formatMonthDay, formatTime } from "@/core/format";
import { joinProblem, meetupPhase } from "../domain/meetups";
import { hasPremiumAccess, isOperator } from "../domain/rules";
import { addDays, seoulDateKey } from "../domain/time";
import type { getMeetupsPage } from "../server/queries";
import type { MeetupView } from "../server/types";
import { MeetupForm } from "./MeetupForm";
import { RsvpButton } from "./RsvpButton";
import { SeatMeter } from "./SeatMeter";
import { StageBand } from "./StageBand";
import styles from "./meetups.module.css";
import ui from "./ui.module.css";

type MeetupsData = Awaited<ReturnType<typeof getMeetupsPage>>;

const endTime = (meetup: MeetupView) => new Date(meetup.startsAt.getTime() + meetup.durationMinutes * 60_000);

/** The run-of-show: upcoming meetups as a timetable, the past ones as a record. */
export function MeetupsPage({ data }: { data: MeetupsData }) {
  const { meetups, viewer, now, next } = data;
  const upcoming = meetups.filter((meetup) => meetupPhase(meetup, now) !== "ended");
  const past = meetups.filter((meetup) => meetupPhase(meetup, now) === "ended").reverse();

  return (
    <>
      <StageBand meetup={next} viewer={viewer} now={now} />
      <div className={`${ui.page} ${styles.page}`}>
        <header className={styles.header}>
          <h1 className={ui.pageTitle}>모임</h1>
          <p className={ui.pageLead}>
            매달 데모데이와 토요일 모각작, 프리미엄 멤버 오피스아워. 신청하면 운영자에게 명단이 바로 보여요.
          </p>
        </header>

        {isOperator(viewer) ? (
          <details id="new-meetup" className={`${ui.slide} ${styles.create}`}>
            <summary className={styles.createSummary}>
              <Plus size={18} aria-hidden="true" />
              새 모임 열기
            </summary>
            <MeetupForm
              draft={{
                title: "",
                description: "",
                date: addDays(seoulDateKey(now), 7),
                time: "19:30",
                durationMinutes: 120,
                location: "",
                format: "offline",
                capacity: 20,
                access: "open",
              }}
            />
          </details>
        ) : null}

        <section aria-labelledby="nc-upcoming" className={styles.section}>
          <h2 id="nc-upcoming" className={ui.sectionTitle}>
            다가오는 순서
          </h2>
          {upcoming.length ? (
            <ol className={`${ui.slide} ${styles.runOfShow}`}>
              {upcoming.map((meetup) => {
                const blocked = joinProblem({ meetup, viewer, going: meetup.going, alreadyGoing: meetup.viewerGoing, now });
                const live = meetupPhase(meetup, now) === "live";
                return (
                  <li key={meetup.id} className={styles.row}>
                    <p className={styles.when}>
                      <span className={styles.day}>{formatMonthDay(meetup.startsAt)}</span>
                      <span className={styles.clock}>
                        {formatTime(meetup.startsAt)}
                        <span className={styles.clockEnd}>–{formatTime(endTime(meetup))}</span>
                      </span>
                      {live ? <span className={`${ui.tag} ${ui.tagAccent}`}>진행 중</span> : null}
                    </p>
                    <div className={styles.what}>
                      <h3 className={styles.rowTitle}>
                        <Link href={`/niche-community/meetups/${meetup.id}`}>{meetup.title}</Link>
                      </h3>
                      <p className={styles.where}>
                        {meetup.format === "online" ? <Video size={14} aria-hidden="true" /> : <MapPin size={14} aria-hidden="true" />}
                        {meetup.location}
                        {meetup.access === "premium" ? (
                          <span className={`${ui.tag} ${ui.secret}`}>
                            <Lock aria-hidden="true" />
                            프리미엄 전용
                          </span>
                        ) : null}
                      </p>
                    </div>
                    <SeatMeter going={meetup.going} capacity={meetup.capacity} />
                    <RsvpButton
                      meetupId={meetup.id}
                      going={meetup.viewerGoing}
                      blockedReason={blocked}
                      needsPremium={meetup.access === "premium" && !hasPremiumAccess(viewer)}
                    />
                  </li>
                );
              })}
            </ol>
          ) : (
            <div className={`${ui.slide} ${styles.empty}`}>
              <p className={styles.emptyTitle}>예정된 모임이 없어요</p>
              <p className={styles.emptyText}>
                {isOperator(viewer) ? "위의 ‘새 모임 열기’로 다음 데모데이를 잡아 보세요." : "운영자가 모임을 열면 여기에 순서대로 올라와요."}
              </p>
            </div>
          )}
        </section>

        {past.length ? (
          <section aria-labelledby="nc-past" className={styles.section}>
            <h2 id="nc-past" className={ui.sectionTitle}>
              지난 모임
            </h2>
            <table className={styles.pastTable}>
              <caption className={ui.srOnly}>지난 모임과 참석 인원</caption>
              <thead>
                <tr>
                  <th scope="col">날짜</th>
                  <th scope="col">모임</th>
                  <th scope="col" className={styles.numCol}>
                    참석
                  </th>
                </tr>
              </thead>
              <tbody>
                {past.map((meetup) => (
                  <tr key={meetup.id}>
                    <td className={styles.pastDate}>{formatMonthDay(meetup.startsAt)}</td>
                    <td>
                      <Link href={`/niche-community/meetups/${meetup.id}`} className={ui.link}>
                        {meetup.title}
                      </Link>
                      {meetup.viewerGoing ? <span className={styles.attended}> · 나도 참석</span> : null}
                    </td>
                    <td className={styles.numCol}>
                      {meetup.going} / {meetup.capacity}명
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ) : null}
      </div>
    </>
  );
}
