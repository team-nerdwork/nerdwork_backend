import { pgTable, text, timestamp, foreignKey, unique, uuid, varchar, doublePrecision, integer, numeric, jsonb, boolean, json, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const chapterType = pgEnum("chapter_type", ['free', 'paid'])
export const comicStatusEnum = pgEnum("comic_status_enum", ['published', 'pending', 'scheduled', 'draft'])
export const creatorTransactionStatus = pgEnum("creator_transaction_status", ['pending', 'completed', 'processing', 'failed'])
export const creatorTransactionType = pgEnum("creator_transaction_type", ['earning', 'withdrawal', 'bonus'])
export const earningSource = pgEnum("earning_source", ['chapter_purchase', 'comic_purchase', 'tip_received', 'subscription_revenue', 'platform_bonus'])
export const listingStatus = pgEnum("listing_status", ['active', 'sold', 'cancelled', 'delisted'])
export const orderStatus = pgEnum("order_status", ['pending', 'confirmed', 'completed', 'cancelled', 'failed'])
export const spendCategory = pgEnum("spend_category", ['chapter_unlock', 'comic_purchase', 'nft_purchase', 'tip_creator', 'subscription'])
export const userTransactionStatus = pgEnum("user_transaction_status", ['pending', 'completed', 'failed', 'refunded'])
export const userTransactionType = pgEnum("user_transaction_type", ['purchase', 'spend', 'refund'])
export const walletTypeEnum = pgEnum("wallet_type_enum", ['solflare', 'phantom'])


export const drizzleMigrations = pgTable("_drizzle_migrations", {
	id: text().primaryKey().notNull(),
	hash: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
});

export const chapters = pgTable("chapters", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	chapterType: chapterType("chapter_type").default('free').notNull(),
	price: doublePrecision().default(0).notNull(),
	summary: text(),
	serialNo: integer("serial_no").default(0).notNull(),
	pages: text().array().notNull(),
	chapterStatus: comicStatusEnum("chapter_status").default('draft'),
	comicId: uuid("comic_id").notNull(),
	uniqueCode: varchar("unique_code", { length: 4 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.comicId],
			foreignColumns: [comics.id],
			name: "chapters_comic_id_comics_id_fk"
		}).onDelete("cascade"),
	unique("chapters_unique_code_unique").on(table.uniqueCode),
]);

export const chapterLikes = pgTable("chapter_likes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	readerId: uuid("reader_id").notNull(),
	chapterId: uuid("chapter_id").notNull(),
	viewedAt: timestamp("viewed_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.chapterId],
			foreignColumns: [chapters.id],
			name: "chapter_likes_chapter_id_chapters_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.readerId],
			foreignColumns: [readerProfile.id],
			name: "chapter_likes_reader_id_reader_profile_id_fk"
		}).onDelete("cascade"),
]);

export const chapterViews = pgTable("chapter_views", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	readerId: uuid("reader_id").notNull(),
	chapterId: uuid("chapter_id").notNull(),
	viewedAt: timestamp("viewed_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.chapterId],
			foreignColumns: [chapters.id],
			name: "chapter_views_chapter_id_chapters_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.readerId],
			foreignColumns: [readerProfile.id],
			name: "chapter_views_reader_id_reader_profile_id_fk"
		}).onDelete("cascade"),
]);

export const comicSubscribers = pgTable("comic_subscribers", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	readerId: uuid("reader_id").notNull(),
	comicId: uuid("comic_id").notNull(),
	subscribedAt: timestamp("subscribed_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.comicId],
			foreignColumns: [comics.id],
			name: "comic_subscribers_comic_id_comics_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.readerId],
			foreignColumns: [readerProfile.id],
			name: "comic_subscribers_reader_id_reader_profile_id_fk"
		}).onDelete("cascade"),
]);

export const creatorTransactions = pgTable("creator_transactions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	creatorId: uuid("creator_id").notNull(),
	transactionType: creatorTransactionType("transaction_type").notNull(),
	status: creatorTransactionStatus().default('pending').notNull(),
	nwtAmount: numeric("nwt_amount", { precision: 10, scale:  6 }).notNull(),
	description: text().notNull(),
	earningSource: earningSource("earning_source"),
	contentId: uuid("content_id"),
	purchaserUserId: uuid("purchaser_user_id"),
	sourceUserTransactionId: uuid("source_user_transaction_id"),
	grossAmount: numeric("gross_amount", { precision: 10, scale:  6 }),
	platformFee: numeric("platform_fee", { precision: 10, scale:  6 }),
	platformFeePercentage: numeric("platform_fee_percentage", { precision: 5, scale:  4 }).default('0.30'),
	withdrawalMethod: varchar("withdrawal_method", { length: 100 }),
	withdrawalAddress: text("withdrawal_address"),
	withdrawalFee: numeric("withdrawal_fee", { precision: 10, scale:  6 }),
	externalTransactionId: varchar("external_transaction_id", { length: 255 }),
	processedAt: timestamp("processed_at", { mode: 'string' }),
	failureReason: text("failure_reason"),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.creatorId],
			foreignColumns: [creatorProfile.id],
			name: "creator_transactions_creator_id_creator_profile_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.sourceUserTransactionId],
			foreignColumns: [userTransactions.id],
			name: "creator_transactions_source_user_transaction_id_user_transactio"
		}),
]);

export const library = pgTable("library", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	readerId: uuid("reader_id").notNull(),
	comicId: uuid("comic_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.comicId],
			foreignColumns: [comics.id],
			name: "library_comic_id_comics_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.readerId],
			foreignColumns: [readerProfile.id],
			name: "library_reader_id_reader_profile_id_fk"
		}).onDelete("cascade"),
]);

export const paidChapters = pgTable("paid_Chapters", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	readerId: uuid("reader_id").notNull(),
	chapterId: uuid("chapter_id").notNull(),
	paidAt: timestamp("paid_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.chapterId],
			foreignColumns: [chapters.id],
			name: "paid_Chapters_chapter_id_chapters_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.readerId],
			foreignColumns: [readerProfile.id],
			name: "paid_Chapters_reader_id_reader_profile_id_fk"
		}).onDelete("cascade"),
]);

export const authUsers = pgTable("auth_users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: text().notNull(),
	username: text().notNull(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	twoFactorEnabled: boolean("two_factor_enabled").default(false).notNull(),
	lastLoginAt: timestamp("last_login_at", { mode: 'string' }),
	lockedUntil: timestamp("locked_until", { mode: 'string' }),
	loginAttempts: integer("login_attempts").default(0).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("auth_users_email_unique").on(table.email),
	unique("auth_users_username_unique").on(table.username),
]);

export const comics = pgTable("comics", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	language: varchar({ length: 50 }).notNull(),
	ageRating: varchar("age_rating", { length: 10 }).notNull(),
	noOfChapters: integer("no_of_chapters").default(0).notNull(),
	noOfDrafts: integer("no_of_drafts").default(0).notNull(),
	description: text().notNull(),
	imageUrl: text("image_url").notNull(),
	comicStatus: comicStatusEnum("comic_status").default('draft'),
	genre: text().array().notNull(),
	tags: text().array(),
	slug: varchar({ length: 300 }).notNull(),
	creatorId: uuid("creator_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.creatorId],
			foreignColumns: [creatorProfile.id],
			name: "comics_creator_id_creator_profile_id_fk"
		}).onDelete("cascade"),
	unique("comics_slug_unique").on(table.slug),
]);

export const creatorProfile = pgTable("creator_profile", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	fullName: text("full_name").notNull(),
	creatorName: text("creator_name").notNull(),
	phoneNumber: text("phone_number"),
	bio: text(),
	genres: text().array().default([""]).notNull(),
	walletType: walletTypeEnum("wallet_type"),
	walletAddress: text("wallet_address"),
	walletBalance: doublePrecision("wallet_balance").default(0).notNull(),
	pinHash: text("pin_hash"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [authUsers.id],
			name: "creator_profile_user_id_auth_users_id_fk"
		}).onDelete("cascade"),
	unique("creator_profile_user_id_unique").on(table.userId),
]);

export const loyaltyPoints = pgTable("loyalty_points", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	points: integer().default(0).notNull(),
	lastUpdated: timestamp("last_updated", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [authUsers.id],
			name: "loyalty_points_user_id_auth_users_id_fk"
		}),
]);

export const nwtTransactions = pgTable("nwt_transactions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userWalletId: uuid("user_wallet_id").notNull(),
	transactionType: text("transaction_type").notNull(),
	category: text().notNull(),
	amount: text().notNull(),
	balanceBefore: text("balance_before").notNull(),
	balanceAfter: text("balance_after").notNull(),
	referenceId: text("reference_id"),
	referenceType: text("reference_type"),
	description: text().notNull(),
	metadata: json(),
	blockchainTxHash: text("blockchain_tx_hash"),
	status: text().notNull(),
	processedAt: timestamp("processed_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userWalletId],
			foreignColumns: [userWallets.id],
			name: "nwt_transactions_user_wallet_id_user_wallets_id_fk"
		}).onDelete("cascade"),
]);

export const passwordResets = pgTable("password_resets", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	token: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	used: boolean().default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [authUsers.id],
			name: "password_resets_user_id_auth_users_id_fk"
		}).onDelete("cascade"),
	unique("password_resets_token_unique").on(table.token),
]);

export const userWallets = pgTable("user_wallets", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userProfileId: uuid("user_profile_id").notNull(),
	nwtBalance: integer("nwt_balance").notNull(),
	nwtLockedBalance: integer("nwt_locked_balance").notNull(),
	primaryWalletAddress: text("primary_wallet_address"),
	kycStatus: text("kyc_status").notNull(),
	kycLevel: integer("kyc_level").default(0).notNull(),
	spendingLimitDaily: integer("spending_limit_daily"),
	spendingLimitMonthly: integer("spending_limit_monthly"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userProfileId],
			foreignColumns: [userProfiles.id],
			name: "user_wallets_user_profile_id_user_profiles_id_fk"
		}).onDelete("cascade"),
	unique("user_wallets_user_profile_id_unique").on(table.userProfileId),
]);

export const userProfiles = pgTable("user_profiles", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	authUserId: uuid("auth_user_id").notNull(),
	firstName: text("first_name"),
	lastName: text("last_name"),
	displayName: text("display_name").notNull(),
	bio: text(),
	avatarUrl: text("avatar_url"),
	dateOfBirth: timestamp("date_of_birth", { mode: 'string' }),
	country: text(),
	timezone: text(),
	language: text().notNull(),
	preferences: json().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.authUserId],
			foreignColumns: [authUsers.id],
			name: "user_profiles_auth_user_id_auth_users_id_fk"
		}).onDelete("cascade"),
]);

export const readerProfile = pgTable("reader_profile", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	fullName: text("full_name").notNull(),
	genres: text().array().default([""]).notNull(),
	walletId: varchar("wallet_id", { length: 12 }).notNull(),
	walletBalance: doublePrecision("wallet_balance").default(0).notNull(),
	pinHash: text("pin_hash"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [authUsers.id],
			name: "reader_profile_user_id_auth_users_id_fk"
		}).onDelete("cascade"),
	unique("reader_profile_user_id_unique").on(table.userId),
	unique("reader_profile_wallet_id_unique").on(table.walletId),
]);

export const userTransactions = pgTable("user_transactions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	readerId: uuid("reader_id").notNull(),
	transactionType: userTransactionType("transaction_type").notNull(),
	status: userTransactionStatus().default('pending').notNull(),
	nwtAmount: numeric("nwt_amount", { precision: 10, scale:  6 }).notNull(),
	usdAmount: numeric("usd_amount", { precision: 10, scale:  2 }),
	description: text().notNull(),
	spendCategory: spendCategory("spend_category"),
	contentId: uuid("content_id"),
	creatorId: uuid("creator_id"),
	helioPaymentId: varchar("helio_payment_id", { length: 255 }),
	helioWebhookId: varchar("helio_webhook_id", { length: 255 }),
	blockchainTxHash: varchar("blockchain_tx_hash", { length: 255 }),
	metadata: jsonb(),
	failureReason: text("failure_reason"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.readerId],
			foreignColumns: [readerProfile.id],
			name: "user_transactions_reader_id_reader_profile_id_fk"
		}).onDelete("cascade"),
]);

export const authSessions = pgTable("auth_sessions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	sessionToken: text("session_token").notNull(),
	refreshToken: text("refresh_token").notNull(),
	ipAddress: text("ip_address").notNull(),
	userAgent: text("user_agent").notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [authUsers.id],
			name: "auth_sessions_user_id_auth_users_id_fk"
		}).onDelete("cascade"),
	unique("auth_sessions_session_token_unique").on(table.sessionToken),
	unique("auth_sessions_refresh_token_unique").on(table.refreshToken),
]);

export const payments = pgTable("payments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userWalletId: uuid("user_wallet_id").notNull(),
	amount: text().notNull(),
	currency: text().notNull(),
	nwtAmount: text("nwt_amount"),
	exchangeRate: text("exchange_rate"),
	webhookId: text("webhook_id"),
	paymentIntentId: text("payment_intent_id"),
	blockchainTxHash: text("blockchain_tx_hash"),
	status: text().notNull(),
	failureReason: text("failure_reason"),
	metadata: json().notNull(),
	processedAt: timestamp("processed_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userWalletId],
			foreignColumns: [userWallets.id],
			name: "payments_user_wallet_id_user_wallets_id_fk"
		}).onDelete("cascade"),
]);

export const walletAddresses = pgTable("wallet_addresses", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userWalletId: uuid("user_wallet_id").notNull(),
	blockchain: text().notNull(),
	address: text().notNull(),
	isVerified: boolean("is_verified").default(false).notNull(),
	isPrimary: boolean("is_primary").default(false).notNull(),
	label: text(),
	addedAt: timestamp("added_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userWalletId],
			foreignColumns: [userWallets.id],
			name: "wallet_addresses_user_wallet_id_user_wallets_id_fk"
		}).onDelete("cascade"),
]);

export const sellerWithdrawals = pgTable("seller_withdrawals", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	sellerId: uuid("seller_id").notNull(),
	amount: numeric({ precision: 20, scale:  2 }).notNull(),
	status: text().notNull(),
	rejectionReason: text("rejection_reason"),
	approvedAt: timestamp("approved_at", { mode: 'string' }),
	processedAt: timestamp("processed_at", { mode: 'string' }),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const chapterComments = pgTable("chapter_comments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	readerId: uuid("reader_id").notNull(),
	chapterId: uuid("chapter_id").notNull(),
	content: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.readerId],
			foreignColumns: [readerProfile.id],
			name: "chapter_comments_reader_id_reader_profile_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.chapterId],
			foreignColumns: [chapters.id],
			name: "chapter_comments_chapter_id_chapters_id_fk"
		}).onDelete("cascade"),
]);

export const creatorBankDetails = pgTable("creator_bank_details", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	creatorId: uuid("creator_id").notNull(),
	bankName: text("bank_name").notNull(),
	accountNumber: text("account_number").notNull(),
	accountName: text("account_name").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.creatorId],
			foreignColumns: [creatorProfile.id],
			name: "creator_bank_details_creator_id_creator_profile_id_fk"
		}).onDelete("cascade"),
	unique("creator_bank_details_creator_id_unique").on(table.creatorId),
]);

export const deviceTokens = pgTable("device_tokens", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	readerId: uuid("reader_id").notNull(),
	token: text().notNull(),
	platform: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.readerId],
			foreignColumns: [readerProfile.id],
			name: "device_tokens_reader_id_reader_profile_id_fk"
		}).onDelete("cascade"),
]);

export const notifications = pgTable("notifications", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	readerId: uuid("reader_id").notNull(),
	type: text().notNull(),
	comicId: uuid("comic_id"),
	chapterId: uuid("chapter_id"),
	title: text().notNull(),
	body: text().notNull(),
	isRead: boolean("is_read").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.readerId],
			foreignColumns: [readerProfile.id],
			name: "notifications_reader_id_reader_profile_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.comicId],
			foreignColumns: [comics.id],
			name: "notifications_comic_id_comics_id_fk"
		}),
	foreignKey({
			columns: [table.chapterId],
			foreignColumns: [chapters.id],
			name: "notifications_chapter_id_chapters_id_fk"
		}),
]);
