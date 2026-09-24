import Link from "next/link";
import { Check, Clock, Eye, Layers, PlayCircle, Users } from "lucide-react";
import { formatWon } from "@/core/format";
import type { School } from "../../db/schema";
import type { CourseDetail } from "../../server/reads";
import { categoryLabel, discountPercent } from "../../domain/catalog";
import { formatRuntime } from "../../domain/duration";
import { CurriculumTimetable } from "../timetable/CurriculumTimetable";
import { LessonTypeIcon } from "../timetable/LessonTypeIcon";
import ui from "../ui/ui.module.css";
import { EnrollPanel } from "./EnrollPanel";
import styles from "./school.module.css";

/** The public course page: facts and curriculum on the left, price + study planner + registration on the right. */
export function CourseLanding({
  detail,
  school,
  today,
  preview,
}: {
  detail: CourseDetail;
  school: Pick<School, "name" | "creatorName">;
  today: string;
  preview: boolean;
}) {
  const { course, sections, stats, planLessons } = detail;
  const discount = discountPercent(course.listPrice, course.price);
  const isOpen = course.status === "published";

  return (
    <article className={styles.landing} data-color={course.color}>
      <div className={styles.hero}>
        {preview && !isOpen ? (
          <p className={styles.previewBanner} role="note">
            <Eye size={16} aria-hidden />
            초안 미리보기예요. 게시하기 전까지 스쿨에는 보이지 않고 수강 신청도 받지 않아요.{" "}
            <Link href={`/online-education/courses/${course.id}`}>커리큘럼 편집으로</Link>
          </p>
        ) : null}
        <h1 className={styles.courseTitle}>{course.title}</h1>
        <p className={styles.courseLede}>{course.description}</p>
        <ul role="list" className={styles.facts}>
          <li>
            <Layers size={16} aria-hidden />
            {categoryLabel(course.category)}
          </li>
          <li>
            <Clock size={16} aria-hidden />총 {formatRuntime(stats.runtimeSeconds)}
          </li>
          <li>
            <PlayCircle size={16} aria-hidden />
            레슨 {stats.lessonCount}개 · 미리보기 {stats.previewCount}개
          </li>
          <li>
            <Users size={16} aria-hidden />
            수강생 {stats.studentCount.toLocaleString("ko-KR")}명
          </li>
        </ul>
        {course.outcomes.length > 0 ? (
          <section aria-labelledby="outcomes-title" className={styles.outcomes}>
            <h2 id="outcomes-title" className={styles.blockTitle}>
              이런 걸 배워요
            </h2>
            <ul role="list">
              {course.outcomes.map((outcome) => (
                <li key={outcome}>
                  <Check size={16} aria-hidden />
                  {outcome}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      <aside className={styles.rail} aria-label="수강 신청">
        <EnrollPanel
          courseId={course.id}
          color={course.color}
          price={course.price}
          listPrice={course.listPrice}
          discount={discount}
          lessons={planLessons}
          today={today}
          open={isOpen}
        />
      </aside>

      <div className={styles.body}>
        <section aria-labelledby="curriculum-title">
          <h2 id="curriculum-title" className={styles.blockTitle}>
            커리큘럼
          </h2>
          <p className={styles.legend}>
            <span>블록이 길수록 긴 레슨이에요.</span>
            <span>
              <LessonTypeIcon type="video" /> 영상
            </span>
            <span>
              <LessonTypeIcon type="text" /> 텍스트
            </span>
            <span>
              <LessonTypeIcon type="quiz" /> 퀴즈
            </span>
          </p>
          {sections.length === 0 ? (
            <p className={ui.emptyText}>커리큘럼을 준비하고 있어요.</p>
          ) : (
            <CurriculumTimetable sections={sections} color={course.color} />
          )}
        </section>

        <section aria-labelledby="teacher-title" className={styles.teacher}>
          <h2 id="teacher-title" className={styles.blockTitle}>
            강사
          </h2>
          <p>
            <strong>{school.creatorName}</strong> · {school.name}
          </p>
          <Link href="/online-education/school" className={ui.sectionLink}>
            이 스쿨의 다른 강의와 자료 보기
          </Link>
        </section>
      </div>

      {isOpen ? (
        <a href="#enroll" className={styles.mobileCta}>
          <span className={ui.num}>{course.price === 0 ? "무료" : formatWon(course.price)}</span>
          <span>시간표 짜고 수강 신청</span>
        </a>
      ) : null}
    </article>
  );
}
