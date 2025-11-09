# NFT System - API Reference Card

Quick reference for all endpoints.

## Minting API

### POST /api/anchor-nft/mint
Mint NFT with image upload

**Form Data:**
- `image` (file) - Image file
- `userProfileId` (string) - User UUID
- `userWalletAddress` (string) - Solana wallet
- `nftName` (string) - NFT name
- `description` (string) - Optional
- `author` (string) - Optional
- `series` (string) - Optional
- `issue` (number) - Optional
- `genre` (string) - Optional
- `pages` (number) - Optional
- `publishDate` (string) - ISO format, optional
- `attributes` (string) - JSON string, optional

**Response:** `{ success, data { mintAddress, signature, metadataUri } }`

---

### POST /api/anchor-nft/mint-url
Mint NFT with external image URL

**Body:**
```json
{
  "userProfileId": "string",
  "userWalletAddress": "string",
  "nftName": "string",
  "imageUrl": "string",
  "description": "string",
  "author": "string",
  "series": "string",
  "issue": 1,
  "genre": "string",
  "pages": 1,
  "publishDate": "2024-01-15T00:00:00Z",
  "attributes": "[{...}]"
}
```

---

### GET /api/anchor-nft/user/{walletAddress}
Get user's NFTs

**Response:** `{ success, data { userWalletAddress, nftCount, nfts [...] } }`

---

### GET /api/anchor-nft/{mintAddress}
Get NFT details

**Response:** `{ success, data { mint, owner, name, uri, metadataUrl } }`

---

### GET /api/anchor-nft/verify-ownership/{mintAddress}/{walletAddress}
Verify ownership

**Response:** `{ success, data { mintAddress, walletAddress, isOwner: boolean } }`

---

### POST /api/anchor-nft/transfer
Transfer NFT (user to user)

**Body:**
```json
{
  "mintAddress": "string",
  "fromUserWalletAddress": "string",
  "toUserWalletAddress": "string",
  "fromUserProfileId": "string",
  "toUserProfileId": "string"
}
```

---

### POST /api/anchor-nft/platform-transfer
Platform-initiated transfer

**Body:**
```json
{
  "mintAddress": "string",
  "userWalletAddress": "string",
  "userProfileId": "string"
}
```

---

### GET /api/anchor-nft/stats
Marketplace statistics

**Response:** `{ success, data { totalMinted, authority } }`

---

### GET /api/anchor-nft/health
Health check

**Response:** `{ success, status, platform { authority, totalNfts } }`

---

## Marketplace API

### GET /api/marketplace/config
Get marketplace configuration

**Response:**
```json
{
  "success": true,
  "data": {
    "platformFeePercentage": "2",
    "minimumListingPrice": "1",
    "maximumListingPrice": "1000000",
    "isMarketplaceActive": true
  }
}
```

---

### GET /api/marketplace/stats
Get marketplace statistics

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

---

### POST /api/marketplace/list
List NFT for sale

**Body:**
```json
{
  "nftId": "uuid",
  "sellerId": "uuid",
  "sellerWalletAddress": "string",
  "price": 100,
  "title": "string",
  "description": "string",
  "royaltyPercentage": 5
}
```

**Response:** `{ success, data { id, status: "active" } }`

---

### GET /api/marketplace/listings
Get listings with filters

**Query Params:**
- `limit` (int, default 20)
- `offset` (int, default 0)
- `minPrice` (number)
- `maxPrice` (number)
- `sellerId` (uuid)
- `sortBy` (price_asc, price_desc, newest, oldest)

**Response:** `{ success, data { listings [...], total, limit, offset } }`

---

### GET /api/marketplace/listings/{listingId}
Get listing details

**Response:**
```json
{
  "success": true,
  "data": {
    "listing": {...},
    "nft": {...},
    "seller": {...}
  }
}
```

---

### POST /api/marketplace/purchase
Purchase NFT

**Body:**
```json
{
  "listingId": "uuid",
  "buyerId": "uuid",
  "buyerWalletAddress": "string",
  "sellerWalletAddress": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "uuid",
    "transactionId": "uuid",
    "status": "completed",
    "amounts": {
      "purchasePrice": 100,
      "platformFeeAmount": 2,
      "royaltyAmount": 5,
      "sellerAmount": 93
    }
  }
}
```

---

### DELETE /api/marketplace/listings/{listingId}
Cancel listing

**Body:**
```json
{
  "sellerId": "uuid"
}
```

---

### GET /api/marketplace/escrow/{sellerId}
Get seller escrow balance

**Response:**
```json
{
  "success": true,
  "data": {
    "sellerId": "uuid",
    "totalEarnings": "5000",
    "totalWithdrawn": "2000",
    "availableBalance": "3000"
  }
}
```

---

### GET /api/marketplace/seller/{sellerId}/sales
Get seller sales history

**Query Params:**
- `limit` (int, default 20)
- `offset` (int, default 0)

---

### GET /api/marketplace/buyer/{buyerId}/purchases
Get buyer purchase history

**Query Params:**
- `limit` (int, default 20)
- `offset` (int, default 0)

---

### POST /api/marketplace/withdraw
Request withdrawal

**Body:**
```json
{
  "sellerId": "uuid",
  "amount": 1000
}
```

**Response:** `{ success, data { id, status: "pending" } }`

---

### GET /api/marketplace/seller/{sellerId}/withdrawals
Get withdrawal history

**Query Params:**
- `limit` (int, default 20)
- `offset` (int, default 0)

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request |
| 403 | Forbidden |
| 404 | Not found |
| 500 | Server error |

---

## Response Format

All endpoints return:

```json
{
  "success": true/false,
  "data": {...},
  "message": "Optional message",
  "error": "Optional error",
  "details": "Additional error details"
}
```

---

## Error Responses

```json
{
  "error": "Error message",
  "details": "Detailed explanation"
}
```

Common errors:
- Missing required fields → 400
- Invalid wallet address → 400
- Insufficient balance → 400
- Listing not found → 404
- Unauthorized → 403

---

## Sorting Options

**sortBy parameter:**
- `price_asc` - Lowest price first
- `price_desc` - Highest price first
- `newest` - Recently listed first
- `oldest` - Oldest listed first

---

## Fee Structure

Default:
- Platform Fee: 2%
- Creator Royalty: 0-5% (per listing)
- Seller gets: Price - Platform Fee - Royalty

**Example (100 NWT purchase):**
- Purchase Price: 100 NWT
- Platform Fee (2%): -2 NWT
- Creator Royalty (5%): -5 NWT
- Seller Receives: 93 NWT

---

## Wallet Address Format

Solana addresses:
- Length: 44 characters
- Format: Base58 encoded
- Example: `4zWWjJ6KYUFLq7h3PkG5TQmK5d7Gj3h5M8qbQKr2mKxL`

---

## Required Headers

Most endpoints don't require special headers. File uploads require:

```
Content-Type: multipart/form-data
```

For JSON requests:

```
Content-Type: application/json
```

---

## Rate Limits

No rate limits implemented yet. Consider adding:
- 100 requests per minute per IP for public endpoints
- 1000 requests per minute for authenticated endpoints

---

## Pagination

Endpoints that return lists use:
- `limit` - Results per page (max 100)
- `offset` - Starting position

Example:
```
/api/marketplace/listings?limit=20&offset=40
```

Gets results 40-60.

---

## Timestamps

All timestamps are ISO 8601 format UTC:
```
2024-01-15T10:30:45Z
```

---

## Testing Tools

### cURL
```bash
curl -X POST http://localhost:3000/api/marketplace/list \
  -H "Content-Type: application/json" \
  -d '{"nftId":"...","sellerId":"..."}'
```

### Postman
1. Import API definition
2. Set environment variables
3. Test endpoints

### Thunder Client (VS Code)
1. Create requests
2. Save to collection
3. Share with team

---

## Common Request Patterns

### List all NFTs
```bash
curl http://localhost:3000/api/marketplace/listings
```

### Search by price
```bash
curl "http://localhost:3000/api/marketplace/listings?minPrice=10&maxPrice=100&sortBy=price_asc"
```

### Get seller info
```bash
curl http://localhost:3000/api/marketplace/escrow/{sellerId}
curl http://localhost:3000/api/marketplace/seller/{sellerId}/sales
```

### Get buyer info
```bash
curl http://localhost:3000/api/marketplace/buyer/{buyerId}/purchases
```

---

## Integration Checklist

Before going live:
- [ ] All endpoints responding
- [ ] Image uploads working
- [ ] IPFS storage working
- [ ] Blockchain transfers working
- [ ] NWT deductions working
- [ ] Escrow system working
- [ ] Database queries correct
- [ ] Error handling proper
- [ ] Pagination working
- [ ] Sorting working

---

**Last Updated:** January 2024
**API Version:** 1.0
**Status:** Stable
