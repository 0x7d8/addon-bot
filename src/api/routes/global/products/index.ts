import { globalAPIRouter } from "@/api"
import { time } from "@rjweb/utils"

export = new globalAPIRouter.Path('/')
	.http('GET', '/', (http) => http
		.onRequest(async(ctr) => {
			const products = await ctr["@"].cache.use('products', () => ctr["@"].database.select({
					id: ctr["@"].database.schema.products.id,
					name: ctr["@"].database.schema.products.name,
					version: ctr["@"].database.schema.products.version,
					icon: ctr["@"].database.schema.products.icon,
					banner: ctr["@"].database.schema.products.banner,
					summary: ctr["@"].database.schema.products.summary
				})
					.from(ctr["@"].database.schema.products)
					.orderBy(ctr["@"].database.schema.products.id),
				time(5).m()
			)

			return ctr.print({
				success: true,
				products
			})
		})
	)