import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { CatalogFilters, PackageTable } from "@/pocs/automation-agency/components/catalog/Catalog";
import { buttonClass } from "@/pocs/automation-agency/components/ui/classes";
import { PageHeader } from "@/pocs/automation-agency/components/ui/PageHeader";
import { parseCatalogFilter } from "@/pocs/automation-agency/components/catalog/params";
import { fetchPackages } from "@/pocs/automation-agency/server/queries";

export const metadata: Metadata = {
  title: "솔루션 카탈로그",
  description: "업종·유형별 자동화 패키지와 사용 도구, 구축비, 월 유지보수비, 월 절감 시간을 비교하세요.",
};

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filter = parseCatalogFilter(await searchParams);
  const packages = await fetchPackages(filter);
  return (
    <>
      <PageHeader
        title="솔루션 카탈로그"
        lede="고객에게 제안하는 자동화 패키지예요. 판매 실적은 실제 프로젝트와 견적에서 집계해요."
        actions={
          <Link href="/automation-agency/catalog/new" className={buttonClass("primary")}>
            <Plus size={16} aria-hidden="true" />
            패키지 등록
          </Link>
        }
      />
      <CatalogFilters filter={filter} />
      <PackageTable packages={packages} filter={filter} />
    </>
  );
}
