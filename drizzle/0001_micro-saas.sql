CREATE SCHEMA "micro_saas";
--> statement-breakpoint
CREATE TYPE "micro_saas"."booking_source" AS ENUM('owner', 'online');--> statement-breakpoint
CREATE TYPE "micro_saas"."booking_status" AS ENUM('pending', 'confirmed', 'cancelled');--> statement-breakpoint
CREATE TYPE "micro_saas"."plan_tier" AS ENUM('free', 'pro', 'business');--> statement-breakpoint
CREATE TABLE "micro_saas"."bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"service_id" uuid,
	"service_name" text NOT NULL,
	"price" integer NOT NULL,
	"duration_minutes" integer NOT NULL,
	"date" date NOT NULL,
	"start_minute" integer NOT NULL,
	"status" "micro_saas"."booking_status" DEFAULT 'pending' NOT NULL,
	"source" "micro_saas"."booking_source" DEFAULT 'owner' NOT NULL,
	"memo" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "micro_saas"."customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"memo" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "micro_saas"."services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"name" text NOT NULL,
	"duration_minutes" integer NOT NULL,
	"price" integer NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "micro_saas"."shops" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"owner_name" text NOT NULL,
	"phone" text NOT NULL,
	"address" text NOT NULL,
	"open_minute" integer NOT NULL,
	"close_minute" integer NOT NULL,
	"seats" integer DEFAULT 1 NOT NULL,
	"closed_weekdays" integer[] DEFAULT '{}'::integer[] NOT NULL,
	"cancel_policy" text DEFAULT '' NOT NULL,
	"plan" "micro_saas"."plan_tier" DEFAULT 'free' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "micro_saas"."bookings" ADD CONSTRAINT "bookings_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "micro_saas"."bookings" ADD CONSTRAINT "bookings_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "micro_saas"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "micro_saas"."bookings" ADD CONSTRAINT "bookings_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "micro_saas"."services"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "micro_saas"."customers" ADD CONSTRAINT "customers_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "micro_saas"."services" ADD CONSTRAINT "services_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "micro_saas"."shops" ADD CONSTRAINT "shops_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bookings_workspace_date_idx" ON "micro_saas"."bookings" USING btree ("workspace_id","date","start_minute");--> statement-breakpoint
CREATE INDEX "bookings_workspace_customer_idx" ON "micro_saas"."bookings" USING btree ("workspace_id","customer_id");--> statement-breakpoint
CREATE UNIQUE INDEX "customers_workspace_phone_uq" ON "micro_saas"."customers" USING btree ("workspace_id","phone");--> statement-breakpoint
CREATE INDEX "services_workspace_idx" ON "micro_saas"."services" USING btree ("workspace_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "shops_workspace_uq" ON "micro_saas"."shops" USING btree ("workspace_id");