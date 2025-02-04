import Modal from "@/bot/modal"
import { MessageFlags, TextInputBuilder, TextInputStyle } from "discord.js"
import { and, count, eq } from "drizzle-orm"

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
			content: '`🔗` This Transaction ID is already linked.',
			flags: [
				MessageFlags.Ephemeral
			]
		})

		const payment = await ctx.sourcexchange.payment(transactionId)
		if (!payment) return ctx.interaction.reply({
			content: '`🔗` Purchase not found.',
			flags: [
				MessageFlags.Ephemeral
			]
		})

		if (payment.status !== 'completed') return ctx.interaction.reply({
			content: '`🔗` This Payment has not been completed.',
			flags: [
				MessageFlags.Ephemeral
			]
		})

		const product = await ctx.database.select({
			id: ctx.database.schema.products.id,
			name: ctx.database.schema.products.name,
			role: ctx.database.schema.products.role,
			productProviderId: ctx.database.schema.productProviders.id
		}).from(ctx.database.schema.products)
			.leftJoin(ctx.database.schema.productProviders, eq(ctx.database.schema.products.id, ctx.database.schema.productProviders.productId))
			.where(and(
				eq(ctx.database.schema.productProviders.provider, 'SOURCEXCHANGE'),
				eq(ctx.database.schema.productProviders.productProviderId, payment.product_id)
			))
			.limit(1)
			.then((r) => r[0])

		if (!product) return ctx.interaction.reply({
			content: '`🔗` Product not found, make sure this product is from me.',
			flags: [
				MessageFlags.Ephemeral
			]
		})

		await ctx.interaction.deferReply({ ephemeral: true })

		await Promise.all([
			ctx.database.insert(ctx.database.schema.productLinks)
				.values({
					discordId: ctx.interaction.user.id,
					paymentId: transactionId,
					productId: product.id,
					providerId: product.productProviderId!,
					created: new Date(payment.created_at)
				}),
			ctx.interaction.guild.members.fetch(ctx.interaction.user.id)
				.then((member) => member.roles.add(product.role))
				.then((member) => member.roles.add(ctx.env.CUSTOMER_ROLE))
				.catch(() => {})
		])

		return ctx.interaction.editReply(`\`🔗\` Purchase linked to **${product.name}**`)
	})
	.export()