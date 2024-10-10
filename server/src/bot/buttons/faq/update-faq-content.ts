import Button from "@/bot/button"
import updateFaqContentModal from "@/bot/modals/faq/update-faq-content"

export default new Button()
    .setName('update-faq-content')
    .listen((ctx, id: number, title: string) => {
        return ctx.interaction.showModal(updateFaqContentModal(ctx.interaction, [], [id, title]))
    })
    .export()