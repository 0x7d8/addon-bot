import { AutocompleteInteraction, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"
import Context from "@/bot/context"

export default class Builder<Excluded extends (keyof Builder)[] = []> {
	protected builder: SlashCommandBuilder = new SlashCommandBuilder().setDMPermission(false)
	protected listener: (ctx: Context<ChatInputCommandInteraction, true>) => any | Promise<any> = () => undefined
	protected autocomplete: (ctx: Context<AutocompleteInteraction, true>) => any | Promise<any> = () => undefined

	/**
	 * Build the Command
	 * @since 1.0.0
	*/ public build(callback: (builder: SlashCommandBuilder) => any): Omit<Builder<[...Excluded, 'build']>, 'build' | Excluded[number]> {
		callback(this.builder)

		return this as any
	}

	/**
	 * Listen for Events
	 * @since 1.0.0
	*/ public listen(callback: (ctx: Context<ChatInputCommandInteraction, true>) => any | Promise<any>): Omit<Builder<[...Excluded, 'listen']>, 'listen' | Excluded[number]> {
		this.listener = callback as any

		return this as any
	}

	/**
	 * Listen for Autocomplete
	 * @since 1.0.0
	*/ public listenAutocomplete(callback: (ctx: Context<AutocompleteInteraction, true>) => any | Promise<any>): Omit<Builder<[...Excluded, 'listenAutocomplete']>, 'listenAutocomplete' | Excluded[number]> {
		this.autocomplete = callback as any

		return this as any
	}
}