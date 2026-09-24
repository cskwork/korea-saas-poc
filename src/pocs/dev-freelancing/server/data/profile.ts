import { eq } from "drizzle-orm";
import type { TaxMode } from "../../domain/money";
import { profiles } from "../../db/schema";
import type { Db } from "../db";

export type Profile = typeof profiles.$inferSelect;

export interface ProfileInput {
  displayName: string;
  businessName: string;
  headline: string;
  bio: string;
  email: string;
  phone: string;
  businessNumber: string | null;
  taxMode: TaxMode;
  bankAccount: string;
  hourlyRate: number;
  monthlyGoal: number;
}

const DEFAULT_PROFILE: ProfileInput = {
  displayName: "이름을 입력하세요",
  businessName: "",
  headline: "",
  bio: "",
  email: "",
  phone: "",
  businessNumber: null,
  taxMode: "withholding",
  bankAccount: "",
  hourlyRate: 60_000,
  monthlyGoal: 5_000_000,
};

/** The workspace's profile; created with defaults if a reset left none. */
export async function getProfile(db: Db, workspaceId: string): Promise<Profile> {
  const [row] = await db.select().from(profiles).where(eq(profiles.workspaceId, workspaceId));
  if (row) return row;
  const [created] = await db
    .insert(profiles)
    .values({ workspaceId, ...DEFAULT_PROFILE })
    .onConflictDoUpdate({ target: profiles.workspaceId, set: { updatedAt: new Date() } })
    .returning();
  return created;
}

export async function saveProfile(db: Db, workspaceId: string, input: ProfileInput): Promise<void> {
  await db
    .insert(profiles)
    .values({ workspaceId, ...input })
    .onConflictDoUpdate({ target: profiles.workspaceId, set: { ...input, updatedAt: new Date() } });
}
