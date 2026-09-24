import type { CourseCategory, CourseColor, LessonType, ProductType } from "../db/schema";

/** Korean labels and fixed vocabularies shared by the studio and the school. */

export const CATEGORIES: readonly { value: CourseCategory; label: string }[] = [
  { value: "programming", label: "프로그래밍" },
  { value: "design", label: "디자인" },
  { value: "data", label: "데이터" },
  { value: "marketing", label: "마케팅" },
];

export const LESSON_TYPES: readonly { value: LessonType; label: string }[] = [
  { value: "video", label: "영상" },
  { value: "text", label: "텍스트" },
  { value: "quiz", label: "퀴즈" },
];

export const PRODUCT_TYPES: readonly { value: ProductType; label: string; format: string }[] = [
  { value: "notion", label: "노션 템플릿", format: "노션 복제 링크" },
  { value: "pdf", label: "PDF", format: "PDF 파일" },
  { value: "sheet", label: "스프레드시트", format: "구글 시트 복사 링크" },
];

/**
 * Course identity colours: each course keeps one block colour everywhere
 * (timetables, charts, roster chips). Order = assignment order for new courses.
 */
export const COURSE_COLORS: readonly { value: CourseColor; label: string }[] = [
  { value: "sky", label: "하늘" },
  { value: "pink", label: "분홍" },
  { value: "mint", label: "민트" },
  { value: "tangerine", label: "귤" },
  { value: "lavender", label: "라벤더" },
  { value: "tomato", label: "토마토" },
  { value: "lime", label: "라임" },
  { value: "lemon", label: "레몬" },
];

const labelOf = <T extends string>(list: readonly { value: T; label: string }[], value: T) =>
  list.find((item) => item.value === value)?.label ?? value;

export const categoryLabel = (value: CourseCategory) => labelOf(CATEGORIES, value);
export const lessonTypeLabel = (value: LessonType) => labelOf(LESSON_TYPES, value);
export const productTypeLabel = (value: ProductType) => labelOf(PRODUCT_TYPES, value);
export const colorLabel = (value: CourseColor) => labelOf(COURSE_COLORS, value);

/** The first colour not used by an existing course (cycles when all are taken). */
export function nextCourseColor(used: readonly CourseColor[]): CourseColor {
  const free = COURSE_COLORS.find((color) => !used.includes(color.value));
  return free ? free.value : COURSE_COLORS[used.length % COURSE_COLORS.length].value;
}

/** Whole-percent discount of the sale price against the list price (0 when not discounted). */
export function discountPercent(listPrice: number, price: number): number {
  if (listPrice <= 0 || price >= listPrice) return 0;
  return Math.round(((listPrice - price) / listPrice) * 100);
}
