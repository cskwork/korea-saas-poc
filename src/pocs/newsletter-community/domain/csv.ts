import { TIER_LABEL, TIERS, type SubscriberStatus, type Tier } from "./tiers";

/** RFC 4180 CSV, with a UTF-8 BOM on export so Excel opens Korean text correctly. */

export function parseCsv(text: string): string[][] {
  const source = text.replace(/^﻿/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (quoted) {
      if (char === '"' && source[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && source[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

function escapeCell(value: string): string {
  // Leading formula characters are neutralised so a spreadsheet never executes a cell.
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export function toCsv(rows: readonly (readonly string[])[]): string {
  return `﻿${rows.map((row) => row.map(escapeCell).join(",")).join("\r\n")}\r\n`;
}

export const SUBSCRIBER_CSV_HEADER = ["이름", "이메일", "등급", "상태", "가입일"] as const;

const STATUS_CSV_LABEL: Record<SubscriberStatus, string> = { active: "구독 중", unsubscribed: "해지" };

export function subscribersToCsv(
  subscribers: readonly { name: string; email: string; tier: Tier; status: SubscriberStatus; joinedOn: string }[],
): string {
  return toCsv([
    SUBSCRIBER_CSV_HEADER,
    ...subscribers.map((s) => [s.name, s.email, TIER_LABEL[s.tier], STATUS_CSV_LABEL[s.status], s.joinedOn]),
  ]);
}

export interface SubscriberImportRow {
  line: number;
  name: string;
  email: string;
  tier: Tier;
  status: SubscriberStatus;
  joinedOn: string | null;
}

export interface SubscriberImportParse {
  rows: SubscriberImportRow[];
  errors: { line: number; message: string }[];
}

const HEADER_ALIASES: Record<"name" | "email" | "tier" | "status" | "joinedOn", string[]> = {
  name: ["이름", "name", "성명"],
  email: ["이메일", "email", "e-mail", "메일"],
  tier: ["등급", "tier", "플랜", "plan"],
  status: ["상태", "status"],
  joinedOn: ["가입일", "joined", "joined_on", "구독일"],
};

const TIER_ALIASES: Partial<Record<string, Tier>> = Object.fromEntries(
  TIERS.flatMap((tier) => [
    [tier, tier],
    [TIER_LABEL[tier], tier],
  ]),
);

const STATUS_ALIASES: Partial<Record<string, SubscriberStatus>> = {
  active: "active",
  "구독 중": "active",
  구독중: "active",
  활성: "active",
  unsubscribed: "unsubscribed",
  churned: "unsubscribed",
  해지: "unsubscribed",
  이탈: "unsubscribed",
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
export const MAX_IMPORT_ROWS = 2000;

/**
 * Reads subscribers from CSV. The first row must be a header naming at least
 * 이름 and 이메일 (Korean or English); 등급, 상태 and 가입일 are optional.
 */
export function parseSubscriberCsv(text: string): SubscriberImportParse {
  const table = parseCsv(text);
  if (table.length === 0) return { rows: [], errors: [{ line: 1, message: "파일이 비어 있어요." }] };

  const header = table[0].map((cell) => cell.trim().toLowerCase());
  const column = (key: keyof typeof HEADER_ALIASES) =>
    header.findIndex((cell) => HEADER_ALIASES[key].some((alias) => alias.toLowerCase() === cell));
  const index = {
    name: column("name"),
    email: column("email"),
    tier: column("tier"),
    status: column("status"),
    joinedOn: column("joinedOn"),
  };
  if (index.name < 0 || index.email < 0) {
    return { rows: [], errors: [{ line: 1, message: "첫 줄에 '이름'과 '이메일' 열 제목이 있어야 해요." }] };
  }
  if (table.length - 1 > MAX_IMPORT_ROWS) {
    return { rows: [], errors: [{ line: 1, message: `한 번에 ${MAX_IMPORT_ROWS}명까지 가져올 수 있어요.` }] };
  }

  const rows: SubscriberImportRow[] = [];
  const errors: SubscriberImportParse["errors"] = [];
  const seen = new Set<string>();

  table.slice(1).forEach((cells, i) => {
    const line = i + 2;
    const cell = (at: number) => (at >= 0 ? (cells[at] ?? "").trim() : "");
    const result = readRow(line, {
      name: cell(index.name),
      email: cell(index.email).toLowerCase(),
      tier: cell(index.tier),
      status: cell(index.status),
      joinedOn: cell(index.joinedOn),
    });
    if (typeof result === "string") {
      errors.push({ line, message: result });
    } else if (seen.has(result.email)) {
      errors.push({ line, message: `파일 안에서 중복된 이메일이에요: ${result.email}` });
    } else {
      seen.add(result.email);
      rows.push(result);
    }
  });

  return { rows, errors };
}

/** One CSV row → an import row, or the Korean reason it was rejected. */
function readRow(
  line: number,
  raw: { name: string; email: string; tier: string; status: string; joinedOn: string },
): SubscriberImportRow | string {
  if (!raw.name) return "이름이 비어 있어요.";
  if (raw.name.length > 40) return "이름은 40자까지 쓸 수 있어요.";
  if (!EMAIL.test(raw.email)) return `이메일 형식이 아니에요: ${raw.email || "(빈 칸)"}`;

  const tier = raw.tier ? TIER_ALIASES[raw.tier.toLowerCase()] : "free";
  if (!tier) return `등급은 무료·베이직·프로 중 하나여야 해요: ${raw.tier}`;
  const status = raw.status ? STATUS_ALIASES[raw.status.toLowerCase()] : "active";
  if (!status) return `상태는 구독 중·해지 중 하나여야 해요: ${raw.status}`;
  if (raw.joinedOn && !DATE.test(raw.joinedOn)) return `가입일은 2026-09-01 형식으로 써 주세요: ${raw.joinedOn}`;

  return { line, name: raw.name, email: raw.email, tier, status, joinedOn: raw.joinedOn || null };
}
