import type { Metadata } from "next";
import { RevenueView, type RevenuePeriod } from "@/pocs/ai-design-video/components/revenue/RevenueView";
import { getRevenue } from "@/pocs/ai-design-video/server/queries";

export const metadata: Metadata = {
  title: "수익 분석",
  description: "월별 납품액과 목표 달성률, 작업 종류별·단건/구독별 매출을 실제 주문 데이터로 계산해요.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { period } = await searchParams;
  const valid: RevenuePeriod = period === "month" || period === "year" ? period : "quarter";
  return <RevenueView {...await getRevenue()} period={valid} />;
}
