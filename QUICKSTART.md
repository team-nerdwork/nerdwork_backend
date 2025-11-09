# Quick Start Guide - NFT Minting & Marketplace

Get the NFT system up and running in 10 minutes!

## Prerequisites

- Node.js 16+
- PostgreSQL database
- Solana wallet with devnet SOL
- Pinata account (for IPFS)

## 1. Environment Setup (2 minutes)

Add to `.env`:

```bash
# Solana
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
ANCHOR_PRIVATE_KEY=/path/to/keypair.json

# Pinata IPFS
PINATA_JWT=your_pinata_jwt
PINATA_GATEWAY=gateway.pinata.cloud

# Existing vars (keep these)
JWT_SECRET=your_secret
DATABASE_URL=postgresql://...
```

## 2. Install & Migrate (3 minutes)

```bash
# Install new dependencies
npm install

# Run database migrations
npm run migrate:dev
```

## 3. Update Server (2 minutes)

In `src/server.ts`:

```typescript
import { AnchorConfig } from "./config/anchor.config";
import anchorNftRoutes from "./routes/anchor.nft.routes";
import marketplaceRoutes from "./routes/marketplace.routes";

// Add routes
app.use("/api/anchor-nft", anchorNftRoutes);
app.use("/api/marketplace", marketplaceRoutes);

// Initialize Anchor (in your startup function)
async function startServer() {
  await AnchorConfig.initializeAll();

  app.listen(3000, () => {
    console.log("✓ NFT services initialized");
    console.log("✓ Server running on :3000");
  });
}

startServer();
```

## 4. Test It (3 minutes)

### Check Health
```bash
curl http://localhost:3000/api/anchor-nft/health
```

Expected response:
```json
{
  "success": true,
  "status": "healthy",
  "platform": {
    "authority": "...",
    "totalNfts": 0
  }
}
```

### List Marketplace
```bash
curl http://localhost:3000/api/marketplace/listings
```

## Usage Examples

### 1. Mint NFT

```bash
curl -X POST http://localhost:3000/api/anchor-nft/mint \
  -F "image=@image.jpg" \
  -F "userProfileId=user-123" \
  -F "userWalletAddress=4zWWjJ6K...8qbQK" \
  -F "nftName=Comic #1" \
  -F "description=Amazing comic" \
  -F "author=John Doe" \
  -F "series=My Series" \
  -F "issue=1"
```

Response includes:
- `mintAddress` - The NFT mint address
- `signature` - Transaction signature
- `metadataUri` - IPFS metadata URL

### 2. List for Sale

```bash
curl -X POST http://localhost:3000/api/marketplace/list \
  -H "Content-Type: application/json" \
  -d '{
    "nftId": "from-mint-response",
    "sellerId": "seller-wallet-id",
    "sellerWalletAddress": "4zWWjJ6K...8qbQK",
    "price": 100,
    "title": "Comic #1",
    "royaltyPercentage": 5
  }'
```

### 3. Buy NFT

```bash
curl -X POST http://localhost:3000/api/marketplace/purchase \
  -H "Content-Type: application/json" \
  -d '{
    "listingId": "from-list-response",
    "buyerId": "buyer-user-id",
    "buyerWalletAddress": "9k7dQP...2mKxL",
    "sellerWalletAddress": "4zWWjJ6K...8qbQK"
  }'
```

## Key Endpoints

### Minting
- `POST /api/anchor-nft/mint` - Mint NFT with image
- `POST /api/anchor-nft/mint-url` - Mint with external URL
- `GET /api/anchor-nft/user/{wallet}` - Get user's NFTs

### Marketplace
- `GET /api/marketplace/listings` - Browse NFTs
- `POST /api/marketplace/list` - List NFT for sale
- `POST /api/marketplace/purchase` - Buy NFT
- `DELETE /api/marketplace/listings/{id}` - Delist NFT
- `GET /api/marketplace/escrow/{seller}` - Check earnings

## Useful Commands

```bash
# Check blockchain health
curl http://localhost:3000/api/anchor-nft/health

# Get marketplace stats
curl http://localhost:3000/api/marketplace/stats

# Browse listings
curl "http://localhost:3000/api/marketplace/listings?sortBy=newest&limit=10"

# Check seller balance
curl http://localhost:3000/api/marketplace/escrow/{sellerId}
```

## Database Queries

Check marketplace status:

```sql
-- Count listings
SELECT COUNT(*) FROM nft_listings WHERE status = 'active';

-- Recent sales
SELECT * FROM nft_orders WHERE status = 'completed'
ORDER BY completed_at DESC LIMIT 5;

-- Seller escrow
SELECT * FROM marketplace_escrow WHERE seller_id = '...';
```

## Troubleshooting

### "Anchor service not initialized"
✓ Check `AnchorConfig.initializeAll()` is called
✓ Check environment variables are set

### "Invalid wallet address"
✓ Wallet must be valid Solana address (44 chars)
✓ Example: `4zWWjJ6KYUFLq7h3PkG5TQmK5d7Gj3h5M8qbQKr2mKxL`

### "IPFS upload failed"
✓ Check Pinata JWT token
✓ Check gateway URL
✓ Verify image file is readable

### "NFT transfer failed"
✓ Check buyer has received NFT on chain
✓ Verify wallet addresses are correct
✓ Check platform account has SOL for fees

## What's Included

### Minting System
- ✓ Mint NFTs on Solana
- ✓ Store metadata on IPFS
- ✓ Database tracking
- ✓ Transfer functionality
- ✓ Ownership verification

### Marketplace
- ✓ List NFTs for sale
- ✓ Browse & filter listings
- ✓ Purchase with NWT tokens
- ✓ Automatic blockchain transfers
- ✓ Seller escrow system
- ✓ Creator royalties
- ✓ Platform fees (2%)
- ✓ Withdrawal requests

## Next: Full Documentation

For complete details, see:
- **Minting:** `ANCHOR_NFT_INTEGRATION.md`
- **Marketplace:** `NFT_MARKETPLACE_GUIDE.md`
- **Architecture:** `IMPLEMENTATION_SUMMARY.md`

## Support

Stuck? Check the relevant guide above, or review the detailed code comments in:
- `src/services/marketplace.service.ts`
- `src/controller/marketplace.controller.ts`
- `src/services/anchor.program.ts`

Good luck! 🚀
