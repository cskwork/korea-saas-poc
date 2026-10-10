"use client";

import { FileCheck2, PenLine, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect, useEffectEvent, useState } from "react";
import { formatDate, formatNumber, formatTime, seoulDateKey } from "@/core/format";
import { Headline } from "../components/dashboard/Headline";
import { MonthLedger } from "../components/dashboard/MonthLedger";
import { RecentDrafts } from "../components/dashboard/RecentDrafts";
import { Stand } from "../components/dashboard/Stand";
import { Throughput } from "../components/dashboard/Throughput";
import { TierFlow } from "../components/dashboard/TierFlow";
import dashboardStyles from "../components/dashboard/dashboard.module.css";
import { CharCount } from "../components/drafts/CharCount";
import { DraftBody } from "../components/drafts/DraftBody";
import { DeleteDraft, LinkOrder, RestoreVersion } from "../components/drafts/DraftSideActions";
import { DraftWorkbench } from "../components/drafts/DraftWorkbench";
import { Generator } from "../components/drafts/Generator";
import { DraftList, LibraryFilters } from "../components/drafts/Library";
import { VersionList } from "../components/drafts/VersionList";
import draftStyles from "../components/drafts/drafts.module.css";
import { Board } from "../components/orders/Board";
import { BoardFilters } from "../components/orders/BoardFilters";
import { DeliverPanel } from "../components/orders/DeliverPanel";
import { DraftLines } from "../components/orders/DraftLines";
import { EventLog } from "../components/orders/EventLog";
import { MoveButton } from "../components/orders/MoveButton";
import { DeleteOrder, DraftFromOrder } from "../components/orders/OrderActions";
import { OrderBriefPanel } from "../components/orders/OrderBriefPanel";
import { OrderForm } from "../components/orders/OrderForm";
import { PrintButton } from "../components/orders/PrintButton";
import { PublishCase } from "../components/orders/PublishCase";
import { StageSteps } from "../components/orders/StageSteps";
import orderStyles from "../components/orders/orders.module.css";
import { CaseBoard, CaseFilters } from "../components/portfolio/CaseBoard";
import { InquiryForm } from "../components/pricing/InquiryForm";
import { PlanPoles } from "../components/pricing/PlanPoles";
import { WithdrawInquiry } from "../components/pricing/WithdrawInquiry";
import pricingStyles from "../components/pricing/pricing.module.css";
import { BannerProof } from "../components/proof/BannerProof";
import { ClientShell } from "../components/shell/ClientShell";
import { ConsoleShell } from "../components/shell/ConsoleShell";
import { Grommets } from "../components/shell/Grommets";
import { BackLink } from "../components/ui/BackLink";
import { buttonClass } from "../components/ui/buttons";
import { CopyButton } from "../components/ui/CopyButton";
import { DueSticker } from "../components/ui/DueSticker";
import { Empty, PageHeader } from "../components/ui/PageHeader";
import { Skeleton } from "../components/ui/Skeleton";
import { KindTag, SOURCE_LABEL, SampleMark, SourceTag } from "../components/ui/Tags";
import ui from "../components/ui/ui.module.css";
import { CONTENT_KINDS, KIND_LABEL, composeCopy, countCharacters } from "../domain/content";
import { addBusinessDays, longDate } from "../domain/dates";
import { josa } from "../domain/korean";
import { ADVANCE_LABEL, RETREAT_LABEL, nextStatus, orderCode, previousStatus } from "../domain/pipeline";
import { PLANS } from "../domain/plans";
import { DemoProvider, type GeulpumActions } from "./context";

/**
 * The browser-only 글품: the original pages' components, fed by the same stores running on a
 * PGlite database in this browser (./queries, ./actions). Nothing here reaches the server's database.
 */

const BASE = "/ai-content-agency";
/** Fired by ./database after every browser mutation (kept in sync with DEMO_CHANGE_EVENT there). */
const DEMO_CHANGE_EVENT = "geulpum-demo-change";

type Queries = typeof import("./queries");
type SearchParams = Record<string, string | string[] | undefined>;

/** The logical page under /ai-content-agency, matched on the server from the URL segments. */
export type DemoRoute =
  | { name: "home" | "orders" | "newOrder" | "write" | "drafts" | "portfolio" | "pricing" }
  | { name: "order" | "delivery" | "draft"; id: string };

// The browser modules load only in the browser, on first use: no database code runs during SSR.
const loadQueries = (): Promise<Queries> => import("./queries");
let actionsModule: Promise<GeulpumActions> | undefined;
/** Typed as the server action set, so a renamed or reshaped browser action fails the typecheck here. */
const loadActions = (): Promise<GeulpumActions> => (actionsModule ??= import("./actions"));

function lazy<K extends keyof GeulpumActions>(name: K): GeulpumActions[K] {
  const run = async (...args: unknown[]) => {
    const actions = await loadActions();
    return (actions[name] as (...input: unknown[]) => Promise<unknown>)(...args);
  };
  return run as unknown as GeulpumActions[K];
}

/** The browser stand-ins for every server action, same names and signatures. */
const demoActions: GeulpumActions = {
  createOrderAction: lazy("createOrderAction"),
  updateOrderAction: lazy("updateOrderAction"),
  moveOrderAction: lazy("moveOrderAction"),
  deleteOrderAction: lazy("deleteOrderAction"),
  draftFromOrderAction: lazy("draftFromOrderAction"),
  generateDraftAction: lazy("generateDraftAction"),
  regenerateDraftAction: lazy("regenerateDraftAction"),
  editDraftAction: lazy("editDraftAction"),
  restoreVersionAction: lazy("restoreVersionAction"),
  linkDraftAction: lazy("linkDraftAction"),
  deleteDraftAction: lazy("deleteDraftAction"),
  publishCaseAction: lazy("publishCaseAction"),
  deleteCaseAction: lazy("deleteCaseAction"),
  updateCaseAction: lazy("updateCaseAction"),
  selectPlanAction: lazy("selectPlanAction"),
  inquiryAction: lazy("inquiryAction"),
  deleteInquiryAction: lazy("deleteInquiryAction"),
  resetDemoAction: lazy("resetDemoAction"),
};

/** The console frame (masthead, footer, reset) running on the browser actions. */
export function DemoConsoleFrame({ children }: { children: React.ReactNode }) {
  return (
    <DemoProvider actions={demoActions}>
      <ConsoleShell aiMode="template" browserDemo>
        {children}
      </ConsoleShell>
    </DemoProvider>
  );
}

export function DemoRenderer({ route, search }: { route: DemoRoute; search: SearchParams }) {
  if (route.name === "delivery") {
    return (
      <ClientShell>
        <DeliveryView key={route.id} id={route.id} />
      </ClientShell>
    );
  }
  return (
    <DemoConsoleFrame>
      <ConsoleView route={route} search={search} />
    </DemoConsoleFrame>
  );
}

function ConsoleView({ route, search }: { route: DemoRoute; search: SearchParams }) {
  switch (route.name) {
    case "home":
      return <DashboardView />;
    case "orders":
      return <OrdersView search={search} />;
    case "newOrder":
      return <NewOrderView />;
    case "order":
      return <OrderView key={route.id} id={route.id} />;
    case "write":
      return <WriteView search={search} />;
    case "drafts":
      return <DraftsView search={search} />;
    case "draft":
      return <DraftView key={route.id} id={route.id} search={search} />;
    case "portfolio":
      return <PortfolioView search={search} />;
    case "pricing":
      return <PricingView />;
    case "delivery":
      return null;
  }
}

// ------------------------------------------------------------------ data

type Load<T> = { status: "loading" } | { status: "ready"; data: T } | { status: "error"; error: Error };

/**
 * Runs a browser query for the current page and runs it again after every demo change.
 * A refresh keeps the page on screen (forms keep their state); only the first load shows the skeleton.
 * `key` names what is being read; a new key reads again.
 */
function useDemoQuery<T>(key: string, read: (queries: Queries) => Promise<T>): [Load<T>, () => void] {
  const [state, setState] = useState<Load<T>>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  // `read` is rebuilt every render; `key` carries everything it depends on.
  const run = useEffectEvent(read);

  useEffect(() => {
    let active = true;
    const load = () =>
      loadQueries()
        .then((queries) => run(queries))
        .then(
          (data) => active && setState({ status: "ready", data }),
          (error: unknown) =>
            active && setState({ status: "error", error: error instanceof Error ? error : new Error(String(error)) }),
        );
    void load();
    window.addEventListener(DEMO_CHANGE_EVENT, load);
    return () => {
      active = false;
      window.removeEventListener(DEMO_CHANGE_EVENT, load);
    };
  }, [key, attempt]);

  const retry = () => {
    setState({ status: "loading" });
    setAttempt((n) => n + 1);
  };
  return [state, retry];
}

type SkeletonShape = Parameters<typeof Skeleton>[0]["shape"];

/** Loading and failure states shared by every page; renders the page once the data is in. */
function Loaded<T>({
  load,
  retry,
  shape,
  label,
  children,
}: {
  load: Load<T>;
  retry: () => void;
  shape: SkeletonShape;
  label: string;
  children: (data: T) => React.ReactNode;
}) {
  if (load.status === "loading") return <Skeleton shape={shape} label={label} />;
  if (load.status === "error") {
    return (
      <div role="alert">
        <Empty title="샘플 작업실을 열지 못했어요.">
          <p>{load.error.message || "브라우저에 저장된 예시 데이터를 읽지 못했어요."}</p>
          <div className={ui.pageActions}>
            <button type="button" className={buttonClass("primary")} onClick={retry}>
              <RotateCcw size={16} aria-hidden="true" />
              다시 시도
            </button>
          </div>
        </Empty>
      </div>
    );
  }
  return <>{children(load.data)}</>;
}

// ------------------------------------------------------------------ pages

function DashboardView() {
  const [load, retry] = useDemoQuery("home", (q) => q.getDashboard());
  return (
    <Loaded load={load} retry={retry} shape="dashboard" label="현황을 불러오는 중">
      {(dashboard) => (
        <>
          <Headline today={dashboard.today} counts={dashboard.headline} plan={dashboard.usage.plan} />
          <Stand timeline={dashboard.timeline} today={dashboard.today} />
          <div className={dashboardStyles.lower}>
            <div className={dashboardStyles.section}>
              <TierFlow counts={dashboard.pipeline} />
              <MonthLedger usage={dashboard.usage} output={dashboard.output} performance={dashboard.performance} />
            </div>
            <div className={dashboardStyles.section}>
              <Throughput weeks={dashboard.throughput} />
              <RecentDrafts drafts={dashboard.recentDrafts} />
            </div>
          </div>
        </>
      )}
    </Loaded>
  );
}

function OrdersView({ search }: { search: SearchParams }) {
  const [load, retry] = useDemoQuery(`orders?${JSON.stringify([search.q, search.kind])}`, async (queries) => {
    const q = queries.parseQuery(search.q);
    const kind = queries.parseKind(search.kind);
    return { q, kind, ...(await queries.getOrderBoard({ q, kind })) };
  });
  return (
    <>
      <PageHeader
        title="의뢰 게시대"
        lead="의뢰는 단계마다 한 줄씩 걸려요. 마감일이 가까운 순서로 왼쪽부터 걸리고, 버튼 하나로 다음 단계로 옮겨요. 납품은 의뢰에서 보낼 원고를 골라서 해요."
      />
      <Loaded load={load} retry={retry} shape="board" label="게시대를 불러오는 중">
        {({ q, kind, orders, today }) => (
          <>
            <BoardFilters q={q} kind={kind} total={orders.length} />
            <Board orders={orders} today={today} showAllDelivered={search.all === "1"} filtered={Boolean(q || kind)} />
          </>
        )}
      </Loaded>
    </>
  );
}

function NewOrderView() {
  const [load, retry] = useDemoQuery("orders/new", (q) => q.getNewOrderContext());
  return (
    <>
      <BackLink href={`${BASE}/orders`}>의뢰 게시대</BackLink>
      <PageHeader
        title="의뢰서 쓰기"
        lead="고객이 원하는 것을 적어 두면, 접수 단계에 걸리고 마감일까지 게시대에서 챙길 수 있어요."
      />
      <Loaded load={load} retry={retry} shape="form" label="의뢰서를 불러오는 중">
        {(context) => <NewOrderForm {...context} />}
      </Loaded>
    </>
  );
}

function NewOrderForm({ plan: planId, used, today }: Awaited<ReturnType<Queries["getNewOrderContext"]>>) {
  const plan = PLANS[planId];
  const left = plan.monthlyQuota === null ? null : Math.max(0, plan.monthlyQuota - used);
  return (
    <div className={orderStyles.requestLayout}>
      <OrderForm
        action={demoActions.createOrderAction}
        minDate={today}
        allowedKinds={plan.kinds}
        submitLabel="의뢰서 접수"
        defaults={{
          clientName: "",
          industry: "",
          contactName: "",
          contactEmail: "",
          kind: "blog",
          topic: "",
          brief: "",
          keywords: [],
          tone: "friendly",
          length: "medium",
          dueDate: addBusinessDays(today, 3),
        }}
      />
      <aside className={orderStyles.aside} aria-label="접수 안내">
        <div className={orderStyles.asideBox}>
          <strong>{plan.name} 요금제</strong>
          <span>
            {left === null
              ? `이번 달 ${used}건 접수 · 건수 제한 없음`
              : `이번 달 ${used}건 접수 · ${left}건 더 받을 수 있어요`}
          </span>
          <span>받는 유형: {plan.kinds.map((k) => KIND_LABEL[k]).join(", ")}</span>
          <Link href={`${BASE}/pricing`}>요금제 보기</Link>
        </div>
        <div className={orderStyles.asideBox}>
          <strong>접수 뒤에는</strong>
          <span>
            의뢰는 접수 → 작성중 → 검수 → 납품완료 순서로 옮겨져요. 상세 페이지에서 버튼 한 번이면 AI가 첫 시안을
            쓰고, 에디터가 검수한 원고만 납품돼요.
          </span>
        </div>
      </aside>
    </div>
  );
}

function OrderMissing() {
  return (
    <Empty title="이 의뢰를 찾을 수 없어요.">
      <p>삭제됐거나, 데모 데이터를 초기화해서 번호가 바뀌었을 수 있어요.</p>
      <Link href={`${BASE}/orders`} className={buttonClass("primary")}>
        의뢰 게시대로
      </Link>
    </Empty>
  );
}

function OrderView({ id }: { id: string }) {
  const [load, retry] = useDemoQuery(`orders/${id}`, (q) => q.getOrder(id));
  return (
    <Loaded load={load} retry={retry} shape="document" label="의뢰를 불러오는 중">
      {(detail) => (detail ? <OrderSheet detail={detail} /> : <OrderMissing />)}
    </Loaded>
  );
}

function OrderSheet({ detail }: { detail: NonNullable<Awaited<ReturnType<Queries["getOrder"]>>> }) {
  const { order, events, drafts, publishedCase, plan, today } = detail;
  // A request keeps its own kind even if the plan no longer takes it; switching needs a plan that does.
  const allowedKinds = CONTENT_KINDS.filter((k) => k === order.kind || PLANS[plan].kinds.includes(k));
  const next = nextStatus(order.status);
  const previous = previousStatus(order.status);
  const deliveredDraft = drafts.find((d) => d.id === order.deliveredDraftId);

  return (
    <>
      <BackLink href={`${BASE}/orders`}>의뢰 게시대</BackLink>
      <div className={orderStyles.sheetHead} data-stage={order.status}>
        <Grommets className={orderStyles.sheetGrommets} />
        <div className={orderStyles.sheetTitleRow}>
          <h1 className={ui.pageTitle}>{order.topic}</h1>
          <DueSticker
            dueDate={order.dueDate}
            today={today}
            status={order.status}
            deliveredOn={order.deliveredAt ? seoulDateKey(order.deliveredAt) : null}
          />
        </div>
        <div className={orderStyles.sheetMeta}>
          <span>{orderCode(order.number)}</span>
          <KindTag kind={order.kind} />
          <span>
            {order.clientName} · {order.industry}
          </span>
          <span>접수 {formatDate(order.createdAt, { month: "long", day: "numeric" })}</span>
        </div>
      </div>

      <StageSteps status={order.status} events={events} />

      <div className={orderStyles.sheet}>
        <div>
          <OrderBriefPanel
            orderId={order.id}
            allowedKinds={allowedKinds}
            order={{
              clientName: order.clientName,
              industry: order.industry,
              contactName: order.contactName,
              contactEmail: order.contactEmail,
              kind: order.kind,
              topic: order.topic,
              brief: order.brief,
              keywords: order.keywords,
              tone: order.tone,
              length: order.length,
              dueDate: order.dueDate,
            }}
          />
          <section className={orderStyles.panel} aria-labelledby="log-title">
            <h2 id="log-title" className={orderStyles.panelTitle}>
              진행 기록
            </h2>
            <EventLog events={events} />
          </section>
        </div>

        <div className={orderStyles.sheetSide}>
          <section className={orderStyles.panel} aria-labelledby="progress-title">
            <div className={orderStyles.panelHead}>
              <h2 id="progress-title" className={orderStyles.panelTitle}>
                시안과 진행
              </h2>
            </div>
            {order.status !== "delivered" ? <DraftFromOrder orderId={order.id} hasDrafts={drafts.length > 0} /> : null}
            {order.status === "review" ? (
              <DeliverPanel orderId={order.id} drafts={drafts} />
            ) : (
              <DraftLines drafts={drafts} deliveredDraftId={order.deliveredDraftId} />
            )}
            <div className={orderStyles.actionsRow}>
              {next && order.status !== "review" && order.status !== "delivered" ? (
                <MoveButton
                  orderId={order.id}
                  to={next}
                  label={order.status === "received" ? "시안 없이 작성중으로" : ADVANCE_LABEL[order.status]}
                  size="regular"
                  // Writing a draft already starts the order; once there are drafts, 검수 요청 is the next step.
                  variant={order.status === "received" ? "quiet" : drafts.length > 0 ? "primary" : "secondary"}
                />
              ) : null}
              {previous && order.status !== "received" ? (
                <MoveButton orderId={order.id} to={previous} label={RETREAT_LABEL[order.status]} back size="regular" />
              ) : null}
            </div>
          </section>

          {order.status === "delivered" && deliveredDraft ? (
            <section className={orderStyles.panel} aria-labelledby="delivery-title">
              <div className={orderStyles.panelHead}>
                <h2 id="delivery-title" className={orderStyles.panelTitle}>
                  납품
                </h2>
                <Link href={`${BASE}/orders/${order.id}/delivery`} className={buttonClass("secondary", "small")}>
                  <FileCheck2 size={14} aria-hidden="true" />
                  고객용 납품서
                </Link>
              </div>
              <p>
                {order.deliveredAt ? `${formatDate(order.deliveredAt, { month: "long", day: "numeric" })}에 ` : ""}「
                <Link href={`${BASE}/drafts/${deliveredDraft.id}`}>{deliveredDraft.title}</Link>」{" "}
                {josa(`v${deliveredDraft.currentVersion}`, "을/를")} 넘겼어요.
              </p>
              {publishedCase ? (
                <p>
                  사례 게시판에 <Link href={`${BASE}/portfolio`}>「{publishedCase.title}」</Link>로 올라가 있어요.
                </p>
              ) : (
                <PublishCase
                  orderId={order.id}
                  defaultTitle={order.topic.slice(0, 60)}
                  defaultSummary={`${order.clientName}의 ${KIND_LABEL[order.kind]}를 AI 시안과 에디터 검수로 납품했어요.`}
                />
              )}
            </section>
          ) : null}
        </div>
      </div>
      <div className={orderStyles.dangerZone}>
        <span>의뢰를 지우면 진행 기록도 함께 사라져요.</span>
        <DeleteOrder orderId={order.id} />
      </div>
    </>
  );
}

function WriteView({ search }: { search: SearchParams }) {
  const [load, retry] = useDemoQuery("write", (q) => q.getOpenOrders());
  return (
    <>
      <PageHeader
        title="시안 쓰기"
        lead="조건을 적으면 AI가 첫 시안을 써요. 쓴 시안은 원고함에 v1로 저장되고, 에디터가 고치거나 다시 쓸 때마다 버전이 쌓여요."
      />
      <Loaded load={load} retry={retry} shape="form" label="시안 쓰기를 불러오는 중">
        {(orders) => (
          <Generator
            orders={orders.map(({ id, number, clientName, kind, topic, keywords, tone, length }) => ({
              id,
              number,
              clientName,
              kind,
              topic,
              keywords,
              tone,
              length,
            }))}
            initialOrderId={typeof search.order === "string" ? search.order : null}
            aiMode="template"
          />
        )}
      </Loaded>
    </>
  );
}

function DraftsView({ search }: { search: SearchParams }) {
  const [load, retry] = useDemoQuery(`drafts?${JSON.stringify([search.q, search.kind, search.sort])}`, async (queries) => {
    const q = queries.parseQuery(search.q);
    const kind = queries.parseKind(search.kind);
    const sort = queries.parseSort(search.sort);
    return { q, kind, sort, drafts: await queries.getDraftLibrary({ q, kind, sort }) };
  });
  return (
    <Loaded load={load} retry={retry} shape="list" label="원고함을 불러오는 중">
      {({ q, kind, sort, drafts }) => (
        <>
          <PageHeader
            title="원고함"
            lead={`${q || kind ? "찾은 원고" : "원고"} ${drafts.length}편. 노란 표시는 아직 채우지 않은 [확인 필요] 자리예요.`}
            actions={
              <Link href={`${BASE}/write`} className={buttonClass("primary")}>
                <PenLine size={18} aria-hidden="true" />
                시안 쓰기
              </Link>
            }
          />
          <LibraryFilters q={q} kind={kind} sort={sort} />
          <DraftList drafts={drafts} filtered={Boolean(q || kind)} />
        </>
      )}
    </Loaded>
  );
}

function DraftMissing() {
  return (
    <Empty title="이 원고를 찾을 수 없어요.">
      <p>삭제됐거나, 데모 데이터를 초기화해서 사라졌을 수 있어요.</p>
      <Link href={`${BASE}/drafts`} className={buttonClass("primary")}>
        원고함으로
      </Link>
    </Empty>
  );
}

function DraftView({ id, search }: { id: string; search: SearchParams }) {
  const [load, retry] = useDemoQuery(`drafts/${id}`, (q) => q.getDraft(id));
  return (
    <Loaded load={load} retry={retry} shape="document" label="원고를 불러오는 중">
      {(detail) => (detail ? <DraftSheet detail={detail} query={search} /> : <DraftMissing />)}
    </Loaded>
  );
}

function DraftSheet({
  detail,
  query,
}: {
  detail: NonNullable<Awaited<ReturnType<Queries["getDraft"]>>>;
  query: SearchParams;
}) {
  const { draft, versions, order, openOrders } = detail;
  const requested = Number(query.v);
  const preview = versions.find((v) => v.version === requested && v.version !== draft.currentVersion) ?? null;
  const shown = preview ?? { title: draft.title, body: draft.body, version: draft.currentVersion };
  const meta = (
    <div className={draftStyles.meta}>
      <KindTag kind={draft.kind} />
      <span>주제: {draft.topic}</span>
      {order ? (
        <Link href={`${BASE}/orders/${order.id}`}>
          {orderCode(order.number)} {order.clientName}
        </Link>
      ) : null}
      <SourceTag source={draft.source} />
      <span>
        v{draft.currentVersion} · {formatDate(draft.updatedAt, { month: "long", day: "numeric" })}{" "}
        {formatTime(draft.updatedAt)} 수정
      </span>
    </div>
  );
  // The copy a client received stays as delivered until the order goes back to 검수.
  const deliveredIn =
    order && order.status === "delivered" && order.deliveredDraftId === draft.id
      ? { id: order.id, code: orderCode(order.number) }
      : null;
  const byline = `${order ? order.clientName : "의뢰 없이 쓴 원고"} · ${KIND_LABEL[draft.kind]} 시안 v${shown.version}`;

  return (
    <>
      <BackLink href={`${BASE}/drafts`}>원고함</BackLink>
      <div className={draftStyles.workspace}>
        <div>
          {preview ? (
            <>
              <div className={draftStyles.previewBar} role="status">
                <span>
                  예전 버전 {josa(`v${preview.version}`, "을/를")} 보는 중 ·{" "}
                  {preview.note || SOURCE_LABEL[preview.source]}
                </span>
                <span className={draftStyles.formActions}>
                  {deliveredIn ? null : <RestoreVersion draftId={draft.id} version={preview.version} />}
                  <Link href={`${BASE}/drafts/${draft.id}`}>지금 버전으로</Link>
                </span>
              </div>
              <BannerProof
                title={preview.title}
                kind={draft.kind}
                keywords={draft.keywords}
                byline={byline}
                headingLevel={1}
              />
              {meta}
              <div className={`${draftStyles.document} ${draftStyles.previewDocument}`}>
                <DraftBody body={preview.body} />
              </div>
            </>
          ) : (
            <DraftWorkbench
              meta={meta}
              fresh={query.fresh === "1"}
              deliveredIn={deliveredIn}
              draft={{
                id: draft.id,
                kind: draft.kind,
                title: draft.title,
                body: draft.body,
                keywords: draft.keywords,
                tone: draft.tone,
                length: draft.length,
                version: draft.currentVersion,
                source: draft.source,
                byline,
              }}
            />
          )}
        </div>

        <aside className={draftStyles.side} aria-label="원고 정보">
          <section className={draftStyles.sidePanel} aria-labelledby="count-title">
            <h2 id="count-title" className={draftStyles.sideTitle}>
              글자수{preview ? ` (v${preview.version})` : ""}
            </h2>
            <CharCount body={shown.body} kind={draft.kind} length={draft.length} />
          </section>
          <section className={draftStyles.sidePanel} aria-labelledby="versions-title">
            <h2 id="versions-title" className={draftStyles.sideTitle}>
              버전 기록 {versions.length}개
            </h2>
            <VersionList draftId={draft.id} versions={versions} current={draft.currentVersion} viewing={shown.version} />
          </section>
          <section className={draftStyles.sidePanel} aria-labelledby="link-title">
            <h2 id="link-title" className={draftStyles.sideTitle}>
              의뢰
            </h2>
            {deliveredIn && order ? (
              <p className={draftStyles.sideNote}>
                <Link href={`${BASE}/orders/${order.id}`}>
                  {deliveredIn.code} {order.clientName} · {order.topic}
                </Link>
                에 납품한 원고라 연결을 바꾸거나 지울 수 없어요.
              </p>
            ) : (
              <LinkOrder
                draftId={draft.id}
                orderId={draft.orderId}
                orders={openOrders}
                linked={
                  order ? { id: order.id, number: order.number, clientName: order.clientName, topic: order.topic } : null
                }
              />
            )}
          </section>
          {deliveredIn ? null : <DeleteDraft draftId={draft.id} />}
        </aside>
      </div>
    </>
  );
}

function PortfolioView({ search }: { search: SearchParams }) {
  const [load, retry] = useDemoQuery(`portfolio?${JSON.stringify([search.industry, search.kind])}`, async (queries) => {
    const industry = queries.parseIndustry(search.industry);
    const kind = queries.parseKind(search.kind);
    return { industry, kind, ...(await queries.getCases({ industry, kind })) };
  });
  return (
    <>
      <PageHeader
        title="사례 게시판"
        lead="샘플 표시가 붙은 사례는 예시로 만든 작업이에요. 납품을 마친 의뢰를 올리면 실제 원고와 함께 여기에 걸려요."
      />
      <Loaded load={load} retry={retry} shape="wall" label="사례를 불러오는 중">
        {({ industry, kind, items, industryCounts, total }) => (
          <>
            <CaseFilters industry={industry} kind={kind} counts={industryCounts} total={total} />
            <CaseBoard items={items} filtered={Boolean(industry || kind)} />
          </>
        )}
      </Loaded>
    </>
  );
}

function PricingView() {
  const [load, retry] = useDemoQuery("pricing", (q) => q.getPricing());
  return (
    <>
      <PageHeader
        title="요금제"
        lead="한 달에 맡길 의뢰 수와 콘텐츠 유형으로 골라요. 요금제는 언제든 바꿀 수 있고, 바꾼 기록은 아래에 남아요."
      />
      <Loaded load={load} retry={retry} shape="plans" label="요금제를 불러오는 중">
        {(pricing) => <PricingSheet {...pricing} />}
      </Loaded>
    </>
  );
}

function PricingSheet({ plan, used, history, inquiries, openKinds }: Awaited<ReturnType<Queries["getPricing"]>>) {
  const current = PLANS[plan];
  return (
    <>
      <p className={pricingStyles.usage}>
        <strong>{current.name}</strong>
        <span>
          이번 달 의뢰 {used}건{current.monthlyQuota === null ? " · 건수 제한 없음" : ` / ${current.monthlyQuota}건`}
        </span>
      </p>
      <PlanPoles current={plan} used={used} openKinds={openKinds} />
      <p className={pricingStyles.demoNote}>데모 요금제예요. 요금제를 바꾸면 선택만 기록되고 결제는 이뤄지지 않아요.</p>

      <div className={pricingStyles.lower}>
        <section className={pricingStyles.panel} aria-labelledby="inquiry-title">
          <h2 id="inquiry-title" className={pricingStyles.panelTitle}>
            엔터프라이즈 견적 문의
          </h2>
          <p>여러 브랜드나 채널을 한꺼번에 맡기려면 규모를 알려 주세요. 문의 내용은 이 브라우저에만 저장돼요.</p>
          <InquiryForm />
          {inquiries.length > 0 ? (
            <ul className={pricingStyles.history} role="list" aria-label="남긴 문의">
              {inquiries.map((inquiry) => (
                <li key={inquiry.id}>
                  <span>
                    {inquiry.companyName} · 월 {inquiry.monthlyVolume}건
                  </span>
                  <time dateTime={inquiry.createdAt.toISOString()}>
                    {formatDate(inquiry.createdAt, { month: "long", day: "numeric" })}
                  </time>
                  <WithdrawInquiry inquiryId={inquiry.id} />
                </li>
              ))}
            </ul>
          ) : null}
        </section>
        <section className={pricingStyles.panel} aria-labelledby="history-title">
          <h2 id="history-title" className={pricingStyles.panelTitle}>
            요금제 변경 기록
          </h2>
          <ul className={pricingStyles.history} role="list">
            {history.map((change) => (
              <li key={change.id}>
                <span>{PLANS[change.plan].name}</span>
                <time dateTime={change.createdAt.toISOString()}>
                  {formatDate(change.createdAt, { dateStyle: "medium" })}
                </time>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}

// ------------------------------------------------------------------ client page

function DeliveryView({ id }: { id: string }) {
  const [load, retry] = useDemoQuery(`orders/${id}/delivery`, (q) => q.getOrder(id));
  return (
    <Loaded load={load} retry={retry} shape="document" label="납품서를 불러오는 중">
      {(detail) =>
        detail ? (
          <DeliverySheet detail={detail} />
        ) : (
          <Empty title="이 납품서를 찾을 수 없어요.">
            <p>주소가 바뀌었거나 납품이 취소됐을 수 있어요. 보내 준 담당자에게 새 주소를 받아 주세요.</p>
          </Empty>
        )
      }
    </Loaded>
  );
}

/** What the client receives: the delivered copy, ready to paste or print. */
function DeliverySheet({ detail }: { detail: NonNullable<Awaited<ReturnType<Queries["getOrder"]>>> }) {
  const { order, drafts: orderDrafts } = detail;
  const draft = orderDrafts.find((d) => d.id === order.deliveredDraftId);

  // In the demo the operator opens this page from the order; a real client would get the link.
  const preview = (
    <p className={orderStyles.previewNote}>
      <span>고객에게 보내는 화면이에요.</span>
      <Link href={`${BASE}/orders/${order.id}`}>작업실의 의뢰 {orderCode(order.number)}로 돌아가기</Link>
    </p>
  );

  if (order.status !== "delivered" || !draft) {
    return (
      <div className={orderStyles.delivery}>
        {preview}
        <Empty title="아직 납품 전이에요.">
          <p>에디터 검수가 끝나면 이 주소에서 원고를 받아 볼 수 있어요.</p>
        </Empty>
      </div>
    );
  }

  const count = countCharacters(draft.body);
  return (
    <article className={orderStyles.delivery}>
      {preview}
      <header className={orderStyles.deliveryHead}>
        <h1 className={ui.pageTitle}>납품서</h1>
        <p className={orderStyles.deliverySender}>
          {order.clientName} 담당자님, 의뢰하신 {KIND_LABEL[order.kind]} 원고를 글품 에디터가 검수해 보내 드려요.
        </p>
        <p className={orderStyles.deliveryFacts}>
          <SampleMark />
          <span>의뢰 {orderCode(order.number)}</span>
          <span>마감 {longDate(order.dueDate)}</span>
          {order.deliveredAt ? <span>납품 {formatDate(order.deliveredAt, { dateStyle: "long" })}</span> : null}
          <span>
            {formatNumber(count.withSpaces)}자 · 원고지 {formatNumber(count.manuscriptPages, 1)}매
          </span>
        </p>
      </header>
      <BannerProof
        title={draft.title}
        kind={order.kind}
        keywords={order.keywords}
        byline={`${order.clientName} · ${KIND_LABEL[order.kind]}`}
        size="compact"
      />
      <div className={orderStyles.deliveryActions}>
        <CopyButton text={composeCopy(draft.title, draft.body)} label="전체 복사" variant="primary" />
        <CopyButton text={draft.title} label="제목만 복사" />
        <CopyButton text={draft.body} label="본문만 복사" />
        <PrintButton />
      </div>
      <div className={draftStyles.document}>
        <DraftBody body={draft.body} />
      </div>
      <p className={ui.hint}>
        에디터 검수를 거친 v{draft.currentVersion} 원고예요. 고칠 곳이 있으면 담당 에디터에게 알려 주세요.
      </p>
    </article>
  );
}
