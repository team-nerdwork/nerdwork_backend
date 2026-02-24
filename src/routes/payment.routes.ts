import { Router } from "express";
import {
  createPaymentLink,
  createWebhookForPayment,
  handlePayment,
  handlePaystackPayment,
  verifyPaymentStatus,
} from "../controller/payment.controller";

const router = Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     CreatePaymentLinkRequest:
 *       type: object
 *       required:
 *         - amount
 *       properties:
 *         amount:
 *           type: number
 *           description: Amount for the payment in USD
 *           example: 1.105
 *         name:
 *           type: string
 *           description: Optional name for the payment
 *           example: "NWT_Purchase"
 *         redirectUrl:
 *           type: string
 *           description: Optional redirect URL after payment completion
 *           example: "https://nerdwork.ng/payment/success"
 *     CreatePaymentLinkResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         payment:
 *           type: object
 *           description: Full Helio payment response object
 *         paylinkId:
 *           type: string
 *           description: Unique identifier for the payment link
 *     CreateWebhookRequest:
 *       type: object
 *       required:
 *         - paymentId
 *       properties:
 *         paymentId:
 *           type: string
 *           description: The payment ID to create webhook for
 *           example: "helio_payment_id_123"
 *     CreateWebhookResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           description: Webhook creation response from Helio
 *     WebhookPayload:
 *       type: object
 *       properties:
 *         transaction:
 *           type: string
 *           description: Blockchain transaction signature
 *           example: "BcQK8ibZFXpjQbBNSWGar11Xi85AT21hfaknQB4FJB4HPLtV2mrZbjSZtKeug14crw9qKVgmyWxtJT7G4fBq3WD"
 *         data:
 *           type: object
 *           properties:
 *             content:
 *               type: object
 *               description: Additional payment content
 *             transactionSignature:
 *               type: string
 *               description: Blockchain transaction signature
 *               example: "BcQK8ibZFXpjQbBNSWGar11Xi85AT21hfaknQB4FJB4HPLtV2mrZbjSZtKeug14crw9qKVgmyWxtJT7G4fBq3WD"
 *             status:
 *               type: string
 *               description: Payment status
 *               example: "SUCCESS"
 *             statusToken:
 *               type: string
 *               description: JWT status token from Helio
 *         blockchainSymbol:
 *           type: string
 *           description: Blockchain symbol
 *           example: "SOL"
 *         senderPK:
 *           type: string
 *           description: Sender's public key
 *           example: "FBnExnQQzaowHA3g5VQKV9JKbD4StwnMNz8EymUo9wcT"
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message
 *         details:
 *           type: string
 *           description: Detailed error information
 */

/**
 * @swagger
 * /payment/helio/link:
 *   post:
 *     summary: Create a payment link using Helio API
 *     description: Creates a payment link for purchasing Nerd Work tokens. Requires user authentication and processes payments through the Helio payment gateway.
 *     tags:
 *       - Payment
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePaymentLinkRequest'
 *     responses:
 *       200:
 *         description: Payment link created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreatePaymentLinkResponse'
 *       400:
 *         description: Bad request - missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Missing required fields: amount, currency, name"
 *       401:
 *         description: Unauthorized - invalid or missing JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Failed to create payment link"
 *               details: "Helio API error details"
 */
router.post("/helio/link", createPaymentLink);

/**
 * @swagger
 * /payment/helio/webhook/create:
 *   post:
 *     summary: Create a webhook for payment monitoring
 *     description: Sets up a webhook endpoint to receive payment status updates from Helio. This allows real-time monitoring of payment progress and completion.
 *     tags:
 *       - Payment
 *       - Webhooks
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateWebhookRequest'
 *     responses:
 *       200:
 *         description: Webhook created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateWebhookResponse'
 *       401:
 *         description: Unauthorized - invalid or missing JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       500:
 *         description: Failed to create webhook
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Failed to create webhook"
 *               details: "Helio webhook creation error details"
 */
router.post("/helio/webhook/create", createWebhookForPayment);

/**
 * @swagger
 * /payment/helio/handle:
 *   post:
 *     summary: Handle incoming payment webhooks from Helio
 *     description: Processes webhook events from Helio payment system to update payment status in the database. This endpoint is called automatically by Helio when payment events occur.
 *     tags:
 *       - Payment
 *       - Webhooks
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WebhookPayload'
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       500:
 *         description: Internal server error while processing webhook
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
 */
router.post("/helio/handle", handlePayment);

/**
 * @swagger
 * /payment/link:
 *   post:
 *     summary: Create a payment link (supports Helio and Paystack)
 *     description: Creates a payment link for purchasing NWT tokens with support for multiple payment methods (Helio or Paystack).
 *     tags:
 *       - Payment
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - paymentMethod
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Amount in USD
 *                 example: 10
 *               paymentMethod:
 *                 type: string
 *                 enum: ['helio', 'paystack']
 *                 description: Payment method to use
 *                 example: "paystack"
 *               name:
 *                 type: string
 *                 description: Optional name for tracking
 *                 example: "NWT_Purchase"
 *               redirectUrl:
 *                 type: string
 *                 description: Optional redirect URL after payment
 *     responses:
 *       200:
 *         description: Payment link created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/link", createPaymentLink);

/**
 * @swagger
 * /payment/paystack/webhook:
 *   post:
 *     summary: Handle Paystack webhook
 *     description: Webhook endpoint for Paystack to send payment confirmation events
 *     tags:
 *       - Payment
 *       - Webhooks
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reference:
 *                 type: string
 *                 description: Paystack payment reference
 *                 example: "transaction_ref_123"
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       400:
 *         description: Bad request - missing reference
 *       500:
 *         description: Server error
 */
router.post("/paystack/webhook", handlePaystackPayment);

/**
 * @swagger
 * /payment/verify:
 *   post:
 *     summary: Verify payment status
 *     description: Verify the status of a payment and credit wallet if verified. Useful for client-side polling.
 *     tags:
 *       - Payment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentMethod
 *               - reference
 *             properties:
 *               paymentMethod:
 *                 type: string
 *                 enum: ['helio', 'paystack']
 *                 description: Payment method
 *               reference:
 *                 type: string
 *                 description: Payment reference (transaction signature for Helio, reference for Paystack)
 *     responses:
 *       200:
 *         description: Payment status verified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 verified:
 *                   type: boolean
 *                 status:
 *                   type: string
 *                 transactionId:
 *                   type: string
 *                 nwtAmount:
 *                   type: number
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post("/verify", verifyPaymentStatus);

export default router;
