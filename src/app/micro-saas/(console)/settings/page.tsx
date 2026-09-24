import type { Metadata } from "next";
import { Settings } from "@/pocs/micro-saas/components/settings/Settings";
import { getSettings } from "@/pocs/micro-saas/server/queries";

export const metadata: Metadata = {
  title: "매장 설정",
  description: "상호, 영업시간, 좌석 수, 휴무 요일과 서비스 목록. 예약 가능 시간은 여기서 정해져요.",
};

export default async function SettingsPage() {
  return <Settings data={await getSettings()} />;
}
