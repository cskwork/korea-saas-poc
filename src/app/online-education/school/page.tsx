import type { Metadata } from "next";
import { Storefront } from "@/pocs/online-education/components/school/Storefront";
import { getSchool, getStorefront } from "@/pocs/online-education/server/queries";

export async function generateMetadata(): Promise<Metadata> {
  const school = await getSchool();
  return {
    title: school.name,
    description: `${school.creatorName} 강사의 온라인 강의와 디지털 자료를 모은 스쿨이에요.`,
  };
}

export default async function SchoolPage() {
  return <Storefront data={await getStorefront()} />;
}
