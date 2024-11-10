import { client } from "@/bot"
import Crontab from "@/crontab"
import logger from "@/globals/logger"
import { EmbedBuilder } from "discord.js"
import { and, count, eq, inArray } from "drizzle-orm"

export default new Crontab()
	.cron('*/10 * * * * *')
	.listen(async(ctx) => {
		const demoAccesses = await ctx.database.select({
			count: count()
		}).from(ctx.database.schema.demoAccesses)
			.where(eq(ctx.database.schema.demoAccesses.expired, false))
			.then((c) => c[0].count)

		if (!demoAccesses) return

		logger()
			.text('Collecting Pterodactyl Activity for')
			.text(demoAccesses, (c) => c.cyan)
			.text('Demo Accesses')
			.info()

		const servers = await ctx.pterodactyl.getServers()

		for (const [ name, uuid ] of servers) {
			let activity = await ctx.pterodactyl.getActivity(uuid)
				.then((c) => c.filter((a) => a.relationships.actor.object === 'user' && a.relationships.actor.attributes.username.startsWith('demo')))

			const found = await ctx.database.select({
				identifier: ctx.database.schema.pterodactylActivity.identifier
			}).from(ctx.database.schema.pterodactylActivity)
				.where(and(
					eq(ctx.database.schema.pterodactylActivity.pterodactylServerId, uuid),
					inArray(ctx.database.schema.pterodactylActivity.identifier, activity.map((a) => a.id))
				))

			activity = activity.filter((a) => !found.some((f) => f.identifier === a.id))
			if (!activity.length) continue

			logger()
				.text('Found')
				.text(activity.length - found.length, (c) => c.cyan)
				.text('New Activities for')
				.text(name)
				.info()

			const users = await ctx.database.select({
				pterodactylId: ctx.database.schema.demoAccesses.pterodactylId,
				discordId: ctx.database.schema.demoAccesses.discordId
			}).from(ctx.database.schema.demoAccesses)
				.where(and(
					eq(ctx.database.schema.demoAccesses.expired, false),
					inArray(ctx.database.schema.demoAccesses.discordId, activity.map((a) => a.relationships.actor.attributes!.username.slice(5)))
				))

			await ctx.database.insert(ctx.database.schema.pterodactylActivity)
				.values(activity.map((a) => ({
					identifier: a.id,
					event: a.event,
					properties: a.properties,
					pterodactylServerId: uuid,
					pterodactylId: users.find((u) => u.discordId === a.relationships.actor.attributes!.username.slice(5))?.pterodactylId ?? null
				})))

			for (const a of activity) {
				await client.guilds.cache.get(ctx.env.DISCORD_SERVER)!.channels.fetch(ctx.env.DEMO_CHANNEL)
					.then(async(channel) => 'send' in channel! ? channel.send({
						embeds: [
							new EmbedBuilder()
								.setTitle('`🔍` Pterodactyl Activity')
								.setThumbnail(await client.users.fetch(users.find((u) => u.discordId === a.relationships.actor.attributes!.username.slice(5))?.discordId ?? '123').then((u) => u.displayAvatarURL()).catch(() => null))
								.setFields([
									{
										name: `\`🔍\` Event`,
										value: `\`${a.event}\``,
										inline: true
									},
									{
										name: `\`👤\` User`,
										value: `<@${users.find((u) => u.discordId === a.relationships.actor.attributes!.username.slice(5))?.discordId ?? '123'}>`,
										inline: true
									},
									{
										name: `\`🔗\` Server`,
										value: `[\`${name}\`](<${ctx.env.PTERO_URL}/server/${uuid.slice(0, 8)})`,
										inline: true
									},
									...Object.keys(a.properties).length ? [{
										name: '`📄` Properties',
										value: ctx.join(
											'```json',
											JSON.stringify(a.properties, null, 2),
											'```'
										)
									}] : []
								])
								.setTimestamp(new Date(a.timestamp))
						]
					}) : null)
			}
		}
	})