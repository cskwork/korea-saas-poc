CREATE SCHEMA "niche_community";
--> statement-breakpoint
CREATE TYPE "niche_community"."channel_access" AS ENUM('open', 'premium');--> statement-breakpoint
CREATE TYPE "niche_community"."meetup_format" AS ENUM('offline', 'online');--> statement-breakpoint
CREATE TYPE "niche_community"."member_role" AS ENUM('operator', 'member');--> statement-breakpoint
CREATE TYPE "niche_community"."member_tier" AS ENUM('free', 'premium');--> statement-breakpoint
CREATE TYPE "niche_community"."membership_change_kind" AS ENUM('upgrade', 'downgrade');--> statement-breakpoint
CREATE TABLE "niche_community"."channels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"access" "niche_community"."channel_access" DEFAULT 'open' NOT NULL,
	"icon" text DEFAULT 'message' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "niche_community"."comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"post_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "niche_community"."likes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"post_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "niche_community"."meetups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"duration_minutes" integer DEFAULT 120 NOT NULL,
	"location" text NOT NULL,
	"format" "niche_community"."meetup_format" DEFAULT 'offline' NOT NULL,
	"capacity" integer NOT NULL,
	"access" "niche_community"."channel_access" DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "niche_community"."members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"nickname" text NOT NULL,
	"headline" text DEFAULT '' NOT NULL,
	"bio" text DEFAULT '' NOT NULL,
	"role" "niche_community"."member_role" DEFAULT 'member' NOT NULL,
	"tier" "niche_community"."member_tier" DEFAULT 'free' NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"premium_since" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "niche_community"."membership_changes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"kind" "niche_community"."membership_change_kind" NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "niche_community"."payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"amount_won" integer NOT NULL,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"paid_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "niche_community"."posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"channel_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"premium_only" boolean DEFAULT false NOT NULL,
	"pinned" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "niche_community"."rsvps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"meetup_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "niche_community"."settings" (
	"workspace_id" uuid PRIMARY KEY NOT NULL,
	"acting_member_id" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "niche_community"."channels" ADD CONSTRAINT "channels_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "niche_community"."comments" ADD CONSTRAINT "comments_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "niche_community"."comments" ADD CONSTRAINT "comments_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "niche_community"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "niche_community"."comments" ADD CONSTRAINT "comments_author_id_members_id_fk" FOREIGN KEY ("author_id") REFERENCES "niche_community"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "niche_community"."likes" ADD CONSTRAINT "likes_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "niche_community"."likes" ADD CONSTRAINT "likes_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "niche_community"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "niche_community"."likes" ADD CONSTRAINT "likes_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "niche_community"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "niche_community"."meetups" ADD CONSTRAINT "meetups_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "niche_community"."members" ADD CONSTRAINT "members_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "niche_community"."membership_changes" ADD CONSTRAINT "membership_changes_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "niche_community"."membership_changes" ADD CONSTRAINT "membership_changes_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "niche_community"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "niche_community"."payments" ADD CONSTRAINT "payments_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "niche_community"."payments" ADD CONSTRAINT "payments_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "niche_community"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "niche_community"."posts" ADD CONSTRAINT "posts_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "niche_community"."posts" ADD CONSTRAINT "posts_channel_id_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "niche_community"."channels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "niche_community"."posts" ADD CONSTRAINT "posts_author_id_members_id_fk" FOREIGN KEY ("author_id") REFERENCES "niche_community"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "niche_community"."rsvps" ADD CONSTRAINT "rsvps_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "niche_community"."rsvps" ADD CONSTRAINT "rsvps_meetup_id_meetups_id_fk" FOREIGN KEY ("meetup_id") REFERENCES "niche_community"."meetups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "niche_community"."rsvps" ADD CONSTRAINT "rsvps_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "niche_community"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "niche_community"."settings" ADD CONSTRAINT "settings_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "niche_community"."settings" ADD CONSTRAINT "settings_acting_member_id_members_id_fk" FOREIGN KEY ("acting_member_id") REFERENCES "niche_community"."members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "nc_channels_workspace_idx" ON "niche_community"."channels" USING btree ("workspace_id","position");--> statement-breakpoint
CREATE INDEX "nc_comments_post_idx" ON "niche_community"."comments" USING btree ("post_id","created_at");--> statement-breakpoint
CREATE INDEX "nc_comments_author_idx" ON "niche_community"."comments" USING btree ("author_id");--> statement-breakpoint
CREATE UNIQUE INDEX "nc_likes_post_member_uq" ON "niche_community"."likes" USING btree ("post_id","member_id");--> statement-breakpoint
CREATE INDEX "nc_likes_member_idx" ON "niche_community"."likes" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX "nc_meetups_workspace_idx" ON "niche_community"."meetups" USING btree ("workspace_id","starts_at");--> statement-breakpoint
CREATE INDEX "nc_members_workspace_idx" ON "niche_community"."members" USING btree ("workspace_id","joined_at");--> statement-breakpoint
CREATE INDEX "nc_membership_changes_workspace_idx" ON "niche_community"."membership_changes" USING btree ("workspace_id","occurred_at");--> statement-breakpoint
CREATE UNIQUE INDEX "nc_payments_member_period_uq" ON "niche_community"."payments" USING btree ("member_id","period_start");--> statement-breakpoint
CREATE INDEX "nc_payments_workspace_idx" ON "niche_community"."payments" USING btree ("workspace_id","paid_at");--> statement-breakpoint
CREATE INDEX "nc_posts_workspace_created_idx" ON "niche_community"."posts" USING btree ("workspace_id","created_at");--> statement-breakpoint
CREATE INDEX "nc_posts_channel_idx" ON "niche_community"."posts" USING btree ("channel_id");--> statement-breakpoint
CREATE INDEX "nc_posts_author_idx" ON "niche_community"."posts" USING btree ("author_id");--> statement-breakpoint
CREATE UNIQUE INDEX "nc_rsvps_meetup_member_uq" ON "niche_community"."rsvps" USING btree ("meetup_id","member_id");--> statement-breakpoint
CREATE INDEX "nc_rsvps_member_idx" ON "niche_community"."rsvps" USING btree ("member_id");