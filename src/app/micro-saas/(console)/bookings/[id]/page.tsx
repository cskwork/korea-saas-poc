import type { Metadata } from "next";
import { BookingDetail } from "@/pocs/micro-saas/components/booking/BookingDetail";
import { getBookingDetail } from "@/pocs/micro-saas/server/queries";

export const metadata: Metadata = {
  title: "예약 상세",
  description: "예약 한 건의 신청서: 결재 도장, 일정 옮기기, 메모와 기록 삭제.",
  robots: { index: false },
};

export default async function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BookingDetail data={await getBookingDetail(id)} />;
}
