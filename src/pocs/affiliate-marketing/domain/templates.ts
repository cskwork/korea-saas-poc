import type { ArticleKind } from "./catalog";
import { disclosureLine } from "./catalog";

/**
 * Deterministic Korean drafts for the three content templates. These are the
 * fallback when Claude is unavailable, so they are written to be publishable
 * after a light edit: real structure, the tracked links and the disclosure.
 */

export interface DraftItem {
  name: string;
  priceWon: number | null;
  rating: number | null;
  pros: string[];
  cons: string[];
  reason: string;
  /** Absolute tracked short link, when the item is tied to a registered link. */
  url: string | null;
  programName: string | null;
}

export interface DraftRequest {
  kind: ArticleKind;
  title: string;
  audience: string;
  summary: string;
  items: DraftItem[];
}

export interface Draft {
  title: string;
  body: string;
}

const won = (value: number | null) => (value == null ? "가격 확인 필요" : `${new Intl.NumberFormat("ko-KR").format(value)}원`);
const rating = (value: number | null) => (value == null ? "-" : `${value.toFixed(1)}점`);
const list = (values: string[], empty: string) => (values.length ? values.join(", ") : empty);

/** One disclosure naming every program the draft links to. */
export function draftDisclosure(items: readonly DraftItem[]): string {
  const programs = [...new Set(items.map((i) => i.programName?.trim()).filter((p): p is string => Boolean(p)))];
  return disclosureLine(programs.length ? programs.join("·") : null);
}

function linkLine(item: DraftItem): string | null {
  return item.url ? `- 최저가·구매 링크: ${item.url}` : null;
}

function defaultTitle(request: DraftRequest): string {
  const names = request.items.map((i) => i.name);
  switch (request.kind) {
    case "comparison":
      return `${names.join(" vs ")} 비교, 뭘 사야 할까?`;
    case "ranking":
      return `${request.audience ? `${request.audience}을 위한 ` : ""}추천 TOP ${names.length}`;
    case "review":
      return `${names[0] ?? "제품"} 상세 리뷰: 장단점 솔직 정리`;
  }
}

function comparison(request: DraftRequest): string[] {
  const { items } = request;
  const header = `| 항목 | ${items.map((i) => i.name).join(" | ")} |`;
  const separator = `|---|${items.map(() => "---").join("|")}|`;
  const row = (label: string, pick: (i: DraftItem) => string) => `| ${label} | ${items.map(pick).join(" | ")} |`;

  const priced = items.filter((i) => i.priceWon != null);
  const cheapest = priced.length ? priced.reduce((a, b) => (b.priceWon! < a.priceWon! ? b : a)) : null;
  const rated = items.filter((i) => i.rating != null);
  const topRated = rated.length ? rated.reduce((a, b) => (b.rating! > a.rating! ? b : a)) : null;
  const richest = items.reduce((a, b) => (b.pros.length > a.pros.length ? b : a));

  const picks = [
    cheapest && `- **가격이 가장 중요하다면:** ${cheapest.name} (${won(cheapest.priceWon)})`,
    topRated && `- **만족도를 우선한다면:** ${topRated.name} (${rating(topRated.rating)})`,
    richest.pros.length > 0 && `- **기능·장점이 많은 쪽을 원한다면:** ${richest.name} (${richest.pros.slice(0, 2).join(", ")})`,
  ].filter((line): line is string => Boolean(line));

  return [
    `${request.audience ? `${request.audience}께 ` : ""}자주 비교되는 ${items.length}개 제품을 가격, 평점, 장단점 기준으로 나란히 정리했어요.${request.summary ? ` ${request.summary}` : ""}`,
    "## 한눈에 비교",
    [header, separator, row("가격", (i) => won(i.priceWon)), row("평점", (i) => rating(i.rating)), row("장점", (i) => list(i.pros, "-")), row("단점", (i) => list(i.cons, "-"))].join("\n"),
    "## 제품별 한 줄 평",
    ...items.flatMap((item) => [
      `### ${item.name}`,
      [
        `- 장점: ${list(item.pros, "정리 중")}`,
        `- 아쉬운 점: ${list(item.cons, "크게 없음")}`,
        item.reason ? `- 한 줄 평: ${item.reason}` : null,
        linkLine(item),
      ]
        .filter(Boolean)
        .join("\n"),
    ]),
    "## 이런 분께 추천해요",
    picks.join("\n") || "- 사용 목적에 맞춰 장단점을 비교해 보세요.",
    "## 마무리",
    "가격은 판매처와 시점에 따라 달라질 수 있어요. 구매 전에 링크에서 최신 가격과 배송 조건을 꼭 확인하세요.",
  ];
}

function ranking(request: DraftRequest): string[] {
  const { items } = request;
  return [
    `${request.audience ? `${request.audience}께 ` : ""}직접 비교해 보고 추린 ${items.length}개 제품을 순위로 정리했어요.${request.summary ? ` ${request.summary}` : ""}`,
    ...items.flatMap((item, index) => [
      `## ${index + 1}위. ${item.name}`,
      [
        `- 가격: ${won(item.priceWon)}`,
        item.rating != null ? `- 평점: ${rating(item.rating)}` : null,
        `- 추천 이유: ${item.reason || list(item.pros, "꾸준히 많이 찾는 제품")}`,
        item.cons.length ? `- 참고할 점: ${item.cons.join(", ")}` : null,
        linkLine(item),
      ]
        .filter(Boolean)
        .join("\n"),
    ]),
    "## 순위 요약",
    items.map((item, index) => `${index + 1}. ${item.name} (${won(item.priceWon)})`).join("\n"),
    "순위는 가격 대비 만족도를 기준으로 정했어요. 가격은 시점에 따라 달라질 수 있으니 구매 전 링크에서 확인하세요.",
  ];
}

function review(request: DraftRequest): string[] {
  const item = request.items[0];
  if (!item) return [];
  return [
    `## 총평: ${item.rating != null ? `${item.rating.toFixed(1)}점 / 5점` : "평점 미정"}`,
    `${item.name}을(를) 직접 써 보며 좋았던 점과 아쉬운 점을 정리했어요.${request.summary ? ` ${request.summary}` : ""}`,
    ["| 항목 | 내용 |", "|---|---|", `| 가격 | ${won(item.priceWon)} |`, `| 평점 | ${rating(item.rating)} |`, `| 추천 대상 | ${request.audience || "가성비를 중요하게 보는 분"} |`].join("\n"),
    "## 좋았던 점",
    item.pros.length ? item.pros.map((p) => `- ${p}`).join("\n") : "- 사용하면서 느낀 장점을 적어 주세요.",
    "## 아쉬운 점",
    item.cons.length ? item.cons.map((c) => `- ${c}`).join("\n") : "- 크게 아쉬운 점은 없었어요.",
    ...(item.reason ? ["## 이런 분께 추천해요", item.reason] : []),
    "## 구매 전 체크",
    ["- 가격과 사은품 구성은 시점에 따라 달라질 수 있어요.", linkLine(item)].filter(Boolean).join("\n"),
  ];
}

export function templateDraft(request: DraftRequest): Draft {
  const title = request.title.trim() || defaultTitle(request);
  const sections =
    request.kind === "comparison" ? comparison(request) : request.kind === "ranking" ? ranking(request) : review(request);
  const body = [`> ${draftDisclosure(request.items)}`, ...sections].join("\n\n");
  return { title, body };
}

/** The same request as a compact brief for Claude (stable field order, no free-form markup). */
export function describeRequest(request: DraftRequest): string {
  const lines = [
    `템플릿: ${request.kind}`,
    `제목 희망: ${request.title || "(자유)"}`,
    `대상 독자: ${request.audience || "(미지정)"}`,
    `추가 메모: ${request.summary || "(없음)"}`,
    `대가성 문구(첫 줄에 인용으로 그대로): ${draftDisclosure(request.items)}`,
    "제품:",
    ...request.items.map((item, index) =>
      [
        `${index + 1}. ${item.name}`,
        `   가격: ${won(item.priceWon)} / 평점: ${rating(item.rating)}`,
        `   장점: ${list(item.pros, "-")} / 단점: ${list(item.cons, "-")}`,
        `   추천 이유: ${item.reason || "-"}`,
        `   링크(그대로 사용): ${item.url ?? "(없음)"}`,
      ].join("\n"),
    ),
  ];
  return lines.join("\n");
}
