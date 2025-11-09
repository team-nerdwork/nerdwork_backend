# Anchor NFT Minting Integration Guide

This guide explains how to integrate and use the Anchor smart contract for NFT minting with your Node.js backend.

## Overview

Your Anchor smart contract allows you to:
1. **Mint NFTs** - Mint NFTs directly to users without complex Web3 interactions
2. **Transfer NFTs** - Platform-initiated transfers allow the company to transfer NFTs to users
3. **Verify Ownership** - Check NFT ownership on-chain

This is perfect for Web2 users who don't understand Web3 - they just need to make HTTP requests!

## Architecture

### Components Created

```
src/
├── config/
│   └── anchor.config.ts              # Anchor service initialization
├── services/
│   ├── anchor.program.ts             # Core Anchor program interaction
│   ├── anchor.minting.service.ts     # NFT minting logic
│   ├── anchor.transfer.service.ts    # NFT transfer logic
│   └── pinata.service.ts             # IPFS metadata storage
├── controller/
│   └── anchor.nft.controller.ts      # HTTP endpoints
├── routes/
│   └── anchor.nft.routes.ts          # Route definitions
├── idl/
│   └── nft_minting.ts                # Smart contract IDL
└── model/
    └── nft.ts                         # Database schema (updated)
```

## Setup Instructions

### 1. Environment Variables

Add these to your `.env` file:

```bash
# Solana Configuration
SOLANA_NETWORK=devnet                           # or mainnet-beta, testnet
SOLANA_RPC_URL=https://api.devnet.solana.com   # Optional, uses default if not set
ANCHOR_PRIVATE_KEY=path/to/keypair.json        # Path to Anchor program authority keypair
                                                # OR: JSON array of secret key bytes

# Pinata IPFS Configuration (for metadata storage)
PINATA_JWT=your_pinata_jwt_token
PINATA_GATEWAY=gateway.pinata.cloud
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

New packages added:
- `@coral-xyz/anchor` - Anchor framework
- `@solana/spl-token` - SPL Token program
- `@pinata/sdk` - Pinata IPFS SDK

### 3. Initialize the Service

In your `src/server.ts` or main entry point:

```typescript
import { AnchorConfig } from "./config/anchor.config";

// Initialize Anchor NFT service
async function initializeServices() {
  try {
    await AnchorConfig.initializeAll();
    console.log("✓ All services initialized");
  } catch (error) {
    console.error("Failed to initialize services:", error);
    process.exit(1);
  }
}

// Call during server startup
initializeServices().then(() => {
  // Start Express server
});
```

### 4. Register Routes

In your Express app setup:

```typescript
import anchorNftRoutes from "./routes/anchor.nft.routes";

app.use("/api/anchor-nft", anchorNftRoutes);
```

## API Endpoints

### 1. Mint NFT with Image Upload

```http
POST /api/anchor-nft/mint
Content-Type: multipart/form-data

Required Fields:
- image: File                       # JPEG, PNG, GIF, or WebP (max 50MB)
- userProfileId: string            # User's UUID
- userWalletAddress: string        # Solana public key
- nftName: string                  # NFT name

Optional Fields:
- description: string
- author: string
- series: string
- issue: number
- genre: string
- pages: number
- publishDate: string              # ISO 8601 format
- attributes: string               # JSON string
```

**Response:**
```json
{
  "success": true,
  "data": {
    "mintAddress": "...",
    "nftInfoPda": "...",
    "signature": "...",
    "imageUri": "ipfs://...",
    "metadataUri": "ipfs://...",
    "nft": {
      "name": "...",
      "uri": "...",
      "owner": "..."
    }
  },
  "message": "NFT minted successfully"
}
```

### 2. Mint NFT with External URL

```http
POST /api/anchor-nft/mint-url
Content-Type: application/json

{
  "userProfileId": "uuid",
  "userWalletAddress": "address",
  "nftName": "Comic Title",
  "imageUrl": "https://example.com/image.jpg",
  "description": "...",
  "author": "...",
  "series": "...",
  "issue": 1,
  "genre": "...",
  "pages": 20,
  "publishDate": "2024-01-01T00:00:00Z",
  "attributes": "[{\"trait_type\":\"...\",\"value\":\"...\"}]"
}
```

### 3. Transfer NFT to User

```http
POST /api/anchor-nft/transfer
Content-Type: application/json

{
  "mintAddress": "...",
  "fromUserProfileId": "...",
  "fromUserWalletAddress": "...",
  "toUserProfileId": "...",
  "toUserWalletAddress": "..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "signature": "...",
    "mintAddress": "...",
    "fromAddress": "...",
    "toAddress": "..."
  },
  "message": "NFT transferred successfully"
}
```

### 4. Platform-Initiated Transfer

```http
POST /api/anchor-nft/platform-transfer
Content-Type: application/json

{
  "mintAddress": "...",
  "userWalletAddress": "...",
  "userProfileId": "..."  # Optional
}
```

This is useful for transferring minted NFTs to users in one step.

### 5. Get User's NFTs

```http
GET /api/anchor-nft/user/{userWalletAddress}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userWalletAddress": "...",
    "nftCount": 5,
    "nfts": [
      {
        "mint": "...",
        "tokenAccount": "...",
        "owner": "...",
        "name": "...",
        "uri": "ipfs://...",
        "metadataUrl": "https://gateway.pinata.cloud/ipfs/..."
      }
    ]
  }
}
```

### 6. Get NFT Details

```http
GET /api/anchor-nft/{mintAddress}
```

### 7. Verify Ownership

```http
GET /api/anchor-nft/verify-ownership/{mintAddress}/{userWalletAddress}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "mintAddress": "...",
    "userWalletAddress": "...",
    "isOwner": true
  }
}
```

### 8. Get Platform Stats

```http
GET /api/anchor-nft/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalMinted": 150,
    "authority": "..."
  }
}
```

### 9. Health Check

```http
GET /api/anchor-nft/health
```

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "platform": {
    "authority": "...",
    "totalNfts": 150
  }
}
```

## Workflow: Minting and Transferring for Web2 Users

The simplest workflow for your use case:

### Step 1: User Requests NFT (Frontend/Mobile)

```javascript
const formData = new FormData();
formData.append('image', imageFile);
formData.append('userProfileId', userId);
formData.append('userWalletAddress', userWallet);
formData.append('nftName', 'Comic Issue #1');
formData.append('description', 'An amazing comic...');
formData.append('author', 'John Doe');
formData.append('series', 'My Comic Series');
formData.append('issue', 1);

const response = await fetch('/api/anchor-nft/mint', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log('NFT Mint Address:', result.data.mintAddress);
```

### Step 2: Backend Mints and Stores Metadata

- Image is uploaded to Pinata IPFS
- Metadata JSON is created and uploaded to Pinata IPFS
- NFT is minted on Solana blockchain
- Database record is created with IPFS URIs

### Step 3: Transfer to User (Optional)

If you minted to the platform wallet first:

```javascript
const transferResponse = await fetch('/api/anchor-nft/platform-transfer', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    mintAddress: result.data.mintAddress,
    userWalletAddress: userWallet,
    userProfileId: userId
  })
});
```

## Database Schema

### NFT Table

```sql
CREATE TABLE nfts (
  id UUID PRIMARY KEY,
  user_wallet_id UUID REFERENCES user_wallets(id),
  collection TEXT,              -- 'anchor', 'metaplex', etc.
  nft_type TEXT DEFAULT 'anchor',
  mint_address TEXT,            -- Solana mint address
  price INTEGER DEFAULT 0,
  is_limited_edition BOOLEAN DEFAULT false,
  amount INTEGER DEFAULT 1,
  metadata JSONB,               -- Stores NFT metadata
  status TEXT,                  -- 'pending', 'minting', 'completed', 'transferred'
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Transfer History Table

```sql
CREATE TABLE nft_transfer_history (
  id UUID PRIMARY KEY,
  nft_id UUID REFERENCES nfts(id),
  from_user_wallet_id UUID REFERENCES user_wallets(id),
  to_user_wallet_id UUID REFERENCES user_wallets(id),
  from_wallet_address TEXT,
  to_wallet_address TEXT,
  transaction_hash TEXT,
  status TEXT,                  -- 'pending', 'completed', 'failed'
  created_at TIMESTAMP
);
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": "Detailed error description"
}
```

Common errors:
- **400** - Invalid input (missing required fields, invalid wallet address)
- **404** - Resource not found
- **500** - Internal server error (blockchain issue, IPFS issue, etc.)

## Security Considerations

1. **Private Key Management**
   - Store ANCHOR_PRIVATE_KEY in environment variables
   - Never commit keypair files to git
   - Use a secure key management service in production

2. **Rate Limiting**
   - Consider adding rate limiting to prevent abuse
   - Solana has transaction limits

3. **Verification**
   - Always verify userProfileId matches authenticated user
   - Add authentication middleware to protect endpoints

4. **Wallet Validation**
   - Validate wallet addresses are valid Solana public keys
   - Use try-catch blocks for PublicKey parsing

## Testing

### Test Minting (with curl)

```bash
curl -X POST http://localhost:3000/api/anchor-nft/mint \
  -F "image=@path/to/image.jpg" \
  -F "userProfileId=test-user-id" \
  -F "userWalletAddress=user_wallet_address" \
  -F "nftName=Test NFT" \
  -F "description=A test NFT"
```

### Test Health Check

```bash
curl http://localhost:3000/api/anchor-nft/health
```

## Advanced Topics

### Custom Metadata

You can add custom metadata by passing a JSON string in the attributes field:

```json
{
  "attributes": "[{\"trait_type\":\"Rarity\",\"value\":\"Rare\"},{\"trait_type\":\"Edition\",\"value\":\"1/100\"}]"
}
```

### IPFS Gateway URLs

Metadata URIs are stored as `ipfs://CID` format. To access via HTTP:

```typescript
const metadataUrl = PinataService.getIpfsUrl(metadataUri);
// https://gateway.pinata.cloud/ipfs/Qm...
```

### Querying NFTs

Get all NFTs minted by your platform:

```typescript
const anchorService = getAnchorService();
const allNfts = await anchorService.getPlatformNfts();
```

## Troubleshooting

### "Anchor service not initialized"
- Make sure `AnchorConfig.initializeAll()` is called during server startup
- Check environment variables are set correctly

### "Invalid wallet address"
- Verify the wallet address is a valid Solana public key
- Address should be 44 characters long (base58)

### "Failed to upload to IPFS"
- Check Pinata API keys are correct
- Verify PINATA_JWT and PINATA_GATEWAY environment variables

### "Transaction failed"
- Ensure the platform authority wallet has sufficient SOL for fees
- Check blockchain RPC is responding

## Support

For issues with:
- **Anchor Framework**: Check [@coral-xyz/anchor docs](https://coral.army/)
- **Solana**: See [Solana Cookbook](https://solanacookbook.com/)
- **Pinata**: Visit [Pinata Documentation](https://docs.pinata.cloud/)
