import type { Metadata } from "next";
import { ConversionsScreen } from "@/pocs/affiliate-marketing/components/conversions/ConversionsScreen";
import { parseConversionFilters } from "@/pocs/affiliate-marketing/server/params";
import { getConversions, recentMonths } from "@/pocs/affiliate-marketing/server/queries";

export const metadata: Metadata = {
  title: "판매 기록",
  description: "제휴 프로그램에서 확인한 주문을 기록하고, 구매 확정·취소 상태에 따라 수수료 합계를 관리하세요.",
};

export default async function ConversionsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const months = recentMonths(6);
  const filters = parseConversionFilters(await searchParams, months);
  const data = await getConversions(filters);
  return <ConversionsScreen {...data} months={months} filters={filters} />;
}
