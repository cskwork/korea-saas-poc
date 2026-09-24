import { and, asc, eq, max } from "drizzle-orm";
import { UserError } from "@/core/actions";
import type { Database } from "@/core/db/connection";
import type { ServiceInput, ShopInput } from "../../domain/validation";
import { services, shops, type MicroSaasSchema, type PlanTier, type Service, type Shop } from "../../db/schema";

/**
 * Shop settings and the service list. Data functions take `(db, workspaceId, …)` so they can
 * run inside transactions and in integration tests; server actions are thin wrappers.
 */

export type Db = Database<MicroSaasSchema>;

export async function findShop(db: Db, workspaceId: string): Promise<Shop> {
  const [shop] = await db.select().from(shops).where(eq(shops.workspaceId, workspaceId)).limit(1);
  if (!shop) throw new Error(`micro-saas: workspace ${workspaceId} has no shop row`);
  return shop;
}

/** Locks the shop row for the rest of the transaction: bookings for one shop are written one at a time. */
export async function lockShop(db: Db, workspaceId: string): Promise<Shop> {
  const [shop] = await db.select().from(shops).where(eq(shops.workspaceId, workspaceId)).for("update");
  if (!shop) throw new Error(`micro-saas: workspace ${workspaceId} has no shop row`);
  return shop;
}

export async function updateShop(db: Db, workspaceId: string, input: ShopInput): Promise<void> {
  await db
    .update(shops)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(shops.workspaceId, workspaceId));
}

export async function setPlan(db: Db, workspaceId: string, plan: PlanTier): Promise<void> {
  await db.update(shops).set({ plan, updatedAt: new Date() }).where(eq(shops.workspaceId, workspaceId));
}

export async function listServices(db: Db, workspaceId: string, options: { activeOnly?: boolean } = {}): Promise<Service[]> {
  const scope = eq(services.workspaceId, workspaceId);
  return db
    .select()
    .from(services)
    .where(options.activeOnly ? and(scope, eq(services.active, true)) : scope)
    .orderBy(asc(services.position), asc(services.createdAt));
}

export async function findService(db: Db, workspaceId: string, id: string): Promise<Service | undefined> {
  const [service] = await db
    .select()
    .from(services)
    .where(and(eq(services.id, id), eq(services.workspaceId, workspaceId)))
    .limit(1);
  return service;
}

export async function createService(db: Db, workspaceId: string, input: ServiceInput): Promise<Service> {
  const [{ last }] = await db
    .select({ last: max(services.position) })
    .from(services)
    .where(eq(services.workspaceId, workspaceId));
  const [service] = await db
    .insert(services)
    .values({ ...input, workspaceId, position: (last ?? -1) + 1 })
    .returning();
  return service;
}

export async function updateService(
  db: Db,
  workspaceId: string,
  id: string,
  input: ServiceInput & { active: boolean },
): Promise<Service> {
  const [service] = await db
    .update(services)
    .set(input)
    .where(and(eq(services.id, id), eq(services.workspaceId, workspaceId)))
    .returning();
  if (!service) throw new UserError("서비스를 찾을 수 없어요. 새로고침 후 다시 시도해 주세요.");
  return service;
}

/** Deletes a service; past bookings keep their snapshot of its name, price and duration. */
export async function deleteService(db: Db, workspaceId: string, id: string): Promise<Service> {
  const [service] = await db
    .delete(services)
    .where(and(eq(services.id, id), eq(services.workspaceId, workspaceId)))
    .returning();
  if (!service) throw new UserError("서비스를 찾을 수 없어요. 새로고침 후 다시 시도해 주세요.");
  return service;
}
