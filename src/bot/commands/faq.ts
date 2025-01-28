import Command from "@/bot/command"
import { InteractionContextType } from "discord.js"
import { eq, ilike } from "drizzle-orm"

export default new Command()
	.build((builder) => builder
		.setName('faq')
		.setContexts(InteractionContextType.Guild)
		.setDescription('Get faqs for various issues')
		.addIntegerOption((option) => option
			.setName('faq')
			.setDescription('The faq you want to search for')
			.setRequired(true)
			.setAutocomplete(true)
		)
	)
	.listen(async(ctx) => {
		const faq = ctx.interaction.options.getInteger('faq', true)

		const data = await ctx.database.select({
			title: ctx.database.schema.faqs.title,
			content: ctx.database.schema.faqs.content
		}).from(ctx.database.schema.faqs)
			.where(eq(ctx.database.schema.faqs.id, faq))
			.limit(1)
			.then((r) => r[0])

		if (!data) return ctx.interaction.reply({
			ephemeral: true,
			content: '`🔍` FAQ not found.'
		})

		return ctx.interaction.reply({
			embeds: [
				ctx.Embed()
					.setTitle(data.title)
					.setDescription(data.content)
			]
		})
	})
	.listenAutocomplete(async(ctx) => {
		const search = ctx.interaction.options.getFocused(false)

		const faqs = await ctx.database.select({
			id: ctx.database.schema.faqs.id,
			title: ctx.database.schema.faqs.title,
		}).from(ctx.database.schema.faqs)
			.where(ilike(ctx.database.schema.faqs.title, `%${search}%`))
			.limit(25)

		return ctx.interaction.respond(faqs.map((faq) => ({
			name: faq.title[0] === '`' && faq.title[3] === '`' ? faq.title.slice(4) : faq.title,
			value: faq.id
		})))
	})