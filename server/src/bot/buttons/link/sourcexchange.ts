import Button from "@/bot/button"
import linkSourcexchangeModal from "@/bot/modals/link/sourcexchange"

export default new Button()
	.setName('link-sourcexchange')
	.listen((ctx) => {
		return ctx.interaction.showModal(linkSourcexchangeModal(ctx.interaction, [], []))
	})
	.export()