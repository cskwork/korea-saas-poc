import { seoulDateKey } from "@/core/format";
import { addDays, addMonths, daysBetween, monthOf, weekdayIndex, type DateKey } from "../domain/dates";
import type { LineItem } from "../domain/money";
import type { Db } from "../server/db";
import {
  clientNotes,
  clients,
  estimateItems,
  estimates,
  invoiceItems,
  invoices,
  milestones,
  portfolioItems,
  profiles,
  projects,
  servicePlans,
  timeEntries,
} from "./schema";

/**
 * Sample data for a new workspace: one freelance developer's last twelve months, dated relative to
 * "today" in Seoul so every dashboard looks current. Everything here is fictional.
 */

const RATE = 60_000;

/** A fixed pseudo-random sequence so every workspace gets the same sample history. */
function sequence(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Seoul wall-clock time on a day. */
const at = (day: DateKey, hour = 10, minute = 0) =>
  new Date(`${day}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00+09:00`);

const hours = (title: string, quantity: number, unitPrice = RATE): LineItem => ({ title, unit: "hour", quantity, unitPrice });
const lump = (title: string, unitPrice: number): LineItem => ({ title, unit: "lump", quantity: 1, unitPrice });

export async function seedDemo(db: Db, workspaceId: string, today: DateKey = seoulDateKey()): Promise<void> {
  const d = (offset: number) => addDays(today, offset);
  const ws = { workspaceId };

  await db.insert(profiles).values({
    ...ws,
    displayName: "윤서진",
    businessName: "서진 개발 스튜디오",
    headline: "스타트업 MVP와 커머스 웹을 기획부터 배포까지 혼자 책임지는 풀스택 개발자",
    bio: "React·Next.js와 Node.js로 작은 팀이 빠르게 검증할 수 있는 제품을 만듭니다. 매주 진행 상황을 공유하고, 견적에 적은 범위와 일정을 지키는 것을 가장 중요하게 생각합니다.",
    email: "hello@seojin.example",
    phone: "010-0000-2417",
    businessNumber: null,
    taxMode: "withholding",
    bankAccount: "카카오뱅크 3333-00-0000000 윤서진",
    hourlyRate: RATE,
    monthlyGoal: 5_000_000,
  });

  // --- Clients --------------------------------------------------------------------------------
  const [digicre, starthub, localfood, edutech, fitness, moment] = await db
    .insert(clients)
    .values([
      { ...ws, name: "김태현", company: "(주)디지털크리에이티브", email: "taehyun@digicre.example", phone: "010-0000-1201", grade: "vip" as const, notes: "장기 파트너. 홈페이지 리뉴얼 이후 월 유지보수 계약 중. 결제는 매월 10일 전후.", createdAt: at(d(-360)) },
      { ...ws, name: "이수진", company: "스타트업허브", email: "sujin@starthub.example", phone: "010-0000-3345", grade: "regular" as const, notes: "B2B SaaS MVP 의뢰. 의사결정이 빠르고 추가 개발 가능성이 높음.", createdAt: at(d(-60)) },
      { ...ws, name: "박민수", company: "로컬푸드마켓", email: "minsu@localfood.example", phone: "010-0000-7790", grade: "new" as const, notes: "배달 앱 견적 문의. 예산 조율 중.", createdAt: at(d(-14)) },
      { ...ws, name: "정하나", company: "에듀테크솔루션", email: "hana@edutech.example", phone: "010-0000-4512", grade: "regular" as const, notes: "LMS 운영사. 검수는 금요일에 몰아서 진행함.", createdAt: at(d(-340)) },
      { ...ws, name: "최영호", company: "피트니스365", email: "youngho@fitness365.example", phone: "010-0000-9021", grade: "new" as const, notes: "운동 기록 앱 프로토타입. 투자 미팅 전 데모가 필요함.", createdAt: at(d(-28)) },
      { ...ws, name: "한가람", company: "모먼트커피 로스터스", email: "garam@momentcoffee.example", phone: "010-0000-6608", grade: "new" as const, notes: "원두 정기구독 주문 페이지 문의 (인스타그램 DM).", createdAt: at(d(-4)) },
    ])
    .returning({ id: clients.id });

  await db.insert(clientNotes).values([
    { ...ws, clientId: digicre.id, kind: "meeting" as const, body: "리뉴얼 오픈 회고. 다음 분기에 관리자 기능 추가를 논의하기로 함.", occurredOn: d(-60) },
    { ...ws, clientId: digicre.id, kind: "call" as const, body: "다음 달 유지보수 범위에 뉴스레터 템플릿 수정 포함 요청.", occurredOn: d(-12) },
    { ...ws, clientId: starthub.id, kind: "meeting" as const, body: "MVP 범위 확정. 결제는 월 구독 1종으로 시작하고 연 구독은 2차로.", occurredOn: d(-52) },
    { ...ws, clientId: starthub.id, kind: "email" as const, body: "팀·권한 관리 화면 와이어프레임 공유, 피드백 대기.", occurredOn: d(-6) },
    { ...ws, clientId: localfood.id, kind: "call" as const, body: "배달 추적은 2차로 미뤄도 된다고 함. 예산은 1,000만 원 안팎 희망.", occurredOn: d(-10) },
    { ...ws, clientId: edutech.id, kind: "email" as const, body: "검수 의견 3건 전달받음: 퀴즈 제한 시간, 채팅 알림음, 리포트 CSV 내보내기.", occurredOn: d(-3) },
    { ...ws, clientId: edutech.id, kind: "meeting" as const, body: "모바일 앱 전환 제안은 내년 예산으로 보류.", occurredOn: d(-60) },
    { ...ws, clientId: fitness.id, kind: "meeting" as const, body: "투자 미팅 데모 일정이 다음 달 중순. 운동 기록 화면을 먼저.", occurredOn: d(-21) },
    { ...ws, clientId: moment.id, kind: "memo" as const, body: "정기구독 주기를 2주/4주 중에 고를 수 있어야 함. 카페24 이전 여부 확인 필요.", occurredOn: d(-2) },
  ]);

  // --- Projects -------------------------------------------------------------------------------
  const project = (values: Omit<typeof projects.$inferInsert, "workspaceId">) => ({ ...ws, ...values });
  const [lms, dashboard, landing, renewal, retainer, mvp, fitnessApp, lmsFeatures, delivery, subscription] = await db
    .insert(projects)
    .values([
      project({ title: "에듀테크 LMS 초기 구축", clientId: edutech.id, status: "done", priority: "high", budget: 6_000_000, startOn: d(-330), dueOn: d(-248), position: 3, completedAt: at(d(-250), 18), description: "강의·퀴즈·진도 관리가 있는 LMS 1차 구축.", createdAt: at(d(-335)) }),
      project({ title: "디지크리 관리자 대시보드", clientId: digicre.id, status: "done", priority: "medium", budget: 3_500_000, startOn: d(-182), dueOn: d(-160), position: 2, completedAt: at(d(-162), 17), description: "주문·재고 현황을 한 화면에서 보는 사내 대시보드.", createdAt: at(d(-186)) }),
      project({ title: "에듀테크 랜딩페이지", clientId: edutech.id, status: "done", priority: "low", budget: 1_500_000, startOn: d(-150), dueOn: d(-128), position: 1, completedAt: at(d(-130), 16), description: "신규 강의 모집용 반응형 랜딩페이지.", createdAt: at(d(-152)) }),
      project({ title: "디지크리 홈페이지 리뉴얼", clientId: digicre.id, status: "done", priority: "high", budget: 5_000_000, startOn: d(-120), dueOn: d(-62), position: 0, completedAt: at(d(-64), 19), description: "Next.js + Headless CMS로 기업 홈페이지 전면 리뉴얼.", createdAt: at(d(-126)) }),
      project({ title: "디지크리 월 유지보수", clientId: digicre.id, status: "progress", priority: "low", budget: 900_000, startOn: d(-364), position: 2, description: "매월 900,000원 · 콘텐츠 수정, 보안 업데이트, 장애 대응.", createdAt: at(d(-364)) }),
      project({ title: "스타트업허브 SaaS MVP", clientId: starthub.id, status: "progress", priority: "high", budget: 8_000_000, startOn: d(-48), dueOn: d(30), position: 0, description: "사용자 관리, 월 구독 결제, 팀 대시보드가 있는 B2B SaaS MVP.", createdAt: at(d(-50)) }),
      project({ title: "피트니스 앱 프로토타입", clientId: fitness.id, status: "progress", priority: "medium", budget: 4_000_000, startOn: d(-20), dueOn: d(24), position: 1, description: "운동 기록·통계 화면 중심의 React Native 프로토타입. 투자 미팅 데모용.", createdAt: at(d(-24)) }),
      project({ title: "LMS 퀴즈·채팅 기능 추가", clientId: edutech.id, status: "review", priority: "medium", budget: 3_000_000, startOn: d(-40), dueOn: d(3), position: 0, description: "퀴즈 모듈, 실시간 채팅, 관리자 리포트 추가.", createdAt: at(d(-45)) }),
      project({ title: "로컬푸드 배달 앱", clientId: localfood.id, status: "inquiry", priority: "medium", budget: 11_000_000, dueOn: d(120), position: 0, description: "지역 농산물 주문·배달 앱. 1차는 주문과 결제, 가게 관리자.", createdAt: at(d(-12)) }),
      project({ title: "모먼트커피 정기구독 주문 페이지", clientId: moment.id, status: "inquiry", priority: "low", budget: 2_160_000, position: 1, description: "원두 정기구독(2주/4주) 주문 페이지와 주문 관리.", createdAt: at(d(-3)) }),
    ])
    .returning({ id: projects.id });

  // --- Milestones -----------------------------------------------------------------------------
  type MilestoneSeed = { title: string; hours: number | null; due?: DateKey; done?: DateKey };
  const milestoneRows = async (projectId: string, list: MilestoneSeed[]) =>
    db
      .insert(milestones)
      .values(
        list.map((m, position) => ({
          ...ws,
          projectId,
          title: m.title,
          estimatedHours: m.hours,
          dueOn: m.due ?? null,
          doneAt: m.done ? at(m.done, 18) : null,
          position,
        })),
      )
      .returning({ id: milestones.id });

  const lmsMs = await milestoneRows(lms.id, [
    { title: "요구사항 정리 · DB 설계", hours: 16, done: d(-316) },
    { title: "강의 · 퀴즈 · 진도", hours: 64, done: d(-268) },
    { title: "관리자 화면 · 배포", hours: 24, done: d(-250) },
  ]);
  const dashboardMs = await milestoneRows(dashboard.id, [
    { title: "화면 설계", hours: 12, done: d(-176) },
    { title: "차트 · 재고 연동", hours: 44, done: d(-162) },
  ]);
  const renewalMs = await milestoneRows(renewal.id, [
    { title: "기획 · 디자인 시안", hours: 24, done: d(-100) },
    { title: "Next.js 개발 · CMS 연동", hours: 48, done: d(-75) },
    { title: "QA · 배포", hours: 8, done: d(-64) },
  ]);
  const mvpMs = await milestoneRows(mvp.id, [
    { title: "요구사항 정리 · 화면 설계", hours: 16, done: d(-40) },
    { title: "회원가입 · 로그인", hours: 16, done: d(-30) },
    { title: "월 구독 결제 연동", hours: 24, done: d(-12) },
    { title: "팀 · 권한 관리", hours: 24, due: d(8) },
    { title: "팀 대시보드", hours: 32, due: d(22) },
    { title: "QA · 배포 · 인수인계", hours: 16, due: d(30) },
  ]);
  const fitnessMs = await milestoneRows(fitnessApp.id, [
    { title: "앱 화면 설계", hours: 8, done: d(-14) },
    { title: "운동 기록 · 통계 화면", hours: 24, due: d(10) },
    { title: "백엔드 API", hours: 10, due: d(18) },
    { title: "데모 빌드 · 배포", hours: 8, due: d(24) },
  ]);
  const lmsFeatureMs = await milestoneRows(lmsFeatures.id, [
    { title: "퀴즈 모듈", hours: 20, done: d(-26) },
    { title: "실시간 채팅", hours: 16, done: d(-12) },
    { title: "관리자 리포트", hours: 8, done: d(-5) },
    { title: "검수 의견 반영", hours: 6, due: d(3) },
  ]);

  // --- Time entries ---------------------------------------------------------------------------
  // Work blocks: [projectId, from offset, to offset, average hours per workday, milestone id].
  type Block = [string, number, number, number, string | null];
  const blocks: Block[] = [
    [lms.id, -330, -317, 2, lmsMs[0].id],
    [lms.id, -316, -269, 2.5, lmsMs[1].id],
    [lms.id, -268, -251, 2, lmsMs[2].id],
    [dashboard.id, -182, -177, 2.5, dashboardMs[0].id],
    [dashboard.id, -176, -163, 3.5, dashboardMs[1].id],
    [landing.id, -150, -131, 2, null],
    [renewal.id, -120, -101, 1.8, renewalMs[0].id],
    [renewal.id, -100, -76, 2.8, renewalMs[1].id],
    [renewal.id, -75, -65, 1.2, renewalMs[2].id],
    [mvp.id, -48, -41, 2.5, mvpMs[0].id],
    [mvp.id, -40, -31, 2, mvpMs[1].id],
    [mvp.id, -30, -13, 2.5, mvpMs[2].id],
    [mvp.id, -12, 0, 2.5, mvpMs[3].id],
    [fitnessApp.id, -20, -15, 1.5, fitnessMs[0].id],
    [fitnessApp.id, -14, 0, 2, fitnessMs[1].id],
    [lmsFeatures.id, -40, -27, 2, lmsFeatureMs[0].id],
    [lmsFeatures.id, -26, -13, 1.5, lmsFeatureMs[1].id],
    [lmsFeatures.id, -12, -6, 1.5, lmsFeatureMs[2].id],
    [lmsFeatures.id, -3, 0, 1, lmsFeatureMs[3].id],
  ];
  const notesFor: Record<string, readonly string[]> = {
    [lms.id]: ["강의 목록 API", "퀴즈 채점 로직", "진도율 계산 쿼리", "관리자 권한 분리"],
    [dashboard.id]: ["차트 컴포넌트", "재고 API 연동", "필터 · 기간 선택"],
    [landing.id]: ["랜딩 섹션 퍼블리싱", "신청 폼 연동", "모바일 대응"],
    [renewal.id]: ["디자인 시안 수정", "CMS 스키마 설계", "페이지 컴포넌트", "이미지 최적화"],
    [mvp.id]: ["API 엔드포인트 구현", "구독 결제 웹훅", "권한 미들웨어", "팀 초대 메일", "테스트 작성"],
    [fitnessApp.id]: ["운동 기록 화면", "주간 통계 차트", "Expo 빌드 설정"],
    [lmsFeatures.id]: ["퀴즈 타이머", "채팅 소켓 연결", "리포트 CSV", "검수 의견 반영"],
    [retainer.id]: ["콘텐츠 수정", "보안 업데이트", "뉴스레터 템플릿"],
  };

  const random = sequence(20260924);
  const perDay = new Map<DateKey, number>();
  const entries: (typeof timeEntries.$inferInsert)[] = [];
  const log = (projectId: string, day: DateKey, minutes: number, milestoneId: string | null) => {
    const used = perDay.get(day) ?? 0;
    const allowed = Math.min(minutes, 10 * 60 - used);
    if (allowed < 30) return;
    perDay.set(day, used + allowed);
    const notes = notesFor[projectId] ?? ["작업"];
    entries.push({ ...ws, projectId, milestoneId, workedOn: day, minutes: allowed, note: notes[Math.floor(random() * notes.length)] });
  };

  for (const [projectId, from, to, average, milestoneId] of blocks) {
    for (let offset = from; offset <= to; offset++) {
      const day = d(offset);
      const weekend = weekdayIndex(day) >= 5;
      if (weekend ? random() > 0.2 : random() < 0.12) continue;
      const factor = weekend ? 0.6 : 0.5 + random();
      log(projectId, day, Math.round((average * factor * 60) / 30) * 30, milestoneId);
    }
  }
  // Retainer: roughly one maintenance session a week.
  for (let offset = -364; offset <= 0; offset++) {
    const day = d(offset);
    if (weekdayIndex(day) === 2 && random() < 0.85) log(retainer.id, day, 60 + Math.round(random() * 3) * 30, null);
  }
  await db.insert(timeEntries).values(entries);

  // --- Estimates ------------------------------------------------------------------------------
  const estimateNumber = (day: DateKey, n = 1) => `EST-${day.replaceAll("-", "")}-${String(n).padStart(3, "0")}`;
  const invoiceNumber = (day: DateKey, n = 1) => `INV-${day.replaceAll("-", "")}-${String(n).padStart(3, "0")}`;

  const renewalItems = [hours("기획 · 디자인 시안", 24), hours("Next.js 개발 · CMS 연동", 48), hours("QA · 배포", 8), lump("CMS 호스팅 1년", 200_000)];
  const mvpItems = [
    hours("요구사항 정리 · 화면 설계", 16),
    hours("회원가입 · 로그인", 16),
    hours("월 구독 결제 연동", 24),
    hours("팀 · 권한 관리", 24),
    hours("팀 대시보드", 32),
    hours("QA · 배포 · 인수인계", 16),
    lump("서버 · 배포 환경 세팅", 320_000),
  ];
  const deliveryItems = [
    lump("UI/UX 디자인 (주요 화면 12종)", 2_000_000),
    hours("주문 · 결제", 40),
    hours("배달 상태 추적 (지도)", 32),
    hours("가게 관리자", 40),
    hours("푸시 알림", 16),
    hours("QA · 스토어 등록", 24),
  ];
  const fitnessItems = [lump("앱 화면 디자인", 1_000_000), hours("운동 기록 · 통계 화면", 24), hours("로그인", 8), hours("백엔드 API", 10), hours("데모 빌드 · 배포", 8)];
  const subscriptionItems = [hours("반응형 주문 페이지", 12), hours("정기결제 연동", 12), hours("주문 관리", 8), hours("QA · 오픈", 4)];
  const lmsFeatureItems = [hours("퀴즈 모듈", 20), hours("실시간 채팅", 16), hours("관리자 리포트", 8), hours("검수 반영", 6)];
  const lmsAppItems = [hours("모바일 앱 전환 (React Native)", 100), hours("푸시 알림", 12), hours("스토어 등록", 8)];

  type EstimateSeed = {
    values: Omit<typeof estimates.$inferInsert, "workspaceId">;
    items: LineItem[];
  };
  const estimateSeeds: EstimateSeed[] = [
    { values: { clientId: digicre.id, projectId: renewal.id, number: estimateNumber(d(-125)), title: "디지크리 홈페이지 리뉴얼", status: "invoiced", issuedOn: d(-125), validUntil: d(-95), sentAt: at(d(-125), 15), decidedAt: at(d(-121), 11) }, items: renewalItems },
    { values: { clientId: edutech.id, projectId: null, number: estimateNumber(d(-70)), title: "LMS 모바일 앱 전환", status: "declined", issuedOn: d(-70), validUntil: d(-40), sentAt: at(d(-70), 14), decidedAt: at(d(-60), 16), notes: "앱 전환은 내년 예산으로 보류 (고객 회신)." }, items: lmsAppItems },
    { values: { clientId: starthub.id, projectId: mvp.id, number: estimateNumber(d(-52)), title: "스타트업허브 SaaS MVP", status: "invoiced", issuedOn: d(-52), validUntil: d(-22), sentAt: at(d(-52), 20), decidedAt: at(d(-49), 10), notes: "착수금 30%, 잔금은 인수인계 후 청구." }, items: mvpItems },
    { values: { clientId: edutech.id, projectId: lmsFeatures.id, number: estimateNumber(d(-44)), title: "LMS 퀴즈·채팅 기능 추가", status: "invoiced", issuedOn: d(-44), validUntil: d(-14), sentAt: at(d(-44), 13), decidedAt: at(d(-42), 9) }, items: lmsFeatureItems },
    { values: { clientId: fitness.id, projectId: fitnessApp.id, number: estimateNumber(d(-24)), title: "피트니스 앱 프로토타입", status: "invoiced", issuedOn: d(-24), validUntil: d(6), sentAt: at(d(-24), 19), decidedAt: at(d(-21), 15) }, items: fitnessItems },
    { values: { clientId: localfood.id, projectId: delivery.id, number: estimateNumber(d(-9)), title: "로컬푸드 배달 앱 1차 개발", status: "sent", issuedOn: d(-9), validUntil: d(21), sentAt: at(d(-9), 21), discount: 120_000, notes: "배달 상태 추적은 2차 개발로 분리 가능." }, items: deliveryItems },
    { values: { clientId: moment.id, projectId: subscription.id, number: estimateNumber(d(-1)), title: "모먼트커피 정기구독 주문 페이지", status: "draft", issuedOn: d(-1), validUntil: d(29) }, items: subscriptionItems },
  ];

  // Multi-row INSERT … RETURNING yields rows in VALUES order, so ids line up with their seeds.
  const estimateRows = await db
    .insert(estimates)
    .values(estimateSeeds.map((seed) => ({ ...ws, taxMode: "withholding" as const, ...seed.values })))
    .returning({ id: estimates.id });
  const estimateIds = estimateRows.map((row) => row.id);
  await db.insert(estimateItems).values(
    estimateSeeds.flatMap((seed, index) => seed.items.map((item, position) => ({ ...ws, estimateId: estimateIds[index], position, ...item }))),
  );
  const [renewalEstimate, , mvpEstimate, lmsFeatureEstimate, fitnessEstimate] = estimateIds;

  // --- Invoices -------------------------------------------------------------------------------
  type InvoiceSeed = {
    values: Omit<typeof invoices.$inferInsert, "workspaceId" | "number"> & { issuedOn: DateKey };
    items: LineItem[];
  };
  const invoiceSeeds: InvoiceSeed[] = [
    { values: { clientId: edutech.id, projectId: lms.id, title: "에듀테크 LMS 초기 구축 · 착수금 50%", status: "paid", issuedOn: d(-328), dueOn: d(-318), sentAt: at(d(-328)), paidOn: d(-322) }, items: [lump("착수금 50% · 에듀테크 LMS 초기 구축", 3_000_000)] },
    { values: { clientId: edutech.id, projectId: lms.id, title: "에듀테크 LMS 초기 구축 · 잔금", status: "paid", issuedOn: d(-249), dueOn: d(-235), sentAt: at(d(-249)), paidOn: d(-241) }, items: [lump("잔금 · 에듀테크 LMS 초기 구축", 3_000_000)] },
    { values: { clientId: digicre.id, projectId: dashboard.id, title: "디지크리 관리자 대시보드", status: "paid", issuedOn: d(-161), dueOn: d(-147), sentAt: at(d(-161)), paidOn: d(-152) }, items: [hours("화면 설계", 12), hours("차트 · 재고 연동", 44), lump("운영 서버 세팅", 140_000)] },
    { values: { clientId: edutech.id, projectId: landing.id, title: "에듀테크 랜딩페이지", status: "paid", issuedOn: d(-129), dueOn: d(-115), sentAt: at(d(-129)), paidOn: d(-121) }, items: [hours("랜딩 퍼블리싱", 20), hours("신청 폼 · 메일 연동", 5)] },
    { values: { clientId: digicre.id, projectId: renewal.id, estimateId: renewalEstimate, title: "디지크리 홈페이지 리뉴얼 · 착수금 50%", status: "paid", issuedOn: d(-119), dueOn: d(-105), sentAt: at(d(-119)), paidOn: d(-112) }, items: [lump("착수금 50% · 디지크리 홈페이지 리뉴얼", 2_500_000)] },
    { values: { clientId: digicre.id, projectId: renewal.id, estimateId: renewalEstimate, title: "디지크리 홈페이지 리뉴얼 · 잔금", status: "paid", issuedOn: d(-63), dueOn: d(-49), sentAt: at(d(-63)), paidOn: d(-55) }, items: [lump("잔금 · 디지크리 홈페이지 리뉴얼", 2_500_000)] },
    { values: { clientId: starthub.id, projectId: mvp.id, estimateId: mvpEstimate, title: "스타트업허브 SaaS MVP · 착수금 30%", status: "paid", issuedOn: d(-48), dueOn: d(-38), sentAt: at(d(-48)), paidOn: d(-41) }, items: [lump("착수금 30% · 스타트업허브 SaaS MVP", 2_400_000)] },
    { values: { clientId: fitness.id, projectId: fitnessApp.id, estimateId: fitnessEstimate, title: "피트니스 앱 프로토타입 · 착수금 30%", status: "awaiting", issuedOn: d(-18), dueOn: d(-4), sentAt: at(d(-18)) }, items: [lump("착수금 30% · 피트니스 앱 프로토타입", 1_200_000)] },
    { values: { clientId: edutech.id, projectId: lmsFeatures.id, estimateId: lmsFeatureEstimate, title: "LMS 퀴즈·채팅 기능 추가", status: "issued", issuedOn: d(-1), dueOn: d(13) }, items: lmsFeatureItems },
  ];

  // Monthly maintenance: issued on the 1st, due on the 10th, paid on the 9th once that day has come.
  for (let back = 11; back >= 0; back--) {
    const month = addMonths(monthOf(today), -back);
    const issuedOn = `${month}-01`;
    const paidOn = `${month}-09`;
    const paid = daysBetween(paidOn, today) >= 0;
    invoiceSeeds.push({
      values: {
        clientId: digicre.id,
        projectId: retainer.id,
        title: `디지크리 ${Number(month.slice(5))}월 유지보수`,
        status: paid ? "paid" : "awaiting",
        issuedOn,
        dueOn: `${month}-10`,
        sentAt: at(issuedOn),
        paidOn: paid ? paidOn : null,
      },
      items: [lump(`${Number(month.slice(5))}월 유지보수 (콘텐츠 · 보안 · 장애 대응)`, 900_000)],
    });
  }

  const perDayCount = new Map<DateKey, number>();
  const ordered = invoiceSeeds.sort((a, b) => a.values.issuedOn.localeCompare(b.values.issuedOn));
  const invoiceRows = await db
    .insert(invoices)
    .values(
      ordered.map((seed) => {
        const n = (perDayCount.get(seed.values.issuedOn) ?? 0) + 1;
        perDayCount.set(seed.values.issuedOn, n);
        return { ...ws, taxMode: "withholding" as const, number: invoiceNumber(seed.values.issuedOn, n), ...seed.values };
      }),
    )
    .returning({ id: invoices.id });
  await db.insert(invoiceItems).values(
    ordered.flatMap((seed, index) => seed.items.map((item, position) => ({ ...ws, invoiceId: invoiceRows[index].id, position, ...item }))),
  );

  // --- Portfolio and price list ---------------------------------------------------------------
  await db.insert(portfolioItems).values([
    { ...ws, projectId: renewal.id, position: 0, title: "디지털크리에이티브 기업 홈페이지 리뉴얼", summary: "반응형 기업 홈페이지를 Next.js로 다시 만들고, 담당자가 직접 콘텐츠를 고칠 수 있도록 Headless CMS를 붙였습니다.", role: "기획 · 프론트엔드 · CMS 연동 (1인)", outcome: "콘텐츠 수정 요청이 개발자를 거치지 않고 담당자 선에서 처리됩니다.", stack: ["Next.js", "TypeScript", "Strapi", "Vercel"], period: "3개월" },
    { ...ws, projectId: mvp.id, position: 1, title: "스타트업허브 B2B SaaS MVP", summary: "사용자 관리, 월 구독 결제, 팀 대시보드가 있는 B2B SaaS MVP를 단계별로 배포하고 있습니다.", role: "풀스택 (1인)", outcome: "진행 중 — 투자 미팅 데모 일정에 맞춰 기능 단위로 배포.", stack: ["React", "Node.js", "PostgreSQL", "토스페이먼츠"], period: "진행 중" },
    { ...ws, projectId: lms.id, position: 2, title: "에듀테크 LMS 교육 플랫폼", summary: "강의 관리, 퀴즈, 수강생 진도 추적이 있는 온라인 교육 플랫폼을 처음부터 구축했습니다.", role: "백엔드 · 관리자 화면", outcome: "운영팀이 수강 현황을 스프레드시트 대신 관리자 화면에서 확인합니다.", stack: ["Vue.js", "Django", "MySQL", "AWS"], period: "3개월" },
    { ...ws, projectId: dashboard.id, position: 3, title: "디지크리 사내 관리자 대시보드", summary: "주문과 재고 현황을 한 화면에서 보는 사내 대시보드.", role: "프론트엔드", outcome: "아침마다 손으로 만들던 집계 보고서를 대시보드가 대신합니다.", stack: ["React", "TypeScript", "Express"], period: "1개월" },
    { ...ws, projectId: null, position: 4, published: false, title: "로컬푸드 모바일 앱 UI 프로토타입", summary: "식품 배달 앱의 주문 흐름 UI와 React Native 프로토타입.", role: "UI 설계 · 프로토타입", outcome: "", stack: ["React Native", "Expo", "Figma"], period: "2주" },
  ]);

  await db.insert(servicePlans).values([
    { ...ws, category: "website" as const, position: 0, name: "베이직 웹사이트", price: 1_500_000, delivery: "2주", features: ["반응형 5페이지", "기본 SEO 설정", "문의 폼", "1개월 유지보수"] },
    { ...ws, category: "website" as const, position: 1, featured: true, name: "스탠다드 웹사이트", price: 3_500_000, delivery: "4주", features: ["반응형 10페이지", "CMS 연동", "다국어 지원", "GA4 연동", "3개월 유지보수"] },
    { ...ws, category: "website" as const, position: 2, name: "프리미엄 웹사이트", price: 7_000_000, delivery: "6–8주", features: ["맞춤 디자인", "Headless CMS", "결제 · 예약 시스템", "외부 API 연동", "성능 최적화", "6개월 유지보수"] },
    { ...ws, category: "app" as const, position: 0, name: "베이직 앱", price: 5_000_000, delivery: "6주", features: ["단일 플랫폼 (iOS 또는 Android)", "기본 화면 5종", "푸시 알림", "1개월 유지보수"] },
    { ...ws, category: "app" as const, position: 1, featured: true, name: "스탠다드 앱", price: 10_000_000, delivery: "10주", features: ["크로스 플랫폼 (React Native)", "맞춤 UI 15화면", "결제 연동", "소셜 로그인", "관리자 웹", "3개월 유지보수"] },
    { ...ws, category: "app" as const, position: 2, name: "프리미엄 앱", price: 20_000_000, delivery: "협의", features: ["iOS + Android 네이티브", "실시간 채팅 · 알림", "분석 대시보드", "CI/CD 파이프라인", "스토어 등록 대행", "6개월 유지보수"] },
    { ...ws, category: "nocode" as const, position: 0, name: "노코드 랜딩페이지", price: 500_000, delivery: "1주", features: ["Framer 또는 Webflow", "1페이지 랜딩", "기본 문의 폼"] },
    { ...ws, category: "nocode" as const, position: 1, featured: true, name: "로코드 비즈니스 앱", price: 2_000_000, delivery: "4주", features: ["Bubble 또는 Softr", "사용자 인증", "DB 연동", "기본 대시보드", "2개월 유지보수"] },
    { ...ws, category: "nocode" as const, position: 2, name: "로코드 SaaS MVP", price: 5_000_000, delivery: "8주", features: ["Bubble + 커스텀 코드", "구독 결제", "관리자 패널", "API 연동", "3개월 유지보수"] },
  ]);
}
