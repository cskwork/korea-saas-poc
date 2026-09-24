import type { Metadata } from "next";
import { LetterHome } from "@/pocs/newsletter-community/components/letter/LetterHome";
import { getLetterHome } from "@/pocs/newsletter-community/server/queries";

export async function generateMetadata(): Promise<Metadata> {
  const { publication } = await getLetterHome();
  return { title: { absolute: `${publication.name} — 지난 호와 정기구독` }, description: publication.description };
}

export default async function LetterHomePage() {
  const { publication, plans, issues, reader } = await getLetterHome();
  return <LetterHome publication={publication} plans={plans} issues={issues} reader={reader} />;
}
