CREATE TABLE "support_data_points" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(100) NOT NULL,
	"question" text NOT NULL,
	"priority" integer NOT NULL,
	"possible_values" jsonb NOT NULL,
	CONSTRAINT "support_data_points_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "support_matchers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"conditions" jsonb NOT NULL,
	"solution" text NOT NULL,
	"priority" integer DEFAULT 100,
	"category" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"discordId" varchar(22) NOT NULL,
	"channelId" varchar(22) NOT NULL,
	"transcript" varchar(255),
	"notes" text NOT NULL,
	"closed" timestamp,
	"created" timestamp DEFAULT now() NOT NULL
);
