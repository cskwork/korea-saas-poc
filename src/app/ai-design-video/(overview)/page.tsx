import type { Metadata } from "next";
import { Dashboard } from "@/pocs/ai-design-video/components/dashboard/Dashboard";
import { getDashboard } from "@/pocs/ai-design-video/server/queries";

export const metadata: Metadata = {
  title: "오늘의 콘티",
  description: "마감이 가까운 순서로 정리한 진행 중인 디자인·영상 주문과 이번 달 납품액.",
};

export default async function Page() {
  return <Dashboard data={await getDashboard()} />;
}
