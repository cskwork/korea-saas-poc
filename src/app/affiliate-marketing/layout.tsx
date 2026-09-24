import type { Metadata } from "next";
import { ModuleShell } from "@/pocs/affiliate-marketing/components/shell/ModuleShell";
import { meta } from "@/pocs/affiliate-marketing/meta";

export const metadata: Metadata = {
  title: { default: `${meta.name} — ${meta.tagline}`, template: `%s · ${meta.name}` },
  description: meta.description,
  applicationName: meta.name,
  openGraph: { title: meta.name, description: meta.description, locale: "ko_KR", type: "website" },
};

export default function AffiliateMarketingLayout({ children }: { children: React.ReactNode }) {
  return <ModuleShell>{children}</ModuleShell>;
}
