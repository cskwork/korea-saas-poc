import type { Metadata } from "next";
import { PriceSheet } from "@/pocs/ai-design-video/components/pricing/PriceSheet";
import { getPackages } from "@/pocs/ai-design-video/server/queries";

export const metadata: Metadata = {
  title: "가격표",
  description:
    "썸네일·배너·상세페이지·숏폼·영상 편집·로고 단건 패키지와 월 구독 플랜. 고른 패키지로 바로 주문을 접수해요.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { plan } = await searchParams;
  return <PriceSheet packages={await getPackages()} plan={plan === "subscription" ? "subscription" : "single"} />;
}
