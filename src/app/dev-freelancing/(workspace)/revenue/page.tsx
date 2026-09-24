import type { Metadata } from "next";
import { RevenueView } from "@/pocs/dev-freelancing/components/revenue/RevenueView";
import { getRevenue, getSettings } from "@/pocs/dev-freelancing/server/queries";

export const metadata: Metadata = {
  title: "수익",
  description: "월별 입금, 받을 돈의 나이, 원천징수·부가세 세금 칸, 고객별 입금과 프로젝트별 실효 시급.",
};

export default async function RevenuePage() {
  const [report, profile] = await Promise.all([getRevenue(), getSettings()]);
  return <RevenueView report={report} hourlyRate={profile.hourlyRate} />;
}
