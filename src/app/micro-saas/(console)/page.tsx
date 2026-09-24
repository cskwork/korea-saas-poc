import type { Metadata } from "next";
import { Dashboard } from "@/pocs/micro-saas/components/dashboard/Dashboard";
import { getDashboard } from "@/pocs/micro-saas/server/queries";

export const metadata: Metadata = {
  title: "대시보드",
  description: "오늘의 예약장: 다음 손님, 도장을 기다리는 예약, 이번 주 예약 흐름을 한눈에.",
};

export default async function DashboardPage() {
  return <Dashboard data={await getDashboard()} />;
}
