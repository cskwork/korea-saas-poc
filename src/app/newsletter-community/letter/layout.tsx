import type { Metadata } from "next";
import { LetterShell } from "@/pocs/newsletter-community/components/letter/LetterShell";
import { getLetterPlans } from "@/pocs/newsletter-community/server/queries";

export async function generateMetadata(): Promise<Metadata> {
  const { publication } = await getLetterPlans();
  return {
    title: { default: publication.name, template: `%s · ${publication.name}` },
    description: publication.description,
  };
}

export default async function LetterLayout({ children }: { children: React.ReactNode }) {
  const { publication, plans, reader } = await getLetterPlans();
  return (
    <LetterShell publication={publication} plans={plans} reader={reader}>
      {children}
    </LetterShell>
  );
}
