import type { Metadata } from "next";
import Link from "next/link";
import { PenLine } from "lucide-react";
import { IssueList } from "@/pocs/newsletter-community/components/issues/IssueList";
import { Notice, PageHeader } from "@/pocs/newsletter-community/components/shell/PageHeader";
import { buttonClass } from "@/pocs/newsletter-community/components/ui/button";
import { getIssueList } from "@/pocs/newsletter-community/server/queries";
import { issueListQuery } from "@/pocs/newsletter-community/server/schemas";

export const metadata: Metadata = {
  title: "발행 목록",
  description: "초안, 발행 예약, 발행한 호를 한 목록에서 찾고 관리합니다.",
};

export default async function IssuesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filter = issueListQuery.parse(params);
  const { issues, counts, nextNumber } = await getIssueList(filter);
  return (
    <>
      <PageHeader
        title="발행"
        lead="초안은 발행 전까지 몇 번이고 고칠 수 있어요. 예약한 호는 정한 시각이 지나면 자동으로 발행돼요."
        actions={
          <Link href="/newsletter-community/issues/new" className={buttonClass("primary")}>
            <PenLine size={16} aria-hidden />
            새 호 쓰기
          </Link>
        }
      />
      {params.deleted === "1" && <Notice>초안을 지웠어요.</Notice>}
      <IssueList issues={issues} counts={counts} status={filter.status} q={filter.q} nextNumber={nextNumber} />
    </>
  );
}
