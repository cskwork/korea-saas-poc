import type { Metadata } from "next";
import { AnalyticsPage } from "@/pocs/smart-store/components/analytics/AnalyticsPage";
import { getSalesAnalytics } from "@/pocs/smart-store/server/queries";
import { analyticsPeriod, type SearchParams } from "@/pocs/smart-store/server/search-params";

export const metadata: Metadata = {
  title: "매출 분석",
  description: "주문 기록으로 계산한 기간별 매출, 남는 돈, 마진율, 카테고리 비중과 많이 판 상품을 봅니다.",
};

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const analytics = await getSalesAnalytics(analyticsPeriod(await searchParams));
  return <AnalyticsPage analytics={analytics} />;
}
