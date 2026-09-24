import type { Metadata } from "next";
import { DashboardScreen } from "@/pocs/affiliate-marketing/components/dashboard/DashboardScreen";
import { getDashboard, shortLinkOrigin } from "@/pocs/affiliate-marketing/server/queries";

export const metadata: Metadata = {
  title: "대시보드",
  description: "이번 달 제휴 링크 수익, 목표 달성률, 잘 팔린 링크와 방금 들어온 클릭을 한 화면에서 확인하세요.",
};

export default async function AffiliateDashboardPage() {
  const data = await getDashboard();
  return <DashboardScreen data={data} origin={shortLinkOrigin()} />;
}
