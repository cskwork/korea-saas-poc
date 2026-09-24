import type { Metadata } from "next";
import { Dashboard } from "@/pocs/online-education/components/dashboard/Dashboard";
import { getDashboard } from "@/pocs/online-education/server/queries";

export const metadata: Metadata = {
  title: "이번 주 시간표",
  description: "이번 주 결제를 시간표 블록으로 보고, 이번 달 매출과 최근 수강 신청을 확인해요.",
};

export default async function StudioHomePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const data = await getDashboard(await searchParams);
  return <Dashboard data={data} now={new Date()} />;
}
