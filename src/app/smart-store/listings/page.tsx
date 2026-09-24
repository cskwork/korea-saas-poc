import type { Metadata } from "next";
import { ListingsPage } from "@/pocs/smart-store/components/listings/ListingsPage";
import { getListings } from "@/pocs/smart-store/server/queries";
import { listingFilters, param, type SearchParams } from "@/pocs/smart-store/server/search-params";

export const metadata: Metadata = {
  title: "등록 상품",
  description: "스마트스토어에 올린 상품의 판매가, 남는 돈, 판매 상태를 관리합니다.",
};

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const filters = listingFilters(params);
  const { entries, counts } = await getListings(filters);
  return (
    <ListingsPage entries={entries} counts={counts} filters={filters} deleted={param(params, "deleted") === "1"} />
  );
}
