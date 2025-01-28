import { Events } from "discord.js"
import Context from "@/bot/context"
export default class Builder<Excluded extends (keyof Builder)[] = []> {
	protected listener: (ctx: Context<any>, ...rest: any[]) => any | Promise<any> = () => undefined
	protected event!: Events

	/**
	 * Set the Event to listen to
	 * @since 1.0.0
	*/ public listenTo(event: (events: typeof Events) => Events): Omit<Builder<[...Excluded, 'listenTo']>, 'listenTo' | Excluded[number]> {
		this.event = event(Events)

		return this as any
	}

	/**
	 * Listen for Events
	 * @since 1.0.0
	*/ public listen<Interaction>(callback: (ctx: Context<Interaction>, ...rest: any[]) => any | Promise<any>): Omit<Builder<[...Excluded, 'listen']>, 'listen' | Excluded[number]> {
		this.listener = callback as any

		return this as any
	}
}