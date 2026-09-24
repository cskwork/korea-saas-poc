import type { Metadata } from "next";
import { Dashboard } from "@/pocs/automation-agency/components/dashboard/Dashboard";
import { fetchDashboard } from "@/pocs/automation-agency/server/queries";

export const metadata: Metadata = {
  title: "운행 현황",
  description: "구축 중인 자동화 프로젝트, 유지보수 정기 수익(MRR), 견적 파이프라인을 노선도 한 장으로 확인하세요.",
};

export default async function AutomationAgencyDashboardPage() {
  const data = await fetchDashboard();
  return <Dashboard data={data} />;
}
