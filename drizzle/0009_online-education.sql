CREATE SCHEMA "online_education";
--> statement-breakpoint
CREATE TYPE "online_education"."billing_cycle" AS ENUM('monthly', 'yearly');--> statement-breakpoint
CREATE TYPE "online_education"."course_category" AS ENUM('programming', 'design', 'data', 'marketing');--> statement-breakpoint
CREATE TYPE "online_education"."course_color" AS ENUM('sky', 'pink', 'mint', 'tangerine', 'lavender', 'tomato', 'lime', 'lemon');--> statement-breakpoint
CREATE TYPE "online_education"."course_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TYPE "online_education"."enrollment_status" AS ENUM('active', 'completed', 'refunded');--> statement-breakpoint
CREATE TYPE "online_education"."lesson_type" AS ENUM('video', 'text', 'quiz');--> statement-breakpoint
CREATE TYPE "online_education"."payment_kind" AS ENUM('course', 'product');--> statement-breakpoint
CREATE TYPE "online_education"."payment_status" AS ENUM('paid', 'refunded');--> statement-breakpoint
CREATE TYPE "online_education"."plan_tier" AS ENUM('free', 'basic', 'pro');--> statement-breakpoint
CREATE TYPE "online_education"."product_status" AS ENUM('on_sale', 'paused');--> statement-breakpoint
CREATE TYPE "online_education"."product_type" AS ENUM('notion', 'pdf', 'sheet');--> statement-breakpoint
CREATE TABLE "online_education"."courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" "online_education"."course_category" NOT NULL,
	"color" "online_education"."course_color" NOT NULL,
	"list_price" integer NOT NULL,
	"price" integer NOT NULL,
	"outcomes" text[] NOT NULL,
	"status" "online_education"."course_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "online_education"."enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"learner_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"status" "online_education"."enrollment_status" DEFAULT 'active' NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"sessions_per_week" integer NOT NULL,
	"minutes_per_session" integer NOT NULL,
	"plan_finish_on" date NOT NULL,
	"enrolled_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_studied_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	CONSTRAINT "enrollments_learnerId_courseId_unique" UNIQUE("learner_id","course_id")
);
--> statement-breakpoint
CREATE TABLE "online_education"."learners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "learners_workspaceId_email_unique" UNIQUE("workspace_id","email")
);
--> statement-breakpoint
CREATE TABLE "online_education"."lessons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"section_id" uuid NOT NULL,
	"title" text NOT NULL,
	"type" "online_education"."lesson_type" NOT NULL,
	"duration_seconds" integer NOT NULL,
	"is_preview" boolean DEFAULT false NOT NULL,
	"position" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "online_education"."payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"learner_id" uuid,
	"kind" "online_education"."payment_kind" NOT NULL,
	"course_id" uuid,
	"product_id" uuid,
	"item_title" text NOT NULL,
	"amount" integer NOT NULL,
	"status" "online_education"."payment_status" DEFAULT 'paid' NOT NULL,
	"paid_at" timestamp with time zone DEFAULT now() NOT NULL,
	"refunded_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "online_education"."products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"title" text NOT NULL,
	"type" "online_education"."product_type" NOT NULL,
	"description" text NOT NULL,
	"price" integer NOT NULL,
	"status" "online_education"."product_status" DEFAULT 'on_sale' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "online_education"."schools" (
	"workspace_id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"creator_name" text NOT NULL,
	"plan" "online_education"."plan_tier" DEFAULT 'basic' NOT NULL,
	"billing" "online_education"."billing_cycle" DEFAULT 'monthly' NOT NULL,
	"plan_changed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "online_education"."sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"title" text NOT NULL,
	"position" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "online_education"."courses" ADD CONSTRAINT "courses_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "online_education"."enrollments" ADD CONSTRAINT "enrollments_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "online_education"."enrollments" ADD CONSTRAINT "enrollments_learner_id_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "online_education"."learners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "online_education"."enrollments" ADD CONSTRAINT "enrollments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "online_education"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "online_education"."learners" ADD CONSTRAINT "learners_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "online_education"."lessons" ADD CONSTRAINT "lessons_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "online_education"."lessons" ADD CONSTRAINT "lessons_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "online_education"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "online_education"."lessons" ADD CONSTRAINT "lessons_section_id_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "online_education"."sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "online_education"."payments" ADD CONSTRAINT "payments_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "online_education"."payments" ADD CONSTRAINT "payments_learner_id_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "online_education"."learners"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "online_education"."payments" ADD CONSTRAINT "payments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "online_education"."courses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "online_education"."payments" ADD CONSTRAINT "payments_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "online_education"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "online_education"."products" ADD CONSTRAINT "products_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "online_education"."schools" ADD CONSTRAINT "schools_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "online_education"."sections" ADD CONSTRAINT "sections_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "online_education"."sections" ADD CONSTRAINT "sections_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "online_education"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "courses_workspace_id_created_at_index" ON "online_education"."courses" USING btree ("workspace_id","created_at");--> statement-breakpoint
CREATE INDEX "enrollments_course_id_index" ON "online_education"."enrollments" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "enrollments_workspace_id_enrolled_at_index" ON "online_education"."enrollments" USING btree ("workspace_id","enrolled_at");--> statement-breakpoint
CREATE INDEX "learners_workspace_id_created_at_index" ON "online_education"."learners" USING btree ("workspace_id","created_at");--> statement-breakpoint
CREATE INDEX "lessons_section_id_position_index" ON "online_education"."lessons" USING btree ("section_id","position");--> statement-breakpoint
CREATE INDEX "lessons_course_id_index" ON "online_education"."lessons" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "payments_workspace_id_paid_at_index" ON "online_education"."payments" USING btree ("workspace_id","paid_at");--> statement-breakpoint
CREATE INDEX "payments_learner_id_index" ON "online_education"."payments" USING btree ("learner_id");--> statement-breakpoint
CREATE INDEX "payments_course_id_index" ON "online_education"."payments" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "payments_product_id_index" ON "online_education"."payments" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "products_workspace_id_created_at_index" ON "online_education"."products" USING btree ("workspace_id","created_at");--> statement-breakpoint
CREATE INDEX "sections_course_id_position_index" ON "online_education"."sections" USING btree ("course_id","position");