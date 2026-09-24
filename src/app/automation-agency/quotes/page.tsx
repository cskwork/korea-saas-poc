import type { Metadata } from "next";
import Link from "next/link";
import { FilePlus2 } from "lucide-react";
import { oneOf, param } from "@/pocs/automation-agency/components/params";
import { ProfileForm } from "@/pocs/automation-agency/components/quotes/ProfileForm";
import { QuoteFilters, QuoteTable } from "@/pocs/automation-agency/components/quotes/QuoteList";
import { buttonClass } from "@/pocs/automation-agency/components/ui/classes";
import { Notice } from "@/pocs/automation-agency/components/ui/Notice";
import { PageHeader, SectionHead } from "@/pocs/automation-agency/components/ui/PageHeader";
import ui from "@/pocs/automation-agency/components/ui/ui.module.css";
import { QUOTE_STATUSES } from "@/pocs/automation-agency/domain/labels";
import { fetchProfile, fetchQuotes } from "@/pocs/automation-agency/server/queries";

export const metadata: Metadata = {
  title: "견적",
  description:
    "자동화 패키지로 부가세 포함 견적서를 만들고, 발송·수락 상태를 관리하고, 수락된 견적을 프로젝트로 전환하세요.",
};

export default async function QuotesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filter = { status: oneOf(params, "status", QUOTE_STATUSES), q: param(params, "q")?.slice(0, 60) || undefined };
  const [{ quotes, counts }, profile] = await Promise.all([fetchQuotes(filter), fetchProfile()]);
  return (
    <>
      <PageHeader
        title="견적"
        lede="구축비는 한 번, 유지보수는 매달. 두 금액을 부가세와 함께 나눠 보여 주는 견적서예요."
        actions={
          <Link href="/automation-agency/quotes/new" className={buttonClass("primary")}>
            <FilePlus2 size={16} aria-hidden="true" />
            견적서 작성
          </Link>
        }
      />
      {param(params, "deleted") === "1" ? (
        <Notice tone="ok" className={ui.noticeGap}>
          견적서를 삭제했어요.
        </Notice>
      ) : null}
      <QuoteFilters filter={filter} counts={counts} />
      <QuoteTable quotes={quotes} filtered={Boolean(filter.status || filter.q)} />
      <section className={ui.section} aria-labelledby="profile-title">
        <SectionHead id="profile-title" title="공급자 정보" note="모든 견적서의 공급자 칸에 인쇄돼요." />
        <ProfileForm
          values={{
            agencyName: profile?.agencyName ?? "AutoMate Pro",
            representative: profile?.representative ?? "",
            businessNumber: profile?.businessNumber ?? "",
            email: profile?.email ?? "",
            phone: profile?.phone ?? "",
          }}
        />
      </section>
    </>
  );
}
