import type { Metadata } from "next";
import { RevenueReport } from "@/pocs/online-education/components/revenue/RevenueReport";
import { getRevenue } from "@/pocs/online-education/server/queries";

export const metadata: Metadata = {
  title: "수익 분석",
  description: "월별 매출, 강의와 디지털 상품의 비중, 성장률과 예상 정산액을 결제 기록으로 계산해요.",
};

type Params = Record<string, string | string[] | undefined>;

export default async function RevenuePage({ searchParams }: { searchParams: Promise<Params> }) {
  const report = await getRevenue(await searchParams);
  return <RevenueReport report={report} />;
}
