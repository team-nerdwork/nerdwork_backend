# NFT Marketplace Integration Guide

A comprehensive guide to the NFT marketplace system that enables users to buy and sell comic NFTs using in-app tokens (NWT).

## Overview

The NFT marketplace allows:
- **Sellers** to list their NFTs for sale
- **Buyers** to purchase NFTs with NWT (in-app tokens)
- **Automatic NWT deduction** from buyer wallets
- **Escrow system** to hold seller earnings
- **Withdrawal requests** for sellers to cash out earnings
- **Platform fees** and creator royalties

## Architecture

### Database Schema

```
NFT Marketplace Tables:
├── nft_listings          - Active NFT listings
├── nft_orders            - Purchase orders/sales
├── nft_order_transactions - Payment records
├── nft_marketplace_transfers - Blockchain transfer records
├── marketplace_escrow    - Seller earnings
├── seller_withdrawals    - Withdrawal requests
└── marketplace_config    - Platform settings
```

## Setup Instructions

### 1. Add Marketplace Routes

In your Express app (`src/index.ts` or `src/server.ts`):

```typescript
import marketplaceRoutes from "./routes/marketplace.routes";

// Register routes
app.use("/api/marketplace", marketplaceRoutes);
```

### 2. Update Transaction Controller

The marketplace integrates with your existing transaction system. Ensure you have the `createUserSpendTransaction` function in your `transaction.controller.ts`:

```typescript
/**
 * Create a spending transaction when user buys NFT
 */
export const createUserSpendTransaction = async (
  userId: string,
  nwtAmount: number,
  spendCategory: "marketplace_purchase",
  contentId: string,
  creatorId?: string,
  description?: string
) => {
  // Implementation in transaction.controller.ts
};
```

### 3. Database Migration

Run migrations to create marketplace tables:

```bash
npm run migrate:dev
# or
npm run push:dev
```

## API Endpoints

### Marketplace Configuration

#### Get Marketplace Config
```http
GET /api/marketplace/config
```

Returns current marketplace settings (fees, price limits, etc.).

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "platformFeePercentage": "2",
    "minimumListingPrice": "1",
    "maximumListingPrice": "1000000",
    "isMarketplaceActive": true,
    "allowRoyalties": true
  }
}
```

### Listing Management

#### List NFT for Sale
```http
POST /api/marketplace/list
Content-Type: application/json

{
  "nftId": "uuid",
  "sellerId": "wallet-id-uuid",
  "sellerWalletAddress": "solana-public-key",
  "price": 100,
  "title": "Amazing Comic #1",
  "description": "First edition of my comic series",
  "royaltyPercentage": 5
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "listing-uuid",
    "nftId": "nft-uuid",
    "sellerId": "seller-wallet-id",
    "price": "100",
    "title": "Amazing Comic #1",
    "status": "active",
    "listedAt": "2024-01-15T10:00:00Z"
  },
  "message": "NFT listed successfully"
}
```

#### Get Active Listings
```http
GET /api/marketplace/listings?limit=20&offset=0&minPrice=10&maxPrice=500&sortBy=newest
```

**Query Parameters:**
- `limit` (default: 20) - Number of results
- `offset` (default: 0) - Pagination offset
- `minPrice` - Minimum price filter (NWT)
- `maxPrice` - Maximum price filter (NWT)
- `sellerId` - Filter by specific seller
- `sortBy` - Sort order: `price_asc`, `price_desc`, `newest`, `oldest`

**Response:**
```json
{
  "success": true,
  "data": {
    "listings": [
      {
        "id": "listing-uuid",
        "title": "Comic #1",
        "price": "100",
        "status": "active",
        "listedAt": "2024-01-15T10:00:00Z"
      }
    ],
    "total": 150,
    "limit": 20,
    "offset": 0
  }
}
```

#### Get Listing Details
```http
GET /api/marketplace/listings/{listingId}
```

Returns full details including NFT info and seller info.

**Response:**
```json
{
  "success": true,
  "data": {
    "listing": { /* listing data */ },
    "nft": { /* NFT data */ },
    "seller": { /* seller wallet info */ }
  }
}
```

#### Cancel Listing
```http
DELETE /api/marketplace/listings/{listingId}
Content-Type: application/json

{
  "sellerId": "seller-wallet-id"
}
```

### Purchasing

#### Purchase NFT
```http
POST /api/marketplace/purchase
Content-Type: application/json

{
  "listingId": "listing-uuid",
  "buyerId": "buyer-user-id",
  "buyerWalletAddress": "solana-public-key",
  "sellerWalletAddress": "seller-solana-key"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "orderId": "order-uuid",
    "transactionId": "transaction-uuid",
    "status": "completed",
    "amounts": {
      "purchasePrice": 100,
      "platformFeeAmount": 2,
      "royaltyAmount": 5,
      "sellerAmount": 93
    }
  },
  "message": "NFT purchased successfully"
}
```

**How it works:**
1. Creates an order record
2. Creates a transaction record
3. Deducts NWT from buyer's wallet
4. Transfers NFT on blockchain
5. Credits seller's escrow
6. Updates listing status to "sold"

### Seller Dashboard

#### Get Escrow Balance
```http
GET /api/marketplace/escrow/{sellerId}
```

Returns seller's current earnings and withdrawal status.

**Response:**
```json
{
  "success": true,
  "data": {
    "sellerId": "seller-wallet-id",
    "totalEarnings": "5000",
    "totalWithdrawn": "2000",
    "availableBalance": "3000"
  }
}
```

#### Get Sales History
```http
GET /api/marketplace/seller/{sellerId}/sales?limit=20&offset=0
```

Returns list of NFTs sold by the seller.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "order-uuid",
      "nftId": "nft-uuid",
      "buyerId": "buyer-id",
      "purchasePrice": "100",
      "platformFeeAmount": "2",
      "sellerAmount": "93",
      "status": "completed",
      "completedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### Request Withdrawal
```http
POST /api/marketplace/withdraw
Content-Type: application/json

{
  "sellerId": "seller-wallet-id",
  "amount": 1000
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "withdrawal-uuid",
    "sellerId": "seller-wallet-id",
    "amount": "1000",
    "status": "pending",
    "createdAt": "2024-01-15T11:00:00Z"
  },
  "message": "Withdrawal request created successfully"
}
```

#### Get Withdrawal History
```http
GET /api/marketplace/seller/{sellerId}/withdrawals?limit=20&offset=0
```

### Buyer Dashboard

#### Get Purchase History
```http
GET /api/marketplace/buyer/{buyerId}/purchases?limit=20&offset=0
```

Returns NFTs purchased by the buyer.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "order-uuid",
      "nftId": "nft-uuid",
      "mintAddress": "solana-mint",
      "purchasePrice": "100",
      "status": "completed",
      "completedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Marketplace Statistics

#### Get Marketplace Stats
```http
GET /api/marketplace/stats
```

Returns aggregate marketplace data.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalActiveListings": 250,
    "totalCompletedSales": 1500,
    "totalVolume": 125000,
    "floorPrice": 10
  }
}
```

## Marketplace Flow

### Seller Workflow

1. **List NFT**
   ```
   User has NFT → Lists for sale → Listing becomes active
   ```

2. **Monitor Sales**
   ```
   Get sales history → View escrow balance → Track earnings
   ```

3. **Withdraw Earnings**
   ```
   Request withdrawal → (Admin review) → Withdraw to wallet
   ```

### Buyer Workflow

1. **Browse Listings**
   ```
   Get listings → Filter by price/seller → View details
   ```

2. **Purchase NFT**
   ```
   Select listing → Purchase with NWT → NFT transferred to wallet
   ```

3. **Manage Collection**
   ```
   View purchase history → Check NFT ownership → Verify on chain
   ```

## Fee Structure

### Platform Fees

The default fee structure:
- **Platform Fee**: 2% (configurable)
- **Creator Royalty**: 0-5% (per listing, optional)
- **Seller Receives**: Purchase Price - Platform Fee - Creator Royalty

### Example Transaction

**Scenario:** Buyer purchases NFT for 100 NWT
- Platform Fee (2%): 2 NWT → Platform
- Creator Royalty (5%): 5 NWT → Creator/Original Artist
- Seller Amount: 93 NWT → Seller's Escrow

```
Purchase Price: 100 NWT
├── Platform Fee: 2 NWT (2%)
├── Creator Royalty: 5 NWT (5%)
└── Seller Receives: 93 NWT
```

## Database Relationships

```
nft_listings
├── nftId → nfts.id
├── sellerId → user_wallets.id
└── [when sold, creates nft_orders]

nft_orders
├── listingId → nft_listings.id
├── nftId → nfts.id
├── buyerId → user_wallets.id
├── sellerId → user_wallets.id
└── transactionId → nft_order_transactions.id

nft_order_transactions
├── orderId → nft_orders.id
├── buyerId → reader_profile.id
└── [NWT payment record]

marketplace_escrow
├── sellerId → user_wallets.id
└── [balance tracking]

nft_marketplace_transfers
├── orderId → nft_orders.id
└── nftId → nfts.id
```

## Error Handling

### Common Errors

**400 - Bad Request**
- Missing required fields
- Invalid wallet address
- Invalid price (too high/low)
- Insufficient escrow balance for withdrawal

**403 - Forbidden**
- Seller trying to cancel someone else's listing
- Buyer with insufficient NWT balance

**404 - Not Found**
- Listing not found
- NFT not found
- Order not found

**500 - Internal Server Error**
- Database errors
- Blockchain transfer failures
- Payment processing errors

## Best Practices

### For Sellers

1. **Set appropriate prices** - Consider market conditions and demand
2. **Provide good descriptions** - Helps attract buyers
3. **Set reasonable royalties** - Don't exceed 10%
4. **Monitor escrow balance** - Withdraw regularly to avoid large balances
5. **Check transaction fees** - Understand what you'll receive

### For Buyers

1. **Verify listing details** - Check NFT metadata and seller info
2. **Check NWT balance** - Ensure sufficient funds before purchase
3. **Review transaction fees** - Understand total cost
4. **Verify NFT transfer** - Confirm ownership after purchase
5. **Keep purchase history** - For record keeping

### For Admins

1. **Monitor platform fees** - Ensure they're reasonable and competitive
2. **Review withdrawal requests** - Verify legitimacy before approval
3. **Track marketplace health** - Monitor volume, prices, and user activity
4. **Prevent fraud** - Monitor suspicious listings/purchases
5. **Update configuration** - Adjust fees and limits as needed

## Integration with Anchor NFT Minting

The marketplace works seamlessly with the Anchor NFT minting system:

1. **Mint NFT** → NFT record created in database
2. **List NFT** → Create marketplace listing
3. **Purchase NFT** → Create order and transfer on blockchain
4. **Verify Ownership** → Check blockchain + database

```
Anchor Mint → Database NFT Record → List on Marketplace → Purchase → Transfer
```

## Troubleshooting

### "NFT not found"
- Ensure NFT was minted and database record exists
- Check nftId format is valid UUID

### "Insufficient balance"
- Check escrow balance with `GET /api/marketplace/escrow/{sellerId}`
- Ensure withdrawal amount is less than available balance

### "Listing is not active"
- Verify listing status is still "active"
- Check if listing was already sold

### "Buyer has insufficient NWT"
- Check buyer's wallet balance
- May need to purchase more NWT

### "Blockchain transfer failed"
- Verify wallet addresses are valid
- Check platform has sufficient SOL for transaction fees
- Ensure NFT ownership is correct

## Future Enhancements

Potential features to consider:

1. **Auction System** - Time-based bidding for NFTs
2. **Collections** - Group related NFTs together
3. **Rarity Scoring** - Automatically calculate NFT rarity
4. **Offers** - Allow buyers to make offers below asking price
5. **Bulk Operations** - List/delist multiple NFTs at once
6. **Analytics** - Detailed seller/buyer analytics
7. **Recommendations** - Suggest NFTs based on user history
8. **Disputes** - Handle purchase disputes and refunds
9. **Ratings** - User ratings and reputation system
10. **Social Features** - Favorites, follows, messages

## Support & Documentation

For additional help:
- Check Solana Cookbook for blockchain concepts
- Review Anchor documentation for NFT operations
- See transaction system for payment flows
- Check existing payment controller for NWT integration examples
