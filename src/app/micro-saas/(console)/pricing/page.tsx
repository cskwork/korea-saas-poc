import type { Metadata } from "next";
import { Pricing } from "@/pocs/micro-saas/components/pricing/Pricing";
import { getPricing } from "@/pocs/micro-saas/server/queries";

export const metadata: Metadata = {
  title: "요금제",
  description: "Free, Pro, Business 요금제와 기능 비교표. 이 매장의 실제 예약·고객 수와 한도를 함께 보여줘요.",
};

export default async function PricingPage() {
  return <Pricing data={await getPricing()} />;
}
