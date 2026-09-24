import type { Metadata } from "next";
import { ModuleRoot } from "@/pocs/dev-freelancing/components/ModuleRoot";
import { meta } from "@/pocs/dev-freelancing/meta";

export const metadata: Metadata = {
  title: { default: `${meta.name} — ${meta.tagline}`, template: `%s · ${meta.name}` },
  description: meta.description,
  applicationName: meta.name,
  openGraph: { title: meta.name, description: meta.description, locale: "ko_KR", type: "website" },
};

export default function DevFreelancingLayout({ children }: { children: React.ReactNode }) {
  return <ModuleRoot>{children}</ModuleRoot>;
}
