import { ROI_DEFAULTS, type RoiInput } from "../../domain/roi";
import type { PackageOption } from "../../server/data/catalog";
import type { DiagnosisWithRoi } from "../../server/data/diagnoses";
import { Notice } from "../ui/Notice";
import { PageHeader, SectionHead } from "../ui/PageHeader";
import ui from "../ui/ui.module.css";
import { DiagnosisList } from "./DiagnosisList";
import { RoiCalculator } from "./RoiCalculator";

export function RoiPage({
  diagnoses,
  packages,
  loaded,
  packageId,
}: {
  diagnoses: DiagnosisWithRoi[];
  packages: PackageOption[];
  loaded?: DiagnosisWithRoi;
  packageId?: string;
}) {
  const pkg = packageId ? packages.find((p) => p.id === packageId) : undefined;
  const initial: RoiInput = loaded
    ? {
        weeklyHours: loaded.weeklyHours,
        hourlyCost: loaded.hourlyCost,
        automationRate: loaded.automationRate,
        investment: loaded.investment,
        monthlyFee: loaded.monthlyFee,
      }
    : pkg
      ? { ...ROI_DEFAULTS, investment: pkg.setupFee, monthlyFee: pkg.monthlyFee }
      : ROI_DEFAULTS;

  return (
    <>
      <PageHeader
        title="ROI 진단"
        lede="고객의 반복 업무를 시간과 인건비로 바꿔, 자동화가 몇 달 만에 본전을 찾는지 함께 계산해요."
      />
      {loaded ? (
        <Notice tone="info" className={ui.noticeGap}>
          ‘{loaded.clientName}’ 진단을 불러왔어요. 조건을 바꿔 새 진단으로 저장할 수 있어요.
        </Notice>
      ) : null}
      {pkg && !loaded ? (
        <Notice tone="info" className={ui.noticeGap}>
          ‘{pkg.name}’ 패키지의 구축비와 유지보수비를 넣었어요.
        </Notice>
      ) : null}
      <div id="calculator">
        <RoiCalculator
          key={loaded?.id ?? pkg?.id ?? "blank"}
          initial={initial}
          presets={packages.filter((p) => !p.archived)}
          initialClient={
            loaded
              ? {
                  clientName: loaded.clientName,
                  contactName: loaded.contactName,
                  industry: loaded.industry,
                  note: loaded.note,
                }
              : undefined
          }
        />
      </div>
      <section className={ui.section} aria-labelledby="dx-title">
        <SectionHead
          id="dx-title"
          title="저장한 진단"
          note="진단은 영업 리드예요. 상태를 바꾸고 바로 견적으로 이어 가세요."
        />
        <DiagnosisList diagnoses={diagnoses} />
      </section>
    </>
  );
}
