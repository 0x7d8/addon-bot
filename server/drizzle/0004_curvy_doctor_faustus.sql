ALTER TABLE "pterodactylActivity" DROP CONSTRAINT "pterodactylActivity_pterodactylId_demoAccesses_pterodactylId_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pterodactylActivity" ADD CONSTRAINT "pterodactylActivity_pterodactylId_demoAccesses_pterodactylId_fk" FOREIGN KEY ("pterodactylId") REFERENCES "public"."demoAccesses"("pterodactylId") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
