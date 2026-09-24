import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { OrderForm } from "@/pocs/ai-design-video/components/orders/OrderForm";
import { SheetHeader } from "@/pocs/ai-design-video/components/SheetHeader";
import { getOrderFormData } from "@/pocs/ai-design-video/server/queries";

export const metadata: Metadata = { title: "주문 수정", robots: { index: false } };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const { packages, order, today } = await getOrderFormData(id);
  if (!order) notFound();
  return (
    <>
      <SheetHeader
        title="주문 수정"
        lead={`${order.code} · ${order.clientName} — 단계와 수정 기록은 주문 화면에서 바꿔요.`}
      />
      <OrderForm packages={packages} today={today} order={order} />
    </>
  );
}
