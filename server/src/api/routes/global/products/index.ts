import { globalAPIRouter } from "@/api"

export = new globalAPIRouter.Path('/')
	.http('GET', '/', (http) => http
		.onRequest(async(ctr) => {
			const products = await ctr["@"].database.select({
				id: ctr["@"].database.schema.products.id,
				name: ctr["@"].database.schema.products.name,
				version: ctr["@"].database.schema.products.version,
				icon: ctr["@"].database.schema.products.icon,
				banner: ctr["@"].database.schema.products.banner,
				summary: ctr["@"].database.schema.products.summary
			})
				.from(ctr["@"].database.schema.products)

			return ctr.print({
				success: true,
				products
			})
		})
	)