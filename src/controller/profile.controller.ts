import { eq, sql } from "drizzle-orm";
import { db } from "../config/db";
import {
  creatorBankDetails,
  creatorProfile,
  readerProfile,
} from "../model/profile";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { getUserJwtFromToken } from "./library.controller";

export const addCreatorProfile = async (req, res) => {
  try {
    const { userId, fullName, creatorName, phoneNumber, bio, genres } =
      req.body;

    const [profile] = await db
      .insert(creatorProfile)
      .values({
        userId,
        fullName,
        creatorName,
        phoneNumber,
        bio,
        genres,
      })
      .returning();

    return res.json({ profile });
  } catch (err) {
    console.error(err);
    return res
      .status(400)
      .json({ message: "Failed to create creator profile" });
  }
};

export const addReaderProfile = async (req, res) => {
  try {
    const { userId, genres, fullName } = req.body;

    // Generate walletId (12 chars)
    const walletId = crypto.randomBytes(6).toString("hex");

    // Hash pin
    // const pinHash = crypto.createHash("sha256").update(pin).digest("hex");

    const [profile] = await db
      .insert(readerProfile)
      .values({
        userId,
        genres,
        fullName,
        walletId,
      })
      .returning();

    return res.json({ profile });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: "Failed to create reader profile" });
  }
};

export const getCreatorProfile = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.userId;

    // Fetch creator profile
    const [creator] = await db
      .select()
      .from(creatorProfile)
      .where(eq(creatorProfile.userId, userId));

    if (!creator) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Fetch bank details (optional)
    const [bankDetails] = await db
      .select({
        bankName: creatorBankDetails.bankName,
        accountNumber: creatorBankDetails.accountNumber,
        accountName: creatorBankDetails.accountName,
      })
      .from(creatorBankDetails)
      .where(eq(creatorBankDetails.creatorId, creator.id));

    return res.json({
      role: "creator",
      profile: {
        ...creator,
        bankDetails: bankDetails || null,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const getReaderProfile = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    const userId = decoded.userId;

    const [reader] = await db
      .select()
      .from(readerProfile)
      .where(eq(readerProfile.userId, userId));

    if (reader) {
      return res.json({ role: "reader", profile: reader });
    }

    return res.status(404).json({ message: "Profile not found" });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const updateReaderProfilePin = async (req, res) => {
  try {
    const { pin } = req.body;

    if (!pin || pin.length < 4) {
      return res.status(400).json({ message: "PIN must be at least 4 digits" });
    }

    // ✅ Auth check
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    const userId = decoded.userId;

    // ✅ Get reader profile
    const [reader] = await db
      .select()
      .from(readerProfile)
      .where(eq(readerProfile.userId, userId));

    if (!reader) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // ✅ Hash the PIN before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPin = await bcrypt.hash(pin, salt);

    // ✅ Update profile with hashed pin
    await db
      .update(readerProfile)
      .set({ pinHash: hashedPin })
      .where(eq(readerProfile.id, reader.id));

    return res.json({
      success: true,
      message: "PIN updated successfully",
    });
  } catch (err) {
    console.error("Update Profile PIN Error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const updateCreatorProfile = async (req, res) => {
  try {
    const { address, walletType } = req.body;

    // ✅ Auth check
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    const userId = decoded.userId;

    const [creator] = await db
      .select()
      .from(creatorProfile)
      .where(eq(creatorProfile.userId, userId));

    if (!creator) {
      return res.status(404).json({ message: "Profile not found" });
    }

    await db
      .update(creatorProfile)
      .set({ walletAddress: address, walletType: walletType })
      .where(eq(creatorProfile.id, creator.id));

    return res.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (err) {
    console.error("Update Profile  Error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const upsertCreatorBankDetails = async (req, res) => {
  try {
    const userId = getUserJwtFromToken(req);
    const { bankName, accountNumber, accountName } = req.body;

    if (!bankName || !accountNumber || !accountName) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const [creator] = await db
      .select()
      .from(creatorProfile)
      .where(eq(creatorProfile.userId, userId));

    if (!creator) {
      return res.status(404).json({
        success: false,
        message: "Creator not found",
      });
    }

    await db
      .insert(creatorBankDetails)
      .values({
        creatorId: creator.id,
        bankName,
        accountNumber,
        accountName,
      })
      .onConflictDoUpdate({
        target: creatorBankDetails.creatorId,
        set: {
          bankName,
          accountNumber,
          accountName,
          updatedAt: new Date(),
        },
      });

    return res.status(200).json({
      success: true,
      message: "Bank details saved successfully",
    });
  } catch (err) {
    console.error("Upsert Bank Details Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to save bank details",
    });
  }
};

export const getCreatorBankDetails = async (req, res) => {
  try {
    const userId = getUserJwtFromToken(req);

    const [creator] = await db
      .select()
      .from(creatorProfile)
      .where(eq(creatorProfile.userId, userId));

    if (!creator) {
      return res.status(404).json({
        success: false,
        message: "Creator not found",
      });
    }

    const [bankDetails] = await db
      .select()
      .from(creatorBankDetails)
      .where(eq(creatorBankDetails.creatorId, creator.id));

    if (!bankDetails) {
      return res.status(200).json({
        success: true,
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      data: bankDetails,
    });
  } catch (err) {
    console.error("Get Bank Details Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch bank details",
    });
  }
};
