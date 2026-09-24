import { z } from "zod";

/**
 * Typed, validated server environment.
 *
 * Empty strings are treated as "unset" so `.env` files can keep blank keys
 * (as `.env.example` does) without tripping validation.
 */
const optional = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((value) => (value === "" ? undefined : value), schema.optional());

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  DATABASE_URL: optional(z.string().regex(/^postgres(ql)?:\/\//, "DATABASE_URL must be a postgres:// URL")),
  PGLITE_DATA_DIR: optional(z.string()),
  DB_POOL_MAX: z.coerce.number().int().positive().default(5),

  ANTHROPIC_API_KEY: optional(z.string()),
  ANTHROPIC_MODEL: z.preprocess((v) => (v === "" ? undefined : v), z.string().default("claude-opus-5")),
  AI_DAILY_LIMIT: z.coerce.number().int().nonnegative().default(30),

  CRON_SECRET: optional(z.string()),
  WORKSPACE_TTL_DAYS: z.coerce.number().int().positive().default(30),

  VERCEL: optional(z.string()),
  VERCEL_ENV: optional(z.enum(["production", "preview", "development"])),
  VERCEL_PROJECT_PRODUCTION_URL: optional(z.string()),
  NEXT_PUBLIC_SITE_URL: optional(z.string()),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | undefined;

export function env(): ServerEnv {
  if (!cached) {
    const parsed = serverEnvSchema.safeParse(process.env);
    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
      throw new Error(`Invalid environment configuration:\n${issues}`);
    }
    cached = parsed.data;
  }
  return cached;
}

/** Public origin of the deployment, used for metadata, sitemap and absolute links. */
export function siteUrl(): string {
  const { NEXT_PUBLIC_SITE_URL, VERCEL_PROJECT_PRODUCTION_URL } = env();
  if (NEXT_PUBLIC_SITE_URL) return NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  if (VERCEL_PROJECT_PRODUCTION_URL) return `https://${VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}
