import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Shell } from "@/pocs/automation-agency/components/shell/Shell";
import { meta } from "@/pocs/automation-agency/meta";

export const metadata: Metadata = {
  title: { default: `${meta.name} · ${meta.category}`, template: `%s · ${meta.name}` },
  description: meta.description,
  openGraph: { title: meta.name, description: meta.description },
};

export default function AutomationAgencyLayout({ children }: { children: ReactNode }) {
  return <Shell>{children}</Shell>;
}
