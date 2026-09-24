import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Shell } from "@/pocs/smart-store/components/shell/Shell";
import { meta } from "@/pocs/smart-store/meta";
import { getWaitingCount } from "@/pocs/smart-store/server/queries";

export const metadata: Metadata = {
  title: { default: `${meta.name} — ${meta.tagline}`, template: `%s · ${meta.name}` },
  description: meta.description,
  applicationName: meta.name,
  openGraph: { title: meta.name, description: meta.description, siteName: meta.name, locale: "ko_KR", type: "website" },
};

export default async function SmartStoreLayout({ children }: { children: ReactNode }) {
  const waiting = await getWaitingCount();
  return <Shell waiting={waiting}>{children}</Shell>;
}
