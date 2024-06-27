import Command from "@/bot/command"
import { count, eq, and, sum, avg } from "drizzle-orm"

export default new Command()
	.build((builder) => builder
		.setName('stats')
		.setDMPermission(false)
		.setDescription('Get basic statistics')
	)
	.listen(async(ctx) => {
		const products = await ctx.database.select({
			count: count(ctx.database.schema.products.name),
			sum: sum(ctx.database.schema.productProviders.price),
			average: avg(ctx.database.schema.productProviders.price)
		}).from(ctx.database.schema.products)
			.leftJoin(ctx.database.schema.productProviders, and(
				eq(ctx.database.schema.products.id, ctx.database.schema.productProviders.productId),
				eq(ctx.database.schema.productProviders.currency, 'EUR')
			))
			.then((r) => r[0])

		return ctx.interaction.reply({
			ephemeral: true,
			embeds: [
				ctx.Embed()
					.setTitle('`📈` Statistics')
					.setFields([
						{
							name: '`📦` Products',
							value: `\`${products.count}\``,
							inline: true
						},
						{
							name: '`💶` Total Price',
							value: `\`${parseFloat(products.sum ?? '0').toFixed(2)}€\``,
							inline: true
						},
						{
							name: '`💰` Average Price',
							value: `\`${parseFloat(products.average ?? '0').toFixed(2)}€\``,
							inline: true
						}
					])
			]
		})
	})