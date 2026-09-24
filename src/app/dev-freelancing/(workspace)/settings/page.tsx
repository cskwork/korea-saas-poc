import type { Metadata } from "next";
import { SettingsView } from "@/pocs/dev-freelancing/components/settings/SettingsView";
import { getSettings } from "@/pocs/dev-freelancing/server/queries";

export const metadata: Metadata = {
  title: "설정",
  description: "문서에 찍히는 공급자 정보, 세금 처리, 기본 시급과 월 목표, 데모 데이터 초기화.",
};

export default async function SettingsPage() {
  return <SettingsView profile={await getSettings()} />;
}
