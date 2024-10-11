import Command from "@/bot/command"
import { string, time } from "@rjweb/utils"
import { InteractionContextType } from "discord.js"
import { eq, and } from "drizzle-orm"

export default new Command()
	.build((builder) => builder
		.setName('demo')
		.setContexts(InteractionContextType.Guild)
		.setDescription('Request a demo account')
	)
	.listen(async(ctx) => {
		const demoAccesses = await ctx.database.select({
			password: ctx.database.schema.demoAccesses.password,
			expired: ctx.database.schema.demoAccesses.expired,
			created: ctx.database.schema.demoAccesses.created
		}).from(ctx.database.schema.demoAccesses)
			.where(eq(ctx.database.schema.demoAccesses.discordId, ctx.interaction.user.id))

		const active = demoAccesses.find((access) => !access.expired)
		if (active) return ctx.interaction.reply({
			ephemeral: true,
			content: ctx.join(
				'`🔍` You already have an active demo account.',
				`expires <t:${Math.floor((active.created.getTime() + time(1).h()) / 1000)}:R>`,
				'',
				ctx.env.PTERO_URL,
				ctx.env.PTERO_THEME_URLS ? Object.entries(ctx.env.PTERO_THEME_URLS).map(([ name, url ]) => `[${name} Demo](<${url}>)`).join(' | ') : null,
				'```properties',
				`username: demo.${ctx.interaction.user.id}`,
				`password: ${active.password}`,
				'```'
			)
		})

		if (demoAccesses.some((access) => access.created.getTime() > Date.now() - time(1).d())) return ctx.interaction.reply({
			ephemeral: true,
			content: ctx.join(
				'`🔍` You have already requested a demo account in the last 24 hours, please wait or ask in a ticket.',
				`you can request a new one in <t:${Math.floor((demoAccesses.find((access) => access.created.getTime() > Date.now() - time(1).d())!.created.getTime() + time(1).d()) / 1000)}:R>`
			)
		})

		const password = string.generate({
			length: 16,
			uppercase: false
		})

		await Promise.all([
			ctx.database.insert(ctx.database.schema.demoAccesses)
				.values({
					discordId: ctx.interaction.user.id,
					pterodactylId: -1,
					password
				}),
			ctx.interaction.deferReply({ ephemeral: true })
		])

		const id = await ctx.pterodactyl.createUser(ctx.interaction.user, password)

		await Promise.all([
			ctx.database.update(ctx.database.schema.demoAccesses)
				.set({ pterodactylId: id })
				.where(and(
					eq(ctx.database.schema.demoAccesses.discordId, ctx.interaction.user.id),
					eq(ctx.database.schema.demoAccesses.password, password)
				)),
			ctx.client.guilds.cache.get(ctx.env.DISCORD_SERVER)!.members.fetch(ctx.interaction.user.id)
				.then((member) => member.roles.add(ctx.env.DEMO_ROLE)),
			ctx.client.guilds.cache.get(ctx.env.DISCORD_SERVER)!.channels.fetch(ctx.env.DEMO_CHANNEL)
				.then((channel) => 'send' in channel! ? channel.send(`\`🔍\` <@${ctx.interaction.user.id}>'s demo access has started, it expires <t:${Math.floor((Date.now() + time(1).h()) / 1000)}:R>`) : null)
		])

		return ctx.interaction.editReply(ctx.join(
			'`🔍` Demo account created.',
			`expires <t:${Math.floor((Date.now() + time(1).h()) / 1000)}:R>`,
			'',
			ctx.env.PTERO_URL,
			ctx.env.PTERO_THEME_URLS ? Object.entries(ctx.env.PTERO_THEME_URLS).map(([ name, url ]) => `[${name} Demo](<${url}>)`).join(' | ') : null,
			'```properties',
			`username: demo.${ctx.interaction.user.id}`,
			`password: ${password}`,
			'```'
		))
	})