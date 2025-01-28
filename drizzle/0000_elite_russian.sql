DO $$ BEGIN
 CREATE TYPE "public"."currency" AS ENUM('EUR', 'USD');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."productProvider" AS ENUM('SOURCEXCHANGE', 'BUILTBYBIT');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "demoAccesses" (
	"id" serial PRIMARY KEY NOT NULL,
	"expired" boolean DEFAULT false NOT NULL,
	"password" char(16) NOT NULL,
	"pterodactylId" integer NOT NULL,
	"discordId" varchar(22) NOT NULL,
	"created" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "productLinks" (
	"id" serial PRIMARY KEY NOT NULL,
	"productId" integer NOT NULL,
	"providerId" integer NOT NULL,
	"discordId" varchar(22) NOT NULL,
	"paymentId" varchar(51) NOT NULL,
	"created" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "productProviders" (
	"id" serial PRIMARY KEY NOT NULL,
	"productId" integer NOT NULL,
	"provider" "productProvider" NOT NULL,
	"productProviderId" integer NOT NULL,
	"link" varchar(255) NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"currency" "currency" NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(51) NOT NULL,
	"icon" varchar(255) NOT NULL,
	"banner" varchar(255) NOT NULL,
	"summary" varchar(255) NOT NULL,
	"version" varchar(51) DEFAULT '1.0.0' NOT NULL,
	"role" varchar(22) NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "productLinks" ADD CONSTRAINT "productLinks_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "productLinks" ADD CONSTRAINT "productLinks_providerId_productProviders_id_fk" FOREIGN KEY ("providerId") REFERENCES "public"."productProviders"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "productProviders" ADD CONSTRAINT "productProviders_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "pterodactylId_idx" ON "demoAccesses" USING btree ("pterodactylId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "paymentId_idx" ON "productLinks" USING btree ("paymentId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "discordId_productId_providerId_idx" ON "productLinks" USING btree ("discordId","productId","providerId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "productId_provider_idx" ON "productProviders" USING btree ("productId","provider");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "name_idx" ON "products" USING btree ("name");