import { client } from "@/bot"
import Crontab from "@/crontab"
import env from "@/globals/env"
import logger from "@/globals/logger"
import { and, eq, sql } from "drizzle-orm"

export default new Crontab()
	.cron('* * * * *')
	.listen(async(ctx) => {
		const expiredDemoAccesses = await ctx.database.select({
			discordId: ctx.database.schema.demoAcccesses.discordId,
			pterodactylId: ctx.database.schema.demoAcccesses.pterodactylId
		}).from(ctx.database.schema.demoAcccesses)
			.where(and(
				eq(ctx.database.schema.demoAcccesses.expired, false),
				sql`${ctx.database.schema.demoAcccesses.created} < current_timestamp - INTERVAL '1 hour'`
			))

		if (!expiredDemoAccesses.length) return

		logger()
			.text('Removing')
			.text(expiredDemoAccesses.length, (c) => c.cyan)
			.text('Demo Accesses')
			.info()

		for (const expiredDemoAccess of expiredDemoAccesses) {
			const member = await client.guilds.cache.get(env.DISCORD_SERVER)!
				.members.fetch(expiredDemoAccess.discordId)

			if (member.roles.cache.has(env.DEMO_ROLE)) {
				await Promise.allSettled([
					member.roles.remove(env.DEMO_ROLE),
					member.send('`🔍` Your **1 hour** demo acccess has expired.'),
					ctx.pterodactyl.deleteUser(expiredDemoAccess.pterodactylId)
				])
			}

			await ctx.database.update(ctx.database.schema.demoAcccesses)
				.set({ expired: true })
				.where(eq(ctx.database.schema.demoAcccesses.discordId, expiredDemoAccess.discordId))
		}
	})