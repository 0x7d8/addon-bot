import Command from "@/bot/command"
import { string, time } from "@rjweb/utils"
import { eq, and } from "drizzle-orm"

export default new Command()
	.build((builder) => builder
		.setName('demo')
		.setDMPermission(false)
		.setDescription('Request a demo account')
	)
	.listen(async(ctx) => {
		const demoAccesses = await ctx.database.select({
			password: ctx.database.schema.demoAcccesses.password,
			expired: ctx.database.schema.demoAcccesses.expired,
			created: ctx.database.schema.demoAcccesses.created
		}).from(ctx.database.schema.demoAcccesses)

		const active = demoAccesses.find((access) => !access.expired)
		if (active) return ctx.interaction.reply({
			ephemeral: true,
			content: ctx.join(
				'`🔍` You already have an active demo account.',
				`expires <t:${Math.floor((active.created.getTime() + time(1).h()) / 1000)}:R>`,
				'',
				ctx.env.PTERO_URL,
				'```properties',
				`username: demo.${ctx.interaction.user.id}`,
				`password: ${active.password}`,
				'```'
			)
		})

		if (demoAccesses.some((access) => access.created.getTime() > Date.now() - time(1).d())) return ctx.interaction.reply({
			ephemeral: true,
			content: '`🔍` You have already requested a demo account in the last 24 hours, please wait or ask in a ticket.'
		})

		const password = string.generate({
			length: 16,
			uppercase: false
		})

		await Promise.all([
			ctx.database.insert(ctx.database.schema.demoAcccesses)
				.values({
					discordId: ctx.interaction.user.id,
					pterodactylId: -1,
					password
				}),
			ctx.interaction.deferReply({ ephemeral: true })
		])

		const id = await ctx.pterodactyl.createUser(ctx.interaction.user, password)

		await Promise.all([
			ctx.database.update(ctx.database.schema.demoAcccesses)
				.set({ pterodactylId: id })
				.where(and(
					eq(ctx.database.schema.demoAcccesses.discordId, ctx.interaction.user.id),
					eq(ctx.database.schema.demoAcccesses.password, password)
				)),
			ctx.client.guilds.cache.get(ctx.env.DISCORD_SERVER)!
				.members.fetch(ctx.interaction.user.id)
					.then((member) => member.roles.add(ctx.env.DEMO_ROLE))
		])

		return ctx.interaction.editReply(ctx.join(
			'`🔍` Demo account created.',
			`expires <t:${Math.floor((Date.now() + time(1).h()) / 1000)}:R>`,
			'',
			ctx.env.PTERO_URL,
			'```properties',
			`username: demo.${ctx.interaction.user.id}`,
			`password: ${password}`,
			'```'
		))
	})