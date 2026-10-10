import { drizzle } from "drizzle-orm/pglite";
import type { PGlite } from "@electric-sql/pglite";
import * as platform from "@/core/db/schema";
import { seedModuleIfNeeded } from "@/core/modules/lifecycle";
import { isWorkspaceId } from "@/core/workspace/constants";
import * as schema from "../db/schema";
import { contentAgency } from "../module";
import type { Db } from "../server/store/db";

const ASSETS = "/geulpum-demo-assets/0.5.8";
const WORKSPACE_KEY = "geulpum-demo-workspace-v1";
export const DEMO_CHANGE_EVENT = "geulpum-demo-change";
export interface DemoContext { db: Db; workspaceId: string; flush(): Promise<void> }
let context: Promise<DemoContext> | undefined;
let closing: Promise<void> | undefined;

/** The same migrations, seed and tenant-scoped stores as the server, on a private browser database. */
export async function bootstrapDemoDatabase(client: PGlite, workspaceId: string, migrationSql: string): Promise<DemoContext> {
  const db = drizzle({ client, schema, casing: "snake_case" }) as unknown as Db;
  await client.exec("CREATE TABLE IF NOT EXISTS geulpum_demo_schema (version integer PRIMARY KEY)");
  await client.transaction(async (tx) => {
    const { rows } = await tx.query("SELECT version FROM geulpum_demo_schema WHERE version = 1");
    if (!rows.length) {
      await tx.exec(migrationSql);
      await tx.exec("INSERT INTO geulpum_demo_schema (version) VALUES (1)");
    }
  });
  await db.insert(platform.workspaces).values({ id: workspaceId }).onConflictDoNothing();
  await seedModuleIfNeeded(db, contentAgency, workspaceId);
  // PGlite 0.5.8 transactions commit without awaiting an IDBFS sync. Persist before showing seeded data.
  await client.syncToFs();
  return { db, workspaceId, flush: () => client.syncToFs() };
}

async function fetchAsset(name: string) {
  const response = await fetch(`${ASSETS}/${name}`);
  if (!response.ok) throw new Error(`브라우저 데모 파일을 불러오지 못했어요 (${name}, ${response.status}).`);
  return response;
}

async function openBrowserDatabase(): Promise<DemoContext> {
  if (!globalThis.indexedDB || !navigator.locks) {
    throw new Error("이 브라우저에서는 데모를 안전하게 저장할 수 없어요. IndexedDB와 Web Locks를 지원하는 브라우저로 열어 주세요.");
  }
  let workspaceId = localStorage.getItem(WORKSPACE_KEY);
  if (!isWorkspaceId(workspaceId)) {
    workspaceId = crypto.randomUUID();
    localStorage.setItem(WORKSPACE_KEY, workspaceId);
  }
  const id = workspaceId;
  // IDBFS allows one writer. Hold the lock until this document leaves; never silently use volatile storage.
  let release!: () => void;
  const lifetime = new Promise<void>((resolve) => { release = resolve; });
  return new Promise<DemoContext>((resolve, reject) => {
    void navigator.locks.request("geulpum-demo-database-v1", { signal: AbortSignal.timeout(2000) }, async (lock) => {
      if (!lock) {
        reject(new Error("글품 데모가 다른 탭에서 열려 있어요. 다른 글품 탭을 닫고 다시 시도해 주세요."));
        return;
      }
      let client: PGlite | undefined;
      let clientClose: Promise<void> | undefined;
      try {
        const [{ PGlite }, wasm, initdb, bundle, sql] = await Promise.all([
          import("@electric-sql/pglite"),
          fetchAsset("pglite.wasm").then((r) => r.arrayBuffer()).then((b) => WebAssembly.compile(b)),
          fetchAsset("initdb.wasm").then((r) => r.arrayBuffer()).then((b) => WebAssembly.compile(b)),
          fetchAsset("pglite.data").then((r) => r.blob()),
          fetchAsset("schema.sql").then((r) => r.text()),
        ]);
        client = new PGlite(`idb://geulpum-demo-v1-${id}`, {
          pgliteWasmModule: wasm, initdbWasmModule: initdb, fsBundle: bundle, relaxedDurability: false,
        });
        await client.waitReady;
        const ready = await bootstrapDemoDatabase(client, id, sql);
        window.addEventListener("pagehide", () => {
          context = undefined;
          clientClose = client!.close();
          closing = clientClose;
          release();
        }, { once: true });
        window.addEventListener("pageshow", (event) => { if (event.persisted) refreshDemo(); }, { once: true });
        resolve(ready);
        await lifetime;
      } catch (error) {
        reject(error);
      } finally {
        if (client && !client.closed) await (clientClose ?? client.close());
      }
    }).catch((error: unknown) => {
      reject(error instanceof DOMException && (error.name === "TimeoutError" || error.name === "AbortError")
        ? new Error("글품 데모가 다른 탭에서 열려 있어요. 다른 글품 탭을 닫고 다시 시도해 주세요.")
        : error);
    });
  });
}

export function getDemoContext(): Promise<DemoContext> {
  if (!context) context = (async () => {
    await closing;
    return openBrowserDatabase();
  })().catch((error: unknown) => { context = undefined; throw error; });
  return context;
}

export function refreshDemo() {
  window.dispatchEvent(new Event(DEMO_CHANGE_EVENT));
}

/** Successful actions must persist before announcing success or leaving this document. */
export async function persistDemoChanges() {
  await (await getDemoContext()).flush();
}
