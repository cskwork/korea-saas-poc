CREATE SCHEMA "affiliate_marketing";
--> statement-breakpoint
CREATE TYPE "affiliate_marketing"."article_kind" AS ENUM('comparison', 'ranking', 'review');--> statement-breakpoint
CREATE TYPE "affiliate_marketing"."click_channel" AS ENUM('naver_blog', 'tistory', 'instagram', 'threads', 'x', 'youtube', 'kakao', 'direct', 'other');--> statement-breakpoint
CREATE TYPE "affiliate_marketing"."commission_model" AS ENUM('cps', 'cpa', 'cpc');--> statement-breakpoint
CREATE TYPE "affiliate_marketing"."commission_type" AS ENUM('percent', 'fixed');--> statement-breakpoint
CREATE TYPE "affiliate_marketing"."content_source" AS ENUM('claude', 'template');--> statement-breakpoint
CREATE TYPE "affiliate_marketing"."conversion_status" AS ENUM('pending', 'confirmed', 'cancelled');--> statement-breakpoint
CREATE TYPE "affiliate_marketing"."device_kind" AS ENUM('mobile', 'tablet', 'desktop');--> statement-breakpoint
CREATE TYPE "affiliate_marketing"."link_status" AS ENUM('active', 'paused', 'expired');--> statement-breakpoint
CREATE TABLE "affiliate_marketing"."articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"kind" "affiliate_marketing"."article_kind" NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"input" jsonb NOT NULL,
	"source" "affiliate_marketing"."content_source" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "affiliate_marketing"."clicks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"link_id" uuid NOT NULL,
	"clicked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"channel" "affiliate_marketing"."click_channel" NOT NULL,
	"referrer_host" text,
	"device" "affiliate_marketing"."device_kind" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "affiliate_marketing"."conversions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"link_id" uuid NOT NULL,
	"ordered_on" date NOT NULL,
	"order_amount_won" integer NOT NULL,
	"commission_won" integer NOT NULL,
	"commission_overridden" boolean DEFAULT false NOT NULL,
	"status" "affiliate_marketing"."conversion_status" DEFAULT 'pending' NOT NULL,
	"channel" "affiliate_marketing"."click_channel",
	"note" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "affiliate_marketing"."links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"program_id" uuid,
	"code" text NOT NULL,
	"product_name" text NOT NULL,
	"category" text NOT NULL,
	"destination_url" text NOT NULL,
	"price_won" integer,
	"commission_type" "affiliate_marketing"."commission_type" DEFAULT 'percent' NOT NULL,
	"commission_rate_bp" integer DEFAULT 0 NOT NULL,
	"commission_fixed_won" integer DEFAULT 0 NOT NULL,
	"status" "affiliate_marketing"."link_status" DEFAULT 'active' NOT NULL,
	"memo" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "affiliate_marketing"."programs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"name" text NOT NULL,
	"model" "affiliate_marketing"."commission_model" NOT NULL,
	"default_rate_bp" integer DEFAULT 0 NOT NULL,
	"default_fixed_won" integer DEFAULT 0 NOT NULL,
	"settlement_cycle" text DEFAULT '' NOT NULL,
	"min_payout_won" integer DEFAULT 0 NOT NULL,
	"cookie_window" text DEFAULT '' NOT NULL,
	"best_channels" text DEFAULT '' NOT NULL,
	"best_categories" text DEFAULT '' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "affiliate_marketing"."settings" (
	"workspace_id" uuid NOT NULL,
	"monthly_goal_won" integer DEFAULT 500000 NOT NULL,
	CONSTRAINT "settings_workspace_id_pk" PRIMARY KEY("workspace_id")
);
--> statement-breakpoint
CREATE TABLE "affiliate_marketing"."social_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"link_id" uuid,
	"product_name" text NOT NULL,
	"variants" jsonb NOT NULL,
	"source" "affiliate_marketing"."content_source" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "affiliate_marketing"."articles" ADD CONSTRAINT "articles_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_marketing"."clicks" ADD CONSTRAINT "clicks_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_marketing"."clicks" ADD CONSTRAINT "clicks_link_id_links_id_fk" FOREIGN KEY ("link_id") REFERENCES "affiliate_marketing"."links"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_marketing"."conversions" ADD CONSTRAINT "conversions_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_marketing"."conversions" ADD CONSTRAINT "conversions_link_id_links_id_fk" FOREIGN KEY ("link_id") REFERENCES "affiliate_marketing"."links"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_marketing"."links" ADD CONSTRAINT "links_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_marketing"."links" ADD CONSTRAINT "links_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "affiliate_marketing"."programs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_marketing"."programs" ADD CONSTRAINT "programs_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_marketing"."settings" ADD CONSTRAINT "settings_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_marketing"."social_posts" ADD CONSTRAINT "social_posts_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_marketing"."social_posts" ADD CONSTRAINT "social_posts_link_id_links_id_fk" FOREIGN KEY ("link_id") REFERENCES "affiliate_marketing"."links"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "articles_workspace_idx" ON "affiliate_marketing"."articles" USING btree ("workspace_id","updated_at");--> statement-breakpoint
CREATE INDEX "clicks_workspace_time_idx" ON "affiliate_marketing"."clicks" USING btree ("workspace_id","clicked_at");--> statement-breakpoint
CREATE INDEX "clicks_link_time_idx" ON "affiliate_marketing"."clicks" USING btree ("link_id","clicked_at");--> statement-breakpoint
CREATE INDEX "conversions_workspace_day_idx" ON "affiliate_marketing"."conversions" USING btree ("workspace_id","ordered_on");--> statement-breakpoint
CREATE INDEX "conversions_link_idx" ON "affiliate_marketing"."conversions" USING btree ("link_id");--> statement-breakpoint
CREATE UNIQUE INDEX "links_code_unique" ON "affiliate_marketing"."links" USING btree ("code");--> statement-breakpoint
CREATE INDEX "links_workspace_idx" ON "affiliate_marketing"."links" USING btree ("workspace_id","created_at");--> statement-breakpoint
CREATE INDEX "programs_workspace_idx" ON "affiliate_marketing"."programs" USING btree ("workspace_id","position");--> statement-breakpoint
CREATE INDEX "social_posts_workspace_idx" ON "affiliate_marketing"."social_posts" USING btree ("workspace_id","created_at");