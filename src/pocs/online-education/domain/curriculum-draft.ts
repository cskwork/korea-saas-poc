import { z } from "zod";
import type { CourseCategory } from "../db/schema";

/**
 * A first curriculum for an empty course: sections of lessons with a type,
 * a running time and a preview flag. Claude drafts it when available; the
 * template below is the offline answer and always produces a usable course.
 */

export const curriculumDraftSchema = z.object({
  sections: z.array(
    z.object({
      title: z.string(),
      lessons: z.array(
        z.object({
          title: z.string(),
          type: z.enum(["video", "text", "quiz"]),
          minutes: z.number(),
          isPreview: z.boolean(),
        }),
      ),
    }),
  ),
});

export type CurriculumDraft = z.infer<typeof curriculumDraftSchema>;

export const DRAFT_LIMITS = { sections: 6, lessons: 8, minMinutes: 1, maxMinutes: 180 } as const;

/** Trims, clamps and drops empty parts so any draft (Claude's or ours) is safe to insert. */
export function normalizeDraft(draft: CurriculumDraft): CurriculumDraft {
  const sections = draft.sections
    .map((section) => ({
      title: section.title.trim().slice(0, 60),
      lessons: section.lessons
        .map((lesson) => ({
          title: lesson.title.trim().slice(0, 80),
          type: lesson.type,
          minutes: Math.min(DRAFT_LIMITS.maxMinutes, Math.max(DRAFT_LIMITS.minMinutes, Math.round(lesson.minutes || 10))),
          isPreview: lesson.isPreview,
        }))
        .filter((lesson) => lesson.title.length > 0)
        .slice(0, DRAFT_LIMITS.lessons),
    }))
    .filter((section) => section.title.length > 0 && section.lessons.length > 0)
    .slice(0, DRAFT_LIMITS.sections);
  return { sections };
}

const CORE_SECTIONS: Record<CourseCategory, string[]> = {
  programming: ["기본 문법과 구조 익히기", "작은 기능 직접 만들기", "실전 프로젝트 완성하기"],
  design: ["도구와 기본기 다지기", "실무 화면 만들기", "포트폴리오로 정리하기"],
  data: ["데이터 불러오고 정리하기", "분석하고 시각화하기", "리포트로 전달하기"],
  marketing: ["목표 고객과 메시지 정하기", "채널별로 실행하기", "성과 측정하고 개선하기"],
};

/** Deterministic Korean curriculum from the course's own title, category and outcomes. */
export function templateDraft(course: { title: string; category: CourseCategory; outcomes: string[] }): CurriculumDraft {
  const topics = course.outcomes.length > 0 ? course.outcomes.slice(0, 4) : CORE_SECTIONS[course.category];
  return normalizeDraft({
    sections: [
      {
        title: "시작하기",
        lessons: [
          { title: `${course.title} 한눈에 보기`, type: "video", minutes: 8, isPreview: true },
          { title: "준비물과 학습 환경 만들기", type: "video", minutes: 12, isPreview: true },
        ],
      },
      ...topics.map((topic) => ({
        title: topic,
        lessons: [
          { title: "핵심 개념 이해하기", type: "video" as const, minutes: 15, isPreview: false },
          { title: "따라 하며 실습하기", type: "video" as const, minutes: 25, isPreview: false },
          { title: "정리 노트", type: "text" as const, minutes: 8, isPreview: false },
        ],
      })),
      {
        title: "마무리",
        lessons: [
          { title: "배운 내용 점검 퀴즈", type: "quiz", minutes: 10, isPreview: false },
          { title: "다음에 배울 것", type: "text", minutes: 5, isPreview: false },
        ],
      },
    ],
  });
}
