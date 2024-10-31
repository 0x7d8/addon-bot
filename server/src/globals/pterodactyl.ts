import env from "@/globals/env"
import { User } from "discord.js"
import axios from "axios"

/**
 * Create a new User
 * @since 1.1.0
*/ export async function createUser(user: User, password: string): Promise<number> {
	const data = await axios.post(`${env.PTERO_URL}/api/application/users`, {
		email: `demo.${user.id}@demo.panel`,
		username: `demo.${user.id}`,
		first_name: 'Demo',
		last_name: user.id,
		password
	}, {
		headers: {
			Authorization: `Bearer ${env.PTERO_ADMIN_TOKEN}`,
			Accept: 'application/json'
		}
	})

	await Promise.all(env.PTERO_DEMO_SERVERS.map((server) => axios.post(`${env.PTERO_URL}/api/client/servers/${server}/users`, {
		email: `demo.${user.id}@demo.panel`,
		permissions: [
			'control.console',
			'control.start',
			'control.stop',
			'control.restart',
			'file.create',
			'file.read',
			'file.read-content',
			'file.update',
			'file.delete',
			'file.archive',
			'file.sftp',
			'splitter.read',
			'splitter.create',
			'splitter.update',
			'splitter.delete',
			'templates.read',
			'templates.install',
			'backup.create',
			'backup.read',
			'backup.delete',
			'backup.download',
			'backup.restore',
			'allocation.read',
			'allocation.create',
			'allocation.update',
			'allocation.delete',
			'startup.read',
			'startup.update',
			'startup.docker-image',
			'database.create',
			'database.read',
			'database.update',
			'database.delete',
			'database.view_password',
			'schedule.create',
			'schedule.read',
			'schedule.update',
			'schedule.delete',
			'settings.reinstall'
		]
	}, {
		headers: {
			Authorization: `Bearer ${env.PTERO_CLIENT_TOKEN}`,
			Accept: 'application/json'
		}
	})))

	return data.data.attributes.id
}

/**
 * Delete a User
 * @since 1.1.0
*/ export async function deleteUser(id: number): Promise<void> {
	await axios.delete(`${env.PTERO_URL}/api/application/users/${id}`, {
		headers: {
			Authorization: `Bearer ${env.PTERO_ADMIN_TOKEN}`,
			Accept: 'application/json'
		}
	})
}