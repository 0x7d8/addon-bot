import env from "@/globals/env"
import { time } from "@rjweb/utils"
import axios from "axios"

const cache = new Map<number, {
	license_id: number
	purchaser_id: number
	purchase_date: number
}[]>()

const cache2 = new Map<string, number>()

/**
 * Get Accesses for a Product
 * @since 1.2.0
*/ export async function accesses(product: number) {
	const cached = cache.get(product)
	if (cached) return cached

	const { data } = await axios.get<{
		data: {
			license_id: number
			purchaser_id: number
			purchase_date: number
		}[]
	}>(`https://api.builtbybit.com/v1/resources/${product}/licenses`, {
		headers: {
			Authorization: `Private ${env.BBB_TOKEN}`,
			Accept: 'application/json'
		}
	})

	cache.set(product, data.data)
	setTimeout(() => cache.delete(product), time(2).m())

	return data.data
}

/**
 * Get User by Discord Id
 * @since 1.3.0
*/ export async function user(discord: string): Promise<number> {
	const cached = cache2.get(discord)
	if (cached) return cached

	const { data } = await axios.get<{
		data: {
			member_id: number
		}
	}>(`https://api.builtbybit.com/v1/members/discords/${discord}`, {
		headers: {
			Authorization: `Private ${env.BBB_TOKEN}`,
			Accept: 'application/json'
		}
	})

	cache2.set(discord, data.data.member_id)

	return data.data.member_id
}