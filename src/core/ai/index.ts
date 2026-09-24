import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { sql } from "drizzle-orm";
import type { z } from "zod";
import { getDb, platformSchema } from "@/core/db";
import { env } from "@/core/env";
import { logger, serializeError } from "@/core/logger";
import { ensureWorkspace } from "@/core/workspace";

/**
 * AI generation with a guaranteed answer.
 *
 * With `ANTHROPIC_API_KEY` set, requests go to Claude (per-workspace daily quota).
 * Without a key, over quota, or on any API failure, the caller's deterministic
 * `fallback` runs instead — every AI feature keeps working offline and in tests.
 * The returned `source` lets the UI label which one produced the result.
 */

export type AiSource = "claude" | "template";

export interface AiOutcome<T> {
  data: T;
  source: AiSource;
  /** User-facing Korean note when the template path was taken for a reason worth showing. */
  notice?: string;
}

interface BaseRequest {
  /** Stable feature key for logs, e.g. "ai-content-agency.blog". */
  feature: string;
  /** System prompt. Keep it stable across calls (it is the cacheable prefix). */
  system: string;
  /** The user turn: the concrete task and its inputs. */
  prompt: string;
  maxTokens?: number;
}

export interface ObjectRequest<TSchema extends z.ZodType> extends BaseRequest {
  schema: TSchema;
  fallback: () => z.infer<TSchema> | Promise<z.infer<TSchema>>;
}

export interface TextRequest extends BaseRequest {
  fallback: () => string | Promise<string>;
}

export function aiStatus() {
  const { ANTHROPIC_API_KEY, ANTHROPIC_MODEL, AI_DAILY_LIMIT } = env();
  return { enabled: Boolean(ANTHROPIC_API_KEY) && AI_DAILY_LIMIT > 0, model: ANTHROPIC_MODEL };
}

/** Structured output: Claude's answer is validated against `schema`. */
export async function generateObject<TSchema extends z.ZodType>(
  request: ObjectRequest<TSchema>,
): Promise<AiOutcome<z.infer<TSchema>>> {
  return run(request, async (client, model) => {
    const response = await client.beta.messages.parse({
      ...modelParams(model),
      max_tokens: request.maxTokens ?? 4000,
      system: request.system,
      messages: [{ role: "user", content: request.prompt }],
      output_config: { ...effortParams(model), format: betaZodOutputFormat(request.schema) },
    });
    if (response.stop_reason === "refusal") throw new AiRefusal();
    if (response.parsed_output == null) throw new Error("Claude returned no parsable output");
    return response.parsed_output as z.infer<TSchema>;
  });
}

/** Free-form text output. */
export async function generateText(request: TextRequest): Promise<AiOutcome<string>> {
  return run(request, async (client, model) => {
    const response = await client.beta.messages.create({
      ...modelParams(model),
      max_tokens: request.maxTokens ?? 4000,
      system: request.system,
      messages: [{ role: "user", content: request.prompt }],
      output_config: effortParams(model),
    });
    if (response.stop_reason === "refusal") throw new AiRefusal();
    const text = response.content
      .flatMap((block) => (block.type === "text" ? [block.text] : []))
      .join("")
      .trim();
    if (!text) throw new Error("Claude returned an empty response");
    return text;
  });
}

class AiRefusal extends Error {
  constructor() {
    super("Claude declined the request");
  }
}

let client: Anthropic | undefined;

async function run<T>(
  request: BaseRequest & { fallback: () => T | Promise<T> },
  call: (client: Anthropic, model: string) => Promise<T>,
): Promise<AiOutcome<T>> {
  const { enabled, model } = aiStatus();
  if (!enabled) return { data: await request.fallback(), source: "template" };

  if (!(await consumeQuota())) {
    return {
      data: await request.fallback(),
      source: "template",
      notice: "오늘 사용할 수 있는 AI 생성 횟수를 모두 써서 기본 템플릿으로 만들었어요.",
    };
  }

  try {
    client ??= new Anthropic({ apiKey: env().ANTHROPIC_API_KEY, timeout: 45_000, maxRetries: 1 });
    return { data: await call(client, model), source: "claude" };
  } catch (error) {
    logger.error("ai", `${request.feature} failed; using template`, { ...describe(error), model });
    return {
      data: await request.fallback(),
      source: "template",
      notice: "AI 응답을 받지 못해 기본 템플릿으로 만들었어요. 잠시 후 다시 시도해 주세요.",
    };
  }
}

/** Server-side refusal fallbacks are available on the Opus 5 / Fable 5.1 generation. */
function modelParams(model: string) {
  const supportsFallbacks = /^claude-(opus-5|fable-5)/.test(model);
  return supportsFallbacks
    ? { model, betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const }
    : { model };
}

/** Copywriting is a light task: low effort keeps latency and cost down. Haiku does not take `effort`. */
function effortParams(model: string) {
  return /haiku/.test(model) ? {} : { effort: "low" as const };
}

function describe(error: unknown): Record<string, unknown> {
  if (error instanceof Anthropic.APIError) return { status: error.status, error: error.message };
  return serializeError(error);
}

/** Atomically counts one call against today's quota (Asia/Seoul day). */
async function consumeQuota(): Promise<boolean> {
  try {
    const workspaceId = await ensureWorkspace();
    const db = await getDb(platformSchema);
    const { aiUsage } = platformSchema;
    const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
    const [row] = await db
      .insert(aiUsage)
      .values({ workspaceId, day: today, calls: 1 })
      .onConflictDoUpdate({ target: [aiUsage.workspaceId, aiUsage.day], set: { calls: sql`${aiUsage.calls} + 1` } })
      .returning({ calls: aiUsage.calls });
    return (row?.calls ?? 0) <= env().AI_DAILY_LIMIT;
  } catch (error) {
    logger.error("ai", "quota check failed", serializeError(error));
    return false;
  }
}
