import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { param, parseId } from "@/pocs/automation-agency/components/params";
import { QuoteActions } from "@/pocs/automation-agency/components/quotes/QuoteActions";
import { QuoteDocument } from "@/pocs/automation-agency/components/quotes/QuoteDocument";
import { Notice } from "@/pocs/automation-agency/components/ui/Notice";
import { PageHeader } from "@/pocs/automation-agency/components/ui/PageHeader";
import ui from "@/pocs/automation-agency/components/ui/ui.module.css";
import { fetchProfile, fetchQuote } from "@/pocs/automation-agency/server/queries";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = parseId((await params).id);
  const quote = id ? await fetchQuote(id) : undefined;
  return quote
    ? {
        title: `${quote.number} ${quote.clientName} 견적서`,
        description: `${quote.clientName} 자동화 견적서 (${quote.number})`,
      }
    : { title: "견적서를 찾을 수 없어요" };
}

export default async function QuotePage({ params, searchParams }: Props) {
  const id = parseId((await params).id);
  const [quote, profile, query] = await Promise.all([id ? fetchQuote(id) : undefined, fetchProfile(), searchParams]);
  if (!quote) notFound();
  return (
    <>
      <div className={ui.printHidden}>
        <PageHeader
          back={{ href: "/automation-agency/quotes", label: "견적 목록" }}
          title={`${quote.clientName} 견적서`}
        />
        {param(query, "saved") === "1" ? (
          <Notice tone="ok" className={ui.noticeGap}>
            견적서를 저장했어요. 인쇄하거나 PDF로 저장해 보내세요.
          </Notice>
        ) : null}
        <QuoteActions id={quote.id} status={quote.status} projectId={quote.projectId} />
      </div>
      <QuoteDocument quote={quote} profile={profile} />
    </>
  );
}
