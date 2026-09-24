import "server-only";
import { z } from "zod";
import { generateObject, type AiOutcome } from "@/core/ai";
import { SYSTEM_PROMPT, buildPrompt, type PromptInput } from "../domain/prompt";
import { writeTemplateDraft, type DraftContent } from "../domain/templates";

const draftSchema = z.object({
  title: z.string().min(2).max(120),
  body: z.string().min(20),
});

/**
 * Writes a draft with Claude, or with the template writer when Claude is unavailable.
 * `variant` makes a rewrite read differently from the version it replaces.
 */
export async function writeDraft(input: PromptInput, variant = 0): Promise<AiOutcome<DraftContent>> {
  const outcome = await generateObject({
    feature: `ai-content-agency.${input.kind}`,
    system: SYSTEM_PROMPT,
    prompt: buildPrompt(input),
    schema: draftSchema,
    maxTokens: 4000,
    fallback: () => writeTemplateDraft(input, variant),
  });
  return { ...outcome, data: { title: outcome.data.title.trim(), body: outcome.data.body.trim() } };
}
