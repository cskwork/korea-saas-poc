import { seoulDateKey } from "@/core/format";
import { addDays, addMonths } from "../domain/dates";
import { findTemplate, type Graph } from "../domain/workflow";
import { insertGraph } from "./graph";
import {
  agencyProfiles,
  diagnoses,
  packages,
  projectPackages,
  projects,
  quoteItems,
  quotes,
  workflows,
  type Complexity,
} from "./schema";
import type { Db } from "./types";

/**
 * Demo data for a new workspace ("샘플 데이터"). Every company, person and amount is
 * fictional; dates are relative to today in Asia/Seoul so the dashboard looks alive
 * on any day. Package figures are the legacy POC's estimates.
 */

const PACKAGES = [
  {
    key: "excel",
    name: "엑셀 자동화 패키지",
    industry: "manufacturing",
    kind: "data",
    summary: "반복적인 엑셀 작업을 데이터 수집부터 보고서 생성까지 원클릭으로 처리합니다.",
    details:
      "매일 반복되는 엑셀 작업을 자동화합니다. 흩어진 시트에서 데이터를 모으고, 정해진 규칙으로 가공한 뒤, 보고서 양식에 채워 넣는 과정 전체를 스크립트로 옮깁니다.",
    tools: ["Google Apps Script", "Make"],
    buildHours: 20,
    monthlyHoursSaved: 40,
    setupFee: 1_500_000,
    monthlyFee: 300_000,
  },
  {
    key: "autoreply",
    name: "이메일 자동응답 시스템",
    industry: "service",
    kind: "communication",
    summary: "고객 문의 메일을 자동으로 분류하고 템플릿으로 회신합니다.",
    details:
      "문의 메일을 유형별로 분류하고 템플릿 기반 자동 회신을 보냅니다. 긴급 문의는 즉시 담당자에게 Slack으로 알립니다.",
    tools: ["Zapier", "Gmail"],
    buildHours: 15,
    monthlyHoursSaved: 30,
    setupFee: 1_000_000,
    monthlyFee: 200_000,
  },
  {
    key: "inventory",
    name: "재고 관리 자동화",
    industry: "retail",
    kind: "data",
    summary: "재고 수준을 모니터링하고 최소 재고에 닿으면 자동 발주합니다.",
    details:
      "재고를 주기적으로 조회하고, 최소 재고량에 닿으면 발주서를 만들어 거래처에 보냅니다. 일·주·월 재고 보고서도 자동으로 만듭니다.",
    tools: ["n8n", "Google Sheets"],
    buildHours: 30,
    monthlyHoursSaved: 50,
    setupFee: 2_000_000,
    monthlyFee: 400_000,
  },
  {
    key: "social",
    name: "소셜미디어 자동 포스팅",
    industry: "service",
    kind: "communication",
    summary: "콘텐츠 캘린더에 맞춰 인스타그램·블로그에 예약 게시하고 성과를 모읍니다.",
    details:
      "콘텐츠 캘린더(Google Sheets)에 적힌 일정대로 여러 채널에 게시하고, 채널별 반응을 모아 주간 리포트로 정리합니다.",
    tools: ["Make", "Google Sheets"],
    buildHours: 10,
    monthlyHoursSaved: 20,
    setupFee: 800_000,
    monthlyFee: 150_000,
  },
  {
    key: "payroll",
    name: "급여 정산 자동화",
    industry: "it",
    kind: "settlement",
    summary: "근태 데이터로 급여를 계산하고 명세서와 이체 파일을 만듭니다.",
    details:
      "근태 기록을 불러와 급여를 계산하고, 급여 명세서를 만들어 직원에게 발송합니다. 은행 대량이체 파일도 함께 만듭니다.",
    tools: ["Google Apps Script", "n8n"],
    buildHours: 25,
    monthlyHoursSaved: 35,
    setupFee: 1_800_000,
    monthlyFee: 350_000,
  },
  {
    key: "crm",
    name: "고객 데이터 통합 관리",
    industry: "it",
    kind: "data",
    summary: "스마트스토어·쿠팡·자사몰의 고객 데이터를 한 시트로 모읍니다.",
    details: "여러 판매 채널의 고객·주문 데이터를 자동으로 수집해 중복을 정리하고, 하나의 고객 대장으로 관리합니다.",
    tools: ["Zapier", "Make", "Google Sheets"],
    buildHours: 20,
    monthlyHoursSaved: 25,
    setupFee: 1_200_000,
    monthlyFee: 250_000,
  },
  {
    key: "daily-report",
    name: "일일 리포트 자동 생성",
    industry: "manufacturing",
    kind: "reporting",
    summary: "매일 아침 전일 실적 리포트를 만들어 관계자에게 보냅니다.",
    details: "생산 실적, 매출, 재고 현황을 집계해 매일 오전 9시에 리포트를 발송합니다.",
    tools: ["Google Apps Script", "Slack"],
    buildHours: 12,
    monthlyHoursSaved: 15,
    setupFee: 700_000,
    monthlyFee: 150_000,
  },
  {
    key: "orders",
    name: "주문 처리 자동화",
    industry: "retail",
    kind: "data",
    summary: "온라인 주문 접수부터 송장 발급, 배송 알림까지 처리합니다.",
    details: "쇼핑몰 주문을 자동으로 접수하고 송장을 발급한 뒤, 배송 추적과 고객 알림톡까지 이어서 처리합니다.",
    tools: ["n8n", "Make", "택배 배송조회 API"],
    buildHours: 35,
    monthlyHoursSaved: 60,
    setupFee: 2_500_000,
    monthlyFee: 500_000,
  },
  {
    key: "minutes",
    name: "회의록 자동 정리",
    industry: "service",
    kind: "communication",
    summary: "화상회의 녹음을 받아 적고 핵심과 할 일을 뽑아 Notion에 정리합니다.",
    details:
      "Zoom·Google Meet 녹음을 텍스트로 옮기고, 요약과 액션 아이템을 추출해 Notion 회의록 데이터베이스에 정리합니다.",
    tools: ["Zapier", "OpenAI", "Notion"],
    buildHours: 15,
    monthlyHoursSaved: 20,
    setupFee: 900_000,
    monthlyFee: 200_000,
  },
  {
    key: "invoice",
    name: "세금계산서 자동 발행",
    industry: "other",
    kind: "settlement",
    summary: "매출 전표가 등록되면 전자세금계산서를 발행하고 미수금을 챙깁니다.",
    details:
      "매출이 확정되면 전자세금계산서를 자동으로 발행하고, 입금이 늦는 거래처는 미수금 목록에 올려 알려 드립니다.",
    tools: ["Google Apps Script", "Make"],
    buildHours: 18,
    monthlyHoursSaved: 25,
    setupFee: 1_300_000,
    monthlyFee: 250_000,
  },
] as const;

type PackageKey = (typeof PACKAGES)[number]["key"];

export async function seedAutomationAgency(db: Db, workspaceId: string, today: string = seoulDateKey()): Promise<void> {
  const day = (offset: number) => addDays(today, offset);
  const month = (offset: number) => addMonths(today, offset);
  const at = (offset: number) => new Date(`${day(offset)}T10:00:00+09:00`);

  await db.insert(agencyProfiles).values({
    workspaceId,
    agencyName: "AutoMate Pro",
    representative: "김자동",
    businessNumber: "000-00-00000",
    email: "hello@automate.example",
    phone: "010-0000-0000",
  });

  const packageRows = await db
    .insert(packages)
    .values(PACKAGES.map(({ key: _key, ...pkg }) => ({ ...pkg, tools: [...pkg.tools], workspaceId })))
    .returning({ id: packages.id, name: packages.name });
  const pkg = Object.fromEntries(
    PACKAGES.map((p) => [p.key, packageRows.find((row) => row.name === p.name)]),
  ) as Record<PackageKey, { id: string; name: string }>;
  const pkgInfo = Object.fromEntries(PACKAGES.map((p) => [p.key, p])) as Record<PackageKey, (typeof PACKAGES)[number]>;

  // --- Quotes -------------------------------------------------------------
  const year = Number(today.slice(0, 4));
  const quoteSeeds: {
    client: string;
    contact: string;
    issued: number;
    status: "draft" | "sent" | "accepted" | "declined";
    lines: { key?: PackageKey; name?: string; complexity: Complexity; setup?: number; monthly?: number }[];
    notes?: string;
  }[] = [
    {
      client: "코리아무역",
      contact: "이수진 팀장",
      issued: -58,
      status: "accepted",
      lines: [
        { key: "invoice", complexity: "normal" },
        { key: "excel", complexity: "simple" },
      ],
    },
    {
      client: "그린마트",
      contact: "정대호 대표",
      issued: -19,
      status: "accepted",
      lines: [{ key: "inventory", complexity: "normal" }],
    },
    {
      client: "다온카페",
      contact: "한다온 사장",
      issued: -40,
      status: "declined",
      lines: [{ key: "social", complexity: "simple" }],
    },
    {
      client: "한결인테리어",
      contact: "오세훈 실장",
      issued: -5,
      status: "sent",
      lines: [
        { key: "crm", complexity: "normal" },
        { key: "autoreply", complexity: "simple" },
      ],
      notes: "현장 사진 업로드 흐름은 2차 범위로 분리했습니다.",
    },
    {
      client: "푸른약국",
      contact: "윤지현 약사",
      issued: -2,
      status: "sent",
      lines: [
        { key: "inventory", complexity: "normal" },
        { name: "카카오 알림톡 발송 연동", complexity: "normal", setup: 500_000, monthly: 50_000 },
      ],
    },
    {
      client: "늘봄베이커리",
      contact: "김봄 대표",
      issued: -1,
      status: "sent",
      lines: [{ key: "social", complexity: "normal" }],
    },
    {
      client: "미래교육센터",
      contact: "",
      issued: 0,
      status: "draft",
      lines: [{ key: "minutes", complexity: "complex" }],
    },
  ];

  const quoteIds: Record<string, string> = {};
  for (const [index, q] of quoteSeeds.entries()) {
    const [row] = await db
      .insert(quotes)
      .values({
        workspaceId,
        number: `Q-${year}-${String(index + 1).padStart(4, "0")}`,
        clientName: q.client,
        contactName: q.contact,
        issuedOn: day(q.issued),
        validUntil: day(q.issued + 30),
        status: q.status,
        notes: q.notes ?? "",
        createdAt: at(q.issued),
        updatedAt: at(q.issued),
      })
      .returning({ id: quotes.id });
    quoteIds[q.client] = row.id;
    await db.insert(quoteItems).values(
      q.lines.map((line, position) => ({
        workspaceId,
        quoteId: row.id,
        packageId: line.key ? pkg[line.key].id : null,
        name: line.key ? pkgInfo[line.key].name : (line.name ?? "추가 작업"),
        complexity: line.complexity,
        quantity: 1,
        unitSetupFee: line.key ? pkgInfo[line.key].setupFee : (line.setup ?? 0),
        unitMonthlyFee: line.key ? pkgInfo[line.key].monthlyFee : (line.monthly ?? 0),
        position,
      })),
    );
  }

  // --- Projects -----------------------------------------------------------
  const fees = (keys: PackageKey[]) => ({
    setupFee: keys.reduce((sum, k) => sum + pkgInfo[k].setupFee, 0),
    monthlyFee: keys.reduce((sum, k) => sum + pkgInfo[k].monthlyFee, 0),
  });

  const projectSeeds: {
    client: string;
    industry: "manufacturing" | "retail" | "service" | "it" | "other";
    stage: "waiting" | "analysis" | "development" | "testing" | "deployment" | "maintenance";
    progress: number;
    assignee: string;
    start: number | null;
    due: number | null;
    notes: string;
    keys: PackageKey[];
    maintenance?: { status: "active" | "paused" | "ended"; started: string; ended?: string };
    quote?: string;
    created: number;
  }[] = [
    {
      client: "스마트유통",
      industry: "retail",
      stage: "development",
      progress: 62,
      assignee: "김자동",
      start: -21,
      due: 9,
      notes: "주문처리 모듈 개발 중. 쿠팡 Wing 주문 연동 테스트 계정 대기.",
      keys: ["inventory", "orders"],
      created: -24,
    },
    {
      client: "디지털서비스랩",
      industry: "service",
      stage: "testing",
      progress: 85,
      assignee: "박자동",
      start: -30,
      due: 3,
      notes: "최종 QA 진행 중. 자동 회신 문구 고객 검수 요청함.",
      keys: ["autoreply", "social"],
      created: -33,
    },
    {
      client: "넥스트IT",
      industry: "it",
      stage: "analysis",
      progress: 20,
      assignee: "김자동",
      start: -6,
      due: 38,
      notes: "요구사항 분석 단계. 근태 시스템 API 문서 수령.",
      keys: ["payroll", "crm"],
      created: -8,
    },
    {
      client: "그린마트",
      industry: "retail",
      stage: "waiting",
      progress: 0,
      assignee: "",
      start: null,
      due: 24,
      notes: "견적 수락, 착수일 조율 중.",
      keys: ["inventory"],
      quote: "그린마트",
      created: -15,
    },
    {
      client: "코리아무역",
      industry: "other",
      stage: "deployment",
      progress: 95,
      assignee: "박자동",
      start: -48,
      due: 1,
      notes: "배포 후 안정화 모니터링. 홈택스 인증서 갱신일 확인.",
      keys: ["invoice", "excel"],
      quote: "코리아무역",
      created: -55,
    },
    {
      client: "오름물류",
      industry: "retail",
      stage: "development",
      progress: 45,
      assignee: "김자동",
      start: -14,
      due: -2,
      notes: "택배사 API 키 발급 지연으로 일정 조정 필요.",
      keys: ["orders"],
      created: -16,
    },
    {
      client: "늘봄베이커리",
      industry: "service",
      stage: "waiting",
      progress: 0,
      assignee: "박자동",
      start: null,
      due: 20,
      notes: "견적 발송, 회신 대기.",
      keys: ["social"],
      created: -1,
    },
    {
      client: "(주)한국제조",
      industry: "manufacturing",
      stage: "maintenance",
      progress: 100,
      assignee: "김자동",
      start: -260,
      due: -230,
      notes: "정상 운영 중. 분기 점검 완료.",
      keys: ["excel", "daily-report"],
      maintenance: { status: "active", started: month(-8) },
      created: -262,
    },
    {
      client: "한빛정밀",
      industry: "manufacturing",
      stage: "maintenance",
      progress: 100,
      assignee: "박자동",
      start: -170,
      due: -150,
      notes: "생산 실적 리포트 운영 중.",
      keys: ["daily-report"],
      maintenance: { status: "active", started: month(-5) },
      created: -172,
    },
    {
      client: "바른세무회계",
      industry: "service",
      stage: "maintenance",
      progress: 100,
      assignee: "김자동",
      start: -110,
      due: -92,
      notes: "세금계산서 발행량 월 400건 내외.",
      keys: ["invoice", "minutes"],
      maintenance: { status: "active", started: month(-3) },
      created: -112,
    },
    {
      client: "새솔치과",
      industry: "service",
      stage: "maintenance",
      progress: 100,
      assignee: "박자동",
      start: -50,
      due: -33,
      notes: "예약 문의 자동응답 운영 시작.",
      keys: ["autoreply"],
      maintenance: { status: "active", started: day(-10) },
      created: -52,
    },
    {
      client: "모두의꽃집",
      industry: "retail",
      stage: "maintenance",
      progress: 100,
      assignee: "박자동",
      start: -200,
      due: -186,
      notes: "비수기 동안 유지보수 일시 정지 요청.",
      keys: ["social"],
      maintenance: { status: "paused", started: month(-6) },
      created: -202,
    },
    {
      client: "동해수산",
      industry: "retail",
      stage: "maintenance",
      progress: 100,
      assignee: "김자동",
      start: -300,
      due: -280,
      notes: "사업장 이전으로 계약 종료.",
      keys: ["inventory"],
      maintenance: { status: "ended", started: month(-9), ended: month(-2) },
      created: -302,
    },
  ];

  const projectIds: Record<string, string> = {};
  for (const p of projectSeeds) {
    const [row] = await db
      .insert(projects)
      .values({
        workspaceId,
        clientName: p.client,
        industry: p.industry,
        stage: p.stage,
        progress: p.progress,
        assignee: p.assignee,
        startDate: p.start === null ? null : day(p.start),
        dueDate: p.due === null ? null : day(p.due),
        notes: p.notes,
        ...fees(p.keys),
        maintenanceStatus: p.maintenance?.status ?? "none",
        maintenanceStartedOn: p.maintenance?.started ?? null,
        maintenanceEndedOn: p.maintenance?.ended ?? null,
        quoteId: p.quote ? quoteIds[p.quote] : null,
        createdAt: at(p.created),
        updatedAt: at(Math.min(0, p.created + 10)),
      })
      .returning({ id: projects.id });
    projectIds[p.client] = row.id;
    await db
      .insert(projectPackages)
      .values(p.keys.map((k) => ({ workspaceId, projectId: row.id, packageId: pkg[k].id })));
  }

  // --- ROI diagnoses ------------------------------------------------------
  await db.insert(diagnoses).values([
    {
      workspaceId,
      clientName: "한결인테리어",
      contactName: "오세훈 실장",
      industry: "service",
      weeklyHours: 25,
      hourlyCost: 28_000,
      automationRate: 60,
      investment: 2_200_000,
      monthlyFee: 450_000,
      status: "quoted",
      note: "견적·발주 메일이 하루 30통 이상.",
      createdAt: at(-9),
    },
    {
      workspaceId,
      clientName: "푸른약국",
      contactName: "윤지현 약사",
      industry: "retail",
      weeklyHours: 18,
      hourlyCost: 22_000,
      automationRate: 50,
      investment: 2_500_000,
      monthlyFee: 450_000,
      status: "quoted",
      note: "재고 확인과 도매상 발주를 매일 수기로 처리.",
      createdAt: at(-4),
    },
    {
      workspaceId,
      clientName: "성진금속",
      contactName: "배성진 부장",
      industry: "manufacturing",
      weeklyHours: 40,
      hourlyCost: 26_000,
      automationRate: 55,
      investment: 4_000_000,
      monthlyFee: 500_000,
      status: "consulting",
      note: "생산일보·출하 대장을 엑셀 세 개로 관리.",
      createdAt: at(-3),
    },
    {
      workspaceId,
      clientName: "미래교육센터",
      contactName: "",
      industry: "service",
      weeklyHours: 12,
      hourlyCost: 30_000,
      automationRate: 70,
      investment: 1_350_000,
      monthlyFee: 300_000,
      status: "new",
      note: "주간 회의 4회, 회의록 정리에 매번 1시간.",
      createdAt: at(-1),
    },
    {
      workspaceId,
      clientName: "다온카페",
      contactName: "한다온 사장",
      industry: "service",
      weeklyHours: 5,
      hourlyCost: 12_000,
      automationRate: 50,
      investment: 560_000,
      monthlyFee: 105_000,
      status: "on_hold",
      note: "절감액이 유지보수비와 비슷해 보류.",
      createdAt: at(-42),
    },
  ]);

  // --- Workflows ----------------------------------------------------------
  const customInvoice: Graph = {
    nodes: [
      { key: "t1", kind: "trigger", app: "ecount", label: "매출 전표 등록", column: 0, lane: 0 },
      { key: "a1", kind: "action", app: "hometax", label: "전자세금계산서 발행", column: 1, lane: 0 },
      { key: "c1", kind: "condition", app: "router", label: "발행 성공?", column: 2, lane: 0 },
      { key: "a2", kind: "action", app: "gmail", label: "거래처 발행 안내 메일", column: 3, lane: 0 },
      { key: "a3", kind: "action", app: "slack", label: "발행 오류 알림", column: 3, lane: 1 },
      { key: "a4", kind: "action", app: "sheets", label: "미수금 대장 갱신", column: 4, lane: 0 },
    ],
    edges: [
      { from: "t1", to: "a1", label: "" },
      { from: "a1", to: "c1", label: "" },
      { from: "c1", to: "a2", label: "성공" },
      { from: "c1", to: "a3", label: "실패" },
      { from: "a2", to: "a4", label: "" },
    ],
  };

  const workflowSeeds: {
    name: string;
    description: string;
    platform: "make" | "zapier" | "n8n" | "apps_script";
    project: string;
    graph: Graph;
    updated: number;
  }[] = [
    {
      name: "스마트유통 주문 → 배송",
      description: "스마트스토어 주문을 재고 확인 후 송장 발급까지 이어 줍니다.",
      platform: "n8n",
      project: "스마트유통",
      graph: templateGraph("order-shipping"),
      updated: -2,
    },
    {
      name: "디지털서비스랩 문의 자동응답",
      description: "문의 메일 분류, 자동 회신, 긴급 건 Slack 알림.",
      platform: "zapier",
      project: "디지털서비스랩",
      graph: templateGraph("email-autoreply"),
      updated: -4,
    },
    {
      name: "한국제조 일일 생산 리포트",
      description: "매일 오전 9시 전일 실적을 모아 보고서를 발송합니다.",
      platform: "apps_script",
      project: "(주)한국제조",
      graph: templateGraph("sheet-report"),
      updated: -40,
    },
    {
      name: "바른세무회계 세금계산서 발행",
      description: "매출 전표 등록부터 발행 안내, 미수금 대장까지.",
      platform: "make",
      project: "바른세무회계",
      graph: customInvoice,
      updated: -20,
    },
  ];

  for (const w of workflowSeeds) {
    const [row] = await db
      .insert(workflows)
      .values({
        workspaceId,
        name: w.name,
        description: w.description,
        platform: w.platform,
        projectId: projectIds[w.project] ?? null,
        createdAt: at(w.updated - 3),
        updatedAt: at(w.updated),
      })
      .returning({ id: workflows.id });
    await insertGraph(db, workspaceId, row.id, w.graph);
  }
}

function templateGraph(id: string): Graph {
  const template = findTemplate(id);
  if (!template) throw new Error(`Unknown workflow template: ${id}`);
  return template.graph;
}
