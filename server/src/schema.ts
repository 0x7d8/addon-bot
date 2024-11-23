import { sql } from "drizzle-orm"
import { boolean, char, decimal, text, integer, pgEnum, pgTable, serial, timestamp, uniqueIndex, varchar, index, jsonb, uuid } from "drizzle-orm/pg-core"

export const productProvider = pgEnum('productProvider', ['SOURCEXCHANGE', 'BUILTBYBIT'])
export const currency = pgEnum('currency', ['EUR', 'USD'])

export const products = pgTable('products', {
  id: serial('id').primaryKey(),

	name: varchar('name', { length: 51 }).notNull(),
	icon: varchar('icon', { length: 255 }).notNull(),
	banner: varchar('banner', { length: 255 }).notNull(),
	summary: varchar('summary', { length: 255 }).notNull(),
	version: varchar('version', { length: 51 }).default('1.0.0').notNull(),
	identifier: varchar('identifier', { length: 51 }).notNull().default(sql`gen_random_uuid()`),

	role: varchar('role', { length: 22 }).notNull(),
}, (products) => [
	uniqueIndex('products_name_idx').on(products.name),
	uniqueIndex('products_identifier_idx').on(products.identifier),
	uniqueIndex('products_role_idx').on(products.role)
])

export const productProviders = pgTable('product_providers', {
	id: serial('id').primaryKey(),
	productId: integer('productId').references(() => products.id).notNull(),

	provider: productProvider('provider').notNull(),
	productProviderId: integer('productProviderId').notNull(),

	link: varchar('link', { length: 255 }).notNull(),
	price: decimal('price', { precision: 10, scale: 2 }).notNull(),
	currency: currency('currency').notNull()
}, (productProviders) => [
	uniqueIndex('productProviders_productId_provider_idx').on(productProviders.productId, productProviders.provider)
])

export const productLinks = pgTable('product_links', {
	id: serial('id').primaryKey(),
	productId: integer('productId').references(() => products.id).notNull(),
	providerId: integer('providerId').references(() => productProviders.id).notNull(),

	discordId: varchar('discordId', { length: 22 }).notNull(),
	paymentId: varchar('paymentId', { length: 51 }).notNull(),

	created: timestamp('created').default(sql`now()`).notNull()
}, (productLinks) => [
	uniqueIndex('productLinks_paymentId_idx').on(productLinks.paymentId),
	uniqueIndex('productLinks_discordId_productId_providerId_idx').on(productLinks.discordId, productLinks.productId, productLinks.providerId)
])

export const demoAccesses = pgTable('demo_accesses', {
	id: serial('id').primaryKey(),

	expired: boolean('expired').default(false).notNull(),
	password: char('password', { length: 16 }).notNull(),
	pterodactylId: integer('pterodactylId').notNull(),
	discordId: varchar('discordId', { length: 22 }).notNull(),

	created: timestamp('created').default(sql`now()`).notNull()
}, (demoAccesses) => [
	uniqueIndex('demoAccesses_pterodactylId_idx').on(demoAccesses.pterodactylId),
	index('demoAccesses_discordId_idx').on(demoAccesses.discordId),
	index('demoAccesses_expired_idx').on(demoAccesses.expired),
	index('demoAccesses_created_idx').on(demoAccesses.created)
])

export const sendMessages = pgTable('send_messages', {
	id: serial('id').primaryKey(),

	enabled: boolean('enabled').default(true).notNull(),
	discordId: varchar('discordId', { length: 22 }),
	discordChannelId: varchar('discordChannelId', { length: 22 }).notNull(),
	message: text('message').notNull()
}, (sendMessage) => [
	uniqueIndex('sendMessages_discordChannelId_discordId_idx').on(sendMessage.discordChannelId, sendMessage.discordId)
])

export const faqs = pgTable('faqs', {
	id: serial('id').primaryKey(),

	title: varchar('title', { length: 31 }).notNull(),
	content: text('content').notNull(),

	created: timestamp('created').default(sql`now()`).notNull(),
	updated: timestamp('updated').default(sql`now()`).notNull()
}, (faq) => [
	uniqueIndex('faqs_title_idx').on(faq.title),
	index('faqs_created_idx').on(faq.created),
	index('faqs_updated_idx').on(faq.updated)
])

export const pterodactylActivity = pgTable('pterodactyl_activity', {
	id: serial('id').primaryKey(),
	pterodactylId: integer('pterodactylId').references(() => demoAccesses.pterodactylId, { onDelete: 'set null' }),
	pterodactylServerId: uuid('pterodactylServerId').notNull(),

	identifier: char('identifier', { length: 40 }).notNull(),
	event: varchar('event', { length: 121 }).notNull(),
	properties: jsonb('properties').notNull(),

	created: timestamp('created').default(sql`now()`).notNull()
}, (activity) => [
	uniqueIndex('pterodactylActivity_activity_identifier_idx').on(activity.identifier),
	index('pterodactylActivity_pterodactylId_idx').on(activity.pterodactylId),
	index('pterodactylActivity_created_idx').on(activity.created)
])