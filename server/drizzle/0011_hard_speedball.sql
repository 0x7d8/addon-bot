ALTER TABLE "automatic_errors" RENAME COLUMN "regex" TO "allowed_regex";--> statement-breakpoint
DROP INDEX IF EXISTS "automaticErrors_allowedRegex_idx";--> statement-breakpoint
ALTER TABLE "automatic_errors" ADD COLUMN "disallowed_regex" varchar(255);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "automaticErrors_allowedRegex_idx" ON "automatic_errors" USING btree ("allowed_regex");