import colors, { StyleFunction } from "ansi-colors"
import env from "@/globals/env"

type Colors = typeof import('ansi-colors')

class Logger {
	protected content: any[] = []

	/**
	 * Add Text
	 * @since 1.0.0
	*/ public text(text: string | number, color: (c: Colors) => StyleFunction = (c) => c.reset): this {
		this.content.push(color(colors)(text.toString()))

		return this
	}

	/**
	 * Add Raw Values
	 * @since 1.0.0
	*/ public raw(content: any): this {
		this.content.push(content)

		return this
	}


	/**
	 * Log as INF
	 * @since 1.0.0
	*/ public info(): boolean {
		if (env.LOG_LEVEL !== 'info' && env.LOG_LEVEL !== 'debug') return false

		console.info(colors.bgBlue(' INF '), colors.gray(new Date().toLocaleDateString('de-DE', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		})), ...this.content)

		return true
	}

	/**
	 * Log as ERR
	 * @since 1.0.0
	*/ public error(): boolean {
		if (env.LOG_LEVEL !== 'info' && env.LOG_LEVEL !== 'debug') return false

		console.error(colors.bgRed(' ERR '), colors.gray(new Date().toLocaleDateString('de-DE', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		})), ...this.content)

		return true
	}

	/**
	 * Log as DEB
	 * @since 1.0.0
	*/ public debug(): boolean {
		if (env.LOG_LEVEL !== 'debug') return false

		console.error(colors.bgYellow(' DEB '), colors.gray(new Date().toLocaleDateString('de-DE', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		})), ...this.content)

		return true
	}
}

export default function logger(): Logger {
	return new Logger()
}