import "server-only";
import { getDb } from "@/core/db";
import { logger, serializeError } from "@/core/logger";
import * as schema from "../db/schema";
import { isPlausibleCode } from "../domain/codes";
import { classifyDevice, isBotUserAgent, isSafeDestination, referrerHostOf, resolveClickChannel } from "../domain/tracking";
import { recordClick, resolveCode } from "./tracking";

/**
 * The public redirect behind every short link. Returns what the route should send and,
 * for a countable click, a deferred write the route schedules after the response.
 */

export interface RedirectRequest {
  code: string;
  channelTag: string | null;
  referrer: string | null;
  userAgent: string | null;
  ownHost: string;
}

export type RedirectOutcome =
  | { kind: "redirect"; location: string; record: (() => Promise<void>) | null }
  | { kind: "missing" }
  | { kind: "ended"; productName: string }
  | { kind: "unavailable" };

export async function resolveRedirect(request: RedirectRequest): Promise<RedirectOutcome> {
  const code = request.code.trim().toLowerCase();
  if (!isPlausibleCode(code)) return { kind: "missing" };
  try {
    const db = await getDb(schema);
    const link = await resolveCode(db, code);
    if (!link || !isSafeDestination(link.destinationUrl)) return { kind: "missing" };
    if (link.status === "expired") return { kind: "ended", productName: link.productName };

    const countable = link.status === "active" && !isBotUserAgent(request.userAgent);
    const referrerHost = referrerHostOf(request.referrer, request.ownHost);
    const record = countable
      ? async () => {
          try {
            await recordClick(db, {
              linkId: link.id,
              workspaceId: link.workspaceId,
              channel: resolveClickChannel({ tag: request.channelTag, referrerHost, userAgent: request.userAgent }),
              referrerHost,
              device: classifyDevice(request.userAgent),
            });
          } catch (error) {
            logger.error("affiliate-marketing", "click not recorded", { code, ...serializeError(error) });
          }
        }
      : null;
    return { kind: "redirect", location: link.destinationUrl, record };
  } catch (error) {
    logger.error("affiliate-marketing", "short link lookup failed", { code, ...serializeError(error) });
    return { kind: "unavailable" };
  }
}

const escape = (value: string) => value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** A tiny standalone page (no workspace chrome: the visitor is not the link's owner). */
export function notice(title: string, body: string): string {
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${escape(title)} · 링크잇</title><style>
:root{color-scheme:light}body{margin:0;min-height:100dvh;display:grid;place-items:center;background:#edf0f3;color:#13161d;font-family:"Pretendard Variable",Pretendard,-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo",sans-serif;padding:16px;word-break:keep-all}
main{max-width:420px;width:100%;background:#fff;border:2px solid #13161d;border-radius:3px;overflow:hidden}
.band{background:#fedb34;border-bottom:2px solid #13161d;padding:14px 18px;font-weight:800;font-size:13px}
.body{padding:18px}h1{margin:0 0 8px;font-size:22px;line-height:1.3}p{margin:0 0 16px;line-height:1.6;color:#44484f}
a{display:inline-block;padding:10px 16px;background:#da151f;color:#fff;font-weight:700;text-decoration:none;border-radius:3px}
a:focus-visible{outline:3px solid #13161d;outline-offset:2px}
</style></head><body><main><div class="band">링크잇 짧은 링크</div><div class="body"><h1>${escape(title)}</h1><p>${escape(body)}</p><a href="/">처음으로</a></div></main></body></html>`;
}
