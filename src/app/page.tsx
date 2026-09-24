import type { Metadata } from "next";
import { HubPage } from "@/hub/HubPage";

export const metadata: Metadata = {
  title: "한국형 1인 SaaS 10선 — 실제로 돌아가는 열 개의 가게",
  description:
    "AI 콘텐츠 대행부터 예약 SaaS, 온라인 강의, 뉴스레터까지. 혼자 운영할 수 있는 열 가지 한국형 SaaS를 직접 써 볼 수 있는 제품으로 만들었습니다.",
};

export default function Page() {
  return <HubPage />;
}
