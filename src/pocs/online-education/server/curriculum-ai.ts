import "server-only";
import { generateObject } from "@/core/ai";
import type { Course } from "../db/schema";
import { categoryLabel } from "../domain/catalog";
import { curriculumDraftSchema, normalizeDraft, templateDraft, type CurriculumDraft } from "../domain/curriculum-draft";

const SYSTEM = `당신은 한국의 1인 강사가 온라인 강의를 설계하도록 돕는 교육 설계자입니다.
강의 제목, 소개, 카테고리, 배울 내용을 보고 커리큘럼 초안을 JSON으로 만듭니다.
규칙:
- 섹션 3~6개, 섹션마다 레슨 2~6개. 배우는 순서대로 배치합니다.
- 레슨 type은 video(영상), text(텍스트), quiz(퀴즈) 중 하나이고, 섹션 끝에는 필요할 때만 퀴즈를 둡니다.
- minutes는 5~45 사이의 정수로, 실습 레슨은 길게, 개념 소개는 짧게 잡습니다.
- 첫 섹션의 앞 레슨 1~2개만 isPreview를 true로 둡니다.
- 제목은 한국어로 짧고 구체적으로 씁니다. 수익 보장이나 과장된 약속은 쓰지 않습니다.`;

export interface DraftOutcome {
  draft: CurriculumDraft;
  source: "claude" | "template";
  notice?: string;
}

/** Claude's curriculum draft for the course, or the deterministic template. */
export async function draftCurriculum(course: Pick<Course, "title" | "description" | "category" | "outcomes">): Promise<DraftOutcome> {
  const fallback = () => templateDraft(course);
  const outcome = await generateObject({
    feature: "online-education.curriculum-draft",
    system: SYSTEM,
    prompt: [
      `강의 제목: ${course.title}`,
      `카테고리: ${categoryLabel(course.category)}`,
      `강의 소개: ${course.description}`,
      `배울 내용: ${course.outcomes.length > 0 ? course.outcomes.join(" / ") : "(없음)"}`,
    ].join("\n"),
    schema: curriculumDraftSchema,
    fallback,
    maxTokens: 3000,
  });
  const draft = normalizeDraft(outcome.data);
  if (draft.sections.length === 0) return { draft: fallback(), source: "template" };
  return { draft, source: outcome.source, notice: outcome.notice };
}
