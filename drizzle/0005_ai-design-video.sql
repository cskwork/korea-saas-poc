CREATE SCHEMA "ai_design_video";
--> statement-breakpoint
CREATE TYPE "ai_design_video"."brief_source" AS ENUM('claude', 'template');--> statement-breakpoint
CREATE TYPE "ai_design_video"."order_status" AS ENUM('received', 'drafting', 'revision', 'delivered');--> statement-breakpoint
CREATE TYPE "ai_design_video"."order_type" AS ENUM('thumbnail', 'banner', 'detail_page', 'short_form', 'video_edit', 'logo', 'bundle');--> statement-breakpoint
CREATE TYPE "ai_design_video"."plan_kind" AS ENUM('single', 'subscription');--> statement-breakpoint
CREATE TABLE "ai_design_video"."briefs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"order_id" uuid NOT NULL,
	"source" "ai_design_video"."brief_source" NOT NULL,
	"concepts" jsonb NOT NULL,
	"copy_lines" jsonb NOT NULL,
	"storyboard" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_design_video"."order_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"order_id" uuid NOT NULL,
	"from_status" "ai_design_video"."order_status",
	"to_status" "ai_design_video"."order_status" NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_design_video"."orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"code" text NOT NULL,
	"client_name" text NOT NULL,
	"client_contact" text DEFAULT '' NOT NULL,
	"type" "ai_design_video"."order_type" NOT NULL,
	"title" text NOT NULL,
	"brief" text DEFAULT '' NOT NULL,
	"reference_links" text[] DEFAULT '{}'::text[] NOT NULL,
	"package_id" uuid,
	"package_name" text NOT NULL,
	"plan" "ai_design_video"."plan_kind" NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"rush" boolean DEFAULT false NOT NULL,
	"price" integer NOT NULL,
	"extra_fees" integer DEFAULT 0 NOT NULL,
	"revision_limit" integer,
	"revisions_used" integer DEFAULT 0 NOT NULL,
	"status" "ai_design_video"."order_status" DEFAULT 'received' NOT NULL,
	"due_date" date NOT NULL,
	"tools" text[] DEFAULT '{}'::text[] NOT NULL,
	"delivered_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_design_video"."packages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"kind" "ai_design_video"."plan_kind" NOT NULL,
	"order_type" "ai_design_video"."order_type",
	"name" text NOT NULL,
	"price" integer NOT NULL,
	"unit" text NOT NULL,
	"summary" text NOT NULL,
	"includes" text[] DEFAULT '{}'::text[] NOT NULL,
	"revision_limit" integer,
	"turnaround_days" integer NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_design_video"."portfolio_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"order_id" uuid,
	"title" text NOT NULL,
	"category" "ai_design_video"."order_type" NOT NULL,
	"client_label" text NOT NULL,
	"headline" text NOT NULL,
	"summary" text NOT NULL,
	"tools" text[] DEFAULT '{}'::text[] NOT NULL,
	"palette" text[] DEFAULT '{}'::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_design_video"."revisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"order_id" uuid NOT NULL,
	"round" integer NOT NULL,
	"note" text NOT NULL,
	"extra_fee" integer DEFAULT 0 NOT NULL,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "ai_design_video"."studio_settings" (
	"workspace_id" uuid PRIMARY KEY NOT NULL,
	"monthly_goal" integer NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_design_video"."briefs" ADD CONSTRAINT "briefs_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_design_video"."briefs" ADD CONSTRAINT "briefs_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "ai_design_video"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_design_video"."order_events" ADD CONSTRAINT "order_events_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_design_video"."order_events" ADD CONSTRAINT "order_events_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "ai_design_video"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_design_video"."orders" ADD CONSTRAINT "orders_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_design_video"."orders" ADD CONSTRAINT "orders_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "ai_design_video"."packages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_design_video"."packages" ADD CONSTRAINT "packages_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_design_video"."portfolio_items" ADD CONSTRAINT "portfolio_items_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_design_video"."portfolio_items" ADD CONSTRAINT "portfolio_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "ai_design_video"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_design_video"."revisions" ADD CONSTRAINT "revisions_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_design_video"."revisions" ADD CONSTRAINT "revisions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "ai_design_video"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_design_video"."studio_settings" ADD CONSTRAINT "studio_settings_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "briefs_workspace_id_order_id_created_at_index" ON "ai_design_video"."briefs" USING btree ("workspace_id","order_id","created_at");--> statement-breakpoint
CREATE INDEX "order_events_workspace_id_order_id_created_at_index" ON "ai_design_video"."order_events" USING btree ("workspace_id","order_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_workspace_id_code_index" ON "ai_design_video"."orders" USING btree ("workspace_id","code");--> statement-breakpoint
CREATE INDEX "orders_workspace_id_status_due_date_index" ON "ai_design_video"."orders" USING btree ("workspace_id","status","due_date");--> statement-breakpoint
CREATE INDEX "orders_workspace_id_delivered_at_index" ON "ai_design_video"."orders" USING btree ("workspace_id","delivered_at");--> statement-breakpoint
CREATE INDEX "packages_workspace_id_kind_sort_order_index" ON "ai_design_video"."packages" USING btree ("workspace_id","kind","sort_order");--> statement-breakpoint
CREATE INDEX "portfolio_items_workspace_id_category_created_at_index" ON "ai_design_video"."portfolio_items" USING btree ("workspace_id","category","created_at");--> statement-breakpoint
CREATE INDEX "revisions_workspace_id_order_id_index" ON "ai_design_video"."revisions" USING btree ("workspace_id","order_id");