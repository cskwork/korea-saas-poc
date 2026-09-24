import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { ModuleRoot } from "@/pocs/micro-saas/components/world/ModuleRoot";
import { meta } from "@/pocs/micro-saas/meta";

export const metadata: Metadata = {
  title: { default: meta.name, template: `%s · ${meta.name}` },
  description: meta.description,
  applicationName: meta.name,
  icons: { icon: { url: "/micro-saas/favicon.svg", type: "image/svg+xml" } },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: meta.name,
    title: `${meta.name} · ${meta.tagline}`,
    description: "수기 예약장을 디지털로. 오늘의 예약을 한눈에, 확정은 도장 한 번으로.",
    images: [{ url: "/micro-saas/og.jpg", width: 1200, height: 630, alt: "예약잇다 도장과 예약장" }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e5ede8" },
    { media: "(prefers-color-scheme: dark)", color: "#161b24" },
  ],
  colorScheme: "light dark",
};

export default function MicroSaasLayout({ children }: { children: ReactNode }) {
  return <ModuleRoot>{children}</ModuleRoot>;
}
