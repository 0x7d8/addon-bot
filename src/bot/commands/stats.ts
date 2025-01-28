import Command from "@/bot/command"
import { InteractionContextType } from "discord.js"
import { count, eq, and, sum, avg, countDistinct } from "drizzle-orm"

export default new Command()
	.build((builder) => builder
		.setName('stats')
		.setContexts(InteractionContextType.Guild)
		.setDescription('Get basic statistics')
	)
	.listen(async(ctx) => {
		const [ products, links, demos, tickets ] = await Promise.all([
			ctx.database.select({
				count: count(ctx.database.schema.products.name),
				sum: sum(ctx.database.schema.productProviders.price),
				average: avg(ctx.database.schema.productProviders.price)
			}).from(ctx.database.schema.products)
				.leftJoin(ctx.database.schema.productProviders, and(
					eq(ctx.database.schema.products.id, ctx.database.schema.productProviders.productId),
					eq(ctx.database.schema.productProviders.currency, 'EUR')
				))
				.then((r) => r[0]),
			ctx.database.select({
				count: count(ctx.database.schema.productLinks.id),
				uniqueUsersCount: countDistinct(ctx.database.schema.productLinks.discordId)
			}).from(ctx.database.schema.productLinks)
				.then((r) => r[0]),
			ctx.database.select({
				count: count(ctx.database.schema.demoAccesses.id)
			}).from(ctx.database.schema.demoAccesses)
				.then((r) => r[0]),
			ctx.interaction.guild!.channels.fetch()
				.then((channels) => channels.filter((c) => c?.parent?.name.toLowerCase().includes('tickets')).size)
		])

		return ctx.interaction.reply({
			embeds: [
				ctx.Embed()
					.setTitle('`📈` Global Statistics')
					.setFields([
						{
							name: '`📦` Total Products',
							value: `\`${products.count}\``,
							inline: true
						},
						{
							name: '`💶` Total Product Price',
							value: `\`${parseFloat(products.sum ?? '0').toFixed(2)} EUR\``,
							inline: true
						},
						{
							name: '`💰` Average Product Price',
							value: `\`${parseFloat(products.average ?? '0').toFixed(2)} EUR\``,
							inline: true
						},
						{
							name: '`🔗` Linked Purchases',
							value: `\`${links.count}\``,
							inline: true
						},
						{
							name: '`👤` Unique Linked Buyers',
							value: `\`${links.uniqueUsersCount}\``,
							inline: true
						},
						{
							name: '`🔍` Demo Accesses',
							value: `\`${demos.count}\``,
							inline: true
						},
						{
							name: '`🦅` Members',
							value: `\`${ctx.interaction.guild?.memberCount}\``,
							inline: true
						},
						{
							name: '`🎫` Open Tickets',
							value: `\`${tickets}\``,
							inline: true
						}
					])
			]
		})
	})