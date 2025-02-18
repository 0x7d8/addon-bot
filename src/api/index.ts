import { Server, version as Version, Cors } from "rjweb-server"
import { sentry } from "@rjweb/sentry"
import getVersion from "@/index"
import logger from "@/globals/logger"
import database from "@/globals/database"
import env from "@/globals/env"
import { Runtime } from "@rjweb/runtime-node"
import cache from "@/globals/cache"

const startTime = performance.now()

export const server = new Server(Runtime, {
  port: env.PORT,
  proxy: {
    enabled: true,
    credentials: {
      authenticate: false
    }
  }, logging: {
    debug: env.LOG_LEVEL === 'debug'
  }
}, [
	Cors.use({ allowAll: true }),
  sentry.use({
    dsn: env.SENTRY_URL
  })
], {
	appVersion: getVersion(),
  database,
  cache,
  logger,
  env,
  join(...strings: (string | number | undefined | null | boolean)[]): string {
		return strings.filter((str) => str === '' || Boolean(str)).join('\n')
	}
})

export const globalAPIRouter = new server.FileLoader('/')
  .load('api/routes/global', {
    fileBasedRouting: true
  })
  .export()

server.http((ctr) => {
  logger()
    .text(`${ctr.type.toUpperCase()} ${ctr.url.method}`, (c) => c.green)
    .text(':')
    .text(ctr.url.href, (c) => c.green)
    .text(ctr.client.ip.usual(), (c) => c.cyan)
    .text(ctr.context.ip.isProxied ? '(proxied)' : '(raw)', (c) => c.gray)
    .info()
})

server.rateLimit('httpRequest', (ctr) => {
  return ctr.status(ctr.$status.TOO_MANY_REQUESTS).print({ success: false, errors: ['You are making too many requests! Slow down.'] })
})

server.error('httpRequest', (ctr, error) => {
  if (process.env.NODE_ENV === 'development') ctr.status(ctr.$status.INTERNAL_SERVER_ERROR).print({ success: false, errors: [error.toString()] })
  else ctr.status(ctr.$status.INTERNAL_SERVER_ERROR).print({ success: false, errors: ['An Unknown Server Error has occured'] })

  logger()
    .text('HTTP Request Error')
    .text('\n')
    .text(error.toString(), (c) => c.red)
    .error()
})

server.notFound(async(ctr) => {
	return ctr.status(ctr.$status.NOT_FOUND).print({ success: false, errors: ['Route not found'] })
})

server.start()
  .then((port) => {
    logger()
      .text('HTTP Server', (c) => c.redBright)
      .text(`(${Version}) started on port`)
      .text(port, (c) => c.cyan)
      .text(`(${(performance.now() - startTime).toFixed(1)}ms)`, (c) => c.gray)
      .info()
  })
  .catch((err: Error) => {
    logger()
      .text('HTTP Server', (c) => c.redBright)
      .text('failed starting')
      .text('\n')
      .text(err.stack!, (c) => c.red)
      .error()
  })