CREATE SCHEMA "smart_store";
--> statement-breakpoint
CREATE TYPE "smart_store"."category" AS ENUM('fashion', 'beauty', 'living', 'digital', 'food', 'etc');--> statement-breakpoint
CREATE TYPE "smart_store"."competition" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "smart_store"."copy_source" AS ENUM('claude', 'template', 'manual');--> statement-breakpoint
CREATE TYPE "smart_store"."listing_status" AS ENUM('selling', 'paused');--> statement-breakpoint
CREATE TYPE "smart_store"."order_status" AS ENUM('new', 'confirmed', 'shipping', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TYPE "smart_store"."supplier" AS ENUM('domeme', 'domeggook');--> statement-breakpoint
CREATE TYPE "smart_store"."trend" AS ENUM('rising', 'steady', 'falling', 'seasonal');--> statement-breakpoint
CREATE TABLE "smart_store"."calculations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"label" text NOT NULL,
	"category" "smart_store"."category" NOT NULL,
	"cost" integer NOT NULL,
	"price" integer NOT NULL,
	"shipping_cost" integer NOT NULL,
	"monthly_quantity" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "smart_store"."catalog_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"category" "smart_store"."category" NOT NULL,
	"supplier" "smart_store"."supplier" NOT NULL,
	"wholesale_price" integer NOT NULL,
	"suggested_price" integer NOT NULL,
	"shipping_cost" integer NOT NULL,
	"options" text,
	"lead_days" integer DEFAULT 2 NOT NULL,
	"stock" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "catalog_items_workspaceId_code_unique" UNIQUE("workspace_id","code")
);
--> statement-breakpoint
CREATE TABLE "smart_store"."keyword_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"keyword" text NOT NULL,
	"head_keyword" text NOT NULL,
	"category" "smart_store"."category" NOT NULL,
	"monthly_volume" integer NOT NULL,
	"competition" "smart_store"."competition" NOT NULL,
	"trend" "smart_store"."trend" NOT NULL,
	CONSTRAINT "keyword_stats_workspaceId_keyword_unique" UNIQUE("workspace_id","keyword")
);
--> statement-breakpoint
CREATE TABLE "smart_store"."listings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"catalog_item_id" uuid,
	"original_name" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"keywords" text[] NOT NULL,
	"hashtags" text[] NOT NULL,
	"category" "smart_store"."category" NOT NULL,
	"supplier" "smart_store"."supplier",
	"cost" integer NOT NULL,
	"price" integer NOT NULL,
	"shipping_cost" integer NOT NULL,
	"status" "smart_store"."listing_status" DEFAULT 'selling' NOT NULL,
	"copy_source" "smart_store"."copy_source" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "smart_store"."orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"order_no" text NOT NULL,
	"listing_id" uuid,
	"product_name" text NOT NULL,
	"category" "smart_store"."category" NOT NULL,
	"customer_name" text NOT NULL,
	"region" text NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" integer NOT NULL,
	"unit_cost" integer NOT NULL,
	"shipping_cost" integer NOT NULL,
	"fee_rate_bp" integer NOT NULL,
	"status" "smart_store"."order_status" DEFAULT 'new' NOT NULL,
	"courier" text,
	"tracking_number" text,
	"is_test" boolean DEFAULT false NOT NULL,
	"ordered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"confirmed_at" timestamp with time zone,
	"shipped_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	CONSTRAINT "orders_workspaceId_orderNo_unique" UNIQUE("workspace_id","order_no")
);
--> statement-breakpoint
CREATE TABLE "smart_store"."saved_keywords" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"keyword" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "saved_keywords_workspaceId_keyword_unique" UNIQUE("workspace_id","keyword")
);
--> statement-breakpoint
ALTER TABLE "smart_store"."calculations" ADD CONSTRAINT "calculations_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smart_store"."catalog_items" ADD CONSTRAINT "catalog_items_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smart_store"."keyword_stats" ADD CONSTRAINT "keyword_stats_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smart_store"."listings" ADD CONSTRAINT "listings_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smart_store"."listings" ADD CONSTRAINT "listings_catalog_item_id_catalog_items_id_fk" FOREIGN KEY ("catalog_item_id") REFERENCES "smart_store"."catalog_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smart_store"."orders" ADD CONSTRAINT "orders_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smart_store"."orders" ADD CONSTRAINT "orders_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "smart_store"."listings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smart_store"."saved_keywords" ADD CONSTRAINT "saved_keywords_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "calculations_workspace_id_created_at_index" ON "smart_store"."calculations" USING btree ("workspace_id","created_at");--> statement-breakpoint
CREATE INDEX "catalog_items_workspace_id_category_index" ON "smart_store"."catalog_items" USING btree ("workspace_id","category");--> statement-breakpoint
CREATE INDEX "keyword_stats_workspace_id_head_keyword_index" ON "smart_store"."keyword_stats" USING btree ("workspace_id","head_keyword");--> statement-breakpoint
CREATE INDEX "listings_workspace_id_created_at_index" ON "smart_store"."listings" USING btree ("workspace_id","created_at");--> statement-breakpoint
CREATE INDEX "listings_catalog_item_id_index" ON "smart_store"."listings" USING btree ("catalog_item_id");--> statement-breakpoint
CREATE INDEX "orders_workspace_id_ordered_at_index" ON "smart_store"."orders" USING btree ("workspace_id","ordered_at");--> statement-breakpoint
CREATE INDEX "orders_workspace_id_status_index" ON "smart_store"."orders" USING btree ("workspace_id","status");--> statement-breakpoint
CREATE INDEX "orders_listing_id_index" ON "smart_store"."orders" USING btree ("listing_id");