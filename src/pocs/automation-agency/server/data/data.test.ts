import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { resetModule, seedModuleIfNeeded } from "@/core/modules/lifecycle";
import { createTestDatabase, type TestDatabase } from "@/core/testing/database";
import { projects, schema } from "../../db/schema";
import { automationAgency } from "../../module";
import { getPackage, listPackages, packageOptions } from "./catalog";
import { getDashboard } from "./dashboard";
import { createDiagnosis, listDiagnoses } from "./diagnoses";
import {
  advanceProject,
  createProject,
  deleteProject,
  getProject,
  listProjects,
  setMaintenanceStatus,
} from "./projects";
import { convertQuoteToProject, createQuote, getQuote, listQuotes, setQuoteStatus } from "./quotes";
import { createWorkflow, getWorkflow, listWorkflows, saveWorkflow } from "./workflows";

const today = "2026-09-24";

describe("automation-agency data layer", () => {
  let t: TestDatabase<typeof schema>;
  beforeAll(async () => {
    t = await createTestDatabase(schema);
    await seedModuleIfNeeded(t.db, automationAgency, t.workspaceId);
  });
  afterAll(() => t.close());

  it("seeds a live-looking workspace", async () => {
    const dashboard = await getDashboard(t.db, t.workspaceId, today);
    expect(dashboard.mrr).toBeGreaterThan(0);
    expect(dashboard.activeSubscriptions).toBe(4);
    expect(dashboard.pausedSubscriptions).toBe(1);
    expect(dashboard.stations.flatMap((s) => s.projects)).toHaveLength(7);
    expect(dashboard.pipeline.openCount).toBe(3);
    expect(dashboard.topPackages.length).toBeGreaterThan(0);
    expect(dashboard.mrrHistory).toHaveLength(6);
  });

  it("filters and ranks the catalogue by real usage", async () => {
    const retail = await listPackages(t.db, t.workspaceId, { industry: "retail" });
    expect(retail.length).toBeGreaterThan(0);
    expect(retail.every((p) => p.industry === "retail")).toBe(true);
    const search = await listPackages(t.db, t.workspaceId, { q: "세금계산서" });
    expect(search.map((p) => p.name)).toEqual(["세금계산서 자동 발행"]);
    const all = await listPackages(t.db, t.workspaceId);
    expect(all[0].projectCount * 2 + all[0].quoteCount).toBeGreaterThanOrEqual(
      all[1].projectCount * 2 + all[1].quoteCount,
    );
  });

  it("creates a quote with VAT totals and converts it to a project once accepted", async () => {
    const [pkg] = await packageOptions(t.db, t.workspaceId);
    const id = await createQuote(t.db, t.workspaceId, {
      clientName: "테스트상사",
      contactName: "",
      issuedOn: today,
      validDays: 30,
      notes: "",
      lines: [
        {
          packageId: pkg.id,
          name: pkg.name,
          complexity: "complex",
          quantity: 1,
          unitSetupFee: 1_000_000,
          unitMonthlyFee: 200_000,
        },
        {
          packageId: null,
          name: "추가 연동",
          complexity: "normal",
          quantity: 2,
          unitSetupFee: 300_000,
          unitMonthlyFee: 0,
        },
      ],
    });
    const quote = await getQuote(t.db, t.workspaceId, id);
    expect(quote?.number).toMatch(/^Q-2026-\d{4}$/);
    expect(quote?.validUntil).toBe("2026-10-24");
    expect(quote?.totals.setup).toEqual({ supply: 2_100_000, vat: 210_000, total: 2_310_000 });
    expect(quote?.totals.monthly).toEqual({ supply: 300_000, vat: 30_000, total: 330_000 });

    await expect(convertQuoteToProject(t.db, t.workspaceId, id)).rejects.toThrow("수락된 견적만");
    await setQuoteStatus(t.db, t.workspaceId, id, "accepted");
    const projectId = await convertQuoteToProject(t.db, t.workspaceId, id);
    expect(projectId).toBeDefined();
    expect(await convertQuoteToProject(t.db, t.workspaceId, id)).toBe(projectId);
    const project = await getProject(t.db, t.workspaceId, projectId as string);
    expect(project).toMatchObject({
      clientName: "테스트상사",
      stage: "waiting",
      setupFee: 2_100_000,
      monthlyFee: 300_000,
    });
    expect(project?.packages.map((p) => p.id)).toEqual([pkg.id]);
    expect(project?.quote?.id).toBe(id);
  });

  it("moves a project along the line into the maintenance loop", async () => {
    const id = await createProject(
      t.db,
      t.workspaceId,
      {
        clientName: "순환상회",
        industry: "retail",
        stage: "deployment",
        progress: 90,
        assignee: "김자동",
        startDate: null,
        dueDate: null,
        notes: "",
        packageIds: [],
        setupFee: 0,
        monthlyFee: 100_000,
        maintenanceStatus: "none",
        maintenanceStartedOn: null,
      },
      today,
    );
    const before = (await getDashboard(t.db, t.workspaceId, today)).mrr;
    expect(await advanceProject(t.db, t.workspaceId, id, today)).toBe("maintenance");
    const after = await getDashboard(t.db, t.workspaceId, today);
    expect(after.mrr).toBe(before + 100_000);
    await expect(advanceProject(t.db, t.workspaceId, id, today)).rejects.toThrow("종착역");

    await setMaintenanceStatus(t.db, t.workspaceId, id, "ended", today);
    const [row] = await t.db.select().from(projects).where(eq(projects.id, id));
    expect(row).toMatchObject({ maintenanceStatus: "ended", maintenanceStartedOn: today, maintenanceEndedOn: today });
    expect((await getDashboard(t.db, t.workspaceId, today)).mrr).toBe(before);
  });

  it("saves a workflow graph and reloads it with database ids", async () => {
    const id = await createWorkflow(t.db, t.workspaceId, {
      name: "새 노선",
      platform: "make",
      template: "sheet-report",
    });
    const loaded = await getWorkflow(t.db, t.workspaceId, id);
    expect(loaded?.graph.nodes).toHaveLength(5);
    expect(loaded?.graph.edges).toHaveLength(4);

    const ok = await saveWorkflow(t.db, t.workspaceId, {
      id,
      name: "새 노선 (수정)",
      description: "",
      platform: "n8n",
      projectId: null,
      graph: {
        nodes: [
          { key: "x", kind: "trigger", app: "webhook", label: "주문 웹훅", column: 0, lane: 0 },
          { key: "y", kind: "action", app: "kakao", label: "알림톡", column: 1, lane: 1 },
        ],
        edges: [{ from: "x", to: "y", label: "" }],
      },
    });
    expect(ok).toBe(true);
    const saved = await getWorkflow(t.db, t.workspaceId, id);
    expect(saved).toMatchObject({ name: "새 노선 (수정)", platform: "n8n" });
    expect(saved?.graph.nodes.map((n) => n.label).sort()).toEqual(["알림톡", "주문 웹훅"]);
    expect(saved?.graph.edges).toHaveLength(1);

    await expect(
      saveWorkflow(t.db, t.workspaceId, {
        id,
        name: "잘못된 노선",
        description: "",
        platform: "n8n",
        projectId: null,
        graph: { nodes: [], edges: [{ from: "a", to: "b", label: "" }] },
      }),
    ).rejects.toThrow();
  });

  it("isolates workspaces", async () => {
    const other = await t.createWorkspace();
    await seedModuleIfNeeded(t.db, automationAgency, other);
    const [mine] = await listProjects(t.db, t.workspaceId);
    expect(await getProject(t.db, other, mine.id)).toBeUndefined();
    expect(await deleteProject(t.db, other, mine.id)).toBe(false);
    const [pkg] = await packageOptions(t.db, t.workspaceId);
    expect(await getPackage(t.db, other, pkg.id)).toBeUndefined();
    await expect(
      createProject(
        t.db,
        other,
        {
          clientName: "남의 패키지",
          industry: "other",
          stage: "waiting",
          progress: 0,
          assignee: "",
          startDate: null,
          dueDate: null,
          notes: "",
          packageIds: [pkg.id],
          setupFee: 0,
          monthlyFee: 0,
          maintenanceStatus: "none",
          maintenanceStartedOn: null,
        },
        today,
      ),
    ).rejects.toThrow("패키지");
  });

  it("stores ROI diagnoses with computed results", async () => {
    await createDiagnosis(t.db, t.workspaceId, {
      clientName: "진단상사",
      contactName: "",
      industry: "it",
      note: "",
      weeklyHours: 20,
      hourlyCost: 30_000,
      automationRate: 50,
      investment: 1_000_000,
      monthlyFee: 100_000,
    });
    const list = await listDiagnoses(t.db, t.workspaceId);
    const saved = list.find((d) => d.clientName === "진단상사");
    expect(saved?.result.paybackMonths).toBe(1);
  });

  it("resets to the demo data", async () => {
    await resetModule(t.db, automationAgency, t.workspaceId);
    expect((await listQuotes(t.db, t.workspaceId)).some((q) => q.clientName === "테스트상사")).toBe(false);
    expect(await listWorkflows(t.db, t.workspaceId)).toHaveLength(4);
  });
});
