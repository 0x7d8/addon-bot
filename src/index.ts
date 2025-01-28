import * as Sentry from "@sentry/node"
import { system, filesystem } from "@rjweb/utils"
import * as fs from "fs"
import Crontab, { runContext } from "@/crontab"
import cron from "node-cron"
import env from "@/globals/env"
import logger from "@/globals/logger"

Sentry.init({
	dsn: env.SENTRY_URL,
	environment: process.env.NODE_ENV === 'development' ? 'development' : 'production'
})

export default function getVersion() {
	return `${JSON.parse(fs.readFileSync('../package.json', 'utf8')).version}:${system.execute('git rev-parse --short=10 HEAD').trim()}`
}

Promise.all([ ...filesystem.getFiles(`${__dirname}/crontabs`, { recursive: true }).filter((file) => file.endsWith('js')).map(async(file) => {
	const cronFile = (await import(file)).default.default

	if (cronFile instanceof Crontab) {
		cron.schedule(cronFile['interval'], async() => {
			try {
				await Promise.resolve(cronFile['listener'](runContext))
			} catch (error: any) {
				logger()
					.text('Crontab Error')
					.text('\n')
					.text(error.stack ?? error.toString(), (c) => c.red)
					.error()
			}
		}, {
			timezone: 'UTC'
		})
	}
}) ]).then(() => {
	if (env.PORT) require('@/api')
	require('@/bot')
})