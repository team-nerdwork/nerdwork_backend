import { desc, eq } from "drizzle-orm";
import { db } from "../config/db";
import {
  creatorProfile,
  creatorTransactions,
  payments,
  readerProfile,
  userProfiles,
} from "../model/schema";
import axios from "axios";
import { sdk } from "../config/helio.config";
import {
  CreatePaylinkHookByApiKeyDto,
  CreatePaylinkWithApiDto,
} from "@heliofi/common";
import { verifyPayment } from "../services/paymentVerification.service";

// const HELIO_API_BASE = "https://api.dev.hel.io/v1";
const HELIO_API_BASE = "https://api.hel.io/v1"; // For production
const HELIO_PUBLIC_KEY = process.env.HELIO_PUBLIC_KEY;
const HELIO_PRIVATE_KEY = process.env.HELIO_PRIVATE_KEY;
const WEBHOOK_REDIRECT_URL = process.env.WEBHOOK_REDIRECT_URL;
const HELIO_WALLET_ID = process.env.HELIO_WALLET_ID;
const HELIO_PCURRENCY = process.env.HELIO_PCURRENCY;
const HELIO_AMOUNT = Number(process.env.HELIO_AMOUNT);

import jwt from "jsonwebtoken";
import {
  createUserPurchaseTransaction,
  updateUserTransactionStatus,
  updateUserWalletBalance,
} from "./transaction.controller";
import { userTransactions } from "../model/userTransaction";
import { getUserJwtFromToken } from "./library.controller";

export const createPaymentLink = async (req: any, res: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
  const userId = decoded.userId;

  console.log(userId);

  try {
    const { amount, name, redirectUrl, paymentMethod = "helio" } = req.body;

    if (!amount) {
      return res.status(400).json({
        error: "Amount is required",
      });
    }

    if (!paymentMethod || !["helio", "paystack"].includes(paymentMethod)) {
      return res.status(400).json({
        error: "Payment method is required and must be 'helio' or 'paystack'",
      });
    }

    if (paymentMethod === "paystack") {
      return createPaystackPayment(req, res, userId, amount);
    } else {
      return createHelioPaymentLink(
        req,
        res,
        userId,
        amount,
        name,
        redirectUrl,
      );
    }
  } catch (error: any) {
    console.error("Payment link creation error:", error);
    res.status(500).json({
      error: "Failed to create payment link",
      details: error.message,
    });
  }
};

/**
 * Create Helio Payment Link
 */
const createHelioPaymentLink = async (
  req: any,
  res: any,
  userId: string,
  amount: number,
  name: string = "NWT_PURCHASE",
  redirectUrl: string = "",
) => {
  try {
    const createPaylinkDto: CreatePaylinkWithApiDto = {
      name: "NWT_PURCHASE",
      price: (Number(amount) * HELIO_AMOUNT).toString(),
      pricingCurrency: HELIO_PCURRENCY,
      description: `Payment for Nerd Work Token by ${userId} on ${new Date().toISOString()} amount: ${amount}`,
      features: {},
      redirectUrl,
      recipients: [
        {
          walletId: HELIO_WALLET_ID,
          currencyId: HELIO_PCURRENCY,
        },
      ],
    };

    const helioResponse = await sdk.paylink.create(createPaylinkDto);

    const nwtAmount = amount * 10;

    const transactionResult = await createUserPurchaseTransaction(
      userId,
      nwtAmount,
      amount,
      "helio",
      helioResponse.id,
      `Purchase ${nwtAmount} NWT for $${amount} via Helio`,
    );

    if (!transactionResult.success) {
      console.error(
        "Failed to create transaction record:",
        transactionResult.error,
      );
    }

    console.log("Helio payment created:", helioResponse.id);

    res.json({
      success: true,
      payment: helioResponse,
      paylinkId: helioResponse.id,
      transactionId: transactionResult.transaction?.id,
      nwtAmount,
      usdAmount: amount,
      paymentMethod: "helio",
    });
  } catch (error: any) {
    console.error(
      "Helio payment link creation error:",
      error.response?.data || error.message,
    );
    res.status(500).json({
      error: "Failed to create Helio payment link",
      details: error.response?.data || error.message,
    });
  }
};

/**
 * Create Paystack Payment
 */
const createPaystackPayment = async (
  req: any,
  res: any,
  userId: string,
  amount: number,
) => {
  try {
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!paystackSecretKey) {
      return res.status(500).json({
        error: "Paystack configuration missing",
      });
    }

    const [reader] = await db
      .select()
      .from(readerProfile)
      .where(eq(readerProfile.userId, userId));

    if (!reader) {
      return res.status(404).json({
        error: "Reader profile not found",
      });
    }

    const exchangeRate = Number(process.env.USD_TO_NGN_RATE) || 1550;
    const amountInNaira = Math.round(amount * exchangeRate);

    const paystackResponse = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: reader.email || `user_${userId}@nerdwork.ng`,
        amount: amountInNaira * 100,
        metadata: {
          userId,
          nwtAmount: amount * 10,
          usdAmount: amount,
          description: `Purchase ${amount * 10} NWT for $${amount}`,
        },
        callback_url: process.env.PAYSTACK_CALLBACK_URL || "",
      },
      {
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    const paymentData = paystackResponse.data.data;
    const nwtAmount = amount * 10;

    const transactionResult = await createUserPurchaseTransaction(
      userId,
      nwtAmount,
      amount,
      "paystack",
      paymentData.reference,
      `Purchase ${nwtAmount} NWT for $${amount} via Paystack`,
    );

    if (!transactionResult.success) {
      console.error(
        "Failed to create transaction record:",
        transactionResult.error,
      );
    }

    console.log("Paystack payment initialized:", paymentData.reference);

    res.json({
      success: true,
      data: paymentData,
      reference: paymentData.reference,
      authorizationUrl: paymentData.authorization_url,
      accessCode: paymentData.access_code,
      transactionId: transactionResult.transaction?.id,
      nwtAmount,
      usdAmount: amount,
      amountInNaira,
      paymentMethod: "paystack",
    });
  } catch (error: any) {
    console.error(
      "Paystack payment creation error:",
      error.response?.data || error.message,
    );
    res.status(500).json({
      error: "Failed to create Paystack payment",
      details: error.response?.data || error.message,
    });
  }
};

export const createWebhookForPayment = async (req: any, res: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
  const userId = decoded.userId;

  console.log(userId);
  try {
    const { paymentId } = req.body;
    console.log(paymentId);
    const events = ["CREATED"];

    const webhookPayload: CreatePaylinkHookByApiKeyDto = {
      name: "Nerd Work Payment Webhook",
      targetUrl:
        WEBHOOK_REDIRECT_URL || "http://nerdwork.ng/helio/webhook/handle",
      paylinkId: paymentId,
    };

    const response =
      await sdk.paylinkWebhook.createPaylinkWebhook(webhookPayload);
    console.log("Webhook created successfully:", response);
    // add paymet update
    // await db.update(payments)
    //     .set({ webhookId: response.id }) // Add this column if you want to store webhookId
    //     .where(eq(payments.paymentIntentId, paymentId));

    res.json({
      success: true,
      data: response,
    });
  } catch (error: any) {
    console.error(
      "Helio payment webhhok :",
      error.response?.data || error.message,
    );
    res.status(500).json({
      error: "Failed to create webhook",
      details: error.response?.data || error.message,
    });
  }
};

// // incomming req body

// {
//     transaction: 'BcQK8ibZFXpjQbBNSWGar11Xi85AT21hfaknQB4FJB4HPLtV2mrZbjSZtKeug14crw9qKVgmyWxtJT7G4fBq3WD',
//     data: {
//       content: {},
//       transactionSignature: 'BcQK8ibZFXpjQbBNSWGar11Xi85AT21hfaknQB4FJB4HPLtV2mrZbjSZtKeug14crw9qKVgmyWxtJT7G4fBq3WD',
//       status: 'SUCCESS',
//       statusToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0cmFuc2FjdGlvblNpZ25hdHVyZSI6IkJjUUs4aWJaRlhwalFiQk5TV0dhcjExWGk4NUFUMjFoZmFrblFCNEZKQjRIUEx0VjJtclpialNadEtldWcxNGNydzlxS1ZnbXlXeHRKVDdHNGZCcTNXRCIsInRyYW5zYWN0aW9uSWQiOiI2OGJlNjlkNzVmMTI3ODQzZjFiZjQ1MmQiLCJpYXQiOjE3NTczMDk0MDMsImV4cCI6MTc1NzMxNjYwM30.lXf2-BAlDhJrWytTZGCwK-ehm27Oq7XKtmATtlyAldk'
//     },
//     blockchainSymbol: 'SOL',
//     senderPK: 'FBnExnQQzaowHA3g5VQKV9JKbD4StwnMNz8EymUo9wcT'
//   }

export const handlePayment = async (req: any, res: any) => {
  try {
    console.log("Helio Webhook received:", req.body);
    const { transaction: txHash, data, blockchainSymbol, senderPK } = req.body;

    if (!data || !data.transactionSignature) {
      console.log("Invalid webhook data received");
      return res.status(400).json({ error: "Invalid webhook data" });
    }

    const { transactionSignature, status, statusToken } = data;

    console.log("Processing Helio webhook:", {
      status,
      transactionSignature,
      blockchainSymbol,
    });

    if (status === "SUCCESS") {
      console.log("Helio payment successful, processing...");

      const verificationResult = await verifyPayment(
        "helio",
        transactionSignature,
        { status },
      );

      if (!verificationResult.verified) {
        console.error("Helio payment verification failed:", verificationResult);
        return res.status(400).json({
          error: "Payment verification failed",
          details: verificationResult.error,
        });
      }

      const updateResult = await updateUserTransactionStatus(
        "helio",
        transactionSignature,
        "completed",
        transactionSignature,
        {
          blockchainSymbol,
          senderPK,
          statusToken,
          webhookData: req.body,
          verificationResult,
        },
      );

      console.log("Transaction update result:", updateResult);

      if (updateResult.success && updateResult.transaction) {
        const balanceResult = await updateUserWalletBalance(
          updateResult.transaction.userId,
          parseFloat(Number(updateResult.transaction.nwtAmount).toFixed(0)),
          "add",
        );
        console.log("Balance update result:", balanceResult);

        console.log("Helio transaction completed:", {
          transactionId: updateResult.transaction.id,
          balanceUpdated: balanceResult.success,
          newBalance: balanceResult.newBalance,
        });
      }
    } else {
      console.log("Helio payment failed or pending:", status);

      await updateUserTransactionStatus(
        "helio",
        transactionSignature,
        "failed",
        transactionSignature,
        {
          blockchainSymbol,
          senderPK,
          statusToken,
          webhookData: req.body,
        },
        `Helio payment failed with status: ${status}`,
      );
    }

    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("Error handling Helio payment webhook:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Handle Paystack Payment Webhook/Verification
 */
export const handlePaystackPayment = async (req: any, res: any) => {
  try {
    console.log("Paystack webhook received:", req.body);

    const { reference } = req.body;

    if (!reference) {
      console.log("Paystack reference missing");
      return res.status(400).json({ error: "Paystack reference is required" });
    }

    // Verify the payment with Paystack
    const verificationResult = await verifyPayment("paystack", reference);

    if (!verificationResult.verified) {
      console.error(
        "Paystack payment verification failed:",
        verificationResult,
      );

      // Update transaction as failed
      await updateUserTransactionStatus(
        "paystack",
        reference,
        "failed",
        undefined,
        { verificationResult },
        verificationResult.error,
      );

      return res.status(400).json({
        error: "Payment verification failed",
        details: verificationResult.error,
      });
    }

    console.log("Paystack payment verified successfully");

    // Update transaction status to completed
    const updateResult = await updateUserTransactionStatus(
      "paystack",
      reference,
      "completed",
      undefined,
      {
        metadata: verificationResult.metadata,
        verificationResult,
      },
    );

    console.log("Paystack transaction update result:", updateResult);

    if (updateResult.success && updateResult.transaction) {
      // Credit wallet with NWT
      const balanceResult = await updateUserWalletBalance(
        updateResult.transaction.userId,
        parseFloat(Number(updateResult.transaction.nwtAmount).toFixed(0)),
        "add",
      );

      console.log("Balance update result:", balanceResult);

      console.log("Paystack transaction completed:", {
        transactionId: updateResult.transaction.id,
        reference,
        balanceUpdated: balanceResult.success,
        newBalance: balanceResult.newBalance,
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment verified and wallet credited",
      transactionId: updateResult.transaction?.id,
    });
  } catch (error: any) {
    console.error("Error handling Paystack payment:", error.message);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
};

/**
 * Verify Payment Status (for client-side polling)
 * Allows frontend to check payment status without waiting for webhook
 */
export const verifyPaymentStatus = async (req: any, res: any) => {
  try {
    const { paymentMethod, reference } = req.body;

    if (!paymentMethod || !reference) {
      return res.status(400).json({
        error: "paymentMethod and reference are required",
      });
    }

    const verificationResult = await verifyPayment(
      paymentMethod as "helio" | "paystack",
      reference,
    );

    if (verificationResult.success && verificationResult.verified) {
      // Update transaction if not already updated
      const updateResult = await updateUserTransactionStatus(
        paymentMethod,
        reference,
        "completed",
        undefined,
        { verificationResult },
      );

      if (updateResult.success && updateResult.transaction) {
        // Credit wallet if not already credited
        await updateUserWalletBalance(
          updateResult.transaction.userId,
          parseFloat(Number(updateResult.transaction.nwtAmount).toFixed(0)),
          "add",
        );
      }

      return res.status(200).json({
        success: true,
        verified: true,
        status: "completed",
        transactionId: updateResult.transaction?.id,
        nwtAmount: verificationResult.nwtAmount,
        usdAmount: verificationResult.usdAmount,
      });
    }

    res.status(200).json({
      success: verificationResult.success,
      verified: verificationResult.verified,
      status: verificationResult.status,
      error: verificationResult.error,
    });
  } catch (error: any) {
    console.error("Error verifying payment status:", error.message);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
};

export const fetchTransactionByJwtForReaders = async (req, res) => {
  try {
    const userId = getUserJwtFromToken(req);

    const [reader] = await db
      .select()
      .from(readerProfile)
      .where(eq(readerProfile.userId, userId));
    if (!reader) {
      return res.status(404).json({ message: "Reader With Jwt not found" });
    }

    const userTransaction = await db
      .select()
      .from(userTransactions)
      .where(eq(userTransactions.userId, reader.id))
      .orderBy(desc(userTransactions.createdAt));

    return res.json({ transaction: userTransaction });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: "Failed to fetch Transactions" });
  }
};

export const fetchTransactionByJwtForCreators = async (req, res) => {
  try {
    const userId = getUserJwtFromToken(req);

    const [creator] = await db
      .select()
      .from(creatorProfile)
      .where(eq(creatorProfile.userId, userId));
    if (!creator) {
      return res.status(404).json({ message: "Creator With Jwt not found" });
    }

    const creatorTransaction = await db
      .select()
      .from(creatorTransactions)
      .where(eq(creatorTransactions.creatorId, creator.id))
      .orderBy(desc(creatorTransactions.createdAt));

    return res.json({ transaction: creatorTransaction });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: "Failed to fetch Transactions" });
  }
};
