import type { Metadata } from "next";
import { Overview } from "@/pocs/dev-freelancing/components/overview/Overview";
import { getOverview } from "@/pocs/dev-freelancing/server/queries";

export const metadata: Metadata = {
  title: "개요",
  description: "최근 26주 작업 기록, 받을 돈, 이번 달 목표와 진행 중인 프로젝트를 한 화면에서 봅니다.",
};

export default async function OverviewPage() {
  return <Overview data={await getOverview()} />;
}
