import type { Metadata } from "next";
import { OrdersView } from "@/pocs/ai-design-video/components/orders/OrdersView";
import { parseOrdersQuery } from "@/pocs/ai-design-video/components/orders/query";
import { getOrders } from "@/pocs/ai-design-video/server/queries";

export const metadata: Metadata = {
  title: "주문 콘티",
  description: "의뢰접수부터 납품완료까지, 단계·작업 종류·검색어로 주문을 찾아보세요.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = parseOrdersQuery(await searchParams);
  const { orders, counts, today } = await getOrders(query);
  return <OrdersView query={query} orders={orders} counts={counts} today={today} />;
}
