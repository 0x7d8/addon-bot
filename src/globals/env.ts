import { filesystem, string } from "@rjweb/utils"
import { z } from "zod"

let env: Record<string, string | undefined>
try {
	env = filesystem.env('./.env', { async: false })
} catch {
	try {
		env = filesystem.env('../.env', { async: false })
	} catch {
		env = process.env
	}
}

const infos = z.object({
	DATABASE_URL: z.string(),
	SENTRY_URL: z.string().optional(),
	DISCORD_SERVER: z.string(),

	BOT_TOKEN: z.string(),
	SXC_TOKEN: z.string(),
	BBB_TOKEN: z.string(),

	PTERO_URL: z.string(),
	PTERO_THEME_URLS: z.string().transform((v) => string.kv(v, null, ',', '=')).optional(),
	PTERO_DEMO_SERVERS: z.string().transform((v) => v.split(',')),
	PTERO_ADMIN_TOKEN: z.string(),
	PTERO_CLIENT_TOKEN: z.string(),

	S3_URL: z.string().optional(),
	S3_SSL: z.union([ z.literal('true'), z.literal('false') ]).transform((str) => str === 'true').default('true'),
	S3_BUCKET: z.string().optional(),
	S3_REGION: z.string().optional(),
	S3_HOST: z.string().optional(),
	S3_PORT: z.string().transform((str) => parseInt(str)).default('443'),
	S3_ACCESS_KEY: z.string().optional(),
	S3_SECRET_KEY: z.string().optional(),

	TICKET_CATEGORY: z.string(),
	DEMO_CHANNEL: z.string(),
	DEMO_ROLE: z.string(),
	CUSTOMER_ROLE: z.string(),
	SUPPORT_ROLE: z.string(),

	PORT: z.string().transform((v) => parseInt(v)).optional(),
	ENCODING_SEQUENCE: z.string(),
	LOG_LEVEL: z.union([ z.literal('none'), z.literal('info'), z.literal('debug') ])
})

export type Environment = z.infer<typeof infos>

export default infos.parse(env)