/**
 * Workspace cookie contract, shared by the proxy (edge of the request) and the
 * server data layer. Kept dependency-free so it can run in any runtime.
 */
export const WORKSPACE_COOKIE = "ksp_ws";

/** One year: a visitor keeps their demo workspace across visits. */
export const WORKSPACE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * Used when a request carries no workspace cookie at all (cookies disabled,
 * crawlers). Everyone without a cookie shares this read-mostly sandbox.
 */
export const FALLBACK_WORKSPACE_ID = "00000000-0000-4000-8000-000000000000";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isWorkspaceId(value: string | undefined | null): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}
