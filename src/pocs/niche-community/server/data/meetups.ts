import "server-only";
import { and, asc, count, eq, gt, sql } from "drizzle-orm";
import { UserError } from "@/core/actions";
import { meetups, members, rsvps } from "../../db/schema";
import type { MeetupInput } from "../../domain/inputs";
import { cancelProblem, joinProblem } from "../../domain/meetups";
import { isOperator, type Viewer } from "../../domain/rules";
import { seoulInstant } from "../../domain/time";
import type { Db } from "./db";
import type { MeetupDetail, MeetupView } from "../types";

const viewerGoing = (memberId: string) => sql<boolean>`coalesce(bool_or(${rsvps.memberId} = ${memberId}), false)`;

function meetupSelect(viewer: Viewer) {
  return {
    id: meetups.id,
    title: meetups.title,
    description: meetups.description,
    startsAt: meetups.startsAt,
    durationMinutes: meetups.durationMinutes,
    location: meetups.location,
    format: meetups.format,
    capacity: meetups.capacity,
    access: meetups.access,
    going: count(rsvps.id),
    viewerGoing: viewerGoing(viewer.id),
  };
}

/** Meetups with their RSVP count and whether the viewer is going (one grouped query). */
function selectMeetups(db: Db, viewer: Viewer) {
  return db.select(meetupSelect(viewer)).from(meetups).leftJoin(rsvps, eq(rsvps.meetupId, meetups.id));
}

const normalize = <T extends { viewerGoing: unknown }>(row: T) => ({ ...row, viewerGoing: Boolean(row.viewerGoing) });

export async function loadMeetups(db: Db, workspaceId: string, viewer: Viewer): Promise<MeetupView[]> {
  const rows = await selectMeetups(db, viewer)
    .where(eq(meetups.workspaceId, workspaceId))
    .groupBy(meetups.id)
    .orderBy(asc(meetups.startsAt));
  return rows.map(normalize);
}

/** The next meetup that has not started yet (the stage band's countdown). */
export async function loadNextMeetup(db: Db, workspaceId: string, viewer: Viewer, now: Date): Promise<MeetupView | null> {
  const [row] = await selectMeetups(db, viewer)
    .where(and(eq(meetups.workspaceId, workspaceId), gt(meetups.startsAt, now)))
    .groupBy(meetups.id)
    .orderBy(asc(meetups.startsAt))
    .limit(1);
  return row ? normalize(row) : null;
}

export async function loadMeetup(db: Db, workspaceId: string, viewer: Viewer, meetupId: string): Promise<MeetupDetail | null> {
  const [row] = await selectMeetups(db, viewer)
    .where(and(eq(meetups.id, meetupId), eq(meetups.workspaceId, workspaceId)))
    .groupBy(meetups.id)
    .limit(1);
  if (!row) return null;
  const attendees = await db
    .select({ id: members.id, nickname: members.nickname, headline: members.headline, role: members.role, tier: members.tier })
    .from(rsvps)
    .innerJoin(members, eq(members.id, rsvps.memberId))
    .where(and(eq(rsvps.meetupId, meetupId), eq(rsvps.workspaceId, workspaceId)))
    .orderBy(asc(rsvps.createdAt));
  return { ...normalize(row), attendees };
}

function requireOperator(viewer: Viewer) {
  if (!isOperator(viewer)) throw new UserError("모임 개설과 수정은 운영자 명찰로만 할 수 있어요.");
}

function toValues(input: MeetupInput) {
  const { date, time, ...rest } = input;
  return { ...rest, startsAt: seoulInstant(date, time) };
}

export async function createMeetup(db: Db, workspaceId: string, viewer: Viewer, input: MeetupInput, now: Date) {
  requireOperator(viewer);
  const values = toValues(input);
  if (values.startsAt.getTime() <= now.getTime()) throw new UserError("시작 시간은 지금 이후로 잡아 주세요.");
  const [created] = await db
    .insert(meetups)
    .values({ workspaceId, ...values })
    .returning({ id: meetups.id });
  return created.id;
}

export async function updateMeetup(db: Db, workspaceId: string, viewer: Viewer, input: MeetupInput & { id: string }) {
  requireOperator(viewer);
  const { id, ...rest } = input;
  const [current] = await db
    .select({ going: count(rsvps.id) })
    .from(meetups)
    .leftJoin(rsvps, eq(rsvps.meetupId, meetups.id))
    .where(and(eq(meetups.id, id), eq(meetups.workspaceId, workspaceId)))
    .groupBy(meetups.id);
  if (!current) throw new UserError("모임을 찾을 수 없어요.");
  if (rest.capacity < current.going) {
    throw new UserError(`이미 ${current.going}명이 신청했어요. 정원을 ${current.going}명 이상으로 잡아 주세요.`);
  }
  await db
    .update(meetups)
    .set(toValues(rest))
    .where(and(eq(meetups.id, id), eq(meetups.workspaceId, workspaceId)));
}

export async function deleteMeetup(db: Db, workspaceId: string, viewer: Viewer, meetupId: string) {
  requireOperator(viewer);
  const deleted = await db
    .delete(meetups)
    .where(and(eq(meetups.id, meetupId), eq(meetups.workspaceId, workspaceId)))
    .returning({ id: meetups.id });
  if (deleted.length === 0) throw new UserError("모임을 찾을 수 없어요.");
}

/** RSVP (참석 신청) or cancel it. Capacity is re-checked inside a transaction. */
export async function setRsvp(db: Db, workspaceId: string, viewer: Viewer, meetupId: string, going: boolean, now: Date) {
  await db.transaction(async (tx) => {
    // Lock the meetup row so two last-seat requests cannot both pass the capacity check.
    const [meetup] = await tx
      .select({
        startsAt: meetups.startsAt,
        durationMinutes: meetups.durationMinutes,
        capacity: meetups.capacity,
        access: meetups.access,
      })
      .from(meetups)
      .where(and(eq(meetups.id, meetupId), eq(meetups.workspaceId, workspaceId)))
      .limit(1)
      .for("update");
    if (!meetup) throw new UserError("모임을 찾을 수 없어요.");
    const attendees = await tx
      .select({ memberId: rsvps.memberId })
      .from(rsvps)
      .where(and(eq(rsvps.meetupId, meetupId), eq(rsvps.workspaceId, workspaceId)));
    const alreadyGoing = attendees.some((row) => row.memberId === viewer.id);
    const problem = going
      ? joinProblem({ meetup, viewer, going: attendees.length, alreadyGoing, now })
      : cancelProblem({ meetup, alreadyGoing, now });
    if (problem) throw new UserError(problem);
    if (going) {
      await tx.insert(rsvps).values({ workspaceId, meetupId, memberId: viewer.id, createdAt: now });
    } else {
      await tx
        .delete(rsvps)
        .where(and(eq(rsvps.meetupId, meetupId), eq(rsvps.memberId, viewer.id), eq(rsvps.workspaceId, workspaceId)));
    }
  });
}
