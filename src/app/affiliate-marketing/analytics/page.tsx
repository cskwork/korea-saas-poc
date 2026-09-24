import type { Metadata } from "next";
import { AnalyticsScreen } from "@/pocs/affiliate-marketing/components/analytics/AnalyticsScreen";
import { parsePeriod } from "@/pocs/affiliate-marketing/server/params";
import { getAnalytics } from "@/pocs/affiliate-marketing/server/queries";

export const metadata: Metadata = {
  title: "매출 분석",
  description: "기간별 클릭, 판매, 전환율, 수익을 링크·프로그램·채널·시간대별로 나눠 보세요.",
};

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const report = await getAnalytics(parsePeriod(await searchParams));
  return <AnalyticsScreen report={report} />;
}
