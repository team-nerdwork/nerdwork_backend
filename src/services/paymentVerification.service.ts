import axios from "axios";

/**
 * Unified payment verification service for multiple payment methods
 */

interface PaymentVerificationResult {
  success: boolean;
  verified: boolean;
  paymentId: string;
  status: "completed" | "pending" | "failed";
  nwtAmount: number;
  usdAmount: number;
  metadata: any;
  error?: string;
}

/**
 * Verify Paystack payment
 */
export const verifyPaystackPayment = async (
  reference: string,
): Promise<PaymentVerificationResult> => {
  try {
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!paystackSecretKey) {
      return {
        success: false,
        verified: false,
        paymentId: reference,
        status: "failed",
        nwtAmount: 0,
        usdAmount: 0,
        metadata: {},
        error: "Paystack configuration missing",
      };
    }

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
        },
      },
    );

    const { data } = response.data;

    if (data.status !== "success") {
      return {
        success: true,
        verified: false,
        paymentId: reference,
        status: "failed",
        nwtAmount: 0,
        usdAmount: 0,
        metadata: data,
        error: "Payment not successful",
      };
    }

    // Calculate NWT amount (convert from cents to naira, then to NWT)
    const amountInNaira = data.amount / 100; // Paystack stores in cents
    const nwtAmount = amountInNaira * 10; // Example: 1 NGN = 10 NWT (adjust ratio as needed)
    const usdAmount = data.amount / 100; // Store actual amount for reference

    return {
      success: true,
      verified: true,
      paymentId: data.reference,
      status: "completed",
      nwtAmount,
      usdAmount,
      metadata: {
        paystackTransactionId: data.id,
        paystackReference: data.reference,
        customerEmail: data.customer.email,
        authorizationUrl: data.authorization_url,
        accessCode: data.access_code,
        amount: data.amount,
      },
    };
  } catch (error: any) {
    console.error("Paystack verification error:", error.message);
    return {
      success: false,
      verified: false,
      paymentId: reference,
      status: "failed",
      nwtAmount: 0,
      usdAmount: 0,
      metadata: {},
      error: error.message,
    };
  }
};

/**
 * Verify Helio payment transaction
 * For Helio, we verify the blockchain transaction signature
 */
export const verifyHelioPayment = async (
  transactionSignature: string,
  expectedStatus: string = "SUCCESS",
): Promise<PaymentVerificationResult> => {
  try {
    const helioPublicKey = process.env.HELIO_PUBLIC_KEY;
    const helioSecretKey = process.env.HELIO_PRIVATE_KEY;

    if (!helioPublicKey || !helioSecretKey) {
      return {
        success: false,
        verified: false,
        paymentId: transactionSignature,
        status: "failed",
        nwtAmount: 0,
        usdAmount: 0,
        metadata: {},
        error: "Helio configuration missing",
      };
    }

    // For now, we'll verify through the Helio API
    // In production, you might want to verify the blockchain transaction directly
    const response = await axios.get(
      `https://api.hel.io/v1/transactions/${transactionSignature}`,
      {
        headers: {
          Authorization: `Bearer ${helioPublicKey}`,
        },
      },
    );

    const { data } = response;

    if (data.status !== expectedStatus) {
      return {
        success: true,
        verified: false,
        paymentId: transactionSignature,
        status: "failed",
        nwtAmount: 0,
        usdAmount: 0,
        metadata: data,
        error: `Payment status is ${data.status}, expected ${expectedStatus}`,
      };
    }

    // Extract amount from Helio response
    const usdAmount = data.amount ? parseFloat(data.amount) : 0;
    const nwtAmount = usdAmount * 10; // Adjust conversion ratio as needed

    return {
      success: true,
      verified: true,
      paymentId: data.id || transactionSignature,
      status: "completed",
      nwtAmount,
      usdAmount,
      metadata: {
        helioTransactionId: data.id,
        helioSignature: transactionSignature,
        blockchainSymbol: data.currency,
        amount: data.amount,
      },
    };
  } catch (error: any) {
    console.error("Helio verification error:", error.message);
    return {
      success: false,
      verified: false,
      paymentId: transactionSignature,
      status: "failed",
      nwtAmount: 0,
      usdAmount: 0,
      metadata: {},
      error: error.message,
    };
  }
};

/**
 * Verify payment based on payment method
 */
export const verifyPayment = async (
  paymentMethod: "helio" | "paystack",
  paymentReference: string,
  additionalData?: any,
): Promise<PaymentVerificationResult> => {
  if (paymentMethod === "paystack") {
    return verifyPaystackPayment(paymentReference);
  } else if (paymentMethod === "helio") {
    const expectedStatus = additionalData?.status || "SUCCESS";
    return verifyHelioPayment(paymentReference, expectedStatus);
  } else {
    return {
      success: false,
      verified: false,
      paymentId: paymentReference,
      status: "failed",
      nwtAmount: 0,
      usdAmount: 0,
      metadata: {},
      error: "Unsupported payment method",
    };
  }
};
