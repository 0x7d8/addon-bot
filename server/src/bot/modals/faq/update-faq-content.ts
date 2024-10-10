import Modal from "@/bot/modal"
import { TextInputBuilder, TextInputStyle } from "discord.js"
import { eq } from "drizzle-orm"

export default new Modal()
    .setName('update-faq-content')
    .setTitle('Update Content FAQ')
    .build((builder) => builder
        .addRow((row) => row
            .addComponents([
                new TextInputBuilder()
                    .setLabel('Content')
                    .setCustomId('content')
                    .setPlaceholder('content')
                    .setStyle(TextInputStyle.Paragraph)
                    .setMinLength(100)
                    .setRequired(true)
            ])
        )
    )
    .listen(async (ctx, id: number, title: string) => {
        if (!ctx.interaction.guild) return
        const content = ctx.interaction.fields.getTextInputValue('content')
        await ctx.database.update(ctx.database.schema.faqs)
            .set({ title: title, content: content })
            .where(eq(ctx.database.schema.faqs.id, id))
        return ctx.interaction.reply({
            ephemeral: true,
            content: '`✅` FAQ Content has been updated.'
        })
    })
    .export()