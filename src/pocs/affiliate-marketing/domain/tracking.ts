import { CHANNEL_TAGS, type Channel, type Device } from "./catalog";

/**
 * Pure click classification for the tracked redirect: which channel a click came
 * from, which device, whether it is a bot or link-preview fetch, and whether the
 * destination is safe to redirect to.
 */

const TAG_TO_CHANNEL = new Map(Object.entries(CHANNEL_TAGS).map(([channel, tag]) => [tag, channel as Channel]));

const HOST_RULES: [RegExp, Channel][] = [
  [/(^|\.)blog\.naver\.com$|(^|\.)m\.blog\.naver\.com$|(^|\.)naver\.me$/, "naver_blog"],
  [/(^|\.)tistory\.com$/, "tistory"],
  [/(^|\.)instagram\.com$/, "instagram"],
  [/(^|\.)threads\.(net|com)$/, "threads"],
  [/(^|\.)(x|twitter)\.com$|^t\.co$/, "x"],
  [/(^|\.)youtube\.com$|^youtu\.be$/, "youtube"],
  [/(^|\.)kakao\.com$|(^|\.)kakaocdn\.net$/, "kakao"],
];

/** Channel from an explicit `?c=` tag first, then the referrer host; no referrer means a direct visit. */
export function classifyChannel(tag: string | null | undefined, referrerHost: string | null | undefined): Channel {
  const tagged = tag ? TAG_TO_CHANNEL.get(tag.trim().toLowerCase()) : undefined;
  if (tagged) return tagged;
  if (!referrerHost) return "direct";
  const host = referrerHost.toLowerCase();
  for (const [pattern, channel] of HOST_RULES) if (pattern.test(host)) return channel;
  return "other";
}

/** The referrer's host, or null for missing/invalid referrers and same-site navigation. */
export function referrerHostOf(referrer: string | null | undefined, ownHost?: string): string | null {
  if (!referrer) return null;
  try {
    const url = new URL(referrer);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    const host = url.hostname.toLowerCase();
    return ownHost && host === ownHost.toLowerCase() ? null : host;
  } catch {
    return null;
  }
}

/** A click's channel: explicit tag, then the in-app browser, then the referrer host. */
export function resolveClickChannel(input: { tag: string | null; referrerHost: string | null; userAgent: string | null }): Channel {
  const tagged = classifyChannel(input.tag, null);
  if (tagged !== "direct") return tagged;
  if (!input.referrerHost) return inAppChannel(input.userAgent) ?? "direct";
  return classifyChannel(null, input.referrerHost);
}

/** In-app browsers (KakaoTalk, Instagram, Threads…) identify themselves in the user agent. */
export function inAppChannel(userAgent: string | null | undefined): Channel | null {
  if (!userAgent) return null;
  if (/KAKAOTALK/i.test(userAgent)) return "kakao";
  if (/Barcelona/i.test(userAgent)) return "threads";
  if (/Instagram/i.test(userAgent)) return "instagram";
  if (/NAVER\(inapp/i.test(userAgent)) return "naver_blog";
  return null;
}

const BOT_PATTERN =
  /bot\b|crawler|spider|slurp|preview|scrap|facebookexternalhit|embedly|whatsapp|telegrambot|discordbot|slackbot|kakaotalk-scrap|yeti|daumoa|headlesschrome|lighthouse|curl\/|wget\/|python-requests|go-http-client|node-fetch|axios\//i;

/** Link-preview fetchers and crawlers must not count as clicks. */
export function isBotUserAgent(userAgent: string | null | undefined): boolean {
  if (!userAgent) return true;
  return BOT_PATTERN.test(userAgent);
}

export function classifyDevice(userAgent: string | null | undefined): Device {
  if (!userAgent) return "desktop";
  if (/iPad|Tablet|SM-T\d|Nexus (7|9|10)/i.test(userAgent)) return "tablet";
  if (/Mobi|iPhone|iPod|Android/i.test(userAgent)) return "mobile";
  return "desktop";
}

/** Only absolute http(s) URLs with a host are allowed as redirect destinations. */
export function isSafeDestination(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return (url.protocol === "https:" || url.protocol === "http:") && url.hostname.length > 0 && !url.username && !url.password;
  } catch {
    return false;
  }
}
