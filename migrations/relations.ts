import { relations } from "drizzle-orm/relations";
import { comics, chapters, chapterLikes, readerProfile, chapterViews, comicSubscribers, creatorProfile, creatorTransactions, userTransactions, library, paidChapters, authUsers, loyaltyPoints, userWallets, nwtTransactions, passwordResets, userProfiles, authSessions, payments, walletAddresses, chapterComments, creatorBankDetails, deviceTokens, notifications } from "./schema";

export const chaptersRelations = relations(chapters, ({one, many}) => ({
	comic: one(comics, {
		fields: [chapters.comicId],
		references: [comics.id]
	}),
	chapterLikes: many(chapterLikes),
	chapterViews: many(chapterViews),
	paidChapters: many(paidChapters),
	chapterComments: many(chapterComments),
	notifications: many(notifications),
}));

export const comicsRelations = relations(comics, ({one, many}) => ({
	chapters: many(chapters),
	comicSubscribers: many(comicSubscribers),
	libraries: many(library),
	creatorProfile: one(creatorProfile, {
		fields: [comics.creatorId],
		references: [creatorProfile.id]
	}),
	notifications: many(notifications),
}));

export const chapterLikesRelations = relations(chapterLikes, ({one}) => ({
	chapter: one(chapters, {
		fields: [chapterLikes.chapterId],
		references: [chapters.id]
	}),
	readerProfile: one(readerProfile, {
		fields: [chapterLikes.readerId],
		references: [readerProfile.id]
	}),
}));

export const readerProfileRelations = relations(readerProfile, ({one, many}) => ({
	chapterLikes: many(chapterLikes),
	chapterViews: many(chapterViews),
	comicSubscribers: many(comicSubscribers),
	libraries: many(library),
	paidChapters: many(paidChapters),
	authUser: one(authUsers, {
		fields: [readerProfile.userId],
		references: [authUsers.id]
	}),
	userTransactions: many(userTransactions),
	chapterComments: many(chapterComments),
	deviceTokens: many(deviceTokens),
	notifications: many(notifications),
}));

export const chapterViewsRelations = relations(chapterViews, ({one}) => ({
	chapter: one(chapters, {
		fields: [chapterViews.chapterId],
		references: [chapters.id]
	}),
	readerProfile: one(readerProfile, {
		fields: [chapterViews.readerId],
		references: [readerProfile.id]
	}),
}));

export const comicSubscribersRelations = relations(comicSubscribers, ({one}) => ({
	comic: one(comics, {
		fields: [comicSubscribers.comicId],
		references: [comics.id]
	}),
	readerProfile: one(readerProfile, {
		fields: [comicSubscribers.readerId],
		references: [readerProfile.id]
	}),
}));

export const creatorTransactionsRelations = relations(creatorTransactions, ({one}) => ({
	creatorProfile: one(creatorProfile, {
		fields: [creatorTransactions.creatorId],
		references: [creatorProfile.id]
	}),
	userTransaction: one(userTransactions, {
		fields: [creatorTransactions.sourceUserTransactionId],
		references: [userTransactions.id]
	}),
}));

export const creatorProfileRelations = relations(creatorProfile, ({one, many}) => ({
	creatorTransactions: many(creatorTransactions),
	comics: many(comics),
	authUser: one(authUsers, {
		fields: [creatorProfile.userId],
		references: [authUsers.id]
	}),
	creatorBankDetails: many(creatorBankDetails),
}));

export const userTransactionsRelations = relations(userTransactions, ({one, many}) => ({
	creatorTransactions: many(creatorTransactions),
	readerProfile: one(readerProfile, {
		fields: [userTransactions.readerId],
		references: [readerProfile.id]
	}),
}));

export const libraryRelations = relations(library, ({one}) => ({
	comic: one(comics, {
		fields: [library.comicId],
		references: [comics.id]
	}),
	readerProfile: one(readerProfile, {
		fields: [library.readerId],
		references: [readerProfile.id]
	}),
}));

export const paidChaptersRelations = relations(paidChapters, ({one}) => ({
	chapter: one(chapters, {
		fields: [paidChapters.chapterId],
		references: [chapters.id]
	}),
	readerProfile: one(readerProfile, {
		fields: [paidChapters.readerId],
		references: [readerProfile.id]
	}),
}));

export const authUsersRelations = relations(authUsers, ({many}) => ({
	creatorProfiles: many(creatorProfile),
	loyaltyPoints: many(loyaltyPoints),
	passwordResets: many(passwordResets),
	userProfiles: many(userProfiles),
	readerProfiles: many(readerProfile),
	authSessions: many(authSessions),
}));

export const loyaltyPointsRelations = relations(loyaltyPoints, ({one}) => ({
	authUser: one(authUsers, {
		fields: [loyaltyPoints.userId],
		references: [authUsers.id]
	}),
}));

export const nwtTransactionsRelations = relations(nwtTransactions, ({one}) => ({
	userWallet: one(userWallets, {
		fields: [nwtTransactions.userWalletId],
		references: [userWallets.id]
	}),
}));

export const userWalletsRelations = relations(userWallets, ({one, many}) => ({
	nwtTransactions: many(nwtTransactions),
	userProfile: one(userProfiles, {
		fields: [userWallets.userProfileId],
		references: [userProfiles.id]
	}),
	payments: many(payments),
	walletAddresses: many(walletAddresses),
}));

export const passwordResetsRelations = relations(passwordResets, ({one}) => ({
	authUser: one(authUsers, {
		fields: [passwordResets.userId],
		references: [authUsers.id]
	}),
}));

export const userProfilesRelations = relations(userProfiles, ({one, many}) => ({
	userWallets: many(userWallets),
	authUser: one(authUsers, {
		fields: [userProfiles.authUserId],
		references: [authUsers.id]
	}),
}));

export const authSessionsRelations = relations(authSessions, ({one}) => ({
	authUser: one(authUsers, {
		fields: [authSessions.userId],
		references: [authUsers.id]
	}),
}));

export const paymentsRelations = relations(payments, ({one}) => ({
	userWallet: one(userWallets, {
		fields: [payments.userWalletId],
		references: [userWallets.id]
	}),
}));

export const walletAddressesRelations = relations(walletAddresses, ({one}) => ({
	userWallet: one(userWallets, {
		fields: [walletAddresses.userWalletId],
		references: [userWallets.id]
	}),
}));

export const chapterCommentsRelations = relations(chapterComments, ({one}) => ({
	readerProfile: one(readerProfile, {
		fields: [chapterComments.readerId],
		references: [readerProfile.id]
	}),
	chapter: one(chapters, {
		fields: [chapterComments.chapterId],
		references: [chapters.id]
	}),
}));

export const creatorBankDetailsRelations = relations(creatorBankDetails, ({one}) => ({
	creatorProfile: one(creatorProfile, {
		fields: [creatorBankDetails.creatorId],
		references: [creatorProfile.id]
	}),
}));

export const deviceTokensRelations = relations(deviceTokens, ({one}) => ({
	readerProfile: one(readerProfile, {
		fields: [deviceTokens.readerId],
		references: [readerProfile.id]
	}),
}));

export const notificationsRelations = relations(notifications, ({one}) => ({
	readerProfile: one(readerProfile, {
		fields: [notifications.readerId],
		references: [readerProfile.id]
	}),
	comic: one(comics, {
		fields: [notifications.comicId],
		references: [comics.id]
	}),
	chapter: one(chapters, {
		fields: [notifications.chapterId],
		references: [chapters.id]
	}),
}));