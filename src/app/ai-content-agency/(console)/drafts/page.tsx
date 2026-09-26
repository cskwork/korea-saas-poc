import type { Metadata } from "next";
import { PenLine } from "lucide-react";
import Link from "next/link";
import { DraftList, LibraryFilters } from "@/pocs/ai-content-agency/components/drafts/Library";
import { buttonClass } from "@/pocs/ai-content-agency/components/ui/buttons";
import { PageHeader } from "@/pocs/ai-content-agency/components/ui/PageHeader";
import { getDraftLibrary, parseKind, parseQuery, parseSort } from "@/pocs/ai-content-agency/server/queries";

export const metadata: Metadata = {
  title: "원고함",
  description: "AI 시안과 에디터가 고친 원고를 버전 기록과 함께 모아 두고, 찾고, 복사해요.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function DraftsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const q = parseQuery(params.q);
  const kind = parseKind(params.kind);
  const sort = parseSort(params.sort);
  const drafts = await getDraftLibrary({ q, kind, sort });
  return (
    <>
      <PageHeader
        title="원고함"
        lead={`${q || kind ? "찾은 원고" : "원고"} ${drafts.length}편. 노란 표시는 아직 채우지 않은 [확인 필요] 자리예요.`}
        actions={
          <Link href="/ai-content-agency/write" className={buttonClass("primary")}>
            <PenLine size={18} aria-hidden="true" />
            시안 쓰기
          </Link>
        }
      />
      <LibraryFilters q={q} kind={kind} sort={sort} />
      <DraftList drafts={drafts} filtered={Boolean(q || kind)} />
    </>
  );
}
