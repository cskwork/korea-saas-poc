import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PackageDetail } from "@/pocs/automation-agency/components/catalog/PackageDetail";
import { parseId } from "@/pocs/automation-agency/components/params";
import { fetchPackage } from "@/pocs/automation-agency/server/queries";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = parseId((await params).id);
  const pkg = id ? await fetchPackage(id) : undefined;
  return pkg ? { title: pkg.name, description: pkg.summary } : { title: "패키지를 찾을 수 없어요" };
}

export default async function PackagePage({ params, searchParams }: Props) {
  const id = parseId((await params).id);
  const pkg = id ? await fetchPackage(id) : undefined;
  if (!pkg) notFound();
  return <PackageDetail pkg={pkg} saved={(await searchParams).saved === "1"} />;
}
