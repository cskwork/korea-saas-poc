import type { Metadata } from "next";
import type { ReactNode } from "react";
import { StudioShell } from "@/pocs/ai-design-video/components/StudioShell";
import { meta } from "@/pocs/ai-design-video/meta";

export const metadata: Metadata = {
  title: { default: `${meta.name} — ${meta.tagline}`, template: `%s · ${meta.name}` },
  description: meta.description,
  openGraph: { title: meta.name, description: meta.description, locale: "ko_KR", type: "website" },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <StudioShell>{children}</StudioShell>;
}
