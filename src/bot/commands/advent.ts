import Command from "@/bot/command"
import { number, time } from "@rjweb/utils"
import { InteractionContextType, MessageFlags } from "discord.js"
import { and, count, eq, sql } from "drizzle-orm"

const cooldowns = new Map<string, number>()

setInterval(() => {
	for (const [ id, cooldown ] of cooldowns) {
		if (cooldown < Date.now()) cooldowns.delete(id)
	}
}, time(1).m())

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
		if (cooldowns.has(ctx.interaction.user.id)) {
			const cooldown = cooldowns.get(ctx.interaction.user.id)!

			if (cooldown > Date.now()) return ctx.interaction.reply({
				content: `\`⏳\` You are on cooldown, please try again <t:${Math.ceil(cooldown / 1000)}:R>.`,
				flags: [
					MessageFlags.Ephemeral
				]
			})
		}

		cooldowns.set(ctx.interaction.user.id, Date.now() + time(number.generate(30, 60)).s())

		const month = new Date().getMonth() + 1
		if (month !== 12) return ctx.interaction.reply({
			content: '`🔍` The advent calendar is only available in December.',
			flags: [
				MessageFlags.Ephemeral
			]
		})

		const day = new Date().getUTCDate()

		if (day >= 25) return ctx.interaction.reply({
			content: '`🔍` The advent calendar has ended, see you again next year!',
			flags: [
				MessageFlags.Ephemeral
			]
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
			content: '`🔍` There is no reward available for today.',
			flags: [
				MessageFlags.Ephemeral
			]
		})

		if (reward.after) {
			const time = new Date(`${new Date().toDateString()} ${reward.after}`).getTime()

			if (time > Date.now()) return ctx.interaction.reply({
				content: ctx.join(
					'`🔍` The reward for today will be made available later. Check back in a bit!',
					'-# This is likely a bigger reward.'
				), flags: [
					MessageFlags.Ephemeral
				]
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
				content: `\`🔍\` The reward for today has already been redeemed ${reward.maxRedeems} times.`,
				flags: [
					MessageFlags.Ephemeral
				]
			})
		}

		await ctx.database.insert(ctx.database.schema.adventCalendarRedeems)
			.values({ calendarDayId: reward.id, discordId: ctx.interaction.user.id })
			.onConflictDoNothing()

		return ctx.interaction.reply({
			content: ctx.join(
				`\`🎉\` Reward redeemed for Day ${day}!`,
				'',
				reward.content
			), flags: [
				MessageFlags.Ephemeral
			]
		})
	})