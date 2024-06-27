import { ActionRowBuilder, ButtonInteraction, ChatInputCommandInteraction, ModalActionRowComponentBuilder, ModalBuilder, ModalSubmitInteraction } from "discord.js"
import Context from "@/bot/context"
import * as customid from "@/globals/customid"

export type Exported<Args extends any[] = [], ListenerArgs extends any[] = []> = (interaction: ButtonInteraction | ChatInputCommandInteraction, args: Args, listenerArgs: ListenerArgs) => ModalBuilder

class RowBuilder {
	protected rows: ((builder: ActionRowBuilder<ModalActionRowComponentBuilder>) => any)[] = []

	/**
	 * Add a Row
	 * @since 1.0.0
	*/ public addRow(callback: ((builder: ActionRowBuilder<ModalActionRowComponentBuilder>) => any) | null): this {
		if (callback) this.rows.push(callback)

		return this
	}
}

export default class Builder<Excluded extends (keyof Builder)[] = [], Arguments extends any[] = [], ListenerArguments extends any[] = []> {
	protected listener: (ctx: Context<ModalSubmitInteraction, false>) => any | Promise<any> = () => undefined
	protected builder!: (builder: RowBuilder, ...args: any) => any
	protected title = ''
	protected m_name = ''

	/**
	 * Build the Modal
	 * @since 1.0.0
	*/ public build<Args extends any[]>(callback: (builder: RowBuilder, ...args: Args) => any): Omit<Builder<[...Excluded, 'build'], Args, ListenerArguments>, 'build' | Excluded[number]> {
		this.builder = callback

		return this as any
	}

	/**
	 * Set the Modals Name
	 * @since 1.0.0
	*/ public setName(name: string): Omit<Builder<[...Excluded, 'setName'], Arguments, ListenerArguments>, 'setName' | Excluded[number]> {
		this.m_name = name

		return this as any
	}

	/**
	 * Set the Modals Title
	 * @since 1.0.0
	*/ public setTitle(title: string): Omit<Builder<[...Excluded, 'setTitle'], Arguments, ListenerArguments>, 'setTitle' | Excluded[number]> {
		this.title = title

		return this as any
	}

	/**
	 * Listen for Events
	 * @since 1.0.0
	*/ public listen<Args extends any[]>(callback: (ctx: Context<ModalSubmitInteraction, true>, ...args: Args) => any | Promise<any>): Omit<Builder<[...Excluded, 'listen'], Arguments, Args>, 'listen' | Excluded[number]> {
		this.listener = callback as any

		return this as any
	}

	/**
	 * Build the Modal for external Use
	 * @since 1.0.0
	*/ public export(): Exported<Arguments, ListenerArguments> {
		const fn: Exported<Arguments, ListenerArguments> & { m_name: string, listener: any } = (interaction, modalArgs, listenerArgs) => {
			const raw = `${this.m_name}°${modalArgs.map((a) => JSON.stringify(a).replace(/°|\^/g, (c) => encodeURIComponent(c))).join('°')}^${listenerArgs.map((a) => JSON.stringify(a).replace(/°|\^/g, (c) => encodeURIComponent(c))).join('°')}`

			const rowBuilder = new RowBuilder(),
				modalBuilder = new ModalBuilder()
					.setTitle(this.title)
					.setCustomId(customid.encode(interaction.client.user.id.concat(interaction.guildId || 'g'), raw))

			this.builder(rowBuilder, ...modalArgs)

			for (const row of rowBuilder['rows']) {
				const actionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>()
				row(actionRow)

				modalBuilder.addComponents(actionRow)
			}

			return modalBuilder
		}

		fn.m_name = this.m_name
		fn.listener = this.listener

		return fn
	}
}