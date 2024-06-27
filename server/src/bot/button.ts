import { ButtonInteraction, Client } from "discord.js"
import Context from "@/bot/context"
import * as customid from "@/globals/customid"

export type Exported<Args extends any[] = []> = (interaction: { client: Client<true>, guildId: string | null }, ...args: Args) => string
export type PaginateType = 'next' | 'back' | 'refresh' | 'last' | 'first'

export default class Builder<Excluded extends (keyof Builder)[] = [], Arguments extends any[] = []> {
	protected listener: (ctx: Context<ButtonInteraction, true>) => any | Promise<any> = () => undefined
	protected m_name = ''

	/**
	 * Set the Buttons Name
	 * @since 1.12.0
	*/ public setName(name: string): Omit<Builder<[...Excluded, 'setName'], Arguments>, 'setName' | Excluded[number]> {
		this.m_name = name

		return this as any
	}

	/**
	 * Listen for Events
	 * @since 1.12.0
	*/ public listen<Args extends any[]>(callback: (ctx: Context<ButtonInteraction, true>, ...args: Args) => any | Promise<any>): Omit<Builder<[...Excluded, 'listen'], Args>, 'listen' | Excluded[number]> {
		this.listener = callback as any

		return this as any
	}

	/**
	 * Build the Button for external Use
	 * @since 1.12.0
	*/ public export(): Exported<Arguments> {
		const fn: Exported<Arguments> & { m_name: string, listener: Function } = (interaction, ...args) => {
			const raw = `${this.m_name}°${args.map((a) => JSON.stringify(a).replace(/°|\^/g, (c) => encodeURIComponent(c))).join('°')}`

			return customid.encode((interaction.client.user.id).concat(interaction.guildId || 'g'), raw)
		}

		fn.m_name = this.m_name
		fn.listener = this.listener

		return fn
	}
}