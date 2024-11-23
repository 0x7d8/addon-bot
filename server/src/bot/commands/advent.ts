import Command from "@/bot/command"
import { InteractionContextType } from "discord.js"
import { and, count, eq, sql } from "drizzle-orm"

export default new Command()
	.build((builder) => builder
		.setName('advent')
		.setContexts(InteractionContextType.Guild)
		.setDescription('Redeem the current advent calendar reward')
		.addSubcommand((subcommand) => subcommand
			.setName('redeem')
			.setDescription('Redeem the current advent calendar reward')
		)
	)
	.listen(async(ctx) => {
		const month = new Date().getMonth() + 1
		if (month !== 12) return ctx.interaction.reply({
			ephemeral: true,
			content: '`🔍` The advent calendar is only available in December.'
		})

		const day = new Date().getUTCDate()

		if (day >= 25) return ctx.interaction.reply({
			ephemeral: true,
			content: '`🔍` The advent calendar has ended, see you again next year!'
		})

		const reward = await ctx.database.select({
			id: ctx.database.schema.adventCalendarDays.id,
			content: ctx.database.schema.adventCalendarDays.content,
			maxRedeems: ctx.database.schema.adventCalendarDays.maxRedeems,
			after: ctx.database.schema.adventCalendarDays.after,
			redeems: count(ctx.database.schema.adventCalendarRedeems.discordId)
		})
			.from(ctx.database.schema.adventCalendarDays)
			.leftJoin(ctx.database.schema.adventCalendarRedeems, eq(ctx.database.schema.adventCalendarRedeems.calendarDayId, ctx.database.schema.adventCalendarDays.id))
			.where(and(
				eq(ctx.database.schema.adventCalendarDays.day, day),
				eq(ctx.database.schema.adventCalendarDays.year, new Date().getUTCFullYear())
			))
			.groupBy(ctx.database.schema.adventCalendarDays.id)
			.limit(1)
			.then((r) => r[0])

		if (!reward) return ctx.interaction.reply({
			ephemeral: true,
			content: '`🔍` There is no reward available for today.'
		})

		if (reward.after) {
			const time = new Date(`${new Date().toTimeString()} ${reward.after}`).getTime()

			if (time > Date.now()) return ctx.interaction.reply({
				ephemeral: true,
				content: '`🔍` The reward for today is not available yet. Check back in a bit!'
			})
		}

		if (reward.maxRedeems && reward.redeems >= reward.maxRedeems) {
			const didRedeem = await ctx.database.select({ _: sql`1` })
				.from(ctx.database.schema.adventCalendarRedeems)
				.where(and(
					eq(ctx.database.schema.adventCalendarRedeems.calendarDayId, reward.id),
					eq(ctx.database.schema.adventCalendarRedeems.discordId, ctx.interaction.user.id)
				))
				.limit(1)
				.then((r) => r[0])

			if (!didRedeem) return ctx.interaction.reply({
				ephemeral: true,
				content: `\`🔍\` The reward for today has already been redeemed ${reward.maxRedeems} times.`
			})
		}

		await ctx.database.insert(ctx.database.schema.adventCalendarRedeems)
			.values({
				calendarDayId: reward.id,
				discordId: ctx.interaction.user.id
			})
			.onConflictDoNothing()

		return ctx.interaction.reply({
			ephemeral: true,
			content: ctx.join(
				`\`🎉\` Reward redeemed for Day ${day}!`,
				'',
				reward.content
			)
		})
	})