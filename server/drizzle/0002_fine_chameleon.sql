ALTER TABLE "products" ADD COLUMN "identifier" varchar(51) DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "discordId_idx" ON "demoAccesses" USING btree ("discordId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "identifier_idx" ON "products" USING btree ("identifier");