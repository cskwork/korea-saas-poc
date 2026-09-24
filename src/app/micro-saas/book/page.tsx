import type { Metadata } from "next";
import { BookingPage } from "@/pocs/micro-saas/components/book/BookingPage";
import { getBookingPage, getReceipt, getShell } from "@/pocs/micro-saas/server/queries";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export async function generateMetadata(): Promise<Metadata> {
  const { shop } = await getShell();
  return {
    title: `${shop.name} 예약`,
    description: `${shop.name} 온라인 예약: 서비스와 빈 시간을 고르고 이름과 연락처만 남기면 끝.`,
  };
}

export default async function BookPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const receiptId = one(params.receipt);
  const [data, receipt] = await Promise.all([
    getBookingPage({ service: one(params.service), date: one(params.date), time: one(params.time) }),
    receiptId ? getReceipt(receiptId) : undefined,
  ]);
  return (
    <BookingPage
      data={data}
      receipt={receipt}
      requestedTime={one(params.time)}
      moved={Object.keys(params).length > 0}
    />
  );
}
