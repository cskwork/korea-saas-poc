import type { CourseColor, LessonType } from "../../db/schema";
import { lessonTypeLabel } from "../../domain/catalog";
import { formatClock, formatRuntime, toMinutes } from "../../domain/duration";
import { LessonTypeIcon } from "./LessonTypeIcon";
import styles from "./timetable.module.css";

export interface TimetableSection {
  id: string;
  title: string;
  lessons: { id: string; title: string; type: LessonType; durationSeconds: number; isPreview: boolean }[];
}

/** Read-only curriculum laid out as a timetable: sections are columns, lesson blocks grow with running time. */
export function CurriculumTimetable({ sections, color }: { sections: TimetableSection[]; color: CourseColor }) {
  return (
    <ol role="list" className={styles.curriculum} data-color={color}>
      {sections.map((section, index) => {
        const seconds = section.lessons.reduce((sum, lesson) => sum + lesson.durationSeconds, 0);
        return (
          <li key={section.id} className={styles.column}>
            <div className={styles.columnHead}>
              <span className={styles.columnIndex} aria-hidden>
                {index + 1}
              </span>
              <div>
                <h3 className={styles.columnTitle}>
                  <span className={styles.srOnlyInline}>섹션 {index + 1}. </span>
                  {section.title}
                </h3>
                <p className={styles.columnMeta}>
                  레슨 {section.lessons.length}개 · {formatRuntime(seconds)}
                </p>
              </div>
            </div>
            {section.lessons.length === 0 ? (
              <p className={styles.columnEmpty}>준비 중인 섹션이에요.</p>
            ) : (
              <ol role="list" className={styles.stack}>
                {section.lessons.map((lesson) => (
                  <li
                    key={lesson.id}
                    className={styles.lesson}
                    data-type={lesson.type}
                    style={{ "--m": toMinutes(lesson.durationSeconds) } as React.CSSProperties}
                  >
                    <span className={styles.lessonMeta}>
                      <LessonTypeIcon type={lesson.type} />
                      {lessonTypeLabel(lesson.type)} · <time>{formatClock(lesson.durationSeconds)}</time>
                    </span>
                    <span className={styles.lessonTitle}>{lesson.title}</span>
                    {lesson.isPreview ? <span className={styles.previewTag}>미리보기</span> : null}
                  </li>
                ))}
              </ol>
            )}
          </li>
        );
      })}
    </ol>
  );
}
