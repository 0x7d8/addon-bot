CREATE TABLE IF NOT EXISTS "pterodactylActivity" (
	"id" serial PRIMARY KEY NOT NULL,
	"pterodactylId" integer,
	"identifier" char(40) NOT NULL,
	"event" varchar(121) NOT NULL,
	"properties" jsonb NOT NULL,
	"created" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pterodactylActivity" ADD CONSTRAINT "pterodactylActivity_pterodactylId_demoAccesses_pterodactylId_fk" FOREIGN KEY ("pterodactylId") REFERENCES "public"."demoAccesses"("pterodactylId") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "activity_identifier_idx" ON "pterodactylActivity" USING btree ("identifier");