import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  json
} from 'drizzle-orm/pg-core';
import { userWallets } from './wallet';



export const nftTransactions = pgTable('nft_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userWalletId: uuid('user_wallet_id')
    .notNull()
    .references(() => userWallets.id, { onDelete: 'cascade' }),
  transactionType: text('transaction_type').notNull(), // 'credit' | 'debit'
  category: text('category').notNull(), // 'purchase', 'sale', etc.
  amount: text('amount').notNull(),
  balanceBefore: text('balance_before').notNull(),
  balanceAfter: text('balance_after').notNull(),
  referenceId: text('reference_id'),
  referenceType: text('reference_type'),
  description: text('description').notNull(),
  metadata: json('metadata'),
  blockchainTxHash: text('blockchain_tx_hash'),
  status: text('status').notNull(), // 'pending', 'completed', etc.
  processedAt: timestamp('processed_at', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
});



export const nft = pgTable('nfts', {
  id: uuid('id').primaryKey().defaultRandom(),
  owner: uuid('user_wallet_id')
    .notNull()
    .references(() => userWallets.id, { onDelete: 'cascade' }),
  colection: text('collection'), // Collection type: 'anchor', 'metaplex', etc.
  nftType: text('nft_type').default('anchor'), // 'anchor' or 'metaplex'
  mintAddress: text('mint_address'), // Solana mint address
  price: integer('price').default(0),
  isLimitedEdition: boolean('is_limited_edition').default(false),
  amount: integer("amount").default(1),
  tags: json('tags').$type<string[]>(), // Tags like 'fiction', 'mystery', 'romance', etc.
  metadata: json('metadata'),
  status: text('status').notNull(), // 'pending', 'minting', 'completed', 'transferred'
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
});

/**
 * NFT ownership transfer history table
 */
export const nftTransferHistory = pgTable('nft_transfer_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  nftId: uuid('nft_id')
    .notNull()
    .references(() => nft.id, { onDelete: 'cascade' }),
  fromUserWalletId: uuid('from_user_wallet_id')
    .references(() => userWallets.id, { onDelete: 'set null' }),
  toUserWalletId: uuid('to_user_wallet_id')
    .notNull()
    .references(() => userWallets.id, { onDelete: 'cascade' }),
  fromWalletAddress: text('from_wallet_address'),
  toWalletAddress: text('to_wallet_address').notNull(),
  transactionHash: text('transaction_hash'),
  status: text('status').notNull(), // 'pending', 'completed', 'failed'
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
});


