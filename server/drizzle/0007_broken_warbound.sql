CREATE TABLE IF NOT EXISTS "advent_calendar_days" (
	"id" "smallserial" PRIMARY KEY NOT NULL,
	"year" smallint NOT NULL,
	"day" smallint NOT NULL,
	"content" text NOT NULL,
	"created" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "advent_calendar_redeems" (
	"calendarDayId" integer NOT NULL,
	"discordId" varchar(22) NOT NULL,
	"created" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "advent_calendar_redeems" ADD CONSTRAINT "advent_calendar_redeems_calendarDayId_advent_calendar_days_id_fk" FOREIGN KEY ("calendarDayId") REFERENCES "public"."advent_calendar_days"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "adventCalendarDays_year_day_idx" ON "advent_calendar_days" USING btree ("year","day");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "adventCalendarDays_created_idx" ON "advent_calendar_days" USING btree ("created");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "adventCalendarRedeems_calendarDayId_discordId_idx" ON "advent_calendar_redeems" USING btree ("calendarDayId","discordId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "adventCalendarRedeems_created_idx" ON "advent_calendar_redeems" USING btree ("created");