import type { ContentKind, Length, Tone } from "./content";
import { charLength, fitLength, hashtag, josa, particle } from "./korean";

/**
 * The deterministic draft writer. It runs whenever Claude is unavailable (no API key,
 * over quota, API failure) and in tests, so it has to hand the editor something worth
 * editing: the right structure for the channel, the keywords placed where search and
 * readers expect them, the requested voice and length. It never invents facts: prices,
 * specs, numbers and reviews are left as "[확인 필요: …]" slots for the editor to fill.
 */

export interface DraftBrief {
  kind: ContentKind;
  topic: string;
  tone: Tone;
  length: Length;
  keywords: readonly string[];
  clientName?: string | null;
  industry?: string | null;
}

export interface DraftContent {
  title: string;
  body: string;
}

/** Marker the editor must replace before delivery. */
export const CHECK_MARK = "[확인 필요";

export function countOpenChecks(text: string): number {
  return text.split(CHECK_MARK).length - 1;
}

const check = (what: string) => `${CHECK_MARK}: ${what}]`;

/** FNV-1a: a stable seed from the topic so different topics read differently. */
function seedOf(text: string): number {
  let hash = 0x811c9dc5;
  for (const char of text) {
    hash ^= char.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function pick<T>(items: readonly T[], seed: number, offset = 0): T {
  return items[(seed + offset) % items.length];
}

type NormalizedBrief = Omit<DraftBrief, "clientName" | "industry"> & {
  clientName: string | null;
  industry: string | null;
  /** The noun phrase a topic is about: "성수동 소금빵, 새벽 6시에 굽는 이유" → "성수동 소금빵". */
  subject: string;
  /** Whether the topic already reads as a headline (a clause, a question, "…하는 법"). */
  headline: boolean;
};

const HEADLINE_ENDING = /(이유|방법|법|가이드|정리|이야기|후기|팁|하세요|할까|할까요|인가요)$/;

export function topicSubject(topic: string): string {
  const [first] = topic.split(/[,?!:|·]/);
  const subject = first?.trim() ?? "";
  return subject.length >= 2 ? subject : topic.trim();
}

/** "수제 자몽청 가을 한정 출시" → { name: "수제 자몽청", occasion: "가을 한정 출시" } */
export function splitOccasion(subject: string): { name: string; occasion: string | null } {
  const event = "(?:출시|런칭|리뉴얼|이벤트|사전 예약|예약|오픈|특강|모집|할인|세일|프로모션|캠페인)";
  const occasion = new RegExp(`^(.+?)\\s+((?:(?:봄|여름|가을|겨울|추석|설|연말|신년)\\s+)?(?:한정\\s+)?${event}(?:\\s+${event})*)$`);
  const match = subject.match(occasion);
  return match ? { name: match[1].trim(), occasion: match[2].trim() } : { name: subject, occasion: null };
}

/** Businesses customers visit in person get visit details; the rest get order details. */
const VISIT_INDUSTRIES = new Set(["F&B", "뷰티", "헬스케어", "교육", "펫"]);

export function writeTemplateDraft(brief: DraftBrief, variant = 0): DraftContent {
  const input: NormalizedBrief = {
    kind: brief.kind,
    tone: brief.tone,
    length: brief.length,
    topic: brief.topic.trim(),
    keywords: brief.keywords.filter(Boolean),
    clientName: brief.clientName?.trim() || null,
    industry: brief.industry ?? null,
    subject: topicSubject(brief.topic),
    headline: /[,?!]/.test(brief.topic) || HEADLINE_ENDING.test(brief.topic.trim()),
  };
  const seed = seedOf(input.topic) + variant * 7;
  switch (input.kind) {
    case "blog":
      return blogPost(input, seed);
    case "product":
      return productDescription(input, seed);
    case "ad":
      return adCopySet(input, seed);
  }
}

// ---------------------------------------------------------------- blog post

function blogPost(b: NormalizedBrief, seed: number): DraftContent {
  const { tone, keywords, clientName } = b;
  const topic = b.subject;
  const [main] = keywords;

  const titles: Record<Tone, string[]> = {
    friendly: [`${topic}, 이것만 알면 충분해요`, `${topic} 처음이라면 꼭 읽어 보세요`, `${topic}, 제가 직접 정리해 봤어요`],
    professional: [`${topic}: 알아 두면 좋은 핵심 정리`, `${topic}, 선택 전에 확인할 것들`, `${topic} 가이드`],
    emotional: [`${topic}, 오늘의 작은 기록`, `${topic}에 마음이 머무는 이유`, `천천히 들여다본 ${topic}`],
    witty: [`${topic}, 아직도 고민 중이세요?`, `${topic}, 이렇게 쉬웠다고?`, `${topic} 모르면 손해인 이유`],
  };
  let title = b.headline ? b.topic : pick(titles[tone], seed);
  if (main && !title.includes(main) && charLength(title) + charLength(main) < 40) title = `[${main}] ${title}`;

  const intro: Record<Tone, string> = {
    friendly: `안녕하세요${clientName ? `, ${clientName}입니다` : ""}! 오늘은 ${topic}에 대해 이야기해 보려고 해요. ${
      main ? `특히 '${main}'${particle(main, "을/를")} 찾아보셨던 분이라면 끝까지 읽어 보세요.` : "처음 알아보시는 분도 편하게 읽을 수 있게 정리했어요."
    }`,
    professional: `${josa(topic, "은/는")} 막상 알아보기 시작하면 확인할 것이 많은 주제입니다. 이 글에서는 ${
      main ? `'${main}'${particle(main, "을/를")} 중심으로 ` : ""
    }꼭 알아 두어야 할 내용을 순서대로 정리했습니다.`,
    emotional: `하루를 보내다 보면 ${josa(topic, "이/가")} 문득 떠오르는 순간이 있습니다. 오늘은 그 마음을 따라 천천히 이야기를 풀어 보려 합니다.`,
    witty: `${topic}, 들어는 봤는데 막상 설명하려면 말문이 막히시죠? 걱정 마세요. 오늘 이 글 하나로 깔끔하게 정리해 드릴게요.`,
  };

  const whyHeading: Record<Tone, string> = {
    friendly: `${topic}, 왜 요즘 많이 찾을까요?`,
    professional: `${topic}의 핵심`,
    emotional: `왜 ${topic}이었을까`,
    witty: `왜 다들 ${topic} 얘기일까?`,
  };
  const whyBody: Record<Tone, string> = {
    friendly: `요즘 ${josa(topic, "을/를")} 찾는 분들이 부쩍 늘었어요. 한 번 경험해 보면 왜 다시 찾게 되는지 금방 알 수 있거든요. ${check(`${topic}만의 특징이나 계기 한두 가지`)}를 먼저 짚고 넘어갈게요.`,
    professional: `${josa(topic, "을/를")} 고를 때는 눈에 띄는 장점보다 나에게 맞는 기준을 먼저 세우는 것이 중요합니다. ${check(`${topic}의 대표적인 특징과 근거`)}를 기준 삼아 비교하면 선택이 훨씬 쉬워집니다.`,
    emotional: `처음 ${josa(topic, "을/를")} 만났던 날을 떠올려 봅니다. ${check("고객이 기억할 만한 장면이나 에피소드")} 같은 작은 순간들이 모여 지금의 이야기가 되었습니다.`,
    witty: `이유는 간단합니다. 한 번 알게 되면 모르던 때로 돌아가기 어렵거든요. ${check(`${topic}의 결정적인 장점 한 가지`)}, 이게 핵심입니다.`,
  };

  const keywordHeading: Record<Tone, (k: string) => string> = {
    friendly: (k) => `'${k}' 이렇게 보세요`,
    professional: (k) => `${k}: 확인할 포인트`,
    emotional: (k) => `${k}에 담긴 이야기`,
    witty: (k) => `${k}, 이것만 기억하세요`,
  };
  const keywordBody: Record<Tone, (k: string) => string> = {
    friendly: (k) => `${josa(k, "은/는")} ${josa(topic, "을/를")} 고를 때 많이들 궁금해하시는 부분이에요. 직접 비교해 보면 차이가 확실히 느껴지는데요, ${check(`${k}에 대한 구체적인 특징이나 사례`)}를 함께 적어 두면 읽는 분들이 훨씬 쉽게 이해할 수 있어요.`,
    professional: (k) => `${k} 측면에서는 두 가지를 확인하시기 바랍니다. 첫째, 실제 사용 환경에서 기대한 만큼의 효과가 나는지. 둘째, 오래 두고 봐도 부담이 없는지. ${check(`${k} 관련 근거 자료나 수치`)}가 있다면 이 단락에 덧붙여 신뢰도를 높일 수 있습니다.`,
    emotional: (k) => `${josa(k, "은/는")} 단순한 조건이 아니라 하루의 결을 바꾸는 작은 차이입니다. ${check(`${k}와 관련된 고객의 경험이나 장면`)}을 담으면 이야기가 더 따뜻해집니다.`,
    witty: (k) => `${k}, 어렵게 생각할 필요 없어요. 딱 하나만 기억하면 됩니다. ${check(`${k}의 핵심 한 줄`)}. 이것만 챙겨도 절반은 성공입니다.`,
  };

  const howHeading: Record<Tone, string> = {
    friendly: "처음이라면 이렇게 시작해 보세요",
    professional: "시작 전 체크리스트",
    emotional: "천천히 시작하는 방법",
    witty: "실패 없는 3단계",
  };
  const howSteps = [
    `원하는 것 정하기: ${topic}에서 가장 중요하게 생각하는 기준을 한 가지만 정해 보세요.`,
    `비교해 보기: ${keywords.length > 1 ? `${keywords.slice(0, 2).join(", ")}처럼` : "후기와 설명을"} 두세 가지 기준으로 나란히 놓고 비교해 보세요.`,
    `직접 경험하기: 마지막 판단은 직접 경험해 본 뒤에 내려도 늦지 않아요.`,
  ];

  const faq = [
    `Q. ${topic}, 처음인데 어렵지 않을까요?`,
    `A. 처음이라면 기본부터 차근차근 시작하면 충분합니다. ${check("초보자에게 권하는 구체적인 방법")}`,
    "",
    `Q. 비용은 어느 정도 생각하면 될까요?`,
    `A. ${check("가격대 또는 문의 방법")}`,
  ].join("\n");

  const visit = VISIT_INDUSTRIES.has(b.industry ?? "");
  const infoHeading = visit ? "이용 안내" : "문의 안내";
  const infoItems = visit
    ? [`위치: ${check("주소와 찾아오는 길")}`, `운영 시간: ${check("요일별 운영 시간")}`, `예약·문의: ${check("전화번호 또는 예약 링크")}`]
    : [`구매·도입 문의: ${check("연락처 또는 링크")}`, `상담 가능 시간: ${check("평일 상담 시간")}`];

  const closing: Record<Tone, string> = {
    friendly: `오늘은 ${topic}에 대해 알아봤어요. 궁금한 점은 댓글로 남겨 주세요. 다음 글에서 또 만나요!`,
    professional: `지금까지 ${topic}의 핵심을 정리했습니다. 기준을 먼저 세우고 비교한다면 후회 없는 선택을 하실 수 있습니다.`,
    emotional: `${topic}에 관한 이야기는 여기까지입니다. 오늘 하루도 당신의 속도대로, 천천히.`,
    witty: `자, 이제 ${topic} 앞에서 더는 망설일 필요 없겠죠? 저장해 두고 필요할 때 꺼내 보세요.`,
  };

  const counts = { short: 1, medium: 2, long: 3 }[b.length];
  const sections: string[] = [intro[tone], `## ${whyHeading[tone]}`, whyBody[tone]];
  for (const keyword of keywords.slice(0, counts)) sections.push(`## ${keywordHeading[tone](keyword)}`, keywordBody[tone](keyword));
  if (b.length !== "short") sections.push(`## ${howHeading[tone]}`, howSteps.map((s) => `- ${s}`).join("\n"));
  if (b.length === "long") sections.push("## 자주 묻는 질문", faq);
  sections.push(`## ${infoHeading}`, infoItems.map((s) => `- ${s}`).join("\n"));
  sections.push(closing[tone]);
  const tags = hashtags(keywords, topic);
  sections.push(tags);

  return { title, body: sections.join("\n\n") };
}

// ------------------------------------------------------- product description

function productDescription(b: NormalizedBrief, seed: number): DraftContent {
  const { tone, keywords } = b;
  const topic = b.subject;
  const title = keywords.length ? `${b.topic} | ${keywords.slice(0, 2).join(" · ")}` : b.topic;

  const headline: Record<Tone, string[]> = {
    friendly: [`매일 손이 가는 ${topic}, 써 보면 왜 찾는지 알게 돼요.`, `${josa(topic, "이/가")} 있으면 하루가 조금 더 편해져요.`],
    professional: [`${topic} — 필요한 것은 빠짐없이 담고, 불필요한 것은 덜어냈습니다.`, `기준을 높인 ${topic}, 오래 쓰는 제품을 찾는 분께 권합니다.`],
    emotional: [`${josa(topic, "과/와")} 함께라면, 평범한 하루가 조금 더 다정해집니다.`, `작은 것에도 마음을 쓰는 당신에게, ${topic}.`],
    witty: [`${topic}, 한 번 쓰면 없던 시절로 못 돌아갑니다.`, `장바구니에 ${josa(topic, "을/를")} 넣어야 할 이유, 지금부터 설명합니다.`],
  };

  const featureLine: Record<Tone, (k: string) => string> = {
    friendly: (k) => `${k}: ${josa(topic, "을/를")} 고르는 분들이 가장 먼저 보는 부분이라 꼼꼼히 챙겼어요. ${check(`${k} 관련 사양`)}`,
    professional: (k) => `${k}: 수치와 근거로 확인할 수 있는 부분입니다. ${check(`${k}의 구체적인 사양·근거`)}`,
    emotional: (k) => `${k}: 손끝에 닿는 순간 차이를 느낄 수 있도록 공들였습니다. ${check(`${k}에 대한 설명`)}`,
    witty: (k) => `${k}: 말보다 써 보는 게 빠릅니다. ${check(`${k} 한 줄 설명`)}`,
  };
  const genericFeatures = [`쓰임새: ${check("제품의 주요 용도")}`, `디자인: ${check("크기·색상·마감")}`, `관리: ${check("세척·보관 방법")}`];
  const featureCount = { short: 2, medium: 3, long: 5 }[b.length];
  const features = [...keywords.map((k) => featureLine[tone](k)), ...genericFeatures].slice(0, featureCount);

  const forWhom = [
    `${josa(topic, "을/를")} 처음 써 보는 분`,
    `선물할 만한 ${josa(topic, "을/를")} 찾는 분`,
    keywords[0] ? `${josa(keywords[0], "을/를")} 중요하게 생각하는 분` : "오래 두고 쓸 제품을 고르는 분",
  ];

  const sections = [
    "## 한 줄 소개",
    pick(headline[tone], seed),
    "## 이런 점이 좋아요",
    features.map((f) => `- ${f}`).join("\n"),
    "## 이런 분께 추천해요",
    forWhom.slice(0, b.length === "short" ? 2 : 3).map((f) => `- ${f}`).join("\n"),
    "## 구성·사양",
    [`- 구성: ${check("본품과 구성품")}`, `- 크기·용량: ${check("정확한 수치")}`, `- 소재·성분: ${check("소재 또는 전성분")}`].join("\n"),
  ];
  if (b.length !== "short") {
    sections.push(
      "## 사용 방법",
      ["- 받으신 뒤 구성품이 모두 들어 있는지 먼저 확인해 주세요.", `- ${check("사용 순서 또는 권장 사용법")}`, "- 처음 사용 전 제품 설명서의 주의 사항을 꼭 읽어 주세요."].join("\n"),
    );
  }
  if (b.length === "long") {
    sections.push("## 배송·교환 안내", [`- 출고: ${check("주문 마감 시각과 출고일")}`, `- 교환·반품: ${check("기간과 조건")}`, `- 문의: ${check("고객센터 연락처")}`].join("\n"));
  }
  return { title, body: sections.join("\n\n") };
}

// ------------------------------------------------------------ ad copy set

function adCopySet(b: NormalizedBrief, seed: number): DraftContent {
  const { tone, keywords } = b;
  const { name: topic } = splitOccasion(b.subject);
  // Keywords that only repeat the product name add nothing to a headline.
  const [k1, k2] = keywords.filter((k) => !b.subject.includes(k));
  const lead = k1 ?? topic;

  const headlines: Record<Tone, string[]> = {
    friendly: [`${topic}, 오늘부터 시작해요`, k1 ? `${josa(k1, "이/가")} 필요할 땐 ${topic}` : `필요할 때 딱, ${topic}`, `기다리던 ${josa(topic, "이/가")} 왔어요`, `${topic}, 가볍게 만나 보세요`],
    professional: [`${topic}, 기준이 다릅니다`, k1 ? `${k1}까지 꼼꼼하게, ${topic}` : `꼼꼼하게 고른 ${topic}`, `선택이 쉬워지는 ${topic}`, `검증된 방식으로, ${topic}`],
    emotional: [`오늘 하루 끝에, ${topic}`, `마음까지 채우는 ${topic}`, `당신의 계절에 ${topic}`, `천천히, 오래 곁에 ${topic}`],
    witty: [`${topic}, 참지 마세요`, `${lead}? 여기 다 있어요`, `${topic} 모르면 손해예요`, `고민은 배송만 늦출 뿐, ${topic}`],
  };
  const heads = [0, 1, 2].map((i) => pick(headlines[tone], seed, i));

  const subs: Record<Tone, string[]> = {
    friendly: [`${k2 ? `${k2}까지 ` : ""}한 번에 챙기세요.`, "지금 확인하면 더 쉬워요."],
    professional: [`${k2 ? `${k2} 기준까지 ` : ""}꼼꼼하게 비교해 보세요.`, "상세 내용은 지금 확인하실 수 있습니다."],
    emotional: ["작은 선택이 하루를 바꿉니다.", "오늘의 나에게 주는 선물."],
    witty: ["망설이는 사이 품절될지도 몰라요.", "일단 눌러 보세요. 후회는 없게."],
  };

  const searchTitle =
    [b.subject, topic, `${lead} ${topic}`, lead].find((t) => charLength(t) <= 15) ?? fitLength(topic, 15);
  const suffix = "지금 확인해 보세요.";
  const descriptionCandidates = [
    [b.subject, k1, k2],
    [b.subject, k1],
    [b.subject],
    [topic],
  ].map((parts) => `${[...new Set(parts.filter((p): p is string => Boolean(p)))].join(" · ")}. ${suffix}`);
  const searchDescription = descriptionCandidates.find((d) => charLength(d) <= 45) ?? fitLength(b.subject, 45);

  const sections = [
    "## 헤드라인",
    heads.map((h, i) => `- ${"ABC"[i]}. ${h}`).join("\n"),
    "## 서브 카피",
    subs[tone].map((s) => `- ${s}`).join("\n"),
    "## 검색광고",
    [`- 제목 (15자 이내): ${searchTitle}`, `- 설명 (45자 이내): ${searchDescription}`].join("\n"),
  ];
  if (b.length !== "short") {
    const sns: Record<Tone, string> = {
      friendly: `${heads[0]}\n${b.subject} 소식, 가장 먼저 전해 드려요.\n${check("혜택·기간 등 이벤트 내용")}\n자세한 내용은 프로필 링크에서 확인하세요.`,
      professional: `${heads[0]}\n${topic}에 대한 자세한 안내를 준비했습니다.\n${check("핵심 혜택 또는 조건")}\n상세 정보는 링크에서 확인하실 수 있습니다.`,
      emotional: `${heads[0]}\n바쁜 하루 사이, 잠시 쉬어 가도 괜찮아요.\n${check("계절·상황에 맞는 한 줄")}\n링크에서 이야기를 이어 보세요.`,
      witty: `${heads[0]}\n저장 필수, 공유 권장.\n${check("이벤트 혜택")}\n더 궁금하면 프로필 링크 클릭!`,
    };
    sections.push("## SNS 게시물", `${sns[tone]}\n${hashtags(keywords, topic)}`);
  }
  if (b.length === "long") {
    sections.push(
      "## 배너 문구",
      [`- 메인: ${heads[1]}`, `- 보조: ${pick(subs[tone], seed)}`, `- 버튼: ${tone === "professional" ? "자세히 보기" : "지금 보기"}`].join("\n"),
      "## 카카오톡 채널 메시지",
      `(광고) ${b.subject} 소식을 전해 드립니다.\n${heads[2]}\n${check("혜택 내용과 기간")}\n수신 거부: 채널 차단`,
    );
  }
  return { title: `${b.subject} 광고 문구`, body: sections.join("\n\n") };
}

/** Keywords as hashtags, plus the subject when it is short enough to be a tag. */
function hashtags(keywords: readonly string[], subject: string): string {
  const tags = keywords.map(hashtag);
  const subjectTag = hashtag(subject);
  if (charLength(subjectTag) <= 13 && !tags.includes(subjectTag)) tags.push(subjectTag);
  return tags.slice(0, 6).join(" ");
}
