import crypto from "crypto"
import zlib from "zlib"
import env from "@/globals/env"

const basePattern = Buffer.from(env.ENCODING_SEQUENCE, 'utf8')

function generateBytePattern(seed: string, length: number) {
	const hash = crypto.createHash('sha256').update(seed),
		seedHash = hash.digest()

	const pattern = Buffer.allocUnsafe(length)
	for (let i = 0; i < length; i++) {
		pattern[i] = seedHash[i % seedHash.length] ^ basePattern[i % basePattern.length]
	}

	return pattern
}

/**
 * Encode Data efficiently using a seed
 * @since 1.0.0
*/ export function encode(seed: string, data: string): string {
	const buffer = zlib.deflateSync(Buffer.from(data, 'utf8'), { level: 6 })

	const pattern = generateBytePattern(seed, buffer.length),
		encrypted = Buffer.allocUnsafe(buffer.length)

	for (let i = 0; i < buffer.length; i++) {
		encrypted[i] = (buffer[i] + pattern[i]) % 256
	}

	let result = ''
	for (let i = 0; i < encrypted.length; i++) {
		result += String.fromCharCode(encrypted[i])
	}

	return result
}

/**
 * Decode Data efficiently using a seed
 * @since 1.0.0
*/ export async function decode(seed: string, data: string): Promise<string | null> {
	try {
		const buffer = Buffer.allocUnsafe(data.length)
		for (let i = 0; i < data.length; i++) {
			buffer[i] = data.charCodeAt(i)
		}

		const pattern = generateBytePattern(seed, buffer.length),
			decrypted = Buffer.allocUnsafe(buffer.length)

		for (let i = 0; i < buffer.length; i++) {
			decrypted[i] = (buffer[i] - pattern[i] + 256) % 256
		}

		const result = await new Promise<string>((resolve, reject) => zlib.inflate(decrypted, (err, result) => {
			if (err) return reject(err)

			return resolve(result.toString('utf8'))
		}))

		return result
	} catch {
		return null
	}
}