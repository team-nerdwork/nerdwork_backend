# Frontend Integration Guide - Dynamic Payment System

## Quick Reference

### Available Payment Methods

- **Helio** - Blockchain-based (SOL)
- **Paystack** - Fiat payment (NGN)

## Integration Steps

### 1. Show Payment Method Selection

```html
<div class="payment-methods">
  <label>
    <input type="radio" name="method" value="helio" />
    Helio (Blockchain)
  </label>
  <label>
    <input type="radio" name="method" value="paystack" />
    Paystack (Card/Bank)
  </label>
</div>

<input type="number" id="amount" placeholder="Amount in USD" />
<button onclick="initiatePayment()">Pay Now</button>
```

### 2. Create Payment Link

```javascript
async function initiatePayment() {
  const amount = document.getElementById("amount").value;
  const method = document.querySelector('input[name="method"]:checked').value;

  const response = await fetch("/payment/link", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: parseFloat(amount),
      paymentMethod: method,
    }),
  });

  const data = await response.json();

  if (!data.success) {
    alert("Payment initialization failed: " + data.error);
    return;
  }

  // Route based on payment method
  if (method === "paystack") {
    handlePaystackPayment(data);
  } else if (method === "helio") {
    handleHelioPayment(data);
  }
}

function getToken() {
  return localStorage.getItem("token");
}
```

### 3. Handle Paystack Payment

```javascript
function handlePaystackPayment(paymentData) {
  // Store reference for verification
  sessionStorage.setItem("paymentReference", paymentData.reference);

  // Redirect to Paystack
  window.location.href = paymentData.authorizationUrl;
}

// After user returns from Paystack
async function verifyPaystackPayment() {
  const reference = sessionStorage.getItem("paymentReference");

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
    alert(`Payment successful! ${data.nwtAmount} NWT added to wallet`);
    // Update UI to show successful payment
  } else {
    alert("Payment verification failed. Please try again.");
  }
}
```

### 4. Handle Helio Payment

```javascript
function handleHelioPayment(paymentData) {
  // Use Helio embed/widget as before
  initHelioCheckout(paymentData.paylinkId);
}

// Helio webhook will handle wallet credit automatically
```

### 5. Payment Status Polling (Optional)

For UX improvement, poll payment status instead of waiting for webhook:

```javascript
async function pollPaymentStatus() {
  const reference = sessionStorage.getItem("paymentReference");
  const maxAttempts = 30; // 30 seconds with 1-second interval
  let attempts = 0;

  const interval = setInterval(async () => {
    attempts++;

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
      clearInterval(interval);
      handlePaymentSuccess(data);
    } else if (attempts >= maxAttempts) {
      clearInterval(interval);
      handlePaymentTimeout();
    }
  }, 1000); // Check every 1 second
}

function handlePaymentSuccess(data) {
  alert(`✓ Payment successful! ${data.nwtAmount} NWT credited`);
  redirectToWallet();
}

function handlePaymentTimeout() {
  alert("⏱ Payment verification pending. Check your wallet in a moment.");
}
```

## Complete Example Component (React/Vue)

### React Example

```jsx
import { useState } from "react";

export default function NWTPayment() {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("paystack");
  const [loading, setLoading] = useState(false);
  const [nwtAmount, setNwtAmount] = useState(0);

  const handleAmountChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setAmount(value);
    setNwtAmount(value * 10); // 1 USD = 10 NWT
  };

  const initiatePayment = async () => {
    if (!amount || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/payment/link", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          paymentMethod: method,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        alert("Error: " + data.error);
        setLoading(false);
        return;
      }

      // Handle based on payment method
      if (method === "paystack") {
        sessionStorage.setItem("paymentReference", data.reference);
        window.location.href = data.authorizationUrl;
      } else {
        // Helio checkout
        initHelioCheckout(data.paylinkId);
        setLoading(false);
      }
    } catch (error) {
      alert("Payment failed: " + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="payment-container">
      <h2>Buy NWT Tokens</h2>

      <div className="amount-input">
        <label>Amount (USD)</label>
        <input
          type="number"
          value={amount}
          onChange={handleAmountChange}
          placeholder="Enter amount"
          min="0"
          step="0.01"
        />
        <p className="nwt-info">
          You will receive: <strong>{nwtAmount} NWT</strong>
        </p>
      </div>

      <div className="payment-methods">
        <label>
          <input
            type="radio"
            value="paystack"
            checked={method === "paystack"}
            onChange={(e) => setMethod(e.target.value)}
          />
          Paystack - Pay with Card/Bank
        </label>
        <label>
          <input
            type="radio"
            value="helio"
            checked={method === "helio"}
            onChange={(e) => setMethod(e.target.value)}
          />
          Helio - Blockchain Payment
        </label>
      </div>

      <button
        onClick={initiatePayment}
        disabled={loading}
        className="pay-button">
        {loading ? "Processing..." : `Pay $${amount || "0"}`}
      </button>
    </div>
  );
}
```

### Vue Example

```vue
<template>
  <div class="payment-container">
    <h2>Buy NWT Tokens</h2>

    <div class="amount-input">
      <label>Amount (USD)</label>
      <input
        v-model.number="amount"
        type="number"
        placeholder="Enter amount"
        min="0"
        step="0.01"
        @change="calculateNWT" />
      <p class="nwt-info">
        You will receive: <strong>{{ nwtAmount }} NWT</strong>
      </p>
    </div>

    <div class="payment-methods">
      <label>
        <input v-model="method" type="radio" value="paystack" />
        Paystack - Pay with Card/Bank
      </label>
      <label>
        <input v-model="method" type="radio" value="helio" />
        Helio - Blockchain Payment
      </label>
    </div>

    <button @click="initiatePayment" :disabled="loading" class="pay-button">
      {{ loading ? "Processing..." : `Pay $${amount || "0"}` }}
    </button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      amount: "",
      nwtAmount: 0,
      method: "paystack",
      loading: false,
    };
  },
  methods: {
    calculateNWT() {
      this.nwtAmount = (this.amount || 0) * 10;
    },
    async initiatePayment() {
      if (!this.amount || this.amount <= 0) {
        alert("Please enter a valid amount");
        return;
      }

      this.loading = true;

      try {
        const response = await fetch("/payment/link", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: parseFloat(this.amount),
            paymentMethod: this.method,
          }),
        });

        const data = await response.json();

        if (!data.success) {
          alert("Error: " + data.error);
          this.loading = false;
          return;
        }

        if (this.method === "paystack") {
          sessionStorage.setItem("paymentReference", data.reference);
          window.location.href = data.authorizationUrl;
        } else {
          // Handle Helio
          this.initHelioCheckout(data.paylinkId);
          this.loading = false;
        }
      } catch (error) {
        alert("Payment failed: " + error.message);
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.payment-container {
  max-width: 400px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.amount-input input {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  margin: 10px 0;
}

.nwt-info {
  font-size: 14px;
  color: #666;
}

.payment-methods {
  margin: 20px 0;
}

.payment-methods label {
  display: block;
  margin: 10px 0;
  cursor: pointer;
}

.pay-button {
  width: 100%;
  padding: 12px;
  background: linear-gradient(90deg, #ff007a, #7d00ff);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  font-weight: bold;
}

.pay-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
```

## Important Considerations

### 1. Return URL Handling

After Paystack payment, user returns to your site. Handle the redirect:

```javascript
// On return page (success page)
window.addEventListener("load", () => {
  const reference = new URLSearchParams(window.location.search).get(
    "reference",
  );
  if (reference) {
    verifyPaystackPayment();
  }
});
```

### 2. Token Validation

Always ensure user is logged in before payment:

```javascript
function getToken() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login";
    return null;
  }
  return token;
}
```

### 3. Error Handling

Show user-friendly error messages:

```javascript
const errorMessages = {
  "Insufficient balance": "Your account has insufficient funds",
  "Payment not successful": "Your payment was not successful. Please try again",
  "Network error": "Connection issue. Please check your internet",
  // Add more as needed
};

function handlePaymentError(error) {
  const message = errorMessages[error] || error;
  alert("❌ " + message);
}
```

### 4. Loading States

Show appropriate feedback during payment processing:

```javascript
function setPaymentLoading(isLoading) {
  const button = document.querySelector(".pay-button");
  button.disabled = isLoading;
  button.textContent = isLoading ? "Processing..." : "Pay Now";
}
```

## Testing

### Test with Paystack (Staging)

Use test cards provided by Paystack:

- Card: 4084084084084081
- CVV: 408
- Expiry: Any future date

### Test with Helio (Testnet)

Use testnet credentials configured in environment

## Troubleshooting

### Payment Link Creation Fails

- Verify user is authenticated (has valid token)
- Check amount is > 0
- Ensure backend is running

### Paystack Redirect Not Working

- Check authorizationUrl in response
- Verify PAYSTACK_SECRET_KEY is set

### Wallet Not Credited

- Check payment status with `/payment/verify`
- Wait a few seconds for webhook processing
- Check browser console for errors

## API Response Examples

### Paystack Payment Link Response

```json
{
  "success": true,
  "reference": "1234567890",
  "authorizationUrl": "https://checkout.paystack.com/...",
  "accessCode": "access_code_123",
  "nwtAmount": 100,
  "usdAmount": 10,
  "amountInNaira": 15500,
  "paymentMethod": "paystack"
}
```

### Helio Payment Link Response

```json
{
  "success": true,
  "paylinkId": "helio_paylink_123",
  "nwtAmount": 100,
  "usdAmount": 10,
  "paymentMethod": "helio"
}
```

### Payment Verification Response

```json
{
  "success": true,
  "verified": true,
  "status": "completed",
  "transactionId": "uuid-123",
  "nwtAmount": 100,
  "usdAmount": 10
}
```
