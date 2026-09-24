import { sql } from "drizzle-orm";
import { boolean, date, index, integer, pgSchema, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { workspaces } from "@/core/db/schema";

/**
 * 예약잇다 tables (Postgres schema `micro_saas`). Every row belongs to a workspace.
 *
 * Times of day are stored as minutes from midnight (`600` = 10:00) so slot and overlap
 * arithmetic stays in integers; calendar days are `date` strings in Asia/Seoul.
 */
export const microSaas = pgSchema("micro_saas");

export const bookingStatus = microSaas.enum("booking_status", ["pending", "confirmed", "cancelled"]);
export const bookingSource = microSaas.enum("booking_source", ["owner", "online"]);
export const planTier = microSaas.enum("plan_tier", ["free", "pro", "business"]);

const tenant = () =>
  uuid()
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" });

const createdAt = () => timestamp({ withTimezone: true }).notNull().defaultNow();

/** The shop's settings: one row per workspace. */
export const shops = microSaas.table(
  "shops",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: tenant(),
    name: text().notNull(),
    category: text().notNull(),
    ownerName: text().notNull(),
    phone: text().notNull(),
    address: text().notNull(),
    openMinute: integer().notNull(),
    closeMinute: integer().notNull(),
    /** How many bookings the shop can serve at the same time (chairs, beds, seats). */
    seats: integer().notNull().default(1),
    /** 0 = 일요일 … 6 = 토요일. */
    closedWeekdays: integer().array().notNull().default(sql`'{}'::integer[]`),
    /** One line printed on 알림톡 confirmations, e.g. "변경/취소는 1시간 전까지 가능합니다." */
    cancelPolicy: text().notNull().default(""),
    plan: planTier().notNull().default("free"),
    createdAt: createdAt(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("shops_workspace_uq").on(t.workspaceId)],
);

export const services = microSaas.table(
  "services",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: tenant(),
    name: text().notNull(),
    durationMinutes: integer().notNull(),
    price: integer().notNull(),
    /** Paused services stay on past bookings but leave the booking page. */
    active: boolean().notNull().default(true),
    position: integer().notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [index("services_workspace_idx").on(t.workspaceId, t.position)],
);

export const customers = microSaas.table(
  "customers",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: tenant(),
    name: text().notNull(),
    /** Normalised Korean format, e.g. "010-1234-5678"; the customer's identity within a shop. */
    phone: text().notNull(),
    memo: text().notNull().default(""),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("customers_workspace_phone_uq").on(t.workspaceId, t.phone)],
);

export const bookings = microSaas.table(
  "bookings",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: tenant(),
    customerId: uuid()
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    serviceId: uuid().references(() => services.id, { onDelete: "set null" }),
    /** Snapshot of the service at booking time, so history survives service edits and deletes. */
    serviceName: text().notNull(),
    price: integer().notNull(),
    durationMinutes: integer().notNull(),
    date: date({ mode: "string" }).notNull(),
    startMinute: integer().notNull(),
    status: bookingStatus().notNull().default("pending"),
    source: bookingSource().notNull().default("owner"),
    memo: text().notNull().default(""),
    createdAt: createdAt(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("bookings_workspace_date_idx").on(t.workspaceId, t.date, t.startMinute),
    index("bookings_workspace_customer_idx").on(t.workspaceId, t.customerId),
  ],
);

export type Shop = typeof shops.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type BookingStatus = (typeof bookingStatus.enumValues)[number];
export type BookingSource = (typeof bookingSource.enumValues)[number];
export type PlanTier = (typeof planTier.enumValues)[number];

export const schema = { microSaas, bookingStatus, bookingSource, planTier, shops, services, customers, bookings };
export type MicroSaasSchema = typeof schema;
