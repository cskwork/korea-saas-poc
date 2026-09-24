import type { Metadata } from "next";
import { LinksScreen } from "@/pocs/affiliate-marketing/components/links/LinksScreen";
import { flag, parseLinkFilters } from "@/pocs/affiliate-marketing/server/params";
import { getLinks, shortLinkOrigin } from "@/pocs/affiliate-marketing/server/queries";

export const metadata: Metadata = {
  title: "링크 진열대",
  description: "제휴 링크를 프로그램·상태·카테고리로 찾고, 링크별 클릭과 판매, 수익을 비교하세요.",
};

export default async function LinksPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const filters = parseLinkFilters(params);
  const data = await getLinks(filters);
  return (
    <LinksScreen
      {...data}
      origin={shortLinkOrigin()}
      deleted={flag(params, "deleted")}
      filters={{ q: filters.q ?? "", programId: filters.programId ?? "", status: filters.status ?? "", category: filters.category ?? "", sort: filters.sort ?? "" }}
    />
  );
}
