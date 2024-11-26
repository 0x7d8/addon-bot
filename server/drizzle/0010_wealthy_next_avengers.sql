CREATE TABLE IF NOT EXISTS "automatic_errors" (
	"id" serial PRIMARY KEY NOT NULL,
	"regex" varchar(255),
	"content" text NOT NULL,
	"created" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "automaticErrors_allowedRegex_idx" ON "automatic_errors" USING btree ("regex");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "automaticErrors_created_idx" ON "automatic_errors" USING btree ("created");