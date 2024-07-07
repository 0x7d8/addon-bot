import env from "@/globals/env"
import { time } from "@rjweb/utils"
import axios from "axios"

const cache = new Map<number, {
	license_id: number
	purchase_date: number
}[]>()

/**
 * Get Accesses for a Product
 * @since 1.2.0
*/ export async function accesses(product: number) {
	const cached = cache.get(product)
	if (cached) return cached

	const data = await axios.get<{
		license_id: number
		purchase_date: number
	}[]>(`https://api.builtbybit.com/v1/resources/${product}/purchases`, {
		headers: {
			Authorization: `Private ${env.BBB_TOKEN}`,
			Accept: 'application/json'
		}
	})

	cache.set(product, data.data)
	setTimeout(() => cache.delete(product), time(2).m())

	return data.data
}