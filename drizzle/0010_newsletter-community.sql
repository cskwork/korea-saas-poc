CREATE SCHEMA "newsletter_community";
--> statement-breakpoint
CREATE TYPE "newsletter_community"."audience" AS ENUM('everyone', 'paid', 'pro');--> statement-breakpoint
CREATE TYPE "newsletter_community"."author_role" AS ENUM('editor', 'member');--> statement-breakpoint
CREATE TYPE "newsletter_community"."board_category" AS ENUM('notice', 'discussion', 'question');--> statement-breakpoint
CREATE TYPE "newsletter_community"."issue_category" AS ENUM('tech', 'business', 'marketing', 'design', 'lifestyle');--> statement-breakpoint
CREATE TYPE "newsletter_community"."issue_status" AS ENUM('draft', 'scheduled', 'published');--> statement-breakpoint
CREATE TYPE "newsletter_community"."sponsorship_status" AS ENUM('proposed', 'booked', 'paid');--> statement-breakpoint
CREATE TYPE "newsletter_community"."subscriber_source" AS ENUM('manual', 'signup', 'import');--> statement-breakpoint
CREATE TYPE "newsletter_community"."subscriber_status" AS ENUM('active', 'unsubscribed');--> statement-breakpoint
CREATE TYPE "newsletter_community"."tier" AS ENUM('free', 'basic', 'pro');--> statement-breakpoint
CREATE TABLE "newsletter_community"."comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"post_id" uuid NOT NULL,
	"body" text NOT NULL,
	"author_name" text NOT NULL,
	"author_role" "newsletter_community"."author_role" NOT NULL,
	"author_subscriber_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletter_community"."issues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"number" integer,
	"title" text NOT NULL,
	"lede" text DEFAULT '' NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"category" "newsletter_community"."issue_category" NOT NULL,
	"audience" "newsletter_community"."audience" NOT NULL,
	"status" "newsletter_community"."issue_status" DEFAULT 'draft' NOT NULL,
	"scheduled_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "issues_workspaceId_number_unique" UNIQUE("workspace_id","number")
);
--> statement-breakpoint
CREATE TABLE "newsletter_community"."membership_sales" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"item" text NOT NULL,
	"buyer_name" text NOT NULL,
	"amount" integer NOT NULL,
	"sold_on" date NOT NULL,
	"subscriber_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletter_community"."plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"tier" "newsletter_community"."tier" NOT NULL,
	"name" text NOT NULL,
	"price" integer NOT NULL,
	"summary" text NOT NULL,
	"perks" text[] NOT NULL,
	CONSTRAINT "plans_workspaceId_tier_unique" UNIQUE("workspace_id","tier")
);
--> statement-breakpoint
CREATE TABLE "newsletter_community"."post_likes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"post_id" uuid NOT NULL,
	"liker_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "post_likes_postId_likerKey_unique" UNIQUE("post_id","liker_key")
);
--> statement-breakpoint
CREATE TABLE "newsletter_community"."posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"category" "newsletter_community"."board_category" NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"author_name" text NOT NULL,
	"author_role" "newsletter_community"."author_role" NOT NULL,
	"author_subscriber_id" uuid,
	"pinned" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletter_community"."publications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"editor_name" text NOT NULL,
	"send_hour" integer DEFAULT 7 NOT NULL,
	"revenue_goal" integer NOT NULL,
	"paid_goal" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "publications_workspaceId_unique" UNIQUE("workspace_id")
);
--> statement-breakpoint
CREATE TABLE "newsletter_community"."sends" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"issue_id" uuid NOT NULL,
	"subscriber_id" uuid,
	"email" text NOT NULL,
	"tier" "newsletter_community"."tier" NOT NULL,
	"sent_at" timestamp with time zone NOT NULL,
	"opened_at" timestamp with time zone,
	"clicked_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "newsletter_community"."sponsorships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"sponsor_name" text NOT NULL,
	"message" text NOT NULL,
	"amount" integer NOT NULL,
	"run_on" date NOT NULL,
	"status" "newsletter_community"."sponsorship_status" DEFAULT 'proposed' NOT NULL,
	"issue_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletter_community"."subscribers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"tier" "newsletter_community"."tier" NOT NULL,
	"status" "newsletter_community"."subscriber_status" DEFAULT 'active' NOT NULL,
	"source" "newsletter_community"."subscriber_source" NOT NULL,
	"joined_on" date NOT NULL,
	"paid_since" date,
	"unsubscribed_on" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscribers_workspaceId_email_unique" UNIQUE("workspace_id","email")
);
--> statement-breakpoint
ALTER TABLE "newsletter_community"."comments" ADD CONSTRAINT "comments_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "newsletter_community"."comments" ADD CONSTRAINT "comments_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "newsletter_community"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "newsletter_community"."comments" ADD CONSTRAINT "comments_author_subscriber_id_subscribers_id_fk" FOREIGN KEY ("author_subscriber_id") REFERENCES "newsletter_community"."subscribers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "newsletter_community"."issues" ADD CONSTRAINT "issues_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "newsletter_community"."membership_sales" ADD CONSTRAINT "membership_sales_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "newsletter_community"."membership_sales" ADD CONSTRAINT "membership_sales_subscriber_id_subscribers_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "newsletter_community"."subscribers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "newsletter_community"."plans" ADD CONSTRAINT "plans_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "newsletter_community"."post_likes" ADD CONSTRAINT "post_likes_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "newsletter_community"."post_likes" ADD CONSTRAINT "post_likes_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "newsletter_community"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "newsletter_community"."posts" ADD CONSTRAINT "posts_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "newsletter_community"."posts" ADD CONSTRAINT "posts_author_subscriber_id_subscribers_id_fk" FOREIGN KEY ("author_subscriber_id") REFERENCES "newsletter_community"."subscribers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "newsletter_community"."publications" ADD CONSTRAINT "publications_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "newsletter_community"."sends" ADD CONSTRAINT "sends_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "newsletter_community"."sends" ADD CONSTRAINT "sends_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "newsletter_community"."issues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "newsletter_community"."sends" ADD CONSTRAINT "sends_subscriber_id_subscribers_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "newsletter_community"."subscribers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "newsletter_community"."sponsorships" ADD CONSTRAINT "sponsorships_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "newsletter_community"."sponsorships" ADD CONSTRAINT "sponsorships_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "newsletter_community"."issues"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "newsletter_community"."subscribers" ADD CONSTRAINT "subscribers_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "comments_post_id_index" ON "newsletter_community"."comments" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "issues_workspace_id_status_index" ON "newsletter_community"."issues" USING btree ("workspace_id","status");--> statement-breakpoint
CREATE INDEX "membership_sales_workspace_id_sold_on_index" ON "newsletter_community"."membership_sales" USING btree ("workspace_id","sold_on");--> statement-breakpoint
CREATE INDEX "posts_workspace_id_created_at_index" ON "newsletter_community"."posts" USING btree ("workspace_id","created_at");--> statement-breakpoint
CREATE INDEX "sends_workspace_id_issue_id_index" ON "newsletter_community"."sends" USING btree ("workspace_id","issue_id");--> statement-breakpoint
CREATE INDEX "sends_subscriber_id_index" ON "newsletter_community"."sends" USING btree ("subscriber_id");--> statement-breakpoint
CREATE INDEX "sponsorships_workspace_id_run_on_index" ON "newsletter_community"."sponsorships" USING btree ("workspace_id","run_on");--> statement-breakpoint
CREATE INDEX "subscribers_workspace_id_joined_on_index" ON "newsletter_community"."subscribers" USING btree ("workspace_id","joined_on");