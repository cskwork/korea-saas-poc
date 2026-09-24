/**
 * Minimal structured logger. JSON lines in production (Vercel log drains parse them),
 * readable lines in development.
 */
type Level = "debug" | "info" | "warn" | "error";

const isProd = process.env.NODE_ENV === "production";

function write(level: Level, scope: string, message: string, data?: Record<string, unknown>) {
  if (level === "debug" && isProd) return;
  const sink = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
  if (isProd) {
    sink(JSON.stringify({ level, scope, message, ...data, time: new Date().toISOString() }));
  } else {
    sink(`[${scope}] ${message}`, ...(data ? [data] : []));
  }
}

export function serializeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) return { error: error.message, name: error.name, stack: isProd ? undefined : error.stack };
  return { error: String(error) };
}

export const logger = {
  debug: (scope: string, message: string, data?: Record<string, unknown>) => write("debug", scope, message, data),
  info: (scope: string, message: string, data?: Record<string, unknown>) => write("info", scope, message, data),
  warn: (scope: string, message: string, data?: Record<string, unknown>) => write("warn", scope, message, data),
  error: (scope: string, message: string, data?: Record<string, unknown>) => write("error", scope, message, data),
};
