import type { Metadata } from "next";
import { OverviewPage } from "@/pocs/smart-store/components/overview/OverviewPage";
import { getOverview } from "@/pocs/smart-store/server/queries";

export const metadata: Metadata = {
  title: "오늘의 가판",
  description: "발주를 기다리는 주문, 최근 7일 매출과 남은 돈, 아직 올리지 않은 고마진 도매 상품을 한 화면에서 봅니다.",
};

// One-click listing on this page may call Claude.
export const maxDuration = 60;

export default async function SmartStoreHome() {
  const overview = await getOverview();
  return <OverviewPage {...overview} now={new Date()} />;
}
