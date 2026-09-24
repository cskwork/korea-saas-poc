import { StudioShell } from "@/pocs/newsletter-community/components/shell/StudioShell";
import { getPublicationSummary } from "@/pocs/newsletter-community/server/queries";

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const publication = await getPublicationSummary();
  return <StudioShell publication={publication}>{children}</StudioShell>;
}
