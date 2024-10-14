import Event from "@/bot/event"
import { Message } from "discord.js"
import axios from "axios"
import { size } from "@rjweb/utils"

const commonFileExtensions: Record<string, string> = Object.freeze({
	'txt': 'text/plain',
	'ts': 'text/typescript',
	'js': 'text/javascript',
	'yaml': 'text/yaml',
	'json': 'application/json',
	'html': 'text/html',
	'css': 'text/css',
	'py': 'text/python',
	'rb': 'text/ruby',
	'java': 'text/java',
	'php': 'text/php',
	'go': 'text/go',
	'rs': 'text/rust',
	'xml': 'application/xml',
	'sql': 'text/sql',
	'c': 'text/c',
	'cpp': 'text/cpp',
	'h': 'text/cpp',
	'cs': 'text/csharp',
	'sh': 'text/shell'
})

const commonFileExtensionsArr = Object.keys(commonFileExtensions)

export default new Event()
	.listenTo((events) => events.MessageCreate)
	.listen<Message>(async(ctx) => {
		const attachments = ctx.interaction.attachments.filter((a) => !a.width && a.size < size(10).mb() && commonFileExtensionsArr.includes(a.name.split('.').pop() || 'txt'))
		const urls: [string, string][] = []

		await Promise.all(attachments.map(async(a) => {
			const { data: content } = await axios.get<string>(a.url)
			if (typeof content !== 'string' && typeof content !== 'object') return

			const { data } = await axios.post<{
				key: string
			}>('https://api.pastes.dev/post', typeof content === 'string' ? content : JSON.stringify(content, undefined, 2), {
				headers: {
					'Content-Type': commonFileExtensions[a.name.split('.').pop() || 'txt'] || 'text/plain'
				}
			})

			urls.push([a.name, `https://pastes.dev/${data.key}`])
		}))

		if (urls.length) {
			await ctx.interaction.reply({
				content: urls.map(([name, url]) => `[\`${name} ↗\`](<${url}>)`).join(' '),
				allowedMentions: { repliedUser: false }
			})
		}
	})