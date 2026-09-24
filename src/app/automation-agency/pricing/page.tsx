import type { Metadata } from "next";
import { oneOf } from "@/pocs/automation-agency/components/params";
import { Pricing } from "@/pocs/automation-agency/components/pricing/Pricing";

export const metadata: Metadata = {
  title: "요금제",
  description: "기본·프로·엔터프라이즈 자동화 유지보수 요금제와 연간 결제 할인, 포함 항목을 비교하세요.",
};

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const billing = oneOf(await searchParams, "billing", ["monthly", "annual"] as const) ?? "monthly";
  return <Pricing billing={billing} />;
}
