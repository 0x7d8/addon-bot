import { client } from "@/bot"
import Crontab from "@/crontab"
import env from "@/globals/env"
import logger from "@/globals/logger"
import { and, eq, sql } from "drizzle-orm"

export default new Crontab()
	.cron('* * * * *')
	.listen(async(ctx) => {
		const expiredDemoAccesses = await ctx.database.select({
			discordId: ctx.database.schema.demoAccesses.discordId,
			pterodactylId: ctx.database.schema.demoAccesses.pterodactylId
		}).from(ctx.database.schema.demoAccesses)
			.where(and(
				eq(ctx.database.schema.demoAccesses.expired, false),
				sql`${ctx.database.schema.demoAccesses.created} < current_timestamp - INTERVAL '1 hour'`
			))

		if (!expiredDemoAccesses.length) return

		logger()
			.text('Removing')
			.text(expiredDemoAccesses.length, (c) => c.cyan)
			.text('Demo Accesses')
			.info()

		for (const expiredDemoAccess of expiredDemoAccesses) {
			const member = await client.guilds.fetch(env.DISCORD_SERVER)
				.then((guild) => guild
					.members.fetch(expiredDemoAccess.discordId)
				)

			await Promise.allSettled([
				member.roles.remove(env.DEMO_ROLE),
				member.send('`🔍` Your **1 hour** demo acccess has expired.'),
				ctx.pterodactyl.deleteUser(expiredDemoAccess.pterodactylId),
				client.guilds.cache.get(env.DISCORD_SERVER)!.channels.fetch(env.DEMO_CHANNEL)
					.then((channel) => 'send' in channel! ? channel.send(`\`🔍\` <@${member.id}>'s demo acccess has expired.`) : null)
			])

			await ctx.database.update(ctx.database.schema.demoAccesses)
				.set({ expired: true })
				.where(eq(ctx.database.schema.demoAccesses.discordId, expiredDemoAccess.discordId))
		}
	})