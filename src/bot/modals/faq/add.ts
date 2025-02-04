import Modal from "@/bot/modal"
import { MessageFlags, TextInputBuilder, TextInputStyle } from "discord.js"

export default new Modal()
	.setName('add-faq')
	.setTitle('Add FAQ')
	.build((builder) => builder
		.addRow((row) => row
			.addComponents([
				new TextInputBuilder()
					.setLabel('Title')
					.setCustomId('title')
					.setPlaceholder('title')
					.setStyle(TextInputStyle.Short)
					.setMaxLength(31)
					.setMinLength(2)
					.setRequired(true)
			])
		)
		.addRow((row) => row
			.addComponents([
				new TextInputBuilder()
					.setLabel('Content')
					.setCustomId('content')
					.setPlaceholder('content')
					.setStyle(TextInputStyle.Paragraph)
					.setMinLength(100)
					.setRequired(true)
			])
		)
	)
	.listen(async(ctx) => {
		if (!ctx.interaction.guild) return

		const title = ctx.interaction.fields.getTextInputValue('title'),
			content = ctx.interaction.fields.getTextInputValue('content')

		try {
			await ctx.database.insert(ctx.database.schema.faqs)
				.values({ title, content })

			return ctx.interaction.reply({
				content: '`✅` FAQ has been added.',
				flags: [
					MessageFlags.Ephemeral
				]
			})
		} catch {
			return ctx.interaction.reply({
				content: '`❌` This Title is already taken.',
				embeds: [
					ctx.Embed()
						.setTitle(title)
						.setDescription(content)
				], flags: [
					MessageFlags.Ephemeral
				]
			})
		}
	})
	.export()