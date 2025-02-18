import { globalAPIRouter } from "@/api"
import { time } from "@rjweb/utils"
import { desc, eq } from "drizzle-orm"

export = new globalAPIRouter.Path('/')
	.http('GET', '/', (http) => http
		.onRequest(async(ctr) => {
			const product = parseInt(ctr.params.get('product', '0'))
			if (!product || isNaN(product) || product < 1) return ctr.status(ctr.$status.BAD_REQUEST).print({ success: false, errors: ['Invalid product'] })

			const [ data ] = await ctr["@"].cache.use(`product::${product}`, () => ctr["@"].database.select({
					id: ctr["@"].database.schema.products.id,
					name: ctr["@"].database.schema.products.name,
					version: ctr["@"].database.schema.products.version,
					icon: ctr["@"].database.schema.products.icon,
					banner: ctr["@"].database.schema.products.banner,
					summary: ctr["@"].database.schema.products.summary
				})
					.from(ctr["@"].database.schema.products)
					.where(eq(ctr["@"].database.schema.products.id, product))
					.limit(1),
				time(5).m()
			)

			if (!data) return ctr.status(ctr.$status.NOT_FOUND).print({ success: false, errors: ['Product not found'] })

			const [ providers, changelogs ] = await ctr["@"].cache.use(`product::${product}::extra`, () => Promise.all([
				ctr["@"].database.select({
					provider: ctr["@"].database.schema.productProviders.provider,
					price: ctr["@"].database.schema.productProviders.price,
					link: ctr["@"].database.schema.productProviders.link,
					currency: ctr["@"].database.schema.productProviders.currency
				})
					.from(ctr["@"].database.schema.productProviders)
					.where(eq(ctr["@"].database.schema.productProviders.productId, product)),
				ctr["@"].database.select({
					version: ctr["@"].database.schema.productChangelogs.version,
					content: ctr["@"].database.schema.productChangelogs.content,
					created: ctr["@"].database.schema.productChangelogs.created
				})
					.from(ctr["@"].database.schema.productChangelogs)
					.where(eq(ctr["@"].database.schema.productChangelogs.productId, product))
					.orderBy(desc(ctr["@"].database.schema.productChangelogs.created))
			]), time(5).m())

			return ctr.print({
				success: true,
				product: data,
				providers: Object.fromEntries(providers.map((provider) => [
					provider.provider,
					{
						name: ctr["@"].database.properCaseProvider(provider.provider),
						price: parseFloat(provider.price),
						currency: provider.currency,
						link: provider.link
					}
				])),

				changelogs: Object.fromEntries(changelogs.map((changelog) => [
					changelog.version,
					{
						content: changelog.content,
						created: changelog.created
					}
				]))
			})
		})
	)