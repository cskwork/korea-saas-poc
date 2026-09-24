import { plainText } from "./markup";

export const ISSUE_STATUSES = ["draft", "scheduled", "published"] as const;
export type IssueStatus = (typeof ISSUE_STATUSES)[number];

export const ISSUE_STATUS_LABEL: Record<IssueStatus, string> = {
  draft: "초안",
  scheduled: "발행 예약",
  published: "발행",
};

export const CATEGORIES = ["tech", "business", "marketing", "design", "lifestyle"] as const;
export type Category = (typeof CATEGORIES)[number];

/** 꼭지: the regular sections of the publication. */
export const CATEGORY_LABEL: Record<Category, string> = {
  tech: "테크",
  business: "비즈니스",
  marketing: "마케팅",
  design: "디자인",
  lifestyle: "일과 삶",
};

/** A 200-character 원고지 sheet: how Korean editors measure length. */
const SHEET_CHARACTERS = 200;
/** Korean reading speed, characters per minute. */
const READING_SPEED = 500;

export function characterCount(body: string): number {
  return plainText(body).replace(/\n/g, "").length;
}

/** 원고지 매수, one decimal. */
export function manuscriptSheets(body: string): number {
  return Math.round((characterCount(body) / SHEET_CHARACTERS) * 10) / 10;
}

export function readingMinutes(body: string): number {
  return Math.max(1, Math.round(characterCount(body) / READING_SPEED));
}

export function nextIssueNumber(currentMax: number | null): number {
  return (currentMax ?? 0) + 1;
}

/** Scheduled issues whose time has come, oldest first (publishing assigns numbers in this order). */
export function dueIssues<T extends { status: IssueStatus; scheduledAt: Date | null }>(issues: T[], now: Date): T[] {
  return issues
    .filter((issue) => issue.status === "scheduled" && issue.scheduledAt !== null && issue.scheduledAt <= now)
    .sort((a, b) => (a.scheduledAt?.getTime() ?? 0) - (b.scheduledAt?.getTime() ?? 0));
}

export type IssueCommand = "save" | "schedule" | "unschedule" | "publish";

/** Which commands the editor may run on an issue in a given status. */
export function allowedCommands(status: IssueStatus): IssueCommand[] {
  switch (status) {
    case "draft":
      return ["save", "schedule", "publish"];
    case "scheduled":
      return ["save", "schedule", "unschedule", "publish"];
    case "published":
      return ["save"];
  }
}

/** Reasons an issue cannot be sent yet (empty when it can). */
export function publishProblems(issue: { title: string; body: string }): string[] {
  const problems: string[] = [];
  if (!issue.title.trim()) problems.push("제목을 입력해 주세요.");
  if (characterCount(issue.body) < 20) problems.push("본문을 20자 이상 써 주세요.");
  return problems;
}
