import Command from "@/bot/command"
import { count, eq } from "drizzle-orm"
import productsButton from "@/bot/buttons/products"

export default new Command()
	.build((builder) => builder
		.setName('products')
		.setDMPermission(false)
		.setDescription('Get all available products')
	)
	.listen(async(ctx) => {
		const [ products, total ] = await Promise.all([
			ctx.database.select({
				name: ctx.database.schema.products.name,
				icon: ctx.database.schema.products.icon,
				banner: ctx.database.schema.products.banner,
				summary: ctx.database.schema.products.summary,
				provider: ctx.database.schema.productProviders.provider,
				price: ctx.database.schema.productProviders.price,
				currency: ctx.database.schema.productProviders.currency,
				link: ctx.database.schema.productProviders.link
			}).from(ctx.database.schema.products)
				.leftJoin(ctx.database.schema.productProviders, eq(ctx.database.schema.products.id, ctx.database.schema.productProviders.productId))
				.orderBy(ctx.database.schema.products.id)
				.offset(0)
				.limit(ctx.database.schema.productProvider.enumValues.length),
			ctx.database.select({
				count: count(ctx.database.schema.products.id)
			}).from(ctx.database.schema.products).then((r) => r[0].count)
		])

		return ctx.interaction.reply({
			embeds: [
				ctx.Embed()
					.setTitle('`📦` Products')
					.setImage(products[0].banner)
					.setThumbnail(products[0].icon)
					.setDescription(ctx.join(
						`## ${products[0].name}`,
						products[0].summary,
						'',
						'**Purchase**',
						...products.map((product) =>
							`[${ctx.database.properCaseProvider(product.provider!)}](<${product.link}>) - \`${parseFloat(product.price!).toFixed(2)} ${product.currency}\``
						)
					))
					.setFooter({ text: `${total} Products` })
			], components: ctx.paginateButtons(1, total, (type) => productsButton(ctx.interaction, 1, type), 1)
		})
	})