import Select, { Exported } from "@/bot/select"
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js"
import forceOpen from "@/bot/buttons/tickets/force-open"

const select: Exported<[options: string[]], [data: number[], key: number, logs: string]> = new Select()
	.setName('ticket-diagnosis')
	.setPlaceholder('Answer Question')
	.build((builder, options: string[]) => {
		for (const string of options) {
			builder.addOption((option) => option
				.setLabel(string)
				.setValue(string)
			)
		}

		return builder
	})
	.listen((ctx, rawData: number[], rawKey: number, logs: string) => {
		const data = ctx.support.expandData(rawData),
			key = ctx.support.expandKey(rawKey)

		data[key] = ctx.interaction.values[0]
		const question = ctx.support.nextQuestion(data)

		if (!question) {
			const solution = ctx.support.findSolution(data)

			if (!solution) {
				return ctx.interaction.update({
					embeds: [
						ctx.Embed()
							.setTitle('`⚒️` Self-Diagnosis')
							.setDescription(ctx.join(
								'Unfortunately, we could not find a solution to your problem.',
								'',
								'> **Solution**',
								'> We recommend opening a ticket so we can assist you further.'
							))
					], components: [
						new ActionRowBuilder()
							.addComponents(
								new ButtonBuilder()
									.setLabel('Open Ticket')
									.setStyle(ButtonStyle.Primary)
									.setEmoji('1150889684227076227')
									.setCustomId(forceOpen(ctx.interaction, ctx.support.compactData(data), logs))
							) as any
					]
				})
			} else {
				return ctx.interaction.update({
					embeds: [
						ctx.Embed()
							.setTitle('`⚒️` Self-Diagnosis')
							.setDescription(ctx.join(
								'We have found a potential solution to your problem. See if this helps, **if not** you can still open a ticket.',
								'',
								`> **${solution.name}**`,
								`> ${solution.solution}`
							))
					], components: [
						new ActionRowBuilder()
							.addComponents(
								new ButtonBuilder()
									.setLabel('Open Ticket')
									.setStyle(ButtonStyle.Primary)
									.setEmoji('1150889684227076227')
									.setCustomId(forceOpen(ctx.interaction, ctx.support.compactData(data), logs))
							) as any
					]
				})
			}
		}

		return ctx.interaction.update({
			embeds: [
				ctx.Embed()
					.setTitle('`⚒️` Self-Diagnosis')
					.setDescription(ctx.join(
						'Before we open a ticket, we will ask you some questions in hopes of you finding the solution to your problem.',
						'',
						'> **Question**',
						`> ${question.question}`
					))
			], components: [
				new ActionRowBuilder()
					.addComponents(
						select(ctx, [question.possibleValues], [ctx.support.compactData(data), question.id, logs])
					) as any
			]
		})
	})
	.export()

export default select