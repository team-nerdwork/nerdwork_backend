/**
 * Payment Methods Configuration
 * Centralized configuration for all payment methods (Helio, Paystack, etc.)
 */

export const paymentConfig = {
  helio: {
    enabled: !!process.env.HELIO_PUBLIC_KEY && !!process.env.HELIO_PRIVATE_KEY,
    publicKey: process.env.HELIO_PUBLIC_KEY,
    secretKey: process.env.HELIO_PRIVATE_KEY,
    walletId: process.env.HELIO_WALLET_ID,
    currency: process.env.HELIO_PCURRENCY || "SOL",
    amount: Number(process.env.HELIO_AMOUNT) || 1,
    webhookUrl: process.env.WEBHOOK_REDIRECT_URL,
  },

  paystack: {
    enabled: !!process.env.PAYSTACK_SECRET_KEY,
    secretKey: process.env.PAYSTACK_SECRET_KEY,
    publicKey: process.env.PAYSTACK_PUBLIC_KEY,
    callbackUrl: process.env.PAYSTACK_CALLBACK_URL,
  },

  conversion: {
    // USD to NWT conversion rate
    // Example: 1 USD = 10 NWT
    usdToNwt: 10,

    // USD to NGN exchange rate for Paystack
    // Updates should be made based on current rates
    usdToNgn: Number(process.env.USD_TO_NGN_RATE) || 1550,
  },
};

/**
 * Validate that at least one payment method is configured
 */
export const validatePaymentConfiguration = () => {
  const { helio, paystack } = paymentConfig;

  if (!helio.enabled && !paystack.enabled) {
    console.warn(
      "⚠️ WARNING: No payment methods are enabled! Configure Helio or Paystack to process payments.",
    );
    return false;
  }

  if (helio.enabled) {
    console.log("✅ Helio payment method is enabled");
  }

  if (paystack.enabled) {
    console.log("✅ Paystack payment method is enabled");
  }

  return true;
};
