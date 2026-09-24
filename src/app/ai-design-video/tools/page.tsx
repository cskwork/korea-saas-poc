import type { Metadata } from "next";
import { ToolMatrix } from "@/pocs/ai-design-video/components/tools/ToolMatrix";
import { TOOL_USES, type ToolUse } from "@/pocs/ai-design-video/domain/tools";
import { getToolUsage } from "@/pocs/ai-design-video/server/queries";

export const metadata: Metadata = {
  title: "AI 도구 비교",
  description: "Canva, CapCut, Midjourney, ChatGPT 등 디자인·영상 제작에 쓰는 AI 도구를 작업 종류별로 비교해요.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { use } = await searchParams;
  const valid = (TOOL_USES as readonly string[]).includes(String(use)) ? (use as ToolUse) : undefined;
  return <ToolMatrix use={valid} orders={await getToolUsage()} />;
}
