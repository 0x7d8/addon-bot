ALTER TABLE "support_matchers" ALTER COLUMN "priority" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "send_messages" ADD COLUMN "ticket" boolean DEFAULT false NOT NULL;