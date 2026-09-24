import type { Metadata } from "next";
import { KeywordsPage } from "@/pocs/smart-store/components/keywords/KeywordsPage";
import { getKeywordResearch } from "@/pocs/smart-store/server/queries";
import { param, type SearchParams } from "@/pocs/smart-store/server/search-params";

export const metadata: Metadata = {
  title: "키워드 리서치",
  description: "상품명에 넣을 네이버 쇼핑 키워드를 월간 검색량, 경쟁도, 트렌드, 추천 점수로 비교하고 저장합니다.",
};

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const query = (param(await searchParams, "q") ?? "").trim().slice(0, 40);
  const research = await getKeywordResearch(query);
  return <KeywordsPage research={research} />;
}
