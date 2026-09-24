import type { Metadata } from "next";
import { CalculatorPage } from "@/pocs/smart-store/components/calculator/CalculatorPage";
import { isCategory } from "@/pocs/smart-store/domain/categories";
import { getCalculations } from "@/pocs/smart-store/server/queries";
import { param, type SearchParams } from "@/pocs/smart-store/server/search-params";

export const metadata: Metadata = {
  title: "마진 계산",
  description:
    "매입가, 판매가, 배송비와 카테고리별 네이버 수수료로 개당·월 순수익과 목표 마진 판매가를 계산하고 기록합니다.",
};

function amount(params: SearchParams, key: string, fallback: number) {
  const value = Number.parseInt(param(params, key) ?? "", 10);
  return Number.isFinite(value) && value >= 0 && value <= 100_000_000 ? value : fallback;
}

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const category = param(params, "category");
  // Legacy calculator defaults: 패션, 10,000 → 25,000, shipping 3,000, 100 a month.
  const initial = {
    label: (param(params, "label") ?? "").slice(0, 40),
    category: isCategory(category) ? category : ("fashion" as const),
    cost: amount(params, "cost", 10_000),
    price: amount(params, "price", 25_000),
    shipping: amount(params, "shipping", 3_000),
    quantity: Math.max(amount(params, "qty", 100), 1),
  };
  const history = await getCalculations();
  return <CalculatorPage initial={initial} history={history} now={new Date()} />;
}
