import "server-only";
import { generateObject, type AiSource } from "@/core/ai";
import {
  BRIEF_SYSTEM_PROMPT,
  briefContentSchema,
  briefPrompt,
  normalizeBrief,
  templateBrief,
  type BriefContent,
  type BriefInput,
} from "../domain/brief";

export interface DraftedBrief {
  content: BriefContent;
  source: AiSource;
  notice?: string;
}

/** Concepts, copy lines and storyboard for an order, from Claude or the Korean template. */
export async function draftBrief(input: BriefInput): Promise<DraftedBrief> {
  const outcome = await generateObject({
    feature: "ai-design-video.brief",
    system: BRIEF_SYSTEM_PROMPT,
    prompt: briefPrompt(input),
    schema: briefContentSchema,
    fallback: () => templateBrief(input),
    maxTokens: 3000,
  });
  return { content: normalizeBrief(outcome.data), source: outcome.source, notice: outcome.notice };
}
