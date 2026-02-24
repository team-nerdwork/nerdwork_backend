# Implementation Checklist - Dynamic Payment System

## Overview

This checklist guides you through implementing the multi-payment-method NWT purchase system.

## Database Migrations

- [ ] Add `paystackPaymentId` column to `userTransactions` table
- [ ] Add `paystackReference` column to `userTransactions` table
- [ ] Update `userTransaction` schema definition

**Migration SQL:**

```sql
ALTER TABLE user_transactions
ADD COLUMN paystack_payment_id VARCHAR(255),
ADD COLUMN paystack_reference VARCHAR(255);
```

## Environment Variables

Add these to your `.env` file:

```bash
# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_live_your_secret_key
PAYSTACK_PUBLIC_KEY=pk_live_your_public_key
PAYSTACK_CALLBACK_URL=https://yourdomain.com/payment/paystack/webhook

# Exchange Rate (update based on current rates)
USD_TO_NGN_RATE=1550

# Existing Helio Configuration (already present)
HELIO_PUBLIC_KEY=...
HELIO_PRIVATE_KEY=...
HELIO_WALLET_ID=...
```

## Files Created/Modified

### ✅ New Files Created

1. **`src/services/paymentVerification.service.ts`**
   - Unified payment verification for Helio and Paystack
   - Functions: `verifyPaystackPayment()`, `verifyHelioPayment()`, `verifyPayment()`

2. **`src/config/payment.config.ts`**
   - Centralized payment configuration
   - Validates payment method setup

3. **`PAYMENT_SYSTEM_GUIDE.md`**
   - Complete documentation
   - API examples
   - Architecture overview

### ✅ Modified Files

1. **`src/controller/transaction.controller.ts`**
   - Updated `createUserPurchaseTransaction()` to accept payment method
   - Updated `updateUserTransactionStatus()` to support both methods
   - Added flexibility for future payment methods

2. **`src/model/userTransaction.ts`**
   - Added `paystackPaymentId` field
   - Added `paystackReference` field
   - Supports multiple payment methods

3. **`src/controller/payment.controller.ts`**
   - Refactored `createPaymentLink()` to route based on payment method
   - Added `createHelioPaymentLink()` (extracted from old logic)
   - Added `createPaystackPayment()` (new Paystack support)
   - Updated `handlePayment()` with payment verification
   - Added `handlePaystackPayment()` (new webhook handler)
   - Added `verifyPaymentStatus()` (client-side polling support)

4. **`src/routes/payment.routes.ts`**
   - Updated imports to include new handlers
   - Kept `/payment/helio/link` for backward compatibility
   - Added `/payment/link` (unified endpoint)
   - Added `/payment/paystack/webhook` (Paystack webhook handler)
   - Added `/payment/verify` (payment status verification)

## Integration Steps

### Step 1: Database Migration

```bash
# Run migration to add Paystack fields
npm run migrate
# or
drizzle-kit push
```

### Step 2: Install Dependencies

Your project should already have `axios` for HTTP requests. Verify:

```bash
npm ls axios
```

### Step 3: Configure Environment

Update `.env` with Paystack credentials and exchange rates.

### Step 4: Test Payment Creation

```bash
# Test for Paystack
curl -X POST http://localhost:5000/payment/link \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10,
    "paymentMethod": "paystack"
  }'

# Test for Helio (backward compatible)
curl -X POST http://localhost:5000/payment/link \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10,
    "paymentMethod": "helio"
  }'
```

### Step 5: Configure Webhooks

#### Paystack Webhook

1. Go to Paystack Dashboard > Settings > API Keys & Webhooks
2. Set webhook URL: `https://yourdomain.com/payment/paystack/webhook`
3. Make sure endpoint is publicly accessible and responds with 200

#### Helio Webhook

- Already configured with `WEBHOOK_REDIRECT_URL` environment variable
- No additional setup needed

### Step 6: Frontend Integration

#### For Paystack Checkout:

```javascript
// Frontend code to integrate Paystack
const response = await fetch("/payment/link", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    amount: 10,
    paymentMethod: "paystack",
  }),
});

const data = await response.json();
// Redirect to: data.authorizationUrl
```

#### For Payment Verification (Polling):

```javascript
// Poll for payment status
const verifyPayment = async (reference) => {
  const response = await fetch("/payment/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      paymentMethod: "paystack",
      reference: reference,
    }),
  });

  const data = await response.json();
  if (data.verified) {
    // Payment successful, wallet credited
    console.log("NWT Amount:", data.nwtAmount);
  }
};
```

## Backward Compatibility

✅ **All existing Helio endpoints remain unchanged**

- `/payment/helio/link` - Still works
- `/payment/helio/handle` - Still works
- `/payment/helio/webhook/create` - Still works

**New unified endpoint:**

- `/payment/link` - Supports both methods

## Testing Checklist

- [ ] Create Helio payment link
- [ ] Create Paystack payment link
- [ ] Test Helio webhook handling
- [ ] Test Paystack webhook handling
- [ ] Test payment verification endpoint
- [ ] Verify wallet is credited after successful payment
- [ ] Verify transaction record is created
- [ ] Test failed payment scenarios
- [ ] Test payment status polling

## Troubleshooting

### Payment Link Creation Fails

1. Check environment variables are set correctly
2. Verify API keys are valid
3. Check network connectivity to payment providers
4. Review logs for detailed error messages

### Webhook Not Triggering

1. Verify webhook URL is publicly accessible
2. Check Paystack/Helio webhook settings
3. Confirm endpoint returns 200 OK
4. Check firewall/security rules allow webhook traffic

### Wallet Not Credited

1. Verify payment is marked as "completed" in database
2. Check wallet update query executed without errors
3. Review payment verification response
4. Check for any transaction status update errors in logs

### Transaction Not Created

1. Verify reader profile exists for user
2. Check database constraints
3. Review error logs for insert query failures

## Monitoring

### Key Metrics to Monitor

- Payment success rate by method
- Average verification time
- Wallet credit latency
- Transaction creation success rate
- Failed payment reasons

### Logs to Review

```bash
# View payment-related logs
grep -i "payment\|transaction\|webhook" app.log | tail -100

# Monitor real-time
tail -f app.log | grep -i "payment"
```

## Rollback Plan

If issues arise:

1. **Revert to Helio only**
   - Use `/payment/helio/link` endpoint
   - No database rollback needed (new columns are nullable)

2. **Pause Paystack payments**
   - Set `PAYSTACK_SECRET_KEY` to empty string
   - System will reject Paystack payment requests

3. **Database rollback** (if needed)
   ```sql
   ALTER TABLE user_transactions
   DROP COLUMN paystack_payment_id,
   DROP COLUMN paystack_reference;
   ```

## Support & Documentation

- **Full Documentation**: See `PAYMENT_SYSTEM_GUIDE.md`
- **API Reference**: Check swagger docs at `/api/docs`
- **Code Comments**: Review functions in payment controller for inline documentation

## Sign-Off Checklist

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] Code merged to main branch
- [ ] Basic functionality tested
- [ ] Webhooks configured in payment provider dashboards
- [ ] Frontend integrated with new payment methods
- [ ] Monitoring and alerting set up
- [ ] Documentation reviewed by team
- [ ] Backup and recovery plan documented

**Deployment Date:** ******\_\_\_******

**Deployed By:** ******\_\_\_******

**Verified By:** ******\_\_\_******
