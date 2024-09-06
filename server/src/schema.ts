import { sql } from "drizzle-orm"
import { boolean, char, decimal, integer, pgEnum, pgTable, serial, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core"

export const productProvider = pgEnum('productProvider', ['SOURCEXCHANGE', 'BUILTBYBIT'])
export const currency = pgEnum('currency', ['EUR', 'USD'])

export const products = pgTable('products', {
  id: serial('id').primaryKey(),

	name: varchar('name', { length: 51 }).notNull(),
	icon: varchar('icon', { length: 255 }).notNull(),
	banner: varchar('banner', { length: 255 }).notNull(),
	summary: varchar('summary', { length: 255 }).notNull(),
	version: varchar('version', { length: 51 }).default('1.0.0').notNull(),

	role: varchar('role', { length: 22 }).notNull(),
}, (products) => ({
	nameIndex: uniqueIndex('name_idx').on(products.name)
}))

export const productProviders = pgTable('productProviders', {
	id: serial('id').primaryKey(),
	productId: integer('productId').references(() => products.id).notNull(),

	provider: productProvider('provider').notNull(),
	productProviderId: integer('productProviderId').notNull(),

	link: varchar('link', { length: 255 }).notNull(),
	price: decimal('price', { precision: 10, scale: 2 }).notNull(),
	currency: currency('currency').notNull()
}, (productProviders) => ({
	productIdProviderIndex: uniqueIndex('productId_provider_idx').on(productProviders.productId, productProviders.provider)
}))

export const productLinks = pgTable('productLinks', {
	id: serial('id').primaryKey(),
	productId: integer('productId').references(() => products.id).notNull(),
	providerId: integer('providerId').references(() => productProviders.id).notNull(),

	discordId: varchar('discordId', { length: 22 }).notNull(),
	paymentId: varchar('paymentId', { length: 51 }).notNull(),

	created: timestamp('created').default(sql`now()`).notNull()
}, (productLinks) => ({
	paymentIdIndex: uniqueIndex('paymentId_idx').on(productLinks.paymentId),
	discordIdProductIdProviderIdIndex: uniqueIndex('discordId_productId_providerId_idx').on(productLinks.discordId, productLinks.productId, productLinks.providerId)
}))

export const demoAcccesses = pgTable('demoAccesses', {
	id: serial('id').primaryKey(),

	expired: boolean('expired').default(false).notNull(),
	password: char('password', { length: 16 }).notNull(),
	pterodactylId: integer('pterodactylId').notNull(),
	discordId: varchar('discordId', { length: 22 }).notNull(),

	created: timestamp('created').default(sql`now()`).notNull()
}, (demoAccess) => ({
	pterodatylIdIndex: uniqueIndex('pterodactylId_idx').on(demoAccess.pterodactylId)
}))