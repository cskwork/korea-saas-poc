import type { Metadata } from "next";
import { PricingView } from "@/pocs/dev-freelancing/components/showcase/ShowcaseViews";
import { getPlans } from "@/pocs/dev-freelancing/server/queries";

export const metadata: Metadata = {
  title: "요금표",
  description: "웹사이트, 앱, 노코드·로코드 서비스의 시작 가격과 포함 내용을 편집합니다.",
};

export default async function PricingPage() {
  return <PricingView plans={await getPlans()} />;
}
