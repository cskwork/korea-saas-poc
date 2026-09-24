import { z } from "zod";
import { logger, serializeError } from "@/core/logger";

/**
 * Server action conventions.
 *
 * Actions validate input with zod, return an `ActionState` (never throw for
 * expected failures) and work with React's `useActionState`:
 *
 * ```ts
 * // server/actions.ts
 * "use server";
 * export const createProduct = formAction(productInput, async (input) => {
 *   const { db, workspaceId } = await getModuleContext(smartStore);
 *   ...
 *   revalidatePath("/smart-store");
 *   return { message: "상품을 등록했어요." };
 * });
 *
 * // component
 * const [state, submit, pending] = useActionState(createProduct, idleState);
 * ```
 */

export type ActionState<TData = undefined> =
  | { status: "idle" }
  | { status: "success"; data?: TData; message?: string }
  | { status: "error"; message: string; fieldErrors?: Partial<Record<string, string[]>> };

export const idleState = { status: "idle" } as const satisfies ActionState<never>;

/** An expected, user-facing failure (Korean message). Anything else is logged and reported generically. */
export class UserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserError";
  }
}

type HandlerResult<TData> = void | { data?: TData; message?: string };

/** Wraps a handler as a `(prevState, formData)` action for forms. */
export function formAction<TSchema extends z.ZodType, TData = undefined>(
  schema: TSchema,
  handler: (input: z.infer<TSchema>) => Promise<HandlerResult<TData>>,
) {
  return async (_prev: ActionState<TData>, formData: FormData): Promise<ActionState<TData>> =>
    execute(schema, formDataToObject(formData), handler);
}

/** Wraps a handler as a plain async function taking a typed object (buttons, client calls). */
export function action<TSchema extends z.ZodType, TData = undefined>(
  schema: TSchema,
  handler: (input: z.infer<TSchema>) => Promise<HandlerResult<TData>>,
) {
  return async (input: z.input<TSchema>): Promise<ActionState<TData>> => execute(schema, input, handler);
}

async function execute<TSchema extends z.ZodType, TData>(
  schema: TSchema,
  raw: unknown,
  handler: (input: z.infer<TSchema>) => Promise<HandlerResult<TData>>,
): Promise<ActionState<TData>> {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const flat = z.flattenError(parsed.error);
    return {
      status: "error",
      message: flat.formErrors[0] ?? "입력한 내용을 다시 확인해 주세요.",
      fieldErrors: flat.fieldErrors as Partial<Record<string, string[]>>,
    };
  }
  try {
    const result = await handler(parsed.data);
    return { status: "success", data: result?.data, message: result?.message };
  } catch (error) {
    if (error instanceof UserError) return { status: "error", message: error.message };
    // Next.js control-flow errors (redirect(), notFound()) must propagate.
    if (isNextControlFlow(error)) throw error;
    logger.error("action", "unexpected action failure", serializeError(error));
    return { status: "error", message: "요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요." };
  }
}

function isNextControlFlow(error: unknown): boolean {
  const digest = (error as { digest?: unknown } | null)?.digest;
  return typeof digest === "string" && (digest.startsWith("NEXT_REDIRECT") || digest.startsWith("NEXT_HTTP_ERROR_FALLBACK"));
}

/** FormData → plain object. Repeated keys become arrays; `$ACTION_*` framework fields are dropped. */
export function formDataToObject(formData: FormData): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("$ACTION")) continue;
    const existing = result[key];
    if (existing === undefined) result[key] = value;
    else result[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
  }
  return result;
}
