import env from "@/globals/env"
import axios from "axios"

/**
 * Get a Payment for a Product Payment Remote Id
 * @since 1.3.1
*/ export async function payment(identifier: string) {
	const data = await axios.get<{
		product_id: number
		created_at: string
		status: 'pending' | 'completed'
	}>(`https://www.sourcexchange.net/api/payments/${identifier}`, {
		validateStatus: (status) => status === 200,
		headers: {
			Authorization: `Bearer ${env.SXC_TOKEN}`,
			Accept: 'application/json'
		}
	}).catch(() => ({ data: null }))

	return data.data
}