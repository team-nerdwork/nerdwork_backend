import { Request, Response } from "express";
import { pinFileToPinataByKey, pinJsonToPinata } from "../services/nft.service";
import { db } from "../config/db";
import { nfts } from "../model/nft/nft.schema";
import {
  creatorProfile,
  nftListings,
  nftOrders,
  nftOwnershipHistory,
  nftOwnerships,
  readerProfile,
} from "../model/schema";
import { getUserJwtFromToken } from "./library.controller";
import { and, desc, eq, gt, sql } from "drizzle-orm";
import { generateFileUrl } from "./file.controller";

// Mint NFT
export const mintNft = async (req: Request, res: Response) => {
  try {
    const user = getUserJwtFromToken(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const [creator] = await db
      .select()
      .from(creatorProfile)
      .where(eq(creatorProfile.userId, user));

    if (!creator) {
      return res.status(403).json({
        success: false,
        error: "Only creators can mint NFTs",
      });
    }

    const {
      name,
      description,
      imageKey,
      supply,
      royaltyBps,
      tags,
      properties,
    } = req.body;

    if (!name || !imageKey || !supply) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    const parsedTags = tags ? JSON.parse(tags) : [];
    const parsedProperties = properties ? JSON.parse(properties) : [];

    const result = await db.transaction(async (tx) => {
      // 1️⃣ Create NFT in draft
      const [draftNft] = await tx
        .insert(nfts)
        .values({
          title: name,
          description,
          imageKey,
          creatorId: creator.id,
          ownerCreatorId: creator.id,
          supply: Number(supply),
          remainingSupply: Number(supply),
          royaltyBps: royaltyBps ?? 500,
          metadata: {
            tags: parsedTags,
            properties: parsedProperties,
          },
          status: "draft",
        })
        .returning();

      // 2️⃣ Pin image → imageCID
      const imageCID = await pinFileToPinataByKey(imageKey);

      // 3️⃣ Build metadata JSON (IPFS standard)
      const metadataJson = {
        name,
        description,
        image: `ipfs://${imageCID}`,
        attributes: parsedProperties,
        properties: {
          files: [
            {
              uri: `ipfs://${imageCID}`,
              type: "image/png",
            },
          ],
        },
      };

      // 4️⃣ Upload metadata JSON → metadataCID
      const metadataCID = await pinJsonToPinata(metadataJson);

      const tokenURI = `ipfs://${metadataCID}`;

      // 5️⃣ Freeze NFT
      const [frozenNft] = await tx
        .update(nfts)
        .set({
          imageCID,
          metadataCID,
          tokenURI,
          status: "frozen",
          updatedAt: new Date(),
        })
        .where(eq(nfts.id, draftNft.id))
        .returning();

      return frozenNft;
    });

    return res.status(201).json({
      success: true,
      data: result,
      message: "NFT minted and frozen successfully",
    });
  } catch (error: any) {
    console.error("Mint NFT error:", error);

    return res.status(500).json({
      success: false,
      error: "Failed to mint NFT",
    });
  }
};

// Get My Minted NFTs (Creators only)
export const getMyMintedNfts = async (req: Request, res: Response) => {
  try {
    const user = getUserJwtFromToken(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const [creator] = await db
      .select()
      .from(creatorProfile)
      .where(eq(creatorProfile.userId, user));

    if (!creator) {
      return res.status(403).json({
        success: false,
        error: "Only creators can access this resource",
      });
    }

    const mintedNfts = await db
      .select()
      .from(nfts)
      .where(eq(nfts.creatorId, creator.id))
      .orderBy(desc(nfts.createdAt));

    const response = mintedNfts.map((nft) => ({
      id: nft.id,
      title: nft.title,
      description: nft.description,

      // Media
      imageUrl: generateFileUrl(nft.imageKey),
      imageCID: nft.imageCID,
      metadataCID: nft.metadataCID,
      tokenURI: nft.tokenURI,

      // Supply
      supply: nft.supply,
      remainingSupply: nft.remainingSupply,

      // Royalty
      royaltyBps: nft.royaltyBps,

      // Lifecycle
      status: nft.status,

      createdAt: nft.createdAt,
      updatedAt: nft.updatedAt,
    }));

    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Fetch minted NFTs error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch NFTs",
    });
  }
};

// Get Nft Details for Creator (only if they are the owner)
export const getSingleCreatorNft = async (req: Request, res: Response) => {
  try {
    const user = getUserJwtFromToken(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const id = req.params.id as string;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "NFT id is required",
      });
    }

    // Get creator profile
    const [creator] = await db
      .select()
      .from(creatorProfile)
      .where(eq(creatorProfile.userId, user));

    if (!creator) {
      return res.status(403).json({
        success: false,
        error: "Only creators can access this resource",
      });
    }

    // Fetch NFT
    const [nft] = await db
      .select()
      .from(nfts)
      .where(and(eq(nfts.id, id), eq(nfts.creatorId, creator.id)));

    if (!nft) {
      return res.status(404).json({
        success: false,
        error: "NFT not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: nft.id,
        title: nft.title,
        description: nft.description,

        imageUrl: generateFileUrl(nft.imageKey),
        imageCID: nft.imageCID,
        metadataCID: nft.metadataCID,
        tokenURI: nft.tokenURI,
        metadata: nft.metadata,

        supply: nft.supply,
        remainingSupply: nft.remainingSupply,
        royaltyBps: nft.royaltyBps,

        status: nft.status,
        createdAt: nft.createdAt,
        updatedAt: nft.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get single creator NFT error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch NFT",
    });
  }
};

// List NFT for sale
export const listNftForSale = async (req: Request, res: Response) => {
  try {
    const user = getUserJwtFromToken(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const [creator] = await db
      .select()
      .from(creatorProfile)
      .where(eq(creatorProfile.userId, user));

    if (!creator) {
      return res.status(403).json({
        success: false,
        error: "Only creators can list NFTs",
      });
    }

    const { nftId, price } = req.body;

    if (!nftId || !price) {
      return res.status(400).json({
        success: false,
        error: "nftId and price are required",
      });
    }

    if (Number(price) <= 0) {
      return res.status(400).json({
        success: false,
        error: "Price must be greater than zero",
      });
    }

    const result = await db.transaction(async (tx) => {
      // 1️⃣ Fetch NFT
      const [nft] = await tx.select().from(nfts).where(eq(nfts.id, nftId));

      if (!nft) {
        throw new Error("NFT not found");
      }

      // 2️⃣ Ownership check
      if (nft.ownerCreatorId !== creator.id) {
        throw new Error("You do not own this NFT");
      }

      // 3️⃣ Must be frozen
      if (nft.status !== "frozen") {
        throw new Error("NFT must be frozen before it can be listed");
      }

      // 4️⃣ Supply check
      if (nft.remainingSupply <= 0) {
        throw new Error("NFT is sold out");
      }

      // 5️⃣ Ensure not already listed
      const existingListing = await tx
        .select()
        .from(nftListings)
        .where(eq(nftListings.nftId, nftId));

      if (existingListing.length > 0) {
        throw new Error("NFT is already listed");
      }

      // 6️⃣ Create listing
      const [listing] = await tx
        .insert(nftListings)
        .values({
          nftId,
          sellerId: creator.id,
          price,
        })
        .returning();

      // 7️⃣ Update NFT status
      await tx
        .update(nfts)
        .set({
          status: "listed",
          updatedAt: new Date(),
        })
        .where(eq(nfts.id, nftId));

      return listing;
    });

    return res.status(201).json({
      success: true,
      data: result,
      message: "NFT listed successfully",
    });
  } catch (error: any) {
    console.error("List NFT error:", error.message);

    return res.status(400).json({
      success: false,
      error: error.message || "Failed to list NFT",
    });
  }
};

// Get Marketplace NFTs
export const getAllAvailableNfts = async (req: Request, res: Response) => {
  try {
    const listings = await db
      .select({
        listingId: nftListings.id,
        nftId: nfts.id,
        title: nfts.title,
        description: nfts.description,
        imageKey: nfts.imageKey,
        price: nftListings.price,
        remainingSupply: nfts.remainingSupply,
        royaltyBps: nfts.royaltyBps,
        creatorName: creatorProfile.creatorName,
      })
      .from(nftListings)
      .innerJoin(nfts, eq(nftListings.nftId, nfts.id))
      .innerJoin(creatorProfile, eq(nftListings.sellerId, creatorProfile.id))
      .where(
        and(
          eq(nftListings.status, "active"),
          eq(nfts.status, "listed"),
          gt(nfts.remainingSupply, 0),
        ),
      )
      .orderBy(desc(nftListings.createdAt));

    const response = listings.map((item) => ({
      listingId: item.listingId,
      nftId: item.nftId,
      title: item.title,
      description: item.description,
      imageUrl: generateFileUrl(item.imageKey),
      price: item.price,
      remainingSupply: item.remainingSupply,
      royaltyBps: item.royaltyBps,
      creatorName: item.creatorName,
    }));

    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Get marketplace NFTs error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch marketplace NFTs",
    });
  }
};

// Buy NFT from listing
export const buyNft = async (req: Request, res: Response) => {
  try {
    const user = getUserJwtFromToken(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const [reader] = await db
      .select()
      .from(readerProfile)
      .where(eq(readerProfile.userId, user));

    if (!reader) {
      return res.status(403).json({
        success: false,
        error: "Only readers can buy NFTs",
      });
    }

    const { listingId, quantity } = req.body;

    if (!listingId || !quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid listing or quantity",
      });
    }

    const result = await db.transaction(async (tx) => {
      // Fetch listing
      const [listing] = await tx
        .select()
        .from(nftListings)
        .where(eq(nftListings.id, listingId));

      if (!listing || listing.status !== "active") {
        throw new Error("Listing not available");
      }

      // Fetch NFT
      const [nft] = await tx
        .select()
        .from(nfts)
        .where(eq(nfts.id, listing.nftId));

      if (!nft) throw new Error("NFT not found");

      if (nft.remainingSupply < quantity) {
        throw new Error("Not enough supply");
      }

      // Financial calculations
      const pricePerUnit = Number(listing.price);
      const totalPrice = pricePerUnit * quantity;

      if (reader.walletBalance < totalPrice) {
        throw new Error("Insufficient balance");
      }

      const platformFeePercent = 0.1;
      const platformFee = totalPrice * platformFeePercent;
      const sellerAmount = totalPrice - platformFee;

      // Deduct buyer
      await tx
        .update(readerProfile)
        .set({
          walletBalance: reader.walletBalance - totalPrice,
        })
        .where(eq(readerProfile.id, reader.id));

      // Credit seller
      await tx
        .update(creatorProfile)
        .set({
          walletBalance: sql`${creatorProfile.walletBalance} + ${sellerAmount}`,
        })
        .where(eq(creatorProfile.id, listing.sellerId));

      // Create order
      const [order] = await tx
        .insert(nftOrders)
        .values({
          nftId: nft.id,
          listingId: listing.id,
          buyerId: reader.id,
          sellerId: listing.sellerId,
          quantity,
          price: totalPrice.toString(),
          platformFee: platformFee.toString(),
          royaltyAmount: "0",
          sellerAmount: sellerAmount.toString(),
          status: "completed",
          completedAt: new Date(),
          metadata: {
            unitPrice: pricePerUnit,
          },
        })
        .returning();

      // Update ownership
      const [existingOwnership] = await tx
        .select()
        .from(nftOwnerships)
        .where(
          and(
            eq(nftOwnerships.nftId, nft.id),
            eq(nftOwnerships.ownerReaderId, reader.id),
          ),
        );

      if (existingOwnership) {
        await tx
          .update(nftOwnerships)
          .set({
            quantity: existingOwnership.quantity + quantity,
          })
          .where(eq(nftOwnerships.id, existingOwnership.id));
      } else {
        await tx.insert(nftOwnerships).values({
          nftId: nft.id,
          ownerReaderId: reader.id,
          quantity,
        });
      }

      // Decrement supply
      await tx
        .update(nfts)
        .set({
          remainingSupply: nft.remainingSupply - quantity,
        })
        .where(eq(nfts.id, nft.id));

      // If sold out
      if (nft.remainingSupply - quantity === 0) {
        await tx
          .update(nftListings)
          .set({ status: "sold" })
          .where(eq(nftListings.id, listingId));
      }

      return order;
    });

    return res.status(200).json({
      success: true,
      data: result,
      message: "NFT purchased successfully",
    });
  } catch (error: any) {
    console.error("Buy NFT error:", error);
    return res.status(400).json({
      success: false,
      error: error.message || "Failed to purchase NFT",
    });
  }
};

// Get single marketplace NFT details
export const getSingleMarketplaceNft = async (req: Request, res: Response) => {
  try {
    const listingIdParam = req.params.listingId;

    if (!listingIdParam || Array.isArray(listingIdParam)) {
      return res.status(400).json({
        success: false,
        error: "Invalid listing id",
      });
    }

    const listingId = listingIdParam;

    const [result] = await db
      .select({
        listingId: nftListings.id,
        nftId: nfts.id,
        title: nfts.title,
        description: nfts.description,
        imageKey: nfts.imageKey,
        price: nftListings.price,
        remainingSupply: nfts.remainingSupply,
        royaltyBps: nfts.royaltyBps,
        listingStatus: nftListings.status,
        creatorId: creatorProfile.id,
        creatorName: creatorProfile.creatorName,
      })
      .from(nftListings)
      .innerJoin(nfts, eq(nftListings.nftId, nfts.id))
      .innerJoin(creatorProfile, eq(nftListings.sellerId, creatorProfile.id))
      .where(eq(nftListings.id, listingId));

    if (!result) {
      return res.status(404).json({
        success: false,
        error: "NFT not found",
      });
    }

    // Optional safety check
    if (result.listingStatus !== "active" || result.remainingSupply <= 0) {
      return res.status(404).json({
        success: false,
        error: "NFT not available",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        listingId: result.listingId,
        nftId: result.nftId,
        title: result.title,
        description: result.description,
        imageUrl: generateFileUrl(result.imageKey),
        price: result.price,
        remainingSupply: result.remainingSupply,
        royaltyBps: result.royaltyBps,
        creator: {
          id: result.creatorId,
          creatorName: result.creatorName,
        },
      },
    });
  } catch (error) {
    console.error("Get single marketplace NFT error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch NFT",
    });
  }
};

// Get My Purchased NFTs (Readers only)
export const getMyPurchasedNfts = async (req: Request, res: Response) => {
  try {
    const user = getUserJwtFromToken(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    // Get reader profile
    const [reader] = await db
      .select()
      .from(readerProfile)
      .where(eq(readerProfile.userId, user));

    if (!reader) {
      return res.status(403).json({
        success: false,
        error: "Only readers can access this resource",
      });
    }

    // Join ownership + NFT definition
    const ownedNfts = await db
      .select({
        nftId: nfts.id,
        title: nfts.title,
        description: nfts.description,
        imageKey: nfts.imageKey,
        tokenURI: nfts.tokenURI,
        royaltyBps: nfts.royaltyBps,
        quantity: nftOwnerships.quantity,
      })
      .from(nftOwnerships)
      .innerJoin(nfts, eq(nftOwnerships.nftId, nfts.id))
      .where(eq(nftOwnerships.ownerReaderId, reader.id));

    const response = ownedNfts.map((item) => ({
      nftId: item.nftId,
      title: item.title,
      description: item.description,
      imageUrl: generateFileUrl(item.imageKey),
      tokenURI: item.tokenURI,
      royaltyBps: item.royaltyBps,
      quantityOwned: item.quantity,
    }));

    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Get purchased NFTs error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch purchased NFTs",
    });
  }
};

// Delete NFT (Creators only, with rules) - Only if not listed, not sold, no orders, no ownership records
export const deleteNft = async (req: Request, res: Response) => {
  try {
    const user = getUserJwtFromToken(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const idParam = req.params.id;

    if (!idParam || Array.isArray(idParam)) {
      return res.status(400).json({
        success: false,
        error: "Invalid NFT id",
      });
    }

    const nftId = idParam;

    const [creator] = await db
      .select()
      .from(creatorProfile)
      .where(eq(creatorProfile.userId, user));

    if (!creator) {
      return res.status(403).json({
        success: false,
        error: "Only creators can delete NFTs",
      });
    }

    const result = await db.transaction(async (tx) => {
      const [nft] = await tx
        .select()
        .from(nfts)
        .where(and(eq(nfts.id, nftId), eq(nfts.creatorId, creator.id)));

      if (!nft) {
        throw new Error("NFT not found");
      }

      // Rule 1: Must not be listed
      if (nft.status === "listed") {
        throw new Error("Cannot delete a listed NFT");
      }

      // Rule 2: Must not be sold
      if (nft.remainingSupply < nft.supply) {
        throw new Error("Cannot delete NFT that has been purchased");
      }

      // Rule 3: No active listing
      const [listing] = await tx
        .select()
        .from(nftListings)
        .where(eq(nftListings.nftId, nftId));

      if (listing) {
        throw new Error("Cannot delete NFT with existing listing");
      }

      // Rule 4: No ownership
      const [ownership] = await tx
        .select()
        .from(nftOwnerships)
        .where(eq(nftOwnerships.nftId, nftId));

      if (ownership) {
        throw new Error("Cannot delete NFT with ownership records");
      }

      // Rule 5: No orders
      const [order] = await tx
        .select()
        .from(nftOrders)
        .where(eq(nftOrders.nftId, nftId));

      if (order) {
        throw new Error("Cannot delete NFT with purchase history");
      }

      await tx.delete(nfts).where(eq(nfts.id, nftId));

      return true;
    });

    return res.status(200).json({
      success: true,
      message: "NFT deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete NFT error:", error);
    return res.status(400).json({
      success: false,
      error: error.message || "Failed to delete NFT",
    });
  }
};
