import { filesystem } from "@rjweb/utils"
import { z } from "zod"

let env: Record<string, string | undefined>
try {
	env = filesystem.env('../.env', { async: false })
} catch {
	try {
		env = filesystem.env('../../.env', { async: false })
	} catch {
		env = process.env
	}
}

const infos = z.object({
	DATABASE_URL: z.string(),
	SENTRY_URL: z.string().optional(),

	BOT_TOKEN: z.string().optional(),
	SXC_TOKEN: z.string().optional(),

	DEMO_ROLE: z.string().optional(),
	CUSTOMER_ROLE: z.string().optional(),

	ENCODING_SEQUENCE: z.string(),
	LOG_LEVEL: z.union([ z.literal('none'), z.literal('info'), z.literal('debug') ])
})

export type Environment = z.infer<typeof infos>

export default infos.parse(env)