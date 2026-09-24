import type { Metadata } from "next";
import { PlansPage } from "@/pocs/online-education/components/plans/PlansPage";
import { getPlan } from "@/pocs/online-education/server/queries";

export const metadata: Metadata = {
  title: "요금제·설정",
  description: "무료·베이직·프로 요금제를 비교하고, 사용량과 스쿨 정보를 관리해요.",
};

export default async function PricingPage() {
  return <PlansPage data={await getPlan()} />;
}
