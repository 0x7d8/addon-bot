import Modal from "@/bot/modal"
import { TextInputBuilder, TextInputStyle } from "discord.js"
import { eq } from "drizzle-orm"

export default new Modal()
    .setName('update-faq-title')
    .setTitle('Update Title FAQ')
    .build((builder) => builder
        .addRow((row) => row
            .addComponents([
                new TextInputBuilder()
                    .setLabel('Title')
                    .setCustomId('title')
                    .setPlaceholder('title')
                    .setStyle(TextInputStyle.Short)
                    .setMaxLength(31)
                    .setMinLength(2)
                    .setRequired(true)
            ])
        )
    )
    .listen(async (ctx, id: number, content: string) => {
        if (!ctx.interaction.guild) return

        const title = ctx.interaction.fields.getTextInputValue('title')

        try {

            await ctx.database.update(ctx.database.schema.faqs)
                .set({ title: title, content: content })
                .where(eq(ctx.database.schema.faqs.id, id))
            
            return ctx.interaction.reply({
                ephemeral: true,
                content: '`✅` FAQ Title has been updated.'
            })
        } catch {
            return ctx.interaction.reply({
                ephemeral: true,
                content: '`❌` This Title is already taken.'
            })
        }
    })
    .export()