import Event from "@/bot/event"
import { GuildMember } from "discord.js"
import { eq } from "drizzle-orm"

export default new Event()
	.listenTo((events) => events.GuildMemberAdd)
	.listen<GuildMember>(async(ctx) => {
		const roles = await ctx.database.select({
			role: ctx.database.schema.products.role
		})
			.from(ctx.database.schema.products)
			.innerJoin(ctx.database.schema.productLinks, eq(ctx.database.schema.products.id, ctx.database.schema.productLinks.productId))
			.where(eq(ctx.database.schema.productLinks.discordId, ctx.interaction.id))

		if (!roles.length) return

		await Promise.all([
			ctx.interaction.roles.add(ctx.env.CUSTOMER_ROLE),
			...roles.map((role) => ctx.interaction.roles.add(role.role))
		])
	})