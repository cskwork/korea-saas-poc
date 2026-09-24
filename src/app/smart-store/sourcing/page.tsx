import type { Metadata } from "next";
import { SourcingPage } from "@/pocs/smart-store/components/sourcing/SourcingPage";
import { getCatalog } from "@/pocs/smart-store/server/queries";
import { catalogFilters, type SearchParams } from "@/pocs/smart-store/server/search-params";

export const metadata: Metadata = {
  title: "도매 소싱",
  description:
    "도매매·도매꾹 상품을 네이버 카테고리 수수료와 배송비를 뺀 실제 마진으로 비교하고, 한 번에 스마트스토어 등록까지 이어갑니다.",
};

export const maxDuration = 60;

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const filters = catalogFilters(await searchParams);
  const catalog = await getCatalog(filters);
  return <SourcingPage filters={filters} {...catalog} />;
}
