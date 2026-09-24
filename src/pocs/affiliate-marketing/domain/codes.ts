/**
 * Short codes for tracked links. Generated codes avoid look-alike characters
 * (0/o, 1/l/i) so they survive being read aloud or retyped from a screenshot.
 */
export const CODE_ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz";
export const GENERATED_CODE_LENGTH = 6;

const CUSTOM_CODE_PATTERN = /^[a-z0-9](?:[a-z0-9-]{1,22}[a-z0-9])$/;

/** Reserved so a custom code can never shadow a route segment. */
const RESERVED = new Set(["new", "edit", "go", "admin", "api"]);

/** A random code; `random` returns an integer in [0, max) (injectable for tests). */
export function generateCode(random: (max: number) => number = cryptoRandom, length = GENERATED_CODE_LENGTH): string {
  let code = "";
  for (let i = 0; i < length; i += 1) code += CODE_ALPHABET[random(CODE_ALPHABET.length)];
  return code;
}

/** Normalises a user-typed custom code, or explains why it cannot be used. */
export function normalizeCustomCode(input: string): { ok: true; code: string } | { ok: false; message: string } {
  const code = input.trim().toLowerCase();
  if (code.length < 3 || code.length > 24) return { ok: false, message: "코드는 3~24자로 입력해 주세요." };
  if (!CUSTOM_CODE_PATTERN.test(code)) {
    return { ok: false, message: "영문 소문자, 숫자, 하이픈(-)만 쓸 수 있고 하이픈으로 시작하거나 끝날 수 없어요." };
  }
  if (RESERVED.has(code)) return { ok: false, message: "예약된 단어라 코드로 쓸 수 없어요." };
  return { ok: true, code };
}

/** Accepts both generated and custom codes (used to reject junk before touching the database). */
export function isPlausibleCode(value: string): boolean {
  return value.length >= 3 && value.length <= 24 && /^[a-z0-9-]+$/.test(value);
}

function cryptoRandom(max: number): number {
  // Rejection sampling keeps the distribution uniform.
  const limit = Math.floor(256 / max) * max;
  const buffer = new Uint8Array(1);
  for (;;) {
    crypto.getRandomValues(buffer);
    if (buffer[0] < limit) return buffer[0] % max;
  }
}

/** Path of the tracked redirect for a code, optionally tagged with a channel. */
export function shortPath(code: string, channelTag?: string): string {
  return `/affiliate-marketing/go/${code}${channelTag ? `?c=${channelTag}` : ""}`;
}
