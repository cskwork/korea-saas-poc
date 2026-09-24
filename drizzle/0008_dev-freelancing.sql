CREATE SCHEMA "dev_freelancing";
--> statement-breakpoint
CREATE TYPE "dev_freelancing"."client_grade" AS ENUM('new', 'regular', 'vip');--> statement-breakpoint
CREATE TYPE "dev_freelancing"."estimate_status" AS ENUM('draft', 'sent', 'accepted', 'declined', 'invoiced');--> statement-breakpoint
CREATE TYPE "dev_freelancing"."invoice_status" AS ENUM('issued', 'awaiting', 'paid');--> statement-breakpoint
CREATE TYPE "dev_freelancing"."line_unit" AS ENUM('hour', 'lump');--> statement-breakpoint
CREATE TYPE "dev_freelancing"."note_kind" AS ENUM('call', 'meeting', 'email', 'memo');--> statement-breakpoint
CREATE TYPE "dev_freelancing"."plan_category" AS ENUM('website', 'app', 'nocode');--> statement-breakpoint
CREATE TYPE "dev_freelancing"."priority" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "dev_freelancing"."project_status" AS ENUM('inquiry', 'progress', 'review', 'done');--> statement-breakpoint
CREATE TYPE "dev_freelancing"."tax_mode" AS ENUM('withholding', 'vat', 'none');--> statement-breakpoint
CREATE TABLE "dev_freelancing"."client_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"kind" "dev_freelancing"."note_kind" DEFAULT 'memo' NOT NULL,
	"body" text NOT NULL,
	"occurred_on" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dev_freelancing"."clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"name" text NOT NULL,
	"company" text DEFAULT '' NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"grade" "dev_freelancing"."client_grade" DEFAULT 'new' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dev_freelancing"."estimate_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"title" text NOT NULL,
	"unit" "dev_freelancing"."line_unit" DEFAULT 'hour' NOT NULL,
	"quantity" numeric(8, 2) NOT NULL,
	"unit_price" integer NOT NULL,
	"estimate_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dev_freelancing"."estimates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"client_id" uuid,
	"project_id" uuid,
	"number" text NOT NULL,
	"title" text NOT NULL,
	"status" "dev_freelancing"."estimate_status" DEFAULT 'draft' NOT NULL,
	"tax_mode" "dev_freelancing"."tax_mode" DEFAULT 'withholding' NOT NULL,
	"discount" integer DEFAULT 0 NOT NULL,
	"issued_on" date NOT NULL,
	"valid_until" date NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"sent_at" timestamp with time zone,
	"decided_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dev_freelancing"."invoice_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"title" text NOT NULL,
	"unit" "dev_freelancing"."line_unit" DEFAULT 'hour' NOT NULL,
	"quantity" numeric(8, 2) NOT NULL,
	"unit_price" integer NOT NULL,
	"invoice_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dev_freelancing"."invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"client_id" uuid,
	"project_id" uuid,
	"estimate_id" uuid,
	"number" text NOT NULL,
	"title" text NOT NULL,
	"status" "dev_freelancing"."invoice_status" DEFAULT 'issued' NOT NULL,
	"tax_mode" "dev_freelancing"."tax_mode" DEFAULT 'withholding' NOT NULL,
	"discount" integer DEFAULT 0 NOT NULL,
	"issued_on" date NOT NULL,
	"due_on" date NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"sent_at" timestamp with time zone,
	"paid_on" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dev_freelancing"."milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"title" text NOT NULL,
	"estimated_hours" numeric(6, 1),
	"due_on" date,
	"position" integer DEFAULT 0 NOT NULL,
	"done_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dev_freelancing"."portfolio_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"project_id" uuid,
	"title" text NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"role" text DEFAULT '' NOT NULL,
	"outcome" text DEFAULT '' NOT NULL,
	"stack" text[] DEFAULT '{}' NOT NULL,
	"url" text DEFAULT '' NOT NULL,
	"period" text DEFAULT '' NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dev_freelancing"."profiles" (
	"workspace_id" uuid PRIMARY KEY NOT NULL,
	"display_name" text NOT NULL,
	"business_name" text DEFAULT '' NOT NULL,
	"headline" text DEFAULT '' NOT NULL,
	"bio" text DEFAULT '' NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"business_number" text,
	"tax_mode" "dev_freelancing"."tax_mode" DEFAULT 'withholding' NOT NULL,
	"bank_account" text DEFAULT '' NOT NULL,
	"hourly_rate" integer DEFAULT 60000 NOT NULL,
	"monthly_goal" integer DEFAULT 5000000 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dev_freelancing"."projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"client_id" uuid,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"status" "dev_freelancing"."project_status" DEFAULT 'inquiry' NOT NULL,
	"priority" "dev_freelancing"."priority" DEFAULT 'medium' NOT NULL,
	"budget" integer DEFAULT 0 NOT NULL,
	"start_on" date,
	"due_on" date,
	"position" integer DEFAULT 0 NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dev_freelancing"."service_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"category" "dev_freelancing"."plan_category" NOT NULL,
	"name" text NOT NULL,
	"price" integer NOT NULL,
	"delivery" text DEFAULT '' NOT NULL,
	"features" text[] DEFAULT '{}' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dev_freelancing"."time_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"milestone_id" uuid,
	"worked_on" date NOT NULL,
	"minutes" integer NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"started_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dev_freelancing"."timers" (
	"workspace_id" uuid PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"milestone_id" uuid,
	"note" text DEFAULT '' NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "dev_freelancing"."client_notes" ADD CONSTRAINT "client_notes_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dev_freelancing"."client_notes" ADD CONSTRAINT "client_notes_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "dev_freelancing"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dev_freelancing"."clients" ADD CONSTRAINT "clients_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dev_freelancing"."estimate_items" ADD CONSTRAINT "estimate_items_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dev_freelancing"."estimate_items" ADD CONSTRAINT "estimate_items_estimate_id_estimates_id_fk" FOREIGN KEY ("estimate_id") REFERENCES "dev_freelancing"."estimates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dev_freelancing"."estimates" ADD CONSTRAINT "estimates_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dev_freelancing"."estimates" ADD CONSTRAINT "estimates_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "dev_freelancing"."clients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dev_freelancing"."estimates" ADD CONSTRAINT "estimates_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "dev_freelancing"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dev_freelancing"."invoice_items" ADD CONSTRAINT "invoice_items_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dev_freelancing"."invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "dev_freelancing"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dev_freelancing"."invoices" ADD CONSTRAINT "invoices_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dev_freelancing"."invoices" ADD CONSTRAINT "invoices_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "dev_freelancing"."clients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dev_freelancing"."invoices" ADD CONSTRAINT "invoices_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "dev_freelancing"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dev_freelancing"."invoices" ADD CONSTRAINT "invoices_estimate_id_estimates_id_fk" FOREIGN KEY ("estimate_id") REFERENCES "dev_freelancing"."estimates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dev_freelancing"."milestones" ADD CONSTRAINT "milestones_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dev_freelancing"."milestones" ADD CONSTRAINT "milestones_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "dev_freelancing"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dev_freelancing"."portfolio_items" ADD CONSTRAINT "portfolio_items_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dev_freelancing"."portfolio_items" ADD CONSTRAINT "portfolio_items_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "dev_freelancing"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dev_freelancing"."profiles" ADD CONSTRAINT "profiles_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dev_freelancing"."projects" ADD CONSTRAINT "projects_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dev_freelancing"."projects" ADD CONSTRAINT "projects_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "dev_freelancing"."clients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dev_freelancing"."service_plans" ADD CONSTRAINT "service_plans_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dev_freelancing"."time_entries" ADD CONSTRAINT "time_entries_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dev_freelancing"."time_entries" ADD CONSTRAINT "time_entries_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "dev_freelancing"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dev_freelancing"."time_entries" ADD CONSTRAINT "time_entries_milestone_id_milestones_id_fk" FOREIGN KEY ("milestone_id") REFERENCES "dev_freelancing"."milestones"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dev_freelancing"."timers" ADD CONSTRAINT "timers_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dev_freelancing"."timers" ADD CONSTRAINT "timers_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "dev_freelancing"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dev_freelancing"."timers" ADD CONSTRAINT "timers_milestone_id_milestones_id_fk" FOREIGN KEY ("milestone_id") REFERENCES "dev_freelancing"."milestones"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "client_notes_workspace_id_client_id_index" ON "dev_freelancing"."client_notes" USING btree ("workspace_id","client_id");--> statement-breakpoint
CREATE INDEX "clients_workspace_id_created_at_index" ON "dev_freelancing"."clients" USING btree ("workspace_id","created_at");--> statement-breakpoint
CREATE INDEX "estimate_items_workspace_id_estimate_id_index" ON "dev_freelancing"."estimate_items" USING btree ("workspace_id","estimate_id");--> statement-breakpoint
CREATE UNIQUE INDEX "estimates_workspace_id_number_index" ON "dev_freelancing"."estimates" USING btree ("workspace_id","number");--> statement-breakpoint
CREATE INDEX "estimates_workspace_id_status_index" ON "dev_freelancing"."estimates" USING btree ("workspace_id","status");--> statement-breakpoint
CREATE INDEX "invoice_items_workspace_id_invoice_id_index" ON "dev_freelancing"."invoice_items" USING btree ("workspace_id","invoice_id");--> statement-breakpoint
CREATE UNIQUE INDEX "invoices_workspace_id_number_index" ON "dev_freelancing"."invoices" USING btree ("workspace_id","number");--> statement-breakpoint
CREATE INDEX "invoices_workspace_id_status_index" ON "dev_freelancing"."invoices" USING btree ("workspace_id","status");--> statement-breakpoint
CREATE INDEX "milestones_workspace_id_project_id_position_index" ON "dev_freelancing"."milestones" USING btree ("workspace_id","project_id","position");--> statement-breakpoint
CREATE INDEX "portfolio_items_workspace_id_position_index" ON "dev_freelancing"."portfolio_items" USING btree ("workspace_id","position");--> statement-breakpoint
CREATE INDEX "projects_workspace_id_status_position_index" ON "dev_freelancing"."projects" USING btree ("workspace_id","status","position");--> statement-breakpoint
CREATE INDEX "service_plans_workspace_id_category_position_index" ON "dev_freelancing"."service_plans" USING btree ("workspace_id","category","position");--> statement-breakpoint
CREATE INDEX "time_entries_workspace_id_worked_on_index" ON "dev_freelancing"."time_entries" USING btree ("workspace_id","worked_on");--> statement-breakpoint
CREATE INDEX "time_entries_workspace_id_project_id_index" ON "dev_freelancing"."time_entries" USING btree ("workspace_id","project_id");