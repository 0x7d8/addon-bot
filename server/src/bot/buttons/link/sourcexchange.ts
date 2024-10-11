import Button from "@/bot/button"
import linkSourcexchangeModal from "@/bot/modals/link/sourcexchange"

export default new Button()
	.setName('link-sourcexchange')
	.listen(async(ctx) => {
		return ctx.interaction.showModal(await linkSourcexchangeModal(ctx.interaction, [], []))
	})
	.export()