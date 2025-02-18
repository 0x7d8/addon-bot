import env from "@/globals/env"
import { number, time } from "@rjweb/utils"
import axios from "axios"
import cache from "@/globals/cache"

/**
 * Get Accesses for a Product
 * @since 1.2.0
*/ export async function access(product: number, member: number) {
	await time.wait(time(number.generate(10, 300)).ms())

	const { data } = await axios.get<{
		data: {
			license_id: number
			purchaser_id: number
			start_date: number
		}
	}>(`https://api.builtbybit.com/v1/resources/${product}/licenses/members/${member}`, {
		headers: {
			Authorization: `Private ${env.BBB_TOKEN}`,
			Accept: 'application/json'
		}
	}).catch(() => ({ data: null }))

	return data?.data || null
}

/**
 * Get User by Discord Id
 * @since 1.3.0
*/ export async function user(discord: string): Promise<number> {
	return cache.use(`builtbybit::user::${discord}`, async() => {
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

		return data.data.member_id
	}, time(1).h())
}