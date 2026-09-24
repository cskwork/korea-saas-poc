import type { Metadata } from "next";
import { OrdersPage } from "@/pocs/smart-store/components/orders/OrdersPage";
import { getOrders } from "@/pocs/smart-store/server/queries";
import { orderFilters, type SearchParams } from "@/pocs/smart-store/server/search-params";

export const metadata: Metadata = {
  title: "주문",
  description: "신규주문 발주 확인, 송장 입력, 배송 완료와 취소까지 스마트스토어 주문 흐름을 처리합니다.",
};

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const filters = orderFilters(await searchParams);
  const data = await getOrders(filters);
  return <OrdersPage {...data} filters={filters} now={new Date()} />;
}
