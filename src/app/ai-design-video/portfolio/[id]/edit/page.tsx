import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { PortfolioForm } from "@/pocs/ai-design-video/components/portfolio/PortfolioForm";
import { SheetHeader } from "@/pocs/ai-design-video/components/SheetHeader";
import { getPortfolioItem } from "@/pocs/ai-design-video/server/queries";

export const metadata: Metadata = { title: "포트폴리오 작업 수정", robots: { index: false } };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = z.uuid().safeParse(id).success ? await getPortfolioItem(id) : null;
  if (!item) notFound();
  return (
    <>
      <SheetHeader title="포트폴리오 작업 수정" lead={item.title} />
      <PortfolioForm
        draft={{
          id: item.id,
          orderId: item.orderId ?? undefined,
          title: item.title,
          category: item.category,
          clientLabel: item.clientLabel,
          headline: item.headline,
          summary: item.summary,
          tools: item.tools,
          palette: item.palette,
        }}
      />
    </>
  );
}
