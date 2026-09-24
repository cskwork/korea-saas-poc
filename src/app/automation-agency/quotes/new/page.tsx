import type { Metadata } from "next";
import { newQuoteDraft } from "@/pocs/automation-agency/components/quotes/draft";
import { QuoteBuilder } from "@/pocs/automation-agency/components/quotes/QuoteBuilder";
import { oneOf, param, parseId } from "@/pocs/automation-agency/components/params";
import { PageHeader } from "@/pocs/automation-agency/components/ui/PageHeader";
import { fetchDiagnosis, fetchPackageOptions } from "@/pocs/automation-agency/server/queries";

export const metadata: Metadata = {
  title: "견적서 작성",
  description: "카탈로그 패키지와 직접 입력 항목으로 부가세 10% 포함 견적서를 만듭니다.",
};

export default async function NewQuotePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const diagnosisId = parseId(param(params, "diagnosis") ?? "");
  const [packages, diagnosis] = await Promise.all([
    fetchPackageOptions(),
    diagnosisId ? fetchDiagnosis(diagnosisId) : undefined,
  ]);
  const draft = newQuoteDraft({
    packages,
    packageId: parseId(param(params, "package") ?? ""),
    planId: param(params, "plan"),
    billing: oneOf(params, "billing", ["monthly", "annual"] as const),
    diagnosis,
  });
  return (
    <>
      <PageHeader
        back={{ href: "/automation-agency/quotes", label: "견적 목록" }}
        title="견적서 작성"
        lede={
          diagnosis
            ? `‘${diagnosis.clientName}’ ROI 진단에서 이어 쓰는 견적서예요.`
            : "항목을 담으면 오른쪽 합계가 바로 바뀌어요."
        }
      />
      <QuoteBuilder draft={draft} catalogue={packages.filter((p) => !p.archived)} />
    </>
  );
}
