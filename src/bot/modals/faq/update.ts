import Modal from "@/bot/modal"
import { MessageFlags, TextInputBuilder, TextInputStyle } from "discord.js"
import { eq } from "drizzle-orm"
import database from "@/globals/database"

export default new Modal()
	.setName('update-faq')
	.setTitle('Update FAQ')
	.build(async(builder, id: number) => {
		const data = await database.select({
			title: database.schema.faqs.title,
			content: database.schema.faqs.content
		}).from(database.schema.faqs)
			.where(eq(database.schema.faqs.id, id))
			.limit(1)
			.then((r) => r[0])

		return builder
			.addRow((row) => row
				.addComponents([
					new TextInputBuilder()
						.setLabel('Title')
						.setCustomId('title')
						.setStyle(TextInputStyle.Short)
						.setMinLength(2)
						.setMaxLength(31)
						.setRequired(true)
						.setValue(data.title)
				])
			)
			.addRow((row) => row
				.addComponents([
					new TextInputBuilder()
						.setLabel('Content')
						.setCustomId('content')
						.setStyle(TextInputStyle.Paragraph)
						.setMinLength(100)
						.setRequired(true)
						.setValue(data.content)
				])
			)
	})
	.listen(async(ctx, id: number) => {
		if (!ctx.interaction.guild) return

		const title = ctx.interaction.fields.getTextInputValue('title'),
			content = ctx.interaction.fields.getTextInputValue('content')

		try {
			await ctx.database.update(ctx.database.schema.faqs)
				.set({ title, content })
				.where(eq(ctx.database.schema.faqs.id, id))

			return ctx.interaction.reply({
				content: '`✅` FAQ has been updated.',
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