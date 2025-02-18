import { Redis } from "ioredis"
import { version } from "ioredis/package.json"
import logger from "@/globals/logger"
import env from "@/globals/env"
import { time } from "@rjweb/utils"

const startTime = performance.now(),	
	localCache = new Map<string, any>()

const redis = new Redis(env.REDIS_URL, {
	keyPrefix: '0x7f6::bot::'
})

redis.once('connect', () => {
	logger()
		.text('Cache', (c) => c.yellow)
		.text(`(${version}) Connection established!`)
		.text(`(${(performance.now() - startTime).toFixed(1)}ms)`, (c) => c.gray)
		.info()
})

export default Object.assign(redis, {
	async use<Run extends () => Promise<any> | any>(key: string, run: Run, expire: number = time(3).s()): Promise<Awaited<ReturnType<Run>>> {
		const mapResult = localCache.get(key)
		if (mapResult) return mapResult

		const redisResult = await redis.get(key)
		if (redisResult) return JSON.parse(redisResult)

		const runResult = await Promise.resolve(run())
		if (!expire) await redis.set(key, JSON.stringify(runResult))
		else if (expire > time(15).s()) await redis.set(key, JSON.stringify(runResult), 'EX', Math.ceil(expire / 1000))
		else {
			localCache.set(key, runResult)

			setTimeout(() => {
				localCache.delete(key)
			}, expire)
		}

		return runResult
	},

	local: {
		use<Run extends () => any>(key: string, run: Run, expire: number = time(3).s()): ReturnType<Run> {
			const mapResult = localCache.get(key)
			if (mapResult) return mapResult

			const runResult = run()
			localCache.set(key, runResult)

			if (!!expire) setTimeout(() => {
				localCache.delete(key)
			}, expire)

			return runResult
		}
	} as const
})