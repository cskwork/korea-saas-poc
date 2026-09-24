import { and, eq, sql } from "drizzle-orm";
import type { DateKey } from "../../domain/dates";
import { PLAN_CATEGORY_LABEL, type PlanCategory } from "../../domain/labels";
import type { WorkCalendar } from "../../domain/time";
import { clientNotes, clients, projects } from "../../db/schema";
import type { Db } from "../db";
import { workCalendar } from "./insights";
import { getProfile, type Profile } from "./profile";
import { listPlans, listPortfolio, type PortfolioItem, type ServicePlan } from "./showcase";

/** The public profile page (포트폴리오 · 요금표 · 문의) and the inquiry it collects. */

export interface PublicProfile {
  profile: Profile;
  portfolio: PortfolioItem[];
  plans: ServicePlan[];
  calendar: WorkCalendar;
}

export async function loadPublicProfile(db: Db, workspaceId: string, today: DateKey): Promise<PublicProfile> {
  const [profile, portfolio, plans, { calendar }] = await Promise.all([
    getProfile(db, workspaceId),
    listPortfolio(db, workspaceId, true),
    listPlans(db, workspaceId),
    workCalendar(db, workspaceId, today, 26),
  ]);
  return { profile, portfolio, plans, calendar };
}

export interface InquiryInput {
  name: string;
  company: string;
  email: string;
  phone: string;
  category: PlanCategory | null;
  budget: number;
  message: string;
}

/**
 * A visitor's quote request becomes work in the pipeline: the client (matched by email, or new),
 * a 문의 card on the board and a memo in the client's history.
 */
export async function submitInquiry(db: Db, workspaceId: string, input: InquiryInput, today: DateKey): Promise<{ projectId: string }> {
  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ id: clients.id })
      .from(clients)
      .where(and(eq(clients.workspaceId, workspaceId), sql`lower(${clients.email}) = ${input.email.toLowerCase()}`))
      .limit(1);
    const clientId =
      existing?.id ??
      (
        await tx
          .insert(clients)
          .values({ workspaceId, name: input.name, company: input.company, email: input.email, phone: input.phone, grade: "new" })
          .returning({ id: clients.id })
      )[0].id;

    const column = await tx
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.workspaceId, workspaceId), eq(projects.status, "inquiry")));
    const kind = input.category ? PLAN_CATEGORY_LABEL[input.category] : "개발";
    const [project] = await tx
      .insert(projects)
      .values({
        workspaceId,
        clientId,
        title: `${input.company || input.name} ${kind} 문의`,
        description: input.message,
        status: "inquiry",
        priority: "medium",
        budget: input.budget,
        position: column.length,
      })
      .returning({ id: projects.id });

    await tx.insert(clientNotes).values({
      workspaceId,
      clientId,
      kind: "email",
      body: `공개 페이지 견적 문의: ${input.message}`,
      occurredOn: today,
    });
    return { projectId: project.id };
  });
}
