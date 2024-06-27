import Event from "@/bot/event"
import { time } from "@rjweb/utils"
import { ActivityType } from "discord.js"
import { count } from "drizzle-orm"

export default new Event()
	.listenTo((events) => events.ClientReady)
	.listen(async(ctx) => {
		while (true) {
			ctx.client.user.setActivity(`${await ctx.database.select({
				count: count(ctx.database.schema.products.name)
			}).from(ctx.database.schema.products).then((r) => r[0].count)} Products`, { type: ActivityType.Watching })
			await time.wait(time(10).s())

			ctx.client.user.setActivity(`${ctx.git.commits.length} Commits`, { type: ActivityType.Watching })
			await time.wait(time(10).s())

			ctx.client.user.setActivity(`${ctx.client.ws.ping}ms Bot Ping`, { type: ActivityType.Watching })
			await time.wait(time(10).s())
		}
	})