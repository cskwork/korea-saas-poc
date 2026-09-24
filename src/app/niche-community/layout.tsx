import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Shell } from "@/pocs/niche-community/components/Shell";
import { meta } from "@/pocs/niche-community/meta";
import { getShell } from "@/pocs/niche-community/server/queries";

export const metadata: Metadata = {
  title: { default: meta.name, template: `%s · ${meta.name}` },
  description: meta.description,
  openGraph: { title: meta.name, description: meta.description },
};

export default async function NicheCommunityLayout({ children }: { children: ReactNode }) {
  const { viewer, personas } = await getShell();
  return (
    <Shell viewer={viewer} personas={personas}>
      {children}
    </Shell>
  );
}
