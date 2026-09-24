import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { editQuoteDraft } from "@/pocs/automation-agency/components/quotes/draft";
import { QuoteBuilder } from "@/pocs/automation-agency/components/quotes/QuoteBuilder";
import { parseId } from "@/pocs/automation-agency/components/params";
import { PageHeader } from "@/pocs/automation-agency/components/ui/PageHeader";
import { fetchPackageOptions, fetchQuote } from "@/pocs/automation-agency/server/queries";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = parseId((await params).id);
  const quote = id ? await fetchQuote(id) : undefined;
  return quote
    ? { title: `${quote.number} 수정`, description: `${quote.clientName} 견적서 수정` }
    : { title: "견적서를 찾을 수 없어요" };
}

export default async function EditQuotePage({ params }: Props) {
  const id = parseId((await params).id);
  const [quote, packages] = await Promise.all([id ? fetchQuote(id) : undefined, fetchPackageOptions()]);
  if (!quote) notFound();
  return (
    <>
      <PageHeader
        back={{ href: `/automation-agency/quotes/${quote.id}`, label: `${quote.number} 견적서` }}
        title="견적서 수정"
      />
      <QuoteBuilder
        draft={editQuoteDraft(quote)}
        catalogue={packages.filter((p) => !p.archived || quote.items.some((i) => i.packageId === p.id))}
      />
    </>
  );
}
