CREATE UNIQUE INDEX "tickets_channelId_idx" ON "tickets" USING btree ("channelId");--> statement-breakpoint
CREATE INDEX "tickets_discordId_idx" ON "tickets" USING btree ("discordId");