import Command from "@/bot/command"
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js"
import linkSourcexchangeButton from "@/bot/buttons/link/sourcexchange"

export default new Command()
	.build((builder) => builder
		.setName('link')
		.setDMPermission(false)
		.setDescription('Link a purchase to your account')
		.addSubcommand((command) => command
			.setName('sourcexchange')
			.setDescription('Link a SourceXchange purchase')
		)
	)
	.listen((ctx) => {
		switch (ctx.interaction.options.getSubcommand()) {
			case "sourcexchange": {
				return ctx.interaction.reply({
					ephemeral: true,
					embeds: [
						ctx.Embed()
							.setTitle('`🔗` Link Purchase')
							.setDescription(ctx.join(
								'To link one of your purchases, please visit your [accesses](https://www.sourcexchange.net/accesses),',
								'and copy the transaction id of the addon you want to link as shown below.'
							))
							.setImage('https://cdn.rjns.dev/addons/sourcexchange_linking_instructions.jpg')
					], components: [
						new ActionRowBuilder()
							.setComponents(
								new ButtonBuilder()
									.setLabel('Link Purchase')
									.setEmoji('1150889514236137605')
									.setStyle(ButtonStyle.Primary)
									.setCustomId(linkSourcexchangeButton(ctx.interaction))
							) as any
					]
				})
			}
		}
	})