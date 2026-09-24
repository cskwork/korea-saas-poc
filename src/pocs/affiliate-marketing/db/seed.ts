import { siteUrl } from "@/core/env";
import { seoulDateKey } from "@/core/format";
import type { Database } from "@/core/db/connection";
import { SOCIAL_PLATFORMS, SOCIAL_PLATFORM_CHANNEL, CHANNEL_TAGS, type Channel, type Device } from "../domain/catalog";
import { generateCode, shortPath } from "../domain/codes";
import { computeCommission, type CommissionTerms } from "../domain/commission";
import { addDays, dayRange, daysBetween } from "../domain/dates";
import { templateDraft, type DraftItem } from "../domain/templates";
import { templateSocial } from "../domain/social";
import * as schema from "./schema";

/**
 * Sample workspace: three programs, twelve links and ~90 days of clicks and orders
 * ending today (Asia/Seoul), so the dashboards look alive on any date. Every value is
 * sample data; the UI labels it as such.
 */

type Db = Database<typeof schema>;

/** Deterministic PRNG so every workspace gets the same shape of data. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type ProgramKey = "coupang" | "tenping" | "adpost";

const PROGRAMS: Record<ProgramKey, Omit<typeof schema.programs.$inferInsert, "workspaceId">> = {
  coupang: {
    name: "쿠팡 파트너스",
    model: "cps",
    defaultRateBp: 300,
    settlementCycle: "월 1회 (구매 확정 후 익월 정산)",
    minPayoutWon: 10_000,
    cookieWindow: "24시간",
    bestChannels: "블로그, 유튜브",
    bestCategories: "전자기기, 생활용품, 유아·키즈",
    notes: "상품군이 넓고 전환이 잘 나와요. 수수료율이 낮은 편이라 객단가 높은 상품이 유리해요.",
    position: 1,
  },
  tenping: {
    name: "텐핑",
    model: "cpa",
    defaultRateBp: 1000,
    defaultFixedWon: 3_000,
    settlementCycle: "주 1회",
    minPayoutWon: 5_000,
    cookieWindow: "캠페인별 상이",
    bestChannels: "인스타그램, 카카오톡",
    bestCategories: "뷰티, 식품·건강",
    notes: "캠페인마다 건당 고정 또는 판매 수수료가 달라요. SNS 공유형 캠페인이 많아요.",
    position: 2,
  },
  adpost: {
    name: "네이버 애드포스트",
    model: "cpc",
    settlementCycle: "월 1회",
    minPayoutWon: 50_000,
    cookieWindow: "해당 없음",
    bestChannels: "네이버 블로그",
    bestCategories: "정보성 글, 도서",
    notes: "링크 판매 수수료가 아니라 블로그 광고 클릭 수익이에요. 판매 기록에서 수익을 직접 입력하세요.",
    position: 3,
  },
};

interface SampleLink {
  program: ProgramKey;
  productName: string;
  category: string;
  priceWon: number;
  terms: CommissionTerms;
  /** Mean clicks per day at today's pace. */
  pace: number;
  cvr: number;
  mix: Partial<Record<Channel, number>>;
  ageDays: number;
  status?: "paused" | "expired";
  /** Days ago the link stopped receiving clicks (paused/expired links). */
  stoppedDaysAgo?: number;
  memo?: string;
}

const percent = (bp: number): CommissionTerms => ({ commissionType: "percent", commissionRateBp: bp, commissionFixedWon: 0 });
const fixed = (won: number): CommissionTerms => ({ commissionType: "fixed", commissionRateBp: 0, commissionFixedWon: won });

const BLOG_MIX = { naver_blog: 45, tistory: 14, youtube: 14, x: 5, kakao: 6, direct: 10, other: 6 };
const SNS_MIX = { instagram: 44, threads: 16, naver_blog: 16, x: 6, kakao: 8, direct: 10 };
const MIXED = { naver_blog: 30, instagram: 22, tistory: 8, threads: 8, kakao: 12, direct: 14, other: 6 };

const LINKS: SampleLink[] = [
  { program: "coupang", productName: "삼성 갤럭시 버즈3 프로", category: "전자기기", priceWon: 219_000, terms: percent(300), pace: 11, cvr: 0.034, mix: BLOG_MIX, ageDays: 90, memo: "리뷰 글 상단 고정 링크" },
  { program: "coupang", productName: "애플 에어팟 프로 2 (USB-C)", category: "전자기기", priceWon: 329_000, terms: percent(300), pace: 9, cvr: 0.028, mix: BLOG_MIX, ageDays: 90 },
  { program: "coupang", productName: "LG 그램 16 노트북", category: "전자기기", priceWon: 1_690_000, terms: percent(300), pace: 5, cvr: 0.009, mix: BLOG_MIX, ageDays: 88 },
  { program: "coupang", productName: "다이슨 에어랩 멀티 스타일러", category: "뷰티", priceWon: 699_000, terms: percent(300), pace: 6, cvr: 0.014, mix: SNS_MIX, ageDays: 80 },
  { program: "coupang", productName: "브리타 마렐라 정수기 필터 6개입", category: "생활용품", priceWon: 39_900, terms: percent(300), pace: 8, cvr: 0.062, mix: MIXED, ageDays: 90 },
  { program: "coupang", productName: "일리 Y3.3 캡슐 커피머신", category: "생활용품", priceWon: 189_000, terms: percent(300), pace: 5, cvr: 0.024, mix: MIXED, ageDays: 60 },
  { program: "coupang", productName: "레고 클래식 라지 조립 박스", category: "유아·키즈", priceWon: 69_900, terms: percent(300), pace: 4, cvr: 0.041, mix: MIXED, ageDays: 42 },
  { program: "coupang", productName: "보솜이 아기 물티슈 100매 10팩", category: "유아·키즈", priceWon: 21_900, terms: percent(300), pace: 5, cvr: 0.07, mix: MIXED, ageDays: 90, status: "paused", stoppedDaysAgo: 9, memo: "품절로 잠시 중지" },
  { program: "coupang", productName: "역행자 (확장판)", category: "도서", priceWon: 19_800, terms: percent(300), pace: 4, cvr: 0.05, mix: BLOG_MIX, ageDays: 90, status: "expired", stoppedDaysAgo: 31 },
  { program: "tenping", productName: "닥터자르트 시카페어 크림 50ml", category: "뷰티", priceWon: 38_000, terms: percent(1000), pace: 9, cvr: 0.045, mix: SNS_MIX, ageDays: 75 },
  { program: "tenping", productName: "뉴트리원 비타민D 4000IU 3개월분", category: "식품·건강", priceWon: 29_900, terms: percent(800), pace: 6, cvr: 0.05, mix: SNS_MIX, ageDays: 70 },
  { program: "tenping", productName: "밀키트 정기배송 첫 달 체험", category: "식품·건강", priceWon: 29_900, terms: fixed(4_000), pace: 4, cvr: 0.06, mix: SNS_MIX, ageDays: 20, memo: "신청 1건당 4,000원 (캠페인 조건)" },
];

const HOUR_WEIGHTS = [2, 1.2, 0.8, 0.5, 0.4, 0.5, 1, 2, 3, 3.2, 3, 4, 6, 5.5, 4, 3.8, 4, 5, 6, 8, 9, 9.5, 8, 5];

const REFERRERS: Record<Channel, string[] | null> = {
  naver_blog: ["blog.naver.com", "m.blog.naver.com"],
  tistory: ["linkit-review.tistory.com"],
  instagram: ["l.instagram.com"],
  threads: ["l.threads.com"],
  x: ["t.co"],
  youtube: ["www.youtube.com", "m.youtube.com"],
  kakao: null,
  direct: null,
  other: ["www.google.com", "search.daum.net", "cafe.naver.com"],
};

function pickWeighted<T extends string>(random: () => number, weights: Partial<Record<T, number>>): T {
  const entries = Object.entries(weights) as [T, number][];
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let roll = random() * total;
  for (const [key, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return key;
  }
  return entries[entries.length - 1][0];
}

function poisson(random: () => number, mean: number): number {
  const limit = Math.exp(-mean);
  let k = 0;
  let p = 1;
  do {
    k += 1;
    p *= random();
  } while (p > limit);
  return k - 1;
}

function destinationFor(link: SampleLink): string {
  const query = encodeURIComponent(link.productName);
  return link.program === "coupang"
    ? `https://www.coupang.com/np/search?q=${query}`
    : `https://search.shopping.naver.com/search/all?query=${query}`;
}

async function insertInChunks<T>(rows: T[], size: number, insert: (chunk: T[]) => Promise<unknown>) {
  for (let i = 0; i < rows.length; i += size) await insert(rows.slice(i, i + size));
}

export async function seedAffiliateMarketing(db: Db, workspaceId: string, now: Date = new Date()): Promise<void> {
  const random = mulberry32(20260924);
  const today = seoulDateKey(now);

  const programRows = await db
    .insert(schema.programs)
    .values((Object.keys(PROGRAMS) as ProgramKey[]).map((key) => ({ workspaceId, ...PROGRAMS[key] })))
    .returning({ id: schema.programs.id, name: schema.programs.name });
  const programId = (key: ProgramKey) => programRows.find((p) => p.name === PROGRAMS[key].name)!.id;

  const linkRows = await db
    .insert(schema.links)
    .values(
      LINKS.map((link) => {
        const created = new Date(`${addDays(today, -link.ageDays)}T09:30:00+09:00`);
        return {
          workspaceId,
          programId: programId(link.program),
          code: generateCode(),
          productName: link.productName,
          category: link.category,
          destinationUrl: destinationFor(link),
          priceWon: link.priceWon,
          ...link.terms,
          status: link.status ?? ("active" as const),
          memo: link.memo ?? "",
          createdAt: created,
          updatedAt: link.stoppedDaysAgo ? new Date(`${addDays(today, -link.stoppedDaysAgo)}T21:00:00+09:00`) : created,
        };
      }),
    )
    .returning({ id: schema.links.id, code: schema.links.code, productName: schema.links.productName });

  const clickRows: (typeof schema.clicks.$inferInsert)[] = [];
  const conversionRows: (typeof schema.conversions.$inferInsert)[] = [];
  const hourTotal = HOUR_WEIGHTS.reduce((a, b) => a + b, 0);
  const hourWeights = Object.fromEntries(HOUR_WEIGHTS.map((w, h) => [String(h), w / hourTotal]));

  LINKS.forEach((link, index) => {
    const linkId = linkRows[index].id;
    const firstDay = addDays(today, -link.ageDays);
    const lastDay = link.stoppedDaysAgo ? addDays(today, -link.stoppedDaysAgo) : today;
    for (const day of dayRange(firstDay, lastDay)) {
      const age = daysBetween(day, today);
      const weekday = new Date(`${day}T12:00:00+09:00`).getUTCDay();
      const growth = 0.45 + 0.55 * (1 - age / 90);
      const weekend = weekday === 0 || weekday === 6 ? 1.18 : 1;
      // Today is only partly over: scale by the share of the day's clicks already past (by hour).
      const partial = day === today ? Math.min(1, Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Seoul", hour: "2-digit", hour12: false }).format(now)) / 24 + 0.15) : 1;
      const count = poisson(random, link.pace * growth * weekend * partial);
      let dayConversions = 0;
      for (let c = 0; c < count; c += 1) {
        const hour = Number(pickWeighted(random, hourWeights));
        const minute = Math.floor(random() * 60);
        const clickedAt = new Date(`${day}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:${String(Math.floor(random() * 60)).padStart(2, "0")}+09:00`);
        if (clickedAt > now) continue;
        const channel = pickWeighted(random, link.mix);
        const hosts = REFERRERS[channel];
        const device: Device = channel === "naver_blog" || channel === "tistory" ? (random() < 0.4 ? "desktop" : "mobile") : random() < 0.9 ? "mobile" : random() < 0.5 ? "tablet" : "desktop";
        clickRows.push({
          workspaceId,
          linkId,
          clickedAt,
          channel,
          referrerHost: hosts ? hosts[Math.floor(random() * hosts.length)] : null,
          device,
        });
        if (random() < link.cvr) dayConversions += 1;
      }
      for (let c = 0; c < dayConversions; c += 1) {
        const orderedOn = random() < 0.2 && day < today ? addDays(day, 1) : day;
        const quantity = random() < 0.12 ? 2 : 1;
        const basket = link.program === "coupang" && random() < 0.3 ? Math.round((5_000 + random() * 55_000) / 100) * 100 : 0;
        const orderAmountWon = link.priceWon * quantity + basket;
        const orderAge = daysBetween(orderedOn, today);
        const roll = random();
        const status = orderAge > 14 ? (roll < 0.9 ? "confirmed" : "cancelled") : roll < 0.95 ? "pending" : "cancelled";
        conversionRows.push({
          workspaceId,
          linkId,
          orderedOn,
          orderAmountWon,
          commissionWon: computeCommission(link.terms, orderAmountWon),
          status,
          channel: pickWeighted(random, link.mix),
          note: basket ? "함께 담은 상품 포함" : "",
          createdAt: new Date(`${orderedOn}T23:00:00+09:00`),
        });
      }
    }
  });

  await insertInChunks(clickRows, 1000, (chunk) => db.insert(schema.clicks).values(chunk));
  await insertInChunks(conversionRows, 500, (chunk) => db.insert(schema.conversions).values(chunk));

  const origin = siteUrl();
  const itemFor = (index: number, overrides: Partial<DraftItem>): DraftItem => ({
    name: LINKS[index].productName,
    priceWon: LINKS[index].priceWon,
    rating: null,
    pros: [],
    cons: [],
    reason: "",
    url: `${origin}${shortPath(linkRows[index].code, CHANNEL_TAGS.naver_blog)}`,
    programName: PROGRAMS[LINKS[index].program].name,
    ...overrides,
  });

  const comparisonItems = [
    itemFor(0, { rating: 4.5, pros: ["노이즈 캔슬링 강함", "갤럭시 연동 편리"], cons: ["아이폰과는 기능 제한"] }),
    itemFor(1, { rating: 4.6, pros: ["아이폰 연동 최고", "착용감 가벼움"], cons: ["가격이 높음"] }),
  ];
  const comparison = templateDraft({ kind: "comparison", title: "", audience: "출퇴근길 무선 이어폰을 찾는 분", summary: "", items: comparisonItems });
  const rankingItems = [
    itemFor(4, { reason: "매달 사는 소모품이라 묶음 구매가 이득" }),
    itemFor(5, { reason: "캡슐 한 번으로 카페 수준 에스프레소" }),
    itemFor(6, { reason: "주말 내내 아이와 만들기 좋은 구성" }),
  ];
  const ranking = templateDraft({ kind: "ranking", title: "신혼집 살림 추천 TOP 3", audience: "신혼부부", summary: "", items: rankingItems });

  await db.insert(schema.articles).values([
    {
      workspaceId,
      kind: "comparison",
      title: comparison.title,
      body: comparison.body,
      input: { title: "", audience: "출퇴근길 무선 이어폰을 찾는 분", summary: "", items: comparisonItems.map((i, n) => ({ linkId: linkRows[n].id, name: i.name, priceWon: i.priceWon, rating: i.rating, pros: i.pros, cons: i.cons, reason: i.reason })) },
      source: "template",
      createdAt: new Date(`${addDays(today, -6)}T22:10:00+09:00`),
      updatedAt: new Date(`${addDays(today, -6)}T22:40:00+09:00`),
    },
    {
      workspaceId,
      kind: "ranking",
      title: ranking.title,
      body: ranking.body,
      input: { title: "신혼집 살림 추천 TOP 3", audience: "신혼부부", summary: "", items: rankingItems.map((i, n) => ({ linkId: linkRows[[4, 5, 6][n]].id, name: i.name, priceWon: i.priceWon, rating: i.rating, pros: i.pros, cons: i.cons, reason: i.reason })) },
      source: "template",
      createdAt: new Date(`${addDays(today, -2)}T21:05:00+09:00`),
      updatedAt: new Date(`${addDays(today, -2)}T21:05:00+09:00`),
    },
  ]);

  const cica = LINKS[9];
  const urls = Object.fromEntries(
    SOCIAL_PLATFORMS.map((platform) => [platform, `${origin}${shortPath(linkRows[9].code, CHANNEL_TAGS[SOCIAL_PLATFORM_CHANNEL[platform]])}`]),
  ) as Record<(typeof SOCIAL_PLATFORMS)[number], string>;
  await db.insert(schema.socialPosts).values({
    workspaceId,
    linkId: linkRows[9].id,
    productName: cica.productName,
    variants: templateSocial({
      productName: cica.productName,
      category: cica.category,
      priceWon: 42_000,
      salePriceWon: cica.priceWon,
      points: ["붉은 기 진정에 바로 효과", "끈적임 없이 가벼운 제형", "민감 피부도 자극 없음"],
      programName: PROGRAMS.tenping.name,
      urls,
    }),
    source: "template",
    createdAt: new Date(`${addDays(today, -1)}T20:30:00+09:00`),
  });

  await db.insert(schema.settings).values({ workspaceId, monthlyGoalWon: 400_000 });
}
