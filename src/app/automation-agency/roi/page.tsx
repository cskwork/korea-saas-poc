import type { Metadata } from "next";
import { RoiPage } from "@/pocs/automation-agency/components/roi/RoiPage";
import { param, parseId } from "@/pocs/automation-agency/components/params";
import { fetchDiagnoses, fetchPackageOptions } from "@/pocs/automation-agency/server/queries";

export const metadata: Metadata = {
  title: "ROI 진단",
  description:
    "주당 반복 업무 시간과 인건비로 자동화 절감액, 첫해 ROI, 투자 회수 기간을 계산하고 고객 진단으로 저장하세요.",
};

export default async function RoiRoute({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const [diagnoses, packages] = await Promise.all([fetchDiagnoses(), fetchPackageOptions()]);
  const diagnosisId = parseId(param(params, "diagnosis") ?? "");
  const packageId = parseId(param(params, "package") ?? "");
  return (
    <RoiPage
      diagnoses={diagnoses}
      packages={packages}
      loaded={diagnosisId ? diagnoses.find((d) => d.id === diagnosisId) : undefined}
      packageId={packageId}
    />
  );
}
