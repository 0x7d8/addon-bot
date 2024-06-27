import git from "simple-git"
import logger from "@/globals/logger"

type Commit = {
	version: string
	message: string
	created: Date
}

const startTime = performance.now()

export const client = git()

export const commits: Commit[] = []

client.log().then(async(c) => {
	for (const commit of c.all.toReversed()) {
		let version: string
		try {
			version = JSON.parse(await client.show(`${commit.hash}:server/package.json`)).version
		} catch {
			version = JSON.parse(await client.show(`${commit.hash}:package.json`)).version
		}

		commits.push({
			version: `${version}:${commit.hash.slice(0, 10)}`.padStart(17, ' '),
			message: commit.message.replaceAll('`', '"'),
			created: new Date(commit.date)
		})
	}

	const version = await client.version()

	logger()
		.text('Git', (c) => c.cyan)
		.text(`(${version.major}.${version.minor}.${version.patch}) Commits loaded!`)
		.text(`(${(performance.now() - startTime).toFixed(1)}ms) (${commits.length} Commits)`, (c) => c.gray)
    .info()
})