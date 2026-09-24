import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { and, eq } from "drizzle-orm";
import { UserError } from "@/core/actions";
import { resetModule, seedModuleIfNeeded } from "@/core/modules/lifecycle";
import { createTestDatabase, type TestDatabase } from "@/core/testing/database";
import * as schema from "../../db/schema";
import { seedDemo } from "../../db/seed";
import { devFreelancing } from "../../module";
import { listClients, loadClient } from "./clients";
import { findEstimate, findInvoice, listInvoices } from "./documents-read";
import {
  convertEstimate,
  createEstimate,
  createProjectFromEstimate,
  deleteInvoice,
  setEstimateStatus,
  setInvoiceStatus,
  updateEstimate,
} from "./documents-write";
import { loadOverview, loadRevenue } from "./insights";
import { loadBoard, moveProject } from "./projects";
import { submitInquiry } from "./public";
import { getTimer, listEntries, startTimer, stopTimer } from "./time";

const TODAY = "2026-09-24";
const NOW = new Date("2026-09-24T14:00:00+09:00");

describe("DevFlow data layer", () => {
  let t: TestDatabase<typeof schema>;
  let ws: string;

  beforeAll(async () => {
    t = await createTestDatabase(schema);
    ws = t.workspaceId;
    await seedDemo(t.db, ws, TODAY);
  });
  afterAll(() => t.close());

  it("seeds a year of sample business", async () => {
    const [clients, board, invoices] = await Promise.all([listClients(t.db, ws), loadBoard(t.db, ws), listInvoices(t.db, ws)]);
    expect(clients).toHaveLength(6);
    expect(board).toHaveLength(10);
    expect(invoices).toHaveLength(9 + 12);
    const entries = await listEntries(t.db, ws, {}, 1000);
    expect(entries.length).toBeGreaterThan(150);
    expect(entries.every((e) => e.minutes >= 30 && e.workedOn <= TODAY)).toBe(true);
  });

  it("builds the overview from real rows", async () => {
    const overview = await loadOverview(t.db, ws, TODAY);
    expect(overview.calendar.weeks).toHaveLength(26);
    expect(overview.calendar.totalMinutes).toBeGreaterThan(0);
    // 피트니스 착수금 was due 4 days ago.
    const fitness = overview.open.find((i) => i.title.startsWith("피트니스"));
    expect(fitness?.overdue).toBe(4);
    expect(overview.receivables.overdueCount).toBe(1);
    // September's maintenance was paid on the 9th.
    expect(overview.month.paidSupply).toBe(900_000);
    expect(overview.active.map((p) => p.status).every((s) => s === "progress" || s === "review")).toBe(true);
    expect(overview.pendingEstimates.map((e) => e.title)).toEqual(["로컬푸드 배달 앱 1차 개발"]);
  });

  it("computes revenue and withheld tax for the year", async () => {
    const report = await loadRevenue(t.db, ws, TODAY);
    expect(report.months).toHaveLength(12);
    expect(report.months.at(-1)?.month).toBe("2026-09");
    expect(report.yearPaid).toBeGreaterThan(0);
    expect(report.tax.withheld).toBeGreaterThan(0);
    // Every paid invoice in the seed is 3.3%: withheld ≈ 3.3% of paid supply.
    expect(report.tax.withheld / report.yearPaid).toBeCloseTo(0.033, 3);
  });

  it("runs an estimate from draft to 착수금 and 잔금 invoices", async () => {
    const [client] = await listClients(t.db, ws, { q: "모먼트" });
    const id = await createEstimate(t.db, ws, {
      clientId: client.id,
      projectId: null,
      title: "원두 구독 2차",
      taxMode: "vat",
      discount: 100_000,
      issuedOn: TODAY,
      validUntil: "2026-10-24",
      notes: "",
      items: [
        { title: "구독 주기 변경", unit: "hour", quantity: 10, unitPrice: 60_000 },
        { title: "쿠폰", unit: "hour", quantity: 8.5, unitPrice: 60_000 },
      ],
    });
    let estimate = await findEstimate(t.db, ws, id);
    expect(estimate?.number).toBe("EST-20260924-001");
    expect(estimate?.totals).toMatchObject({ subtotal: 1_110_000, supply: 1_010_000, vat: 101_000, billed: 1_111_000 });

    await expect(convertEstimate(t.db, ws, id, "full", TODAY)).rejects.toBeInstanceOf(UserError);
    await setEstimateStatus(t.db, ws, id, "sent", NOW);
    await expect(updateEstimate(t.db, ws, id, { ...estimate!, clientId: client.id, items: estimate!.lines })).rejects.toThrow(/작성 중/);
    await setEstimateStatus(t.db, ws, id, "accepted", NOW);

    const advanceId = await convertEstimate(t.db, ws, id, "advance30", TODAY);
    const advance = await findInvoice(t.db, ws, advanceId);
    expect(advance?.totals.supply).toBe(303_000);
    expect(advance?.totals.vat).toBe(30_300);
    expect(advance?.dueOn).toBe("2026-10-08");

    estimate = await findEstimate(t.db, ws, id);
    expect(estimate?.status).toBe("invoiced");
    expect(estimate?.invoicedSupply).toBe(303_000);
    await expect(convertEstimate(t.db, ws, id, "advance50", TODAY)).rejects.toThrow(/전액/);

    const balanceId = await convertEstimate(t.db, ws, id, "balance", TODAY);
    expect((await findInvoice(t.db, ws, balanceId))?.totals.supply).toBe(707_000);

    await setInvoiceStatus(t.db, ws, advanceId, "awaiting", { now: NOW });
    await setInvoiceStatus(t.db, ws, advanceId, "paid", { paidOn: TODAY, now: NOW });
    expect((await findInvoice(t.db, ws, advanceId))?.paidOn).toBe(TODAY);

    // Deleting both invoices hands the estimate back as 수락됨.
    await deleteInvoice(t.db, ws, advanceId);
    await deleteInvoice(t.db, ws, balanceId);
    expect((await findEstimate(t.db, ws, id))?.status).toBe("accepted");

    const projectId = await createProjectFromEstimate(t.db, ws, id);
    const board = await loadBoard(t.db, ws);
    const project = board.find((p) => p.id === projectId);
    expect(project).toMatchObject({ status: "progress", budget: 1_010_000, milestonesTotal: 2, estimatedHours: 18.5 });
  });

  it("persists the timer server-side and logs it to the start day", async () => {
    const [project] = (await loadBoard(t.db, ws)).filter((p) => p.status === "progress");
    await startTimer(t.db, ws, { projectId: project.id, milestoneId: null, note: "리팩터링" }, new Date("2026-09-24T22:30:00+09:00"));
    await expect(startTimer(t.db, ws, { projectId: project.id, milestoneId: null, note: "" })).rejects.toThrow(/이미/);
    expect((await getTimer(t.db, ws))?.projectTitle).toBe(project.title);

    const logged = await stopTimer(t.db, ws, new Date("2026-09-25T00:00:00+09:00"));
    expect(logged).toEqual({ minutes: 90, workedOn: "2026-09-24" });
    expect(await getTimer(t.db, ws)).toBeNull();
    const [entry] = await listEntries(t.db, ws, { projectId: project.id, from: TODAY, to: TODAY });
    expect(entry).toMatchObject({ minutes: 90, note: "리팩터링", fromTimer: true });
  });

  it("moves cards on the board and stamps completion", async () => {
    const board = await loadBoard(t.db, ws);
    const inquiry = board.find((p) => p.status === "inquiry")!;
    await moveProject(t.db, ws, inquiry.id, "done", 0, NOW);
    const after = await loadBoard(t.db, ws);
    const moved = after.find((p) => p.id === inquiry.id)!;
    expect(moved).toMatchObject({ status: "done", position: 0 });
    expect(moved.completedAt?.toISOString()).toBe(NOW.toISOString());
    const done = after.filter((p) => p.status === "done").sort((a, b) => a.position - b.position);
    expect(done.map((p) => p.position)).toEqual(done.map((_, i) => i));

    await moveProject(t.db, ws, inquiry.id, "inquiry", 0, NOW);
    expect((await loadBoard(t.db, ws)).find((p) => p.id === inquiry.id)?.completedAt).toBeNull();
  });

  it("turns a public inquiry into a client, a 문의 card and a history note", async () => {
    const input = { name: "오지훈", company: "그린마켓", email: "Jihun@green.example", phone: "", category: "app" as const, budget: 5_000_000, message: "장보기 앱 견적 부탁드립니다." };
    const { projectId } = await submitInquiry(t.db, ws, input, TODAY);
    await submitInquiry(t.db, ws, { ...input, email: "jihun@green.example", message: "추가 문의" }, TODAY);

    const clients = await listClients(t.db, ws, { q: "그린마켓" });
    expect(clients).toHaveLength(1);
    const detail = await loadClient(t.db, ws, clients[0].id);
    expect(detail?.projects.map((p) => p.status)).toEqual(["inquiry", "inquiry"]);
    expect(detail?.notes).toHaveLength(2);
    expect(detail?.projects.find((p) => p.id === projectId)?.title).toBe("그린마켓 앱 문의");
  });

  it("keeps workspaces apart", async () => {
    const other = await t.createWorkspace();
    const [invoice] = await listInvoices(t.db, ws);
    expect(await findInvoice(t.db, other, invoice.id)).toBeNull();
    await expect(setInvoiceStatus(t.db, other, invoice.id, "awaiting")).rejects.toBeInstanceOf(UserError);
    expect(await listClients(t.db, other)).toEqual([]);
    const [project] = await loadBoard(t.db, ws);
    await expect(startTimer(t.db, other, { projectId: project.id, milestoneId: null, note: "" })).rejects.toThrow(/찾을 수 없어요/);
    const stillThere = await t.db.select().from(schema.invoices).where(and(eq(schema.invoices.id, invoice.id), eq(schema.invoices.workspaceId, ws)));
    expect(stillThere).toHaveLength(1);
  });

  it("seeds through the module lifecycle and resets to the sample data", async () => {
    const fresh = await t.createWorkspace();
    expect(await seedModuleIfNeeded(t.db, devFreelancing, fresh)).toBe(true);
    await submitInquiry(t.db, fresh, { name: "테스트", company: "", email: "t@example.com", phone: "", category: null, budget: 0, message: "?" }, TODAY);
    expect(await listClients(t.db, fresh)).toHaveLength(7);
    await resetModule(t.db, devFreelancing, fresh);
    expect(await listClients(t.db, fresh)).toHaveLength(6);
    expect(await listClients(t.db, ws)).toHaveLength(7);
  });
});
