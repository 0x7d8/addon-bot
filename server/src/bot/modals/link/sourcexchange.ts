import Modal from "@/bot/modal"
import { TextInputBuilder, TextInputStyle } from "discord.js"
import { count, eq } from "drizzle-orm"

export default new Modal()
	.setName('link-sourcexchange')
	.setTitle('Link Purchase')
	.build((builder) => builder
		.addRow((row) => row
			.addComponents([
				new TextInputBuilder()
					.setLabel('Transaction ID')
					.setCustomId('transaction_id')
					.setPlaceholder('5LR5156832XXXXXXX')
					.setStyle(TextInputStyle.Short)
					.setMaxLength(41)
					.setMinLength(17)
					.setRequired(true)
			])
		)
	)
	.listen(async(ctx) => {
		if (!ctx.interaction.guild) return

		const transactionId = ctx.interaction.fields.getTextInputValue('transaction_id')

		const links = await ctx.database.select({
			count: count(ctx.database.schema.productLinks.id)
		}).from(ctx.database.schema.productLinks)
			.where(eq(ctx.database.schema.productLinks.paymentId, transactionId))
			.then((r) => r[0].count)

		if (links > 0) return ctx.interaction.reply({
			ephemeral: true,
			content: '`🔗` This Transaction ID is already linked.'
		})

		const products = await ctx.database.select({
			id: ctx.database.schema.products.id,
			name: ctx.database.schema.products.name,
			role: ctx.database.schema.products.role,
			productProviderId: ctx.database.schema.productProviders.id,
			productProviderProductId: ctx.database.schema.productProviders.productProviderId
		}).from(ctx.database.schema.products)
			.leftJoin(ctx.database.schema.productProviders, eq(ctx.database.schema.products.id, ctx.database.schema.productProviders.productId))
			.where(eq(ctx.database.schema.productProviders.provider, 'SOURCEXCHANGE'))

		const accesses = await Promise.all(products.map((product) => ctx.sourcexchange.accesses(product.productProviderProductId!)))

		for (let i = 0; i < accesses.length; i++) {
			const access = accesses[i].find((access) => access.remote_id === transactionId)
			if (!access) continue

			await ctx.interaction.deferReply({ ephemeral: true })

			await Promise.all([
				ctx.database.insert(ctx.database.schema.productLinks)
					.values({
						discordId: ctx.interaction.user.id,
						paymentId: transactionId,
						productId: products[i].id,
						providerId: products[i].productProviderId!,
						created: new Date(access.created_at)
					}),
				ctx.interaction.guild.members.fetch(ctx.interaction.user.id)
					.then((member) => member.roles.add(products[i].role))
					.then((member) => member.roles.add(ctx.env.CUSTOMER_ROLE))
			])

			return ctx.interaction.editReply(`\`🔗\` Purchase linked to **${products[i].name}**`)
		}

		return ctx.interaction.reply({
			ephemeral: true,
			content: '`🔗` Purchase not found.'
		})
	})
	.export()