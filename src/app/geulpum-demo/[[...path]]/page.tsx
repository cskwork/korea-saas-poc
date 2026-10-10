import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DemoRenderer, type DemoRoute } from "@/pocs/ai-content-agency/demo/renderer";

/**
 * Every /ai-content-agency page, rewritten here (next.config.ts). The data lives in the visitor's
 * browser, so the server only matches the address; the client renderer reads and writes the data.
 */

type Params = Promise<{ path?: string[] }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function matchRoute(path: string[] = []): DemoRoute | null {
  const [section, id, sub, ...rest] = path;
  if (rest.length) return null;
  if (!section) return { name: "home" };
  if (section === "orders") {
    if (!id) return { name: "orders" };
    if (id === "new") return sub ? null : { name: "newOrder" };
    if (!sub) return { name: "order", id };
    return sub === "delivery" ? { name: "delivery", id } : null;
  }
  if (section === "drafts") {
    if (sub) return null;
    return id ? { name: "draft", id } : { name: "drafts" };
  }
  if (id) return null;
  if (section === "write" || section === "portfolio" || section === "pricing") return { name: section };
  return null;
}

// The same titles as the server pages; details can't name their order or draft before the browser reads it.
const METADATA: Record<DemoRoute["name"], Metadata> = {
  home: { title: "현황", description: "오늘 마감, 검수 대기, 마감일까지 걸린 의뢰와 이번 달 납품 장부를 한눈에 봐요." },
  orders: {
    title: "의뢰 게시대",
    description: "접수부터 납품완료까지, 모든 의뢰를 단계별로 걸어 두고 마감일 순으로 챙겨요.",
  },
  newOrder: {
    title: "의뢰서 쓰기",
    description: "블로그·상품 설명·광고 카피 의뢰를 받아 마감일과 함께 게시대에 걸어요.",
  },
  order: { title: "의뢰", description: "의뢰의 진행 단계, 시안, 납품 기록." },
  delivery: { title: "납품서", description: "고객에게 보내는 납품 원고.", robots: { index: false } },
  write: {
    title: "시안 쓰기",
    description: "블로그 포스트, 상품 설명, 광고 카피 시안을 말투·분량·키워드에 맞춰 써서 원고함에 저장해요.",
  },
  drafts: {
    title: "원고함",
    description: "AI 시안과 에디터가 고친 원고를 버전 기록과 함께 모아 두고, 찾고, 복사해요.",
  },
  draft: { title: "원고", description: "원고 본문, 글자수, 버전 기록." },
  portfolio: {
    title: "사례",
    description: "업종별로 모아 본 블로그·상품 설명·광고 카피 작업 사례. 납품한 의뢰를 사례로 올릴 수 있어요.",
  },
  pricing: {
    title: "요금제",
    description:
      "스타터 월 29만원, 프로 월 79만원, 엔터프라이즈 맞춤 견적. 한 달에 맡길 의뢰 수와 콘텐츠 유형으로 골라요.",
  },
};

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const route = matchRoute((await params).path);
  return route ? METADATA[route.name] : { title: "찾는 페이지가 없어요" };
}

export default async function GeulpumDemoPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const [{ path }, search] = await Promise.all([params, searchParams]);
  const route = matchRoute(path);
  if (!route) notFound();
  return <DemoRenderer route={route} search={search} />;
}
