import type { Metadata } from "next";
import { Notifications } from "@/pocs/micro-saas/components/notifications/Notifications";
import { getNotificationPreview } from "@/pocs/micro-saas/server/queries";

export const metadata: Metadata = {
  title: "알림톡 미리보기",
  description: "예약 확인, 리마인더, 취소 안내 알림톡을 실제 다음 예약 내용으로 미리 봐요.",
};

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return <Notifications data={await getNotificationPreview({ type: one(params.type), booking: one(params.booking) })} />;
}
