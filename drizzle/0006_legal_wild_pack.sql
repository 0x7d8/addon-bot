ALTER TABLE "demoAccesses" RENAME TO "demo_accesses";--> statement-breakpoint
ALTER TABLE "productLinks" RENAME TO "product_links";--> statement-breakpoint
ALTER TABLE "productProviders" RENAME TO "product_providers";--> statement-breakpoint
ALTER TABLE "pterodactylActivity" RENAME TO "pterodactyl_activity";--> statement-breakpoint
ALTER TABLE "sendMessages" RENAME TO "send_messages";--> statement-breakpoint
ALTER TABLE "product_links" DROP CONSTRAINT "productLinks_productId_products_id_fk";
--> statement-breakpoint
ALTER TABLE "product_links" DROP CONSTRAINT "productLinks_providerId_productProviders_id_fk";
--> statement-breakpoint
ALTER TABLE "product_providers" DROP CONSTRAINT "productProviders_productId_products_id_fk";
--> statement-breakpoint
ALTER TABLE "pterodactyl_activity" DROP CONSTRAINT "pterodactylActivity_pterodactylId_demoAccesses_pterodactylId_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "pterodactylId_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "discordId_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "title_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "paymentId_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "discordId_productId_providerId_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "productId_provider_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "name_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "identifier_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "activity_identifier_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "discordChannelId_discordId_idx";--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "demoAccesses_pterodactylId_idx" ON "demo_accesses" USING btree ("pterodactylId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "demoAccesses_discordId_idx" ON "demo_accesses" USING btree ("discordId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "demoAccesses_expired_idx" ON "demo_accesses" USING btree ("expired");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "demoAccesses_created_idx" ON "demo_accesses" USING btree ("created");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "faqs_title_idx" ON "faqs" USING btree ("title");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "faqs_created_idx" ON "faqs" USING btree ("created");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "faqs_updated_idx" ON "faqs" USING btree ("updated");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "productLinks_paymentId_idx" ON "product_links" USING btree ("paymentId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "productLinks_discordId_productId_providerId_idx" ON "product_links" USING btree ("discordId","productId","providerId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "productProviders_productId_provider_idx" ON "product_providers" USING btree ("productId","provider");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "products_name_idx" ON "products" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "products_identifier_idx" ON "products" USING btree ("identifier");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "products_role_idx" ON "products" USING btree ("role");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "pterodactylActivity_activity_identifier_idx" ON "pterodactyl_activity" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pterodactylActivity_pterodactylId_idx" ON "pterodactyl_activity" USING btree ("pterodactylId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pterodactylActivity_created_idx" ON "pterodactyl_activity" USING btree ("created");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "sendMessages_discordChannelId_discordId_idx" ON "send_messages" USING btree ("discordChannelId","discordId");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_links" ADD CONSTRAINT "product_links_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_links" ADD CONSTRAINT "product_links_providerId_product_providers_id_fk" FOREIGN KEY ("providerId") REFERENCES "public"."product_providers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_providers" ADD CONSTRAINT "product_providers_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pterodactyl_activity" ADD CONSTRAINT "pterodactyl_activity_pterodactylId_demo_accesses_pterodactylId_fk" FOREIGN KEY ("pterodactylId") REFERENCES "public"."demo_accesses"("pterodactylId") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
