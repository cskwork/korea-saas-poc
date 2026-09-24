import type { Metadata } from "next";
import { Settings } from "@/pocs/newsletter-community/components/settings/Settings";
import { PageHeader } from "@/pocs/newsletter-community/components/shell/PageHeader";
import { getSettings } from "@/pocs/newsletter-community/server/queries";

export const metadata: Metadata = {
  title: "설정",
  description: "레터 이름과 소개, 기본 발송 시각, 수입 목표, 구독 플랜 가격과 혜택을 정합니다.",
};

export default async function SettingsPage() {
  const { publication, plans } = await getSettings();
  return (
    <>
      <PageHeader title="설정" lead="여기서 바꾼 이름과 플랜은 공개 레터와 구독 안내, 수입 계산에 바로 쓰여요." />
      <Settings publication={publication} plans={plans} />
    </>
  );
}
