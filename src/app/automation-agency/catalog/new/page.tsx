import type { Metadata } from "next";
import { EMPTY_PACKAGE, PackageForm } from "@/pocs/automation-agency/components/catalog/PackageForm";
import { PageHeader } from "@/pocs/automation-agency/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "패키지 등록",
  description: "새 자동화 패키지를 카탈로그에 등록합니다.",
};

export default function NewPackagePage() {
  return (
    <>
      <PageHeader
        back={{ href: "/automation-agency/catalog", label: "솔루션 카탈로그" }}
        title="패키지 등록"
        lede="도구 구성과 가격, 월 절감 시간을 적어 두면 견적과 ROI 진단에서 바로 쓸 수 있어요."
      />
      <PackageForm values={EMPTY_PACKAGE} />
    </>
  );
}
