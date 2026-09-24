import Link from "next/link";
import clsx from "clsx";
import { ChevronLeft, ChevronRight, FileText, Plus, TrendingDown, TrendingUp } from "lucide-react";
import { formatPercent, formatRelative, formatWon } from "@/core/format";
import type { readDashboard } from "../../server/reads";
import { dayLabel, monthLabel } from "../../domain/calendar";
import { formatRuntime } from "../../domain/duration";
import { paceLabel } from "../../domain/study-plan";
import { CurriculumFingerprint } from "../timetable/CurriculumFingerprint";
import { WeekTimetable } from "../timetable/WeekTimetable";
import ui from "../ui/ui.module.css";
import styles from "./dashboard.module.css";

type DashboardData = Awaited<ReturnType<typeof readDashboard>>;

export function Dashboard({ data, now }: { data: DashboardData; now: Date }) {
  const { timetable, month, split, courseShares, drafts, recentEnrollments, courses, weekOffset } = data;
  const published = courses.filter((course) => course.status === "published");
  const first = timetable.days[0];
  const last = timetable.days[6];

  return (
    <>
      <header className={ui.pageHeader}>
        <div>
          <h1 className={ui.pageTitle}>{timetable.label}</h1>
          <p className={ui.pageLede}>
            {dayLabel(first.key)} – {dayLabel(last.key)} · 결제 <span className={ui.num}>{timetable.count}</span>건 ·{" "}
            <span className={ui.num}>{formatWon(timetable.total)}</span>{" "}
            <span className={ui.badge} data-tone="sample">
              샘플 데이터
            </span>
          </p>
        </div>
        <div className={ui.headerActions}>
          <nav className={styles.weekNav} aria-label="주 이동">
            <Link href={`/online-education?week=${weekOffset - 1}`} className={clsx(ui.button, ui.small)} scroll={false}>
              <ChevronLeft size={15} aria-hidden />
              지난주
            </Link>
            {weekOffset < 0 ? (
              <Link href="/online-education" className={clsx(ui.button, ui.small)} scroll={false}>
                이번 주
              </Link>
            ) : null}
            {weekOffset < 0 ? (
              <Link href={`/online-education?week=${weekOffset + 1}`} className={clsx(ui.button, ui.small)} scroll={false}>
                다음 주
                <ChevronRight size={15} aria-hidden />
              </Link>
            ) : null}
          </nav>
          <Link href="/online-education/courses/new" className={clsx(ui.button, ui.primary)}>
            <Plus size={16} aria-hidden />새 강의
          </Link>
        </div>
      </header>

      <div className={styles.layout}>
        <section aria-label="주간 결제 시간표" className={styles.weekSection}>
          <ul role="list" className={styles.legend} aria-label="범례">
            {published.map((course) => (
              <li key={course.id} data-color={course.color} className={styles.legendItem}>
                <span className={ui.swatch} aria-hidden />
                {course.title}
              </li>
            ))}
            <li className={styles.legendItem}>
              <span className={styles.productSwatch} aria-hidden />
              디지털 상품
            </li>
          </ul>
          <WeekTimetable week={timetable} />
          {timetable.count === 0 ? (
            <p className={clsx(ui.notice, ui.info, styles.weekEmpty)}>
              이 주에는 아직 결제가 없어요. 강의를 게시하고 스쿨 링크를 나누면 결제가 이 시간표에 블록으로 쌓여요.
            </p>
          ) : null}
        </section>

        <aside className={styles.side} aria-label="이번 달 요약">
          <section className={styles.sideBlock} aria-labelledby="month-title">
            <div className={ui.sectionHead}>
              <h2 id="month-title" className={ui.sectionTitle}>
                {monthLabel(month.month)} 매출
              </h2>
              <Link href="/online-education/revenue" className={ui.sectionLink}>
                수익 분석
              </Link>
            </div>
            <p className={styles.monthSentence}>
              {monthLabel(month.month)} 1일부터 오늘까지 <strong className={ui.num}>{formatWon(month.current)}</strong>이 들어왔어요.
            </p>
            <GrowthLine month={month} />
            <SplitBar shares={courseShares} product={split.product} total={split.total} />
          </section>

          <section className={styles.sideBlock} aria-labelledby="drafts-title">
            <div className={ui.sectionHead}>
              <h2 id="drafts-title" className={ui.sectionTitle}>
                만들고 있는 강의
              </h2>
            </div>
            {drafts.length === 0 ? (
              <p className={styles.quiet}>초안이 없어요. 모든 강의가 스쿨에 게시돼 있어요.</p>
            ) : (
              <ul role="list" className={styles.draftList}>
                {drafts.map((course) => (
                  <li key={course.id}>
                    <Link href={`/online-education/courses/${course.id}`} className={styles.draft}>
                      <CurriculumFingerprint shape={course.shape} color={course.color} width={48} height={40} />
                      <span>
                        <span className={styles.draftTitle}>{course.title}</span>
                        <span className={styles.draftMeta}>
                          레슨 {course.lessonCount}개 · {formatRuntime(course.runtimeSeconds)} · 이어서 만들기
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={styles.sideBlock} aria-labelledby="recent-title">
            <div className={ui.sectionHead}>
              <h2 id="recent-title" className={ui.sectionTitle}>
                최근 수강 신청
              </h2>
              <Link href="/online-education/students" className={ui.sectionLink}>
                수강생
              </Link>
            </div>
            {recentEnrollments.length === 0 ? (
              <p className={styles.quiet}>아직 수강 신청이 없어요.</p>
            ) : (
              <ul role="list" className={styles.recentList}>
                {recentEnrollments.map((row) => (
                  <li key={row.id} className={styles.recent} data-color={row.color}>
                    <span className={ui.swatch} aria-hidden />
                    <span className={styles.recentBody}>
                      <Link href={`/online-education/students/${row.learnerId}`} className={styles.recentName}>
                        {row.learnerName}
                      </Link>
                      <span className={styles.recentCourse}>{row.courseTitle}</span>
                    </span>
                    <span className={styles.recentMeta}>
                      <time dateTime={row.enrolledAt.toISOString()}>{formatRelative(row.enrolledAt, now)}</time>
                      <span>{paceLabel(row)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>

      <section className={styles.coursesSection} aria-labelledby="courses-title">
        <div className={ui.sectionHead}>
          <h2 id="courses-title" className={ui.sectionTitle}>
            강의별 현황
          </h2>
          <Link href="/online-education/courses" className={ui.sectionLink}>
            강의 관리
          </Link>
        </div>
        <ul role="list" className={styles.courseRows}>
          {courses.map((course) => (
            <li key={course.id}>
              <Link href={`/online-education/courses/${course.id}`} className={styles.courseRow}>
                <CurriculumFingerprint shape={course.shape} color={course.color} />
                <span className={styles.courseMain}>
                  <span className={styles.courseTitle}>{course.title}</span>
                  <span className={styles.courseMeta}>
                    <span className={ui.badge} data-tone={course.status === "published" ? "live" : undefined}>
                      {course.status === "published" ? "게시 중" : "초안"}
                    </span>
                    섹션 {course.sectionCount} · 레슨 {course.lessonCount} · {formatRuntime(course.runtimeSeconds)}
                  </span>
                </span>
                <span className={styles.courseFigure}>
                  <span className={styles.figureLabel}>수강생</span>
                  <span className={ui.num}>{course.studentCount.toLocaleString("ko-KR")}명</span>
                </span>
                <span className={styles.courseFigure}>
                  <span className={styles.figureLabel}>누적 매출</span>
                  <span className={ui.num}>{formatWon(course.revenue)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function GrowthLine({ month }: { month: DashboardData["month"] }) {
  const previousLabel = `${monthLabel(month.previousMonth)} 1–${month.previousThroughDay}일`;
  if (month.growth === null) {
    return <p className={styles.growth}>지난달 같은 기간({previousLabel})에는 매출이 없어 비교할 수 없어요.</p>;
  }
  const up = month.growth >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <p className={styles.growth} data-trend={up ? "up" : "down"}>
      <Icon size={16} aria-hidden />
      <span>
        지난달 같은 기간({previousLabel}, <span className={ui.num}>{formatWon(month.previous)}</span>)보다{" "}
        <strong className={ui.num}>{formatPercent(Math.abs(month.growth), 0)}</strong> {up ? "늘었어요" : "줄었어요"}.
      </span>
    </p>
  );
}

function SplitBar({
  shares,
  product,
  total,
}: {
  shares: DashboardData["courseShares"];
  product: number;
  total: number;
}) {
  if (total === 0) return <p className={styles.quiet}>이번 달 결제가 아직 없어요.</p>;
  const courseTotal = total - product;
  const label = `강의 ${formatPercent(courseTotal / total, 0)}, 디지털 상품 ${formatPercent(product / total, 0)}`;
  return (
    <div className={styles.split}>
      <div className={styles.splitBar} role="img" aria-label={`이번 달 매출 구성: ${label}`}>
        {shares.map((share) => (
          <span key={share.key} data-color={share.color ?? undefined} className={styles.splitCourse} style={{ flexGrow: share.revenue }} />
        ))}
        {product > 0 ? <span className={styles.splitProduct} style={{ flexGrow: product }} /> : null}
      </div>
      <ul role="list" className={styles.splitLegend}>
        {shares.map((share) => (
          <li key={share.key} data-color={share.color ?? undefined}>
            <span className={ui.swatch} aria-hidden />
            <span className={styles.splitName}>{share.title}</span>
            <span className={ui.num}>{formatWon(share.revenue)}</span>
          </li>
        ))}
        {product > 0 ? (
          <li>
            <FileText size={14} aria-hidden className={styles.productIcon} />
            <span className={styles.splitName}>디지털 상품</span>
            <span className={ui.num}>{formatWon(product)}</span>
          </li>
        ) : null}
      </ul>
    </div>
  );
}
