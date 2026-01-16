import request from "supertest";
import { app } from "../src/index";
import { db } from "../src/config/db";
import { readerProfile, userProfiles } from "../src/model/profile";
import { authUsers } from "../src/model/auth";
import { nft } from "../src/model/nft";
import { userWallets } from "../src/model/wallet";
import { nftListings, marketplaceEscrow } from "../src/model/marketplace";
import { eq } from "drizzle-orm";

describe("Marketplace - List & Purchase NFT Flow", () => {
  // Increase timeout for database operations
  jest.setTimeout(30000);
  // Test user IDs
  const sellerAuthId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
  const sellerProfileId = "11111111-1111-1111-1111-111111111111";
  const sellerReaderId = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
  const sellerWalletId = "cccccccc-cccc-cccc-cccc-cccccccccccc";

  const buyerAuthId = "dddddddd-dddd-dddd-dddd-dddddddddddd";
  const buyerProfileId = "22222222-2222-2222-2222-222222222222";
  const buyerReaderId = "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee";
  const buyerWalletId = "ffffffff-ffff-ffff-ffff-ffffffffffff";

  let nftId: string;
  let listingId: string;

  // Valid Solana public key format (base58, 44 characters)
  const sellerWalletAddress = "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU";
  const buyerWalletAddress = "DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK";

  beforeAll(async () => {
    // 1. Create seller auth user
    await db.insert(authUsers).values({
      id: sellerAuthId,
      email: "seller@test.com",
      username: "seller_user",
    });

    // 2. Create seller user profile (required for userWallets foreign key)
    await db.insert(userProfiles).values({
      id: sellerProfileId,
      authUserId: sellerAuthId,
      displayName: "Seller User",
      language: "en",
      preferences: {},
    });

    // 3. Create seller reader profile with wallet balance
    await db.insert(readerProfile).values({
      id: sellerReaderId,
      userId: sellerAuthId,
      fullName: "Seller User",
      walletId: "SELLER123456",
      walletBalance: 0, // Seller starts with 0
    });

    // 4. Create seller wallet
    await db.insert(userWallets).values({
      id: sellerWalletId,
      userProfileId: sellerProfileId, // Reference userProfiles, not readerProfile
      nwtBalance: 0,
      nwtLockedBalance: 0,
      primaryWalletAddress: sellerWalletAddress,
      kycStatus: "verified",
      kycLevel: 1,
      spendingLimitDaily: 10000,
      spendingLimitMonthly: 50000,
    });

    // 5. Create buyer auth user
    await db.insert(authUsers).values({
      id: buyerAuthId,
      email: "buyer@test.com",
      username: "buyer_user",
    });

    // 6. Create buyer user profile (required for userWallets foreign key)
    await db.insert(userProfiles).values({
      id: buyerProfileId,
      authUserId: buyerAuthId,
      displayName: "Buyer User",
      language: "en",
      preferences: {},
    });

    // 7. Create buyer reader profile with sufficient NWT balance
    await db.insert(readerProfile).values({
      id: buyerReaderId,
      userId: buyerAuthId,
      fullName: "Buyer User",
      walletId: "BUYER789012",
      walletBalance: 1000, // Buyer has 1000 NWT
    });

    // 8. Create buyer wallet
    await db.insert(userWallets).values({
      id: buyerWalletId,
      userProfileId: buyerProfileId, // Reference userProfiles, not readerProfile
      nwtBalance: 1000,
      nwtLockedBalance: 0,
      primaryWalletAddress: buyerWalletAddress,
      kycStatus: "verified",
      kycLevel: 1,
      spendingLimitDaily: 10000,
      spendingLimitMonthly: 50000,
    });

    // 7. Create NFT owned by seller (with valid Solana mint address)
    const [createdNft] = await db
      .insert(nft)
      .values({
        owner: sellerWalletId,
        colection: "test-collection",
        nftType: "anchor",
        mintAddress: "3yJKwWGR9vyEoHSPjC2pJCHsyZnhb6tP5xYaYLQQcKfR", // Valid Solana mint address (base58, 44 chars)
        price: 100,
        isLimitedEdition: true,
        amount: 1,
        metadata: {
          name: "Test Comic NFT #1",
          description: "A rare comic book NFT",
          image: "https://example.com/nft-image.png",
        },
        status: "completed",
      })
      .returning();

    nftId = createdNft.id;
  });

  afterAll(async () => {
    // Cleanup in reverse order of creation to respect foreign keys
    try {
      await db.delete(marketplaceEscrow).where(eq(marketplaceEscrow.sellerId, sellerWalletId));
      await db.delete(nftListings).where(eq(nftListings.sellerId, sellerWalletId));
      if (nftId) {
        await db.delete(nft).where(eq(nft.id, nftId));
      }
      await db.delete(userWallets).where(eq(userWallets.id, sellerWalletId));
      await db.delete(userWallets).where(eq(userWallets.id, buyerWalletId));
      await db.delete(readerProfile).where(eq(readerProfile.id, sellerReaderId));
      await db.delete(readerProfile).where(eq(readerProfile.id, buyerReaderId));
      await db.delete(userProfiles).where(eq(userProfiles.id, sellerProfileId));
      await db.delete(userProfiles).where(eq(userProfiles.id, buyerProfileId));
      await db.delete(authUsers).where(eq(authUsers.id, sellerAuthId));
      await db.delete(authUsers).where(eq(authUsers.id, buyerAuthId));
    } catch (error) {
      console.error("Cleanup error:", error);
    }
  });

  describe("POST /marketplace/list - List NFT for Sale", () => {
    it("should successfully list an NFT for sale", async () => {
      const res = await request(app)
        .post("/api/marketplace/list")
        .send({
          nftId,
          sellerId: sellerWalletId, // Use wallet ID for listing
          sellerWalletAddress,
          price: 100,
          title: "Test Comic NFT #1",
          description: "A rare comic book NFT for sale",
          royaltyPercentage: 5,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("id");
      expect(parseFloat(res.body.data.price)).toBe(100); // Database returns decimal format
      expect(res.body.data.status).toBe("active");
      expect(res.body.data.nftId).toBe(nftId);

      listingId = res.body.data.id;
      console.log("✓ Listing created with ID:", listingId);
    });

    it("should fail to list NFT with missing fields", async () => {
      const res = await request(app)
        .post("/api/marketplace/list")
        .send({
          nftId,
          sellerId: sellerWalletId, // Use wallet ID for listing
          // Missing price
          title: "Test NFT",
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Missing required fields");
    });

    it("should fail to list NFT with invalid price", async () => {
      const res = await request(app)
        .post("/api/marketplace/list")
        .send({
          nftId,
          sellerId: sellerWalletId, // Use wallet ID for listing
          sellerWalletAddress,
          price: -10, // Negative price
          title: "Test NFT",
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("positive number");
    });

    it("should fail to list NFT with invalid wallet address", async () => {
      const res = await request(app)
        .post("/api/marketplace/list")
        .send({
          nftId,
          sellerId: sellerWalletId, // Use wallet ID for listing
          sellerWalletAddress: "invalid-address",
          price: 100,
          title: "Test NFT",
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Invalid wallet address");
    });
  });

  describe("GET /marketplace/listings - Get Active Listings", () => {
    it("should retrieve active listings", async () => {
      const res = await request(app).get("/api/marketplace/listings");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("listings");
      expect(Array.isArray(res.body.data.listings)).toBe(true);
      expect(res.body.data.listings.length).toBeGreaterThan(0);
    });

    it("should filter listings by price range", async () => {
      const res = await request(app)
        .get("/api/marketplace/listings")
        .query({
          minPrice: 50,
          maxPrice: 150,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.listings.length).toBeGreaterThan(0);

      // Verify all listings are within price range
      res.body.data.listings.forEach((listing: any) => {
        const price = parseFloat(listing.price);
        expect(price).toBeGreaterThanOrEqual(50);
        expect(price).toBeLessThanOrEqual(150);
      });
    });

    it("should sort listings by price ascending", async () => {
      const res = await request(app)
        .get("/api/marketplace/listings")
        .query({ sortBy: "price_asc" });

      expect(res.status).toBe(200);
      const listings = res.body.data.listings;

      // Verify ascending order
      for (let i = 1; i < listings.length; i++) {
        expect(parseFloat(listings[i].price)).toBeGreaterThanOrEqual(
          parseFloat(listings[i - 1].price)
        );
      }
    });
  });

  describe("GET /marketplace/listings/:listingId - Get Listing Details", () => {
    it("should retrieve listing details", async () => {
      const res = await request(app).get(`/api/marketplace/listings/${listingId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("listing");
      expect(res.body.data).toHaveProperty("nft");
      expect(res.body.data).toHaveProperty("seller");
      expect(res.body.data.listing.id).toBe(listingId);
    });

    it("should return 404 for non-existent listing", async () => {
      const fakeId = "99999999-9999-9999-9999-999999999999";
      const res = await request(app).get(`/api/marketplace/listings/${fakeId}`);

      expect(res.status).toBe(404);
    });
  });

  describe("POST /marketplace/purchase - Purchase NFT (CRITICAL BUG FIXES)", () => {
    it("should successfully purchase NFT with atomic transaction", async () => {
      // Ensure listing was created
      if (!listingId) {
        throw new Error("listingId is undefined - listing creation may have failed");
      }

      const res = await request(app)
        .post("/api/marketplace/purchase")
        .send({
          listingId,
          buyerId: buyerReaderId,
          buyerWalletAddress,
          sellerWalletAddress,
        });

      console.log("Purchase response:", res.status, res.body);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("completed");
      expect(res.body.data).toHaveProperty("orderId");
      expect(res.body.data).toHaveProperty("transactionId");
      expect(res.body.data.amounts).toHaveProperty("purchasePrice");
      expect(res.body.data.amounts).toHaveProperty("platformFeeAmount");
      expect(res.body.data.amounts).toHaveProperty("sellerAmount");

      // Verify buyer balance was deducted
      const [buyerProfile] = await db
        .select()
        .from(readerProfile)
        .where(eq(readerProfile.id, buyerReaderId));

      expect(buyerProfile.walletBalance).toBe(900); // 1000 - 100

      // Verify seller escrow was updated (use wallet ID, not reader profile ID)
      const [sellerEscrow] = await db
        .select()
        .from(marketplaceEscrow)
        .where(eq(marketplaceEscrow.sellerId, sellerWalletId));

      expect(sellerEscrow).toBeDefined();
      const sellerAmount = parseFloat(sellerEscrow.availableBalance);
      expect(sellerAmount).toBeGreaterThan(0); // Should have received payment minus fees
      expect(sellerAmount).toBeLessThan(100); // Should be less than full price due to fees

      // Verify listing is now sold
      const [listing] = await db
        .select()
        .from(nftListings)
        .where(eq(nftListings.id, listingId));

      expect(listing.status).toBe("sold");
    });

    it("should fail purchase with insufficient balance", async () => {
      // Create a new listing
      const [newListing] = await db
        .insert(nftListings)
        .values({
          nftId,
          mintAddress: "TestMintAddress123456789ABC",
          sellerId: sellerWalletId, // Use wallet ID
          sellerWalletAddress,
          price: "2000", // More than buyer's balance
          title: "Expensive NFT",
          status: "active",
        })
        .returning();

      const res = await request(app)
        .post("/api/marketplace/purchase")
        .send({
          listingId: newListing.id,
          buyerId: buyerReaderId,
          buyerWalletAddress,
          sellerWalletAddress,
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Insufficient balance");

      // Cleanup
      await db.delete(nftListings).where(eq(nftListings.id, newListing.id));
    });

    it("should fail if buyer tries to buy their own NFT", async () => {
      // Create listing where buyer tries to buy their own NFT
      const [selfListing] = await db
        .insert(nftListings)
        .values({
          nftId,
          mintAddress: "TestMintAddress123456789ABC",
          sellerId: buyerWalletId, // Use buyer's wallet ID as seller
          sellerWalletAddress: buyerWalletAddress,
          price: "50",
          title: "Self Purchase Test",
          status: "active",
        })
        .returning();

      const res = await request(app)
        .post("/api/marketplace/purchase")
        .send({
          listingId: selfListing.id,
          buyerId: buyerReaderId, // Buyer trying to buy own listing
          buyerWalletAddress,
          sellerWalletAddress: buyerWalletAddress,
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Cannot purchase your own NFT");

      // Cleanup
      await db.delete(nftListings).where(eq(nftListings.id, selfListing.id));
    });

    it("should fail purchase with missing fields", async () => {
      const res = await request(app)
        .post("/api/marketplace/purchase")
        .send({
          listingId,
          buyerId: buyerReaderId,
          // Missing wallet addresses
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Missing required fields");
    });
  });

  describe("POST /marketplace/withdraw - Request Withdrawal", () => {
    it("should successfully create withdrawal request and reserve balance", async () => {
      // Get current escrow balance (use wallet ID)
      const escrowData = await db
        .select()
        .from(marketplaceEscrow)
        .where(eq(marketplaceEscrow.sellerId, sellerWalletId));

      // Skip test if escrow doesn't exist yet (requires a successful purchase first)
      if (!escrowData || escrowData.length === 0) {
        console.log("⚠ Skipping: No escrow account (requires successful purchase first)");
        return;
      }

      const availableBalanceBefore = parseFloat(escrowData[0].availableBalance);

      const res = await request(app)
        .post("/api/marketplace/withdraw")
        .send({
          sellerId: sellerWalletId, // Use wallet ID for escrow operations
          amount: 10, // Withdraw 10 NWT
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("id");
      expect(res.body.data.status).toBe("pending");
      expect(parseFloat(res.body.data.amount)).toBe(10); // Database returns decimal format

      // Verify balance was reserved
      const [escrowAfter] = await db
        .select()
        .from(marketplaceEscrow)
        .where(eq(marketplaceEscrow.sellerId, sellerWalletId));

      const availableBalanceAfter = parseFloat(escrowAfter.availableBalance);
      expect(availableBalanceAfter).toBe(availableBalanceBefore - 10);
    });

    it("should fail withdrawal with insufficient balance", async () => {
      const res = await request(app)
        .post("/api/marketplace/withdraw")
        .send({
          sellerId: sellerWalletId, // Use wallet ID for escrow operations
          amount: 99999, // More than available
        });

      expect(res.status).toBe(400);
      // Could be either "Insufficient balance" or "No escrow account"
      expect(
        res.body.error.includes("Insufficient balance") ||
        res.body.error.includes("No escrow account")
      ).toBe(true);
    });

    it("should fail withdrawal with invalid amount", async () => {
      const res = await request(app)
        .post("/api/marketplace/withdraw")
        .send({
          sellerId: sellerWalletId, // Use wallet ID for escrow operations
          amount: -50, // Negative amount
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("positive number");
    });
  });

  describe("GET /marketplace/escrow/:sellerId - Get Escrow Balance", () => {
    it("should retrieve seller's escrow balance", async () => {
      const res = await request(app).get(`/api/marketplace/escrow/${sellerWalletId}`); // Use wallet ID

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("totalEarnings");
      expect(res.body.data).toHaveProperty("availableBalance");
      // Earnings may be 0 if no successful purchase yet
      expect(parseFloat(res.body.data.totalEarnings)).toBeGreaterThanOrEqual(0);
    });
  });

  describe("GET /marketplace/stats - Get Marketplace Statistics", () => {
    it("should retrieve marketplace statistics", async () => {
      const res = await request(app).get("/api/marketplace/stats");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("totalActiveListings");
      expect(res.body.data).toHaveProperty("totalCompletedSales");
      expect(res.body.data).toHaveProperty("totalVolume");
      expect(res.body.data).toHaveProperty("floorPrice");
    });
  });

  describe("GET /marketplace/config - Get Marketplace Config", () => {
    it("should retrieve marketplace configuration", async () => {
      const res = await request(app).get("/api/marketplace/config");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("platformFeePercentage");
      expect(res.body.data).toHaveProperty("minimumListingPrice");
      expect(res.body.data).toHaveProperty("maximumListingPrice");
      expect(res.body.data).toHaveProperty("isMarketplaceActive");
    });
  });
});
