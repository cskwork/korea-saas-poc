import type { Metadata } from "next";
import { Calendar } from "@/pocs/micro-saas/components/calendar/Calendar";
import { getCalendar } from "@/pocs/micro-saas/server/queries";

export const metadata: Metadata = {
  title: "예약 관리",
  description: "월간 달력에서 날짜별 예약을 보고, 빈 시간에 바로 예약을 적어요.",
};

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export default async function CalendarPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  return <Calendar data={await getCalendar({ month: one(params.month), date: one(params.date) })} />;
}
