import type { Metadata } from "next";
import { ModuleShell } from "@/pocs/ai-content-agency/components/shell/ModuleShell";
import { meta } from "@/pocs/ai-content-agency/meta";
import { getAiMode } from "@/pocs/ai-content-agency/server/queries";

export const metadata: Metadata = {
  title: { template: "%s · 글품", default: "글품 — AI 시안, 에디터 검수 콘텐츠 대행" },
  description: meta.description,
  openGraph: {
    title: "글품 — AI 시안, 에디터 검수 콘텐츠 대행",
    description: meta.description,
    locale: "ko_KR",
    type: "website",
  },
};

export default function ContentAgencyLayout({ children }: { children: React.ReactNode }) {
  return <ModuleShell aiMode={getAiMode()}>{children}</ModuleShell>;
}
