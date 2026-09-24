import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ModuleRoot } from "@/pocs/online-education/components/shell/ModuleRoot";
import { meta } from "@/pocs/online-education/meta";

export const metadata: Metadata = {
  title: { template: `%s · ${meta.name}`, default: meta.name },
  description: meta.description,
  openGraph: { title: meta.name, description: meta.tagline, locale: "ko_KR", type: "website" },
};

export default function OnlineEducationLayout({ children }: { children: ReactNode }) {
  return <ModuleRoot>{children}</ModuleRoot>;
}
