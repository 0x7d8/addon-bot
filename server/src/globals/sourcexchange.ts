import env from "@/globals/env"
import { time } from "@rjweb/utils"
import axios from "axios"

const cache = new Map<number, {
	remote_id: string
	created_at: string
}[]>()

/**
 * Get Accesses for a Product
 * @since 1.0.0
*/ export async function accesses(product: number) {
	const cached = cache.get(product)
	if (cached) return cached

	const data = await axios.get<{
		remote_id: string
		created_at: string
	}[]>(`https://www.sourcexchange.net/api/products/${product}/payments`, {
		headers: {
			Authorization: `Bearer ${env.SXC_TOKEN}`,
			Accept: 'application/json'
		}
	})

	cache.set(product, data.data)
	setTimeout(() => cache.delete(product), time(1).m())

	return data.data
}