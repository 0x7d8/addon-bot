import database from "@/globals/database"
import { time } from "@rjweb/utils"
import { and, eq, sql } from "drizzle-orm"

const supportDataPoints: {
	id: number
	key: string
	question: string
	priority: number
	possibleValues: string[]
}[] = []

const supportMatchers: {
	name: string
	conditions: Record<string, string[]>
	solution: string
	priority: number
}[] = []

/**
 * Get next question using collected data
 * @since 1.12.0
*/ export function nextQuestion(data: Record<string, string>) {
	const potentialMatchers = supportMatchers.filter((matcher) => {
		return Object.entries(data).every(([key, value]) => {
			if (!matcher.conditions[key]) return true

			return matcher.conditions[key].includes(value)
		})
	})

	const requiredKeys = new Set<string>()
	for (const matcher of potentialMatchers) {
		for (const key in matcher.conditions) {
			if (!(key in data)) {
				requiredKeys.add(key)
			}
		}
	}

	if (requiredKeys.size === 0) return null

	const existingKeys = Object.keys(data)
	const nextQuestion = supportDataPoints
		.filter((q) => requiredKeys.has(q.key) && !existingKeys.includes(q.key))
		.sort((a, b) => b.priority - a.priority)[0]

	return nextQuestion || null
}

/**
 * Find the solution for the given data
 * @since 1.12.0
*/ export function findSolution(data: Record<string, string>) {
	if (Object.keys(data).length === 0) return null

	const matchingMatcher = supportMatchers
		.filter((matcher) => 
			Object.entries(data).every(([key, value]) => {
				if (!matcher.conditions[key]) return true
				return matcher.conditions[key].includes(value)
			})
		)
		.sort((a, b) => b.priority - a.priority)[0]

	return matchingMatcher || null
}

/**
 * Compact data
 * @since 1.12.0
*/ export function compactData(data: Record<string, string | undefined>): number[] {
	const compacted: number[] = []

	for (const key in data) {
		if (!data[key]) continue

		const compactKey = compactKeyMap.get(key)
		if (compactKey) {
			compacted.push(compactKey.id, compactKey.questions.indexOf(data[key]))
		} else {
			compacted.push(0, parseInt(data[key]))
		}
	}

	return compacted
}

/**
 * Expand data
 * @since 1.12.0
*/ export function expandData(data: number[]): Record<string, string> {
	const expanded: Record<string, string> = {}

	for (let i = 0; i < data.length; i += 2) {
		const key = expandKey(data[i])
		if (key) {
			expanded[key] = compactKeyMap.get(key)?.questions[data[i + 1]] || ''
		} else {
			expanded.addon = data[i + 1].toString()
		}
	}

	return expanded
}

/**
 * Expand key
 * @since 1.12.0
*/ export function expandKey(key: number): string {
	for (const [k, v] of compactKeyMap) {
		if (v.id === key) {
			return k
		}
	}

	return ''
}

/**
 * Find Error Resolution for the given text
*/ export async function findSolutionToAutomaicError(data: string): Promise<string | null> { 
	const errorResolution = await database.select({
		content: database.schema.automaticErrors.content
	})
		.from(database.schema.automaticErrors)
		.where(and(
			eq(database.schema.automaticErrors.enabled, true),
			sql`${data} ~* ${database.schema.automaticErrors.allowedRegex}`,
			sql`${data} !~* COALESCE(${database.schema.automaticErrors.disallowedRegex}, '^$^')`
		))
		.limit(1)
		.then((r) => r[0])

	return errorResolution?.content || null
}

export const closingTickets = new Set<number>()

const compactKeyMap = new Map<string, {
	id: number
	questions: string[]
}>()

async function fill() {
	const dataPoints = await database.select({
		id: database.schema.supportDataPoints.id,
		key: database.schema.supportDataPoints.key,
		question: database.schema.supportDataPoints.question,
		priority: database.schema.supportDataPoints.priority,
		possibleValues: database.schema.supportDataPoints.possibleValues
	})
		.from(database.schema.supportDataPoints)

	supportDataPoints.length = 0
	for (const dataPoint of dataPoints) {
		compactKeyMap.set(dataPoint.key, {
			id: dataPoint.id,
			questions: dataPoint.possibleValues
		})

		supportDataPoints.push(dataPoint)
	}

	const matchers = await database.select({
		name: database.schema.supportMatchers.name,
		conditions: database.schema.supportMatchers.conditions,
		solution: database.schema.supportMatchers.solution,
		priority: database.schema.supportMatchers.priority
	})
		.from(database.schema.supportMatchers)

	supportMatchers.length = 0
	supportMatchers.push(...matchers)
}

setInterval(() => fill().catch(console.error), time(10).m())
fill().catch(console.error)