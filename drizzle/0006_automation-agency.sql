CREATE SCHEMA "automation_agency";
--> statement-breakpoint
CREATE TYPE "automation_agency"."complexity" AS ENUM('simple', 'normal', 'complex');--> statement-breakpoint
CREATE TYPE "automation_agency"."industry" AS ENUM('manufacturing', 'retail', 'service', 'it', 'other');--> statement-breakpoint
CREATE TYPE "automation_agency"."lead_status" AS ENUM('new', 'consulting', 'quoted', 'won', 'on_hold');--> statement-breakpoint
CREATE TYPE "automation_agency"."maintenance_status" AS ENUM('none', 'active', 'paused', 'ended');--> statement-breakpoint
CREATE TYPE "automation_agency"."node_kind" AS ENUM('trigger', 'action', 'condition');--> statement-breakpoint
CREATE TYPE "automation_agency"."package_kind" AS ENUM('data', 'communication', 'reporting', 'settlement');--> statement-breakpoint
CREATE TYPE "automation_agency"."platform" AS ENUM('make', 'zapier', 'n8n', 'apps_script');--> statement-breakpoint
CREATE TYPE "automation_agency"."quote_status" AS ENUM('draft', 'sent', 'accepted', 'declined');--> statement-breakpoint
CREATE TYPE "automation_agency"."project_stage" AS ENUM('waiting', 'analysis', 'development', 'testing', 'deployment', 'maintenance');--> statement-breakpoint
CREATE TABLE "automation_agency"."agency_profiles" (
	"workspace_id" uuid PRIMARY KEY NOT NULL,
	"agency_name" text NOT NULL,
	"representative" text NOT NULL,
	"business_number" text DEFAULT '' NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "automation_agency"."diagnoses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"client_name" text NOT NULL,
	"contact_name" text DEFAULT '' NOT NULL,
	"industry" "automation_agency"."industry" DEFAULT 'other' NOT NULL,
	"weekly_hours" integer NOT NULL,
	"hourly_cost" integer NOT NULL,
	"automation_rate" integer NOT NULL,
	"investment" integer NOT NULL,
	"monthly_fee" integer NOT NULL,
	"status" "automation_agency"."lead_status" DEFAULT 'new' NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "automation_agency"."packages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"name" text NOT NULL,
	"industry" "automation_agency"."industry" NOT NULL,
	"kind" "automation_agency"."package_kind" NOT NULL,
	"summary" text NOT NULL,
	"details" text DEFAULT '' NOT NULL,
	"tools" text[] DEFAULT '{}' NOT NULL,
	"build_hours" integer NOT NULL,
	"monthly_hours_saved" integer NOT NULL,
	"setup_fee" integer NOT NULL,
	"monthly_fee" integer NOT NULL,
	"archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "automation_agency"."project_packages" (
	"workspace_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"package_id" uuid NOT NULL,
	CONSTRAINT "project_packages_project_id_package_id_pk" PRIMARY KEY("project_id","package_id")
);
--> statement-breakpoint
CREATE TABLE "automation_agency"."projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"client_name" text NOT NULL,
	"industry" "automation_agency"."industry" DEFAULT 'other' NOT NULL,
	"stage" "automation_agency"."project_stage" DEFAULT 'waiting' NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"assignee" text DEFAULT '' NOT NULL,
	"start_date" date,
	"due_date" date,
	"notes" text DEFAULT '' NOT NULL,
	"setup_fee" integer DEFAULT 0 NOT NULL,
	"monthly_fee" integer DEFAULT 0 NOT NULL,
	"maintenance_status" "automation_agency"."maintenance_status" DEFAULT 'none' NOT NULL,
	"maintenance_started_on" date,
	"maintenance_ended_on" date,
	"quote_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "automation_agency"."quote_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"quote_id" uuid NOT NULL,
	"package_id" uuid,
	"name" text NOT NULL,
	"complexity" "automation_agency"."complexity" DEFAULT 'normal' NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_setup_fee" integer NOT NULL,
	"unit_monthly_fee" integer NOT NULL,
	"position" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "automation_agency"."quotes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"number" text NOT NULL,
	"client_name" text NOT NULL,
	"contact_name" text DEFAULT '' NOT NULL,
	"issued_on" date NOT NULL,
	"valid_until" date NOT NULL,
	"status" "automation_agency"."quote_status" DEFAULT 'draft' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "quotes_workspace_number_uq" UNIQUE("workspace_id","number")
);
--> statement-breakpoint
CREATE TABLE "automation_agency"."workflow_edges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"workflow_id" uuid NOT NULL,
	"from_node_id" uuid NOT NULL,
	"to_node_id" uuid NOT NULL,
	"label" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "automation_agency"."workflow_nodes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"workflow_id" uuid NOT NULL,
	"kind" "automation_agency"."node_kind" NOT NULL,
	"app" text NOT NULL,
	"label" text NOT NULL,
	"column" integer NOT NULL,
	"lane" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "automation_agency"."workflows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"platform" "automation_agency"."platform" NOT NULL,
	"project_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "automation_agency"."agency_profiles" ADD CONSTRAINT "agency_profiles_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_agency"."diagnoses" ADD CONSTRAINT "diagnoses_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_agency"."packages" ADD CONSTRAINT "packages_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_agency"."project_packages" ADD CONSTRAINT "project_packages_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_agency"."project_packages" ADD CONSTRAINT "project_packages_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "automation_agency"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_agency"."project_packages" ADD CONSTRAINT "project_packages_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "automation_agency"."packages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_agency"."projects" ADD CONSTRAINT "projects_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_agency"."projects" ADD CONSTRAINT "projects_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "automation_agency"."quotes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_agency"."quote_items" ADD CONSTRAINT "quote_items_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_agency"."quote_items" ADD CONSTRAINT "quote_items_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "automation_agency"."quotes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_agency"."quote_items" ADD CONSTRAINT "quote_items_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "automation_agency"."packages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_agency"."quotes" ADD CONSTRAINT "quotes_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_agency"."workflow_edges" ADD CONSTRAINT "workflow_edges_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_agency"."workflow_edges" ADD CONSTRAINT "workflow_edges_workflow_id_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "automation_agency"."workflows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_agency"."workflow_edges" ADD CONSTRAINT "workflow_edges_from_node_id_workflow_nodes_id_fk" FOREIGN KEY ("from_node_id") REFERENCES "automation_agency"."workflow_nodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_agency"."workflow_edges" ADD CONSTRAINT "workflow_edges_to_node_id_workflow_nodes_id_fk" FOREIGN KEY ("to_node_id") REFERENCES "automation_agency"."workflow_nodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_agency"."workflow_nodes" ADD CONSTRAINT "workflow_nodes_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_agency"."workflow_nodes" ADD CONSTRAINT "workflow_nodes_workflow_id_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "automation_agency"."workflows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_agency"."workflows" ADD CONSTRAINT "workflows_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_agency"."workflows" ADD CONSTRAINT "workflows_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "automation_agency"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "diagnoses_workspace_idx" ON "automation_agency"."diagnoses" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "packages_workspace_idx" ON "automation_agency"."packages" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "project_packages_workspace_idx" ON "automation_agency"."project_packages" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "projects_workspace_idx" ON "automation_agency"."projects" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "quote_items_quote_idx" ON "automation_agency"."quote_items" USING btree ("quote_id");--> statement-breakpoint
CREATE INDEX "workflow_edges_workflow_idx" ON "automation_agency"."workflow_edges" USING btree ("workflow_id");--> statement-breakpoint
CREATE INDEX "workflow_nodes_workflow_idx" ON "automation_agency"."workflow_nodes" USING btree ("workflow_id");--> statement-breakpoint
CREATE INDEX "workflows_workspace_idx" ON "automation_agency"."workflows" USING btree ("workspace_id");