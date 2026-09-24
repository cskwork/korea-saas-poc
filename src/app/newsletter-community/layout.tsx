import type { Metadata } from "next";
import { ModuleRoot } from "@/pocs/newsletter-community/components/shell/ModuleRoot";
import { meta } from "@/pocs/newsletter-community/meta";

export const metadata: Metadata = {
  title: { default: meta.name, template: `%s · ${meta.name}` },
  description: meta.description,
  openGraph: { title: meta.name, description: meta.description, locale: "ko_KR" },
};

export default function NewsletterCommunityLayout({ children }: { children: React.ReactNode }) {
  return <ModuleRoot>{children}</ModuleRoot>;
}
