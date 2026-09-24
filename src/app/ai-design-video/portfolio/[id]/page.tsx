import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { PortfolioDetail } from "@/pocs/ai-design-video/components/portfolio/PortfolioDetail";
import { getPortfolioItem } from "@/pocs/ai-design-video/server/queries";

interface Props {
  params: Promise<{ id: string }>;
}

async function load(id: string) {
  if (!z.uuid().safeParse(id).success) return null;
  return getPortfolioItem(id);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = await load((await params).id);
  if (!item) return { title: "작업을 찾을 수 없어요" };
  return { title: item.title, description: item.summary || `${item.clientLabel} 샘플 작업` };
}

export default async function Page({ params }: Props) {
  const item = await load((await params).id);
  if (!item) notFound();
  return <PortfolioDetail item={item} />;
}
