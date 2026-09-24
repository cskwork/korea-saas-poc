import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { OrderDetail } from "@/pocs/ai-design-video/components/orders/OrderDetail";
import { getOrder } from "@/pocs/ai-design-video/server/queries";

/** Generating an AI brief runs from this page. */
export const maxDuration = 60;

interface Props {
  params: Promise<{ id: string }>;
}

async function load(id: string) {
  if (!z.uuid().safeParse(id).success) notFound();
  const result = await getOrder(id);
  if (!result) notFound();
  return result;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) return { title: "주문을 찾을 수 없어요" };
  const result = await getOrder(id);
  if (!result) return { title: "주문을 찾을 수 없어요" };
  const { order } = result.detail;
  return {
    title: `${order.title} (${order.code})`,
    description: `${order.clientName}의 주문 — 단계, 수정 기록, AI 콘티.`,
    robots: { index: false },
  };
}

export default async function Page({ params }: Props) {
  const { detail, today, justCreated } = await load((await params).id);
  return <OrderDetail detail={detail} today={today} justCreated={justCreated} />;
}
