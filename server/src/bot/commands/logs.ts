import Command from "@/bot/command"

export default new Command()
	.build((builder) => builder
		.setName('logs')
		.setDMPermission(false)
		.setDescription('Get a command to retrieve panel logs')
	)
	.listen((ctx) => {
		return ctx.interaction.reply({
			embeds: [
				ctx.Embed()
					.setTitle('`📜` Get Panel Logs')
					.setDescription(ctx.join(
						'```sh',
						'tail -n 150 /var/www/pterodactyl/storage/logs/laravel-$(date +%F).log | nc pteropaste.com 99',
						'```'
					))
			]
		})
	})