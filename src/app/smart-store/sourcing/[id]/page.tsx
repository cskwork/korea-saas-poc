import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { formatNumber } from "@/core/format";
import { CatalogDetail } from "@/pocs/smart-store/components/sourcing/CatalogDetail";
import { getCatalogItem } from "@/pocs/smart-store/server/queries";

export const maxDuration = 60;

type Props = { params: Promise<{ id: string }> };

async function load(params: Props["params"]) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const entry = await getCatalogItem(id);
  if (!entry) notFound();
  return entry;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const entry = await load(params);
  return {
    title: entry.name,
    description: `${entry.name}: 매입가 ${formatNumber(entry.wholesalePrice)}원, 권장 판매가 ${formatNumber(entry.suggestedPrice)}원 기준 수수료·배송비를 뺀 마진.`,
  };
}

export default async function Page({ params }: Props) {
  const entry = await load(params);
  return <CatalogDetail entry={entry} />;
}
