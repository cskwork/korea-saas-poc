import Link from "next/link";
import clsx from "clsx";
import { ArrowLeft, Eye } from "lucide-react";
import { formatWon } from "@/core/format";
import type { CourseDetail } from "../../server/reads";
import { categoryLabel, discountPercent } from "../../domain/catalog";
import { formatRuntime } from "../../domain/duration";
import { CourseForm } from "../courses/CourseForm";
import { CourseRowActions } from "../courses/CourseRowActions";
import { CurriculumFingerprint } from "../timetable/CurriculumFingerprint";
import { LessonTypeIcon } from "../timetable/LessonTypeIcon";
import { CopyLinkButton } from "../ui/form";
import ui from "../ui/ui.module.css";
import { CurriculumBoard } from "./CurriculumBoard";
import { DeleteCourse } from "./DeleteCourse";
import { DraftCurriculum } from "./DraftCurriculum";
import styles from "./builder.module.css";

/** Curriculum builder + course settings for one course. */
export function CoursePage({ detail, aiEnabled }: { detail: CourseDetail; aiEnabled: boolean }) {
  const { course, sections, stats } = detail;
  const schoolPath = `/online-education/school/courses/${course.id}`;
  const discount = discountPercent(course.listPrice, course.price);

  return (
    <>
      <Link href="/online-education/courses" className={ui.back}>
        <ArrowLeft size={15} aria-hidden />
        강의 목록
      </Link>
      <header className={ui.pageHeader}>
        <div className={styles.titleRow}>
          <CurriculumFingerprint shape={sections.map((s) => s.lessons.map((l) => l.durationSeconds))} color={course.color} />
          <div>
            <h1 className={ui.pageTitle}>{course.title}</h1>
            <p className={ui.pageLede}>
              <span className={ui.badge} data-tone={course.status === "published" ? "live" : undefined}>
                {course.status === "published" ? "게시 중" : "초안"}
              </span>{" "}
              {categoryLabel(course.category)} · {course.price === 0 ? "무료" : formatWon(course.price)}
              {discount > 0 ? ` (정가 ${formatWon(course.listPrice)}에서 ${discount}% 할인)` : ""}
            </p>
          </div>
        </div>
        <div className={ui.headerActions}>
          <Link href={course.status === "draft" ? `${schoolPath}?preview=1` : schoolPath} className={ui.button}>
            <Eye size={16} aria-hidden />
            {course.status === "draft" ? "미리보기" : "스쿨 페이지"}
          </Link>
          {course.status === "published" ? <CopyLinkButton path={schoolPath} label="판매 링크 복사" /> : null}
          <CourseRowActions id={course.id} status={course.status} students={stats.studentCount} showDelete={false} />
        </div>
      </header>

      <p className={styles.facts}>
        <span>
          섹션 <strong>{stats.sectionCount}</strong>
        </span>
        <span>
          레슨 <strong>{stats.lessonCount}</strong>
        </span>
        <span>
          총 <strong>{formatRuntime(stats.runtimeSeconds)}</strong>
        </span>
        <span>
          미리보기 <strong>{stats.previewCount}</strong>개
        </span>
        <span>
          수강생 <strong>{stats.studentCount.toLocaleString("ko-KR")}</strong>명
        </span>
        <span>
          누적 매출 <strong>{formatWon(stats.revenue)}</strong>
        </span>
      </p>

      <section aria-labelledby="curriculum-title">
        <div className={ui.sectionHead}>
          <h2 id="curriculum-title" className={ui.sectionTitle}>
            커리큘럼
          </h2>
        </div>
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
        {sections.length === 0 ? <DraftCurriculum courseId={course.id} aiEnabled={aiEnabled} /> : null}
        <CurriculumBoard
          courseId={course.id}
          color={course.color}
          sections={sections.map((section) => ({
            id: section.id,
            title: section.title,
            lessons: section.lessons.map(({ id, title, type, durationSeconds, isPreview }) => ({ id, title, type, durationSeconds, isPreview })),
          }))}
        />
      </section>

      <section className={styles.settings} aria-labelledby="settings-title">
        <div>
          <div className={ui.sectionHead}>
            <h2 id="settings-title" className={ui.sectionTitle}>
              강의 정보
            </h2>
          </div>
          <CourseForm
            courseId={course.id}
            defaults={{
              title: course.title,
              description: course.description,
              category: course.category,
              color: course.color,
              listPrice: course.listPrice,
              price: course.price,
              outcomes: course.outcomes,
            }}
          />
        </div>
        <aside className={styles.settingsAside}>
          <h3>게시 전에 확인해요</h3>
          <p>레슨이 하나 이상 있어야 게시할 수 있어요. 미리보기로 표시한 레슨은 스쿨에서 누구나 제목을 볼 수 있어요.</p>
          <p>가격을 바꿔도 이미 결제한 수강생의 결제 금액은 그대로예요.</p>
        </aside>
      </section>

      <div className={clsx(styles.dangerWrap)}>
        <DeleteCourse id={course.id} students={stats.studentCount} />
      </div>
    </>
  );
}
