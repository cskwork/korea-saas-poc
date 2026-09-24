CREATE SCHEMA "ai_content_agency";
--> statement-breakpoint
CREATE TYPE "ai_content_agency"."content_kind" AS ENUM('blog', 'product', 'ad');--> statement-breakpoint
CREATE TYPE "ai_content_agency"."content_length" AS ENUM('short', 'medium', 'long');--> statement-breakpoint
CREATE TYPE "ai_content_agency"."draft_source" AS ENUM('claude', 'template', 'edit');--> statement-breakpoint
CREATE TYPE "ai_content_agency"."order_status" AS ENUM('received', 'writing', 'review', 'delivered');--> statement-breakpoint
CREATE TYPE "ai_content_agency"."plan_id" AS ENUM('starter', 'pro', 'enterprise');--> statement-breakpoint
CREATE TYPE "ai_content_agency"."tone" AS ENUM('friendly', 'professional', 'emotional', 'witty');--> statement-breakpoint
CREATE TABLE "ai_content_agency"."draft_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"draft_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"source" "ai_content_agency"."draft_source" NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_content_agency"."drafts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"order_id" uuid,
	"kind" "ai_content_agency"."content_kind" NOT NULL,
	"topic" text NOT NULL,
	"tone" "ai_content_agency"."tone" NOT NULL,
	"length" "ai_content_agency"."content_length" NOT NULL,
	"keywords" text[] DEFAULT '{}' NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"current_version" integer DEFAULT 1 NOT NULL,
	"source" "ai_content_agency"."draft_source" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_content_agency"."inquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"company_name" text NOT NULL,
	"contact_name" text NOT NULL,
	"email" text NOT NULL,
	"monthly_volume" integer NOT NULL,
	"message" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_content_agency"."order_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"order_id" uuid NOT NULL,
	"status" "ai_content_agency"."order_status" NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_content_agency"."orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"number" integer NOT NULL,
	"client_name" text NOT NULL,
	"industry" text NOT NULL,
	"contact_name" text DEFAULT '' NOT NULL,
	"contact_email" text DEFAULT '' NOT NULL,
	"kind" "ai_content_agency"."content_kind" NOT NULL,
	"topic" text NOT NULL,
	"brief" text DEFAULT '' NOT NULL,
	"keywords" text[] DEFAULT '{}' NOT NULL,
	"tone" "ai_content_agency"."tone" NOT NULL,
	"length" "ai_content_agency"."content_length" NOT NULL,
	"status" "ai_content_agency"."order_status" DEFAULT 'received' NOT NULL,
	"due_date" date NOT NULL,
	"delivered_at" timestamp with time zone,
	"delivered_draft_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_content_agency"."plan_changes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"plan" "ai_content_agency"."plan_id" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_content_agency"."portfolio_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"industry" text NOT NULL,
	"kind" "ai_content_agency"."content_kind" NOT NULL,
	"title" text NOT NULL,
	"client_label" text NOT NULL,
	"summary" text NOT NULL,
	"excerpt" text NOT NULL,
	"draft_id" uuid,
	"is_sample" boolean DEFAULT false NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_content_agency"."draft_versions" ADD CONSTRAINT "draft_versions_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_content_agency"."draft_versions" ADD CONSTRAINT "draft_versions_draft_id_drafts_id_fk" FOREIGN KEY ("draft_id") REFERENCES "ai_content_agency"."drafts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_content_agency"."drafts" ADD CONSTRAINT "drafts_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_content_agency"."drafts" ADD CONSTRAINT "drafts_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "ai_content_agency"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_content_agency"."inquiries" ADD CONSTRAINT "inquiries_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_content_agency"."order_events" ADD CONSTRAINT "order_events_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_content_agency"."order_events" ADD CONSTRAINT "order_events_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "ai_content_agency"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_content_agency"."orders" ADD CONSTRAINT "orders_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_content_agency"."orders" ADD CONSTRAINT "orders_delivered_draft_id_drafts_id_fk" FOREIGN KEY ("delivered_draft_id") REFERENCES "ai_content_agency"."drafts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_content_agency"."plan_changes" ADD CONSTRAINT "plan_changes_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_content_agency"."portfolio_items" ADD CONSTRAINT "portfolio_items_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_content_agency"."portfolio_items" ADD CONSTRAINT "portfolio_items_draft_id_drafts_id_fk" FOREIGN KEY ("draft_id") REFERENCES "ai_content_agency"."drafts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "draft_versions_draft_version_idx" ON "ai_content_agency"."draft_versions" USING btree ("draft_id","version");--> statement-breakpoint
CREATE INDEX "drafts_workspace_updated_idx" ON "ai_content_agency"."drafts" USING btree ("workspace_id","updated_at");--> statement-breakpoint
CREATE INDEX "drafts_order_idx" ON "ai_content_agency"."drafts" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_events_order_idx" ON "ai_content_agency"."order_events" USING btree ("workspace_id","order_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_workspace_number_idx" ON "ai_content_agency"."orders" USING btree ("workspace_id","number");--> statement-breakpoint
CREATE INDEX "orders_workspace_status_idx" ON "ai_content_agency"."orders" USING btree ("workspace_id","status","due_date");--> statement-breakpoint
CREATE INDEX "plan_changes_workspace_idx" ON "ai_content_agency"."plan_changes" USING btree ("workspace_id","created_at");--> statement-breakpoint
CREATE INDEX "portfolio_workspace_idx" ON "ai_content_agency"."portfolio_items" USING btree ("workspace_id","industry");