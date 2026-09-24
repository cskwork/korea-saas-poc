import type { Metadata } from "next";
import { aiStatus } from "@/core/ai";
import { ContentScreen } from "@/pocs/affiliate-marketing/components/content/ContentScreen";
import { ARTICLE_KINDS, type ArticleKind } from "@/pocs/affiliate-marketing/domain/catalog";
import { flag } from "@/pocs/affiliate-marketing/server/params";
import { getContentHome } from "@/pocs/affiliate-marketing/server/queries";

/** Draft generation may call Claude from this page's server action. */
export const maxDuration = 60;

export const metadata: Metadata = {
  title: "콘텐츠 만들기",
  description: "비교 리뷰, 추천 리스트, 상세 리뷰 템플릿으로 짧은 링크와 대가성 문구가 들어간 블로그 초안을 만드세요.",
};

export default async function ContentPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const kind = (ARTICLE_KINDS as readonly string[]).includes(String(params.kind)) ? (params.kind as ArticleKind) : "comparison";
  const { articles, options } = await getContentHome();
  return <ContentScreen kind={kind} articles={articles} options={options} aiEnabled={aiStatus().enabled} deleted={flag(params, "deleted")} />;
}
