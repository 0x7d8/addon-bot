import { ButtonInteraction, ChatInputCommandInteraction, ModalSubmitInteraction, StringSelectMenuBuilder, StringSelectMenuInteraction, StringSelectMenuOptionBuilder } from "discord.js"
import Context from "@/bot/context"
import * as customid from "@/globals/customid"

export type Exported<Args extends any[] = [], ListenerArgs extends any[] = []> = (interaction: Context<ButtonInteraction | ChatInputCommandInteraction | ModalSubmitInteraction | StringSelectMenuInteraction>, args: Args, listenerArgs: ListenerArgs) => StringSelectMenuBuilder

class OptionBuilder {
	protected options: ((builder: StringSelectMenuOptionBuilder) => any)[] = []

	/**
	 * Add a Row
	 * @since 1.66.0
	*/ public addOption(callback: ((builder: StringSelectMenuOptionBuilder) => any) | null): this {
		if (callback) this.options.push(callback)

		return this
	}
}

export default class Builder<Excluded extends (keyof Builder)[] = [], Arguments extends any[] = [], ListenerArguments extends any[] = []> {
	protected listener: (ctx: Context<StringSelectMenuInteraction>) => any | Promise<any> = () => undefined
	protected builder!: (builder: OptionBuilder, ...args: any) => any
	protected placeholder = ''
	protected min = 1
	protected max = 1
	protected m_name = ''

	/**
	 * Build the Select Menu
	 * @since 1.66.0
	*/ public build<Args extends any[]>(callback: (builder: OptionBuilder, ...args: Args) => any): Omit<Builder<[...Excluded, 'build'], Args, ListenerArguments>, 'build' | Excluded[number]> {
		this.builder = callback

		return this as any
	}

	/**
	 * Set the Select Menus Name
	 * @since 1.66.0
	*/ public setName(name: string): Omit<Builder<[...Excluded, 'setName'], Arguments, ListenerArguments>, 'setName' | Excluded[number]> {
		this.m_name = name

		return this as any
	}

	/**
	 * Set the Select Menu Placeholder
	 * @since 1.66.0
	*/ public setPlaceholder(placeholder: string): Omit<Builder<[...Excluded, 'setPlaceholder'], Arguments, ListenerArguments>, 'setPlaceholder' | Excluded[number]> {
		this.placeholder = placeholder

		return this as any
	}

	/**
	 * Set the Select Menu Minimum Options Required
	 * @since 1.66.0
	*/ public setMin(amount: number): Omit<Builder<[...Excluded, 'setMin'], Arguments, ListenerArguments>, 'setMin' | Excluded[number]> {
		this.min = amount

		return this as any
	}

	/**
	 * Set the Select Menu Maximum Options Required
	 * @since 1.66.0
	*/ public setMax(amount: number): Omit<Builder<[...Excluded, 'setMax'], Arguments, ListenerArguments>, 'setMax' | Excluded[number]> {
		this.max = amount

		return this as any
	}

	/**
	 * Listen for Events
	 * @since 1.66.0
	*/ public listen<Args extends any[]>(callback: (ctx: Context<StringSelectMenuInteraction>, ...args: Args) => any | Promise<any>): Omit<Builder<[...Excluded, 'listen'], Arguments, Args>, 'listen' | Excluded[number]> {
		this.listener = callback as any

		return this as any
	}

	/**
	 * Build the Select Menu for external Use
	 * @since 1.66.0
	*/ public export(): Exported<Arguments, ListenerArguments> {
		const fn: Exported<Arguments, ListenerArguments> & { m_name: string, listener: any } = (interaction, modalArgs, listenerArgs) => {
			const raw = `${this.m_name}°${listenerArgs.map((a) => JSON.stringify(a).replace(/°|\^/g, (c) => encodeURIComponent(c))).join('°')}`

			const optionBuilder = new OptionBuilder(),
				selectBuilder = new StringSelectMenuBuilder()
					.setPlaceholder(this.placeholder)
					.setCustomId(customid.encode(interaction.client.user.id, raw))

			this.builder(optionBuilder, ...modalArgs)

			for (const option of optionBuilder['options']) {
				selectBuilder.addOptions(option(new StringSelectMenuOptionBuilder()))
			}

			return selectBuilder
		}

		fn.m_name = this.m_name
		fn.listener = this.listener

		return fn
	}
}