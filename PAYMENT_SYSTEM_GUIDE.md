# Dynamic Payment System Implementation Guide

## Overview

This guide documents the implementation of a dynamic, multi-payment-method NWT purchase system that supports both Helio and Paystack with proper payment verification and transaction record creation.

## Features

✅ **Multi-Payment Method Support**: Helio and Paystack in a unified interface
✅ **Payment Verification**: Verify payments before crediting wallets
✅ **Transaction Records**: Automatic transaction creation for all purchases
✅ **Wallet Crediting**: Automatic NWT wallet crediting upon payment confirmation
✅ **Status Polling**: Client can verify payment status without waiting for webhooks
✅ **Error Handling**: Comprehensive error handling and logging

## Architecture

### 1. Payment Verification Service (`src/services/paymentVerification.service.ts`)

This service provides unified payment verification for all payment methods:

```typescript
// Verify Paystack payment
const result = await verifyPaystackPayment(reference);

// Verify Helio payment
const result = await verifyHelioPayment(transactionSignature);

// Generic verification by payment method
const result = await verifyPayment("paystack", reference);
const result = await verifyPayment("helio", txHash);
```

**Response Format:**

```typescript
{
  success: boolean;           // Service call succeeded
  verified: boolean;          // Payment was verified as successful
  paymentId: string;          // Payment identifier
  status: string;             // "completed" | "pending" | "failed"
  nwtAmount: number;          // Amount of NWT to credit
  usdAmount: number;          // USD amount
  metadata: any;              // Platform-specific data
  error?: string;             // Error message if verification failed
}
```

### 2. Updated Transaction Controller

Added dynamic payment method support to transaction creation:

```typescript
// Create purchase transaction (supports both methods)
await createUserPurchaseTransaction(
  userId,
  nwtAmount,
  usdAmount,
  "paystack", // or "helio"
  "paystack_reference", // payment identifier
  "Purchase description",
);

// Update transaction status (supports both methods)
await updateUserTransactionStatus(
  "paystack", // or "helio"
  "paystack_ref", // payment ID
  "completed", // status
  undefined, // blockchain hash (optional)
  { metadata }, // metadata
  errorReason, // error reason (optional)
);
```

### 3. Enhanced Payment Controller

New unified endpoints support both payment methods:

**Create Payment Link:**

```http
POST /payment/link
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "amount": 10,
  "paymentMethod": "paystack",  // or "helio"
  "name": "NWT_Purchase",
  "redirectUrl": "https://..."
}
```

**Response (Paystack):**

```json
{
  "success": true,
  "reference": "transaction_ref_123",
  "authorizationUrl": "https://checkout.paystack.com/...",
  "accessCode": "access_code_123",
  "nwtAmount": 100,
  "usdAmount": 10,
  "amountInNaira": 15500,
  "paymentMethod": "paystack"
}
```

### 4. Webhook Handlers

#### Helio Webhook: `/payment/helio/handle`

Handles Helio blockchain payment confirmations with signature verification.

#### Paystack Webhook: `/payment/paystack/webhook`

Handles Paystack payment confirmations and verifies with Paystack API.

#### Payment Verification: `/payment/verify`

Allows client-side polling to verify payment status:

```http
POST /payment/verify
Content-Type: application/json

{
  "paymentMethod": "paystack",
  "reference": "transaction_ref_123"
}
```

## Database Schema Updates

### User Transactions Table

Added Paystack-specific fields:

```sql
paystack_payment_id VARCHAR(255)    -- Paystack transaction ID
paystack_reference VARCHAR(255)     -- Paystack reference for verification
```

## Payment Flow

### Paystack Flow

```
1. Frontend calls POST /payment/link
   ├─ Input: amount, paymentMethod: "paystack"
   └─ Response: Paystack checkout URL

2. User completes payment on Paystack
   ├─ Paystack sends webhook to /payment/paystack/webhook
   ├─ System verifies payment with Paystack API
   ├─ Transaction status updated to "completed"
   └─ Wallet credited with NWT

3. Alternative: Client polls /payment/verify
   ├─ Input: paymentMethod: "paystack", reference
   ├─ System verifies with Paystack
   ├─ Wallet credited if verified
   └─ Response: Payment status
```

### Helio Flow

```
1. Frontend calls POST /payment/link
   ├─ Input: amount, paymentMethod: "helio"
   └─ Response: Helio checkout URL

2. User completes blockchain transaction
   ├─ Helio sends webhook to /payment/helio/handle
   ├─ System verifies blockchain transaction
   ├─ Transaction status updated to "completed"
   └─ Wallet credited with NWT

3. Helio webhook handler processes automatically
   └─ No polling needed (blockchain confirmations are authoritative)
```

## Environment Variables Required

```bash
# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_live_your_secret_key
PAYSTACK_PUBLIC_KEY=pk_live_your_public_key
PAYSTACK_CALLBACK_URL=https://yourdomain.com/payment/paystack/webhook

# Helio Configuration (existing)
HELIO_PUBLIC_KEY=your_helio_public_key
HELIO_PRIVATE_KEY=your_helio_secret_key
HELIO_WALLET_ID=your_wallet_id
HELIO_PCURRENCY=SOL
HELIO_AMOUNT=1

# Exchange Rate Configuration
USD_TO_NGN_RATE=1550  # Update based on current rates

# Helio Webhook URL (existing)
WEBHOOK_REDIRECT_URL=https://yourdomain.com/payment/helio/handle
```

## Transaction Record Flow

Every NWT purchase automatically creates transaction records:

### 1. Purchase Initiated

- Transaction created with status: **pending**
- Payment method and ID stored for verification
- Awaits webhook confirmation

### 2. Payment Verified

- Status updated to: **completed**
- Metadata populated with payment details
- Wallet credited with NWT

### 3. Payment Failed

- Status updated to: **failed**
- Failure reason recorded
- User can retry payment

### 4. Transaction Fields

```
- id: UUID
- userId: Reference to reader
- transactionType: "purchase"
- status: "pending" | "completed" | "failed"
- nwtAmount: Amount of NWT to credit
- usdAmount: USD amount paid
- paystackPaymentId: Paystack transaction ID (if Paystack)
- paystackReference: Paystack reference (if Paystack)
- helioPaymentId: Helio payment ID (if Helio)
- blockchainTxHash: Blockchain tx hash (if Helio)
- metadata: Payment provider response
- failureReason: Error message if failed
```

## API Examples

### Example 1: Paystack Payment

```bash
# 1. Create payment link
curl -X POST http://localhost:5000/payment/link \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10,
    "paymentMethod": "paystack"
  }'

# Response:
{
  "success": true,
  "reference": "1234567890",
  "authorizationUrl": "https://checkout.paystack.com/...",
  "nwtAmount": 100,
  "paymentMethod": "paystack"
}

# 2. User redirected to authorizationUrl and completes payment

# 3. Verify payment (polling)
curl -X POST http://localhost:5000/payment/verify \
  -H "Content-Type: application/json" \
  -d '{
    "paymentMethod": "paystack",
    "reference": "1234567890"
  }'

# Response:
{
  "success": true,
  "verified": true,
  "status": "completed",
  "transactionId": "uuid-of-transaction",
  "nwtAmount": 100
}
```

### Example 2: Helio Payment

```bash
# 1. Create payment link
curl -X POST http://localhost:5000/payment/link \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10,
    "paymentMethod": "helio"
  }'

# Response includes Helio checkout widget
```

## Verification Logic

### Paystack Verification

1. Call Paystack API with reference
2. Check if transaction status is "success"
3. Extract amount and customer email
4. Verify amount matches expected value

### Helio Verification

1. Call Helio API with transaction signature
2. Check blockchain transaction confirmation
3. Verify transaction amount and receiver

## Error Handling

### Payment Verification Failures

- Transaction status set to "failed"
- Failure reason recorded in database
- User can attempt payment again
- Wallet NOT credited

### Network Errors

- Webhook retry mechanisms (implement exponential backoff)
- Manual verification available via `/payment/verify` endpoint
- Logging for debugging

### Data Validation

- Amount validation (must be > 0)
- User exists validation
- Payment method validation
- Reference format validation

## Security Considerations

1. **API Key Security**
   - Store in environment variables
   - Never commit to repository
   - Rotate regularly

2. **Signature Verification**
   - Verify Helio blockchain signatures
   - Validate Paystack API responses
   - Check webhook authenticity

3. **Idempotency**
   - Webhook handlers idempotent (safe to call multiple times)
   - Database constraints prevent duplicate credits
   - Reference-based lookups prevent race conditions

4. **Rate Limiting**
   - Implement on payment endpoints
   - Prevent payment bombing
   - Protect wallet crediting

## Testing

### Unit Tests

Test each payment verification method independently:

```typescript
// Test Paystack verification
const result = await verifyPaystackPayment("test_reference");
expect(result.verified).toBe(true);

// Test Helio verification
const result = await verifyHelioPayment("test_signature");
expect(result.verified).toBe(true);
```

### Integration Tests

Test complete payment flows with webhooks:

```typescript
// Create payment, simulate webhook, verify wallet credit
```

## Monitoring & Logging

All payment operations are logged:

- Payment creation
- Verification attempts
- Wallet credits
- Failures and errors

Monitor these logs for:

- Failed verification attempts
- Payment anomalies
- User support issues

## Future Enhancements

1. **Additional Payment Methods**
   - Stripe
   - Apple Pay
   - Google Pay
   - Other crypto payments

2. **Refund Processing**
   - Automated refunds for failed transactions
   - Manual refund interface for support team

3. **Advanced Analytics**
   - Payment conversion rates
   - Average transaction value
   - Revenue by payment method
   - Geographic payment analysis

4. **Retry Mechanisms**
   - Automatic retry for failed payments
   - Exponential backoff for webhooks
   - Dead letter queue for failed webhooks

## Support

For issues or questions:

1. Check application logs in `/logs` directory
2. Review transaction records in database
3. Verify environment variables are set correctly
4. Test with `/payment/verify` endpoint to diagnose issues
