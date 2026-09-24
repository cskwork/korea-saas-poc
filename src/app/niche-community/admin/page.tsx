import type { Metadata } from "next";
import { DashboardPage } from "@/pocs/niche-community/components/DashboardPage";
import { OperatorGate } from "@/pocs/niche-community/components/OperatorGate";
import { getDashboardPage, getOperatorPersona } from "@/pocs/niche-community/server/queries";

export const metadata: Metadata = {
  title: "운영 대시보드",
  description: "멤버 수, MRR, 30일 활성, 이탈, 재결제율을 이 커뮤니티의 기록에서 계산해 보여 주는 운영자 대시보드.",
};

export default async function NicheCommunityAdminPage() {
  const page = await getDashboardPage();
  if (!page.operator) return <OperatorGate viewer={page.viewer} operator={await getOperatorPersona()} />;
  return <DashboardPage data={page.data} now={page.now} />;
}
