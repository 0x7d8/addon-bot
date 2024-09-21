CREATE TABLE IF NOT EXISTS "faqs" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(31) NOT NULL,
	"content" text NOT NULL,
	"created" timestamp DEFAULT now() NOT NULL,
	"updated" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sendMessages" (
	"id" serial PRIMARY KEY NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"discordId" varchar(22),
	"discordChannelId" varchar(22) NOT NULL,
	"message" text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "title_idx" ON "faqs" USING btree ("title");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "discordChannelId_discordId_idx" ON "sendMessages" USING btree ("discordChannelId","discordId");