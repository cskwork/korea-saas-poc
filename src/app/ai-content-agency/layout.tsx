import type { Metadata } from "next";
import { ModuleRoot } from "@/pocs/ai-content-agency/components/shell/ModuleRoot";
import { meta } from "@/pocs/ai-content-agency/meta";

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
  return <ModuleRoot>{children}</ModuleRoot>;
}
