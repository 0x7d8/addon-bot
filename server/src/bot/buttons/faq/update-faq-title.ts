import Button from "@/bot/button"
import updateFaqTitleModal from "@/bot/modals/faq/update-faq-title"

export default new Button()
    .setName('update-faq-title')
    .listen((ctx, id: number, content: string) => {
        return ctx.interaction.showModal(updateFaqTitleModal(ctx.interaction, [], [id, content]))
    })
    .export()