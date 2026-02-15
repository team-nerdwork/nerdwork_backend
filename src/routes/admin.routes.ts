import { Router } from "express";
import {
  adminSignIn,
  getAdminOverview,
  listUsers,
  updateUserStatus,
  listCreators,
  updateCreatorVerification,
  listComics,
  updateComicStatus,
  getMarketplaceSummary,
  getFinanceSummary,
  listPayouts,
  processPayout,
  listAuditLogs,
} from "../controller/admin.controller";
import { requireAdmin } from "../middleware/adminAuth";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     AdminSignInRequest:
 *       type: object
 *       required:
 *         - idToken
 *       properties:
 *         idToken:
 *           type: string
 *           description: Google ID token from the frontend
 *     AdminUser:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         email:
 *           type: string
 *         username:
 *           type: string
 *         displayName:
 *           type: string
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         isActive:
 *           type: boolean
 *         lockedUntil:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         nftsOwned:
 *           type: number
 *         spent:
 *           type: number
 *     AdminUsersResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AdminUser'
 *         pagination:
 *           type: object
 *           properties:
 *             page:
 *               type: number
 *             pageSize:
 *               type: number
 *             total:
 *               type: number
 *     UpdateUserStatusRequest:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [active, suspended, inactive]
 *         durationDays:
 *           type: number
 *         reason:
 *           type: string
 *     AdminCreator:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         status:
 *           type: string
 *           enum: [pending, verified, rejected]
 *         works:
 *           type: number
 *         revenue:
 *           type: number
 *         rating:
 *           type: number
 *           nullable: true
 *     AdminCreatorsResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AdminCreator'
 *         pagination:
 *           type: object
 *           properties:
 *             page:
 *               type: number
 *             pageSize:
 *               type: number
 *             total:
 *               type: number
 *     UpdateCreatorVerificationRequest:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [pending, verified, rejected]
 *         note:
 *           type: string
 *     AdminComic:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         slug:
 *           type: string
 *         creator:
 *           type: string
 *         status:
 *           type: string
 *           enum: [draft, pending, published, flagged]
 *         submitted:
 *           type: string
 *           format: date-time
 *         chapters:
 *           type: number
 *         genre:
 *           type: string
 *         views:
 *           type: number
 *         sales:
 *           type: number
 *         revenue:
 *           type: number
 *     AdminComicsResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AdminComic'
 *         pagination:
 *           type: object
 *           properties:
 *             page:
 *               type: number
 *             pageSize:
 *               type: number
 *             total:
 *               type: number
 *     UpdateComicStatusRequest:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [draft, pending, published, flagged]
 *         note:
 *           type: string
 *     MarketplaceSummaryResponse:
 *       type: object
 *       properties:
 *         totalNftsMinted:
 *           type: number
 *         sales7d:
 *           type: number
 *         volume7d:
 *           type: number
 *     FinanceSummaryResponse:
 *       type: object
 *       properties:
 *         platformRevenue:
 *           type: number
 *         pendingPayouts:
 *           type: number
 *         completedPayouts:
 *           type: number
 *         platformFeePercent:
 *           type: number
 *     AdminPayout:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         creator:
 *           type: string
 *         amount:
 *           type: number
 *         status:
 *           type: string
 *         date:
 *           type: string
 *           format: date-time
 *     AdminPayoutsResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AdminPayout'
 *         pagination:
 *           type: object
 *           properties:
 *             page:
 *               type: number
 *             pageSize:
 *               type: number
 *             total:
 *               type: number
 *     ProcessPayoutRequest:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [pending, processing, completed, failed]
 *     AdminAuditLog:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         action:
 *           type: string
 *         status:
 *           type: string
 *         targetType:
 *           type: string
 *         targetId:
 *           type: string
 *         metadata:
 *           type: object
 *         createdAt:
 *           type: string
 *           format: date-time
 *         adminId:
 *           type: string
 *     AdminAuditLogsResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AdminAuditLog'
 *         pagination:
 *           type: object
 *           properties:
 *             page:
 *               type: number
 *             pageSize:
 *               type: number
 *             total:
 *               type: number
 */

/**
 * @swagger
 * /admin/auth/signin:
 *   post:
 *     summary: Admin sign-in with Google
 *     tags: [Admin]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminSignInRequest'
 *     responses:
 *       200:
 *         description: Admin authenticated
 *       400:
 *         description: Invalid request
 *       403:
 *         description: Admin access denied
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /admin/overview:
 *   get:
 *     summary: Admin overview dashboard data
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Overview data
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: List users
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, suspended, inactive]
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Users list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminUsersResponse'
 */

/**
 * @swagger
 * /admin/users/{authUserId}/status:
 *   patch:
 *     summary: Update user status
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: authUserId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserStatusRequest'
 *     responses:
 *       200:
 *         description: User status updated
 */

/**
 * @swagger
 * /admin/creators:
 *   get:
 *     summary: List creators
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, verified, rejected]
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Creators list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminCreatorsResponse'
 */

/**
 * @swagger
 * /admin/creators/{creatorId}/verify:
 *   patch:
 *     summary: Verify or reject creator
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: creatorId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCreatorVerificationRequest'
 *     responses:
 *       200:
 *         description: Creator status updated
 */

/**
 * @swagger
 * /admin/comics:
 *   get:
 *     summary: List comics
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, pending, published, flagged]
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Comics list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminComicsResponse'
 */

/**
 * @swagger
 * /admin/comics/{comicId}/moderate:
 *   patch:
 *     summary: Moderate comic status
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: comicId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateComicStatusRequest'
 *     responses:
 *       200:
 *         description: Comic status updated
 */

/**
 * @swagger
 * /admin/marketplace/summary:
 *   get:
 *     summary: Marketplace summary
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Marketplace summary data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MarketplaceSummaryResponse'
 */

/**
 * @swagger
 * /admin/finance/summary:
 *   get:
 *     summary: Finance summary
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Finance summary data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FinanceSummaryResponse'
 */

/**
 * @swagger
 * /admin/finance/payouts:
 *   get:
 *     summary: List payouts
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Payouts list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminPayoutsResponse'
 */

/**
 * @swagger
 * /admin/finance/payouts/{id}/process:
 *   post:
 *     summary: Process payout
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProcessPayoutRequest'
 *     responses:
 *       200:
 *         description: Payout processed
 */

/**
 * @swagger
 * /admin/audit-logs:
 *   get:
 *     summary: List admin audit logs
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Audit logs list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminAuditLogsResponse'
 */

const signInLimiter = (() => {
  const windowMs = 10 * 60 * 1000;
  const maxAttempts = 10;
  const hits = new Map<string, { count: number; resetAt: number }>();

  return (req, res, next) => {
    const forwarded = req.headers["x-forwarded-for"];
    const ip =
      (Array.isArray(forwarded) ? forwarded[0] : forwarded) || req.ip || "local";
    const now = Date.now();

    const entry = hits.get(ip);
    if (!entry || entry.resetAt < now) {
      hits.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (entry.count >= maxAttempts) {
      return res.status(429).json({ message: "Too many attempts" });
    }

    entry.count += 1;
    hits.set(ip, entry);
    return next();
  };
})();

router.post("/auth/signin", signInLimiter, adminSignIn);

router.use(requireAdmin);

router.get("/overview", getAdminOverview);
router.get("/users", listUsers);
router.patch("/users/:authUserId/status", updateUserStatus);
router.get("/creators", listCreators);
router.patch("/creators/:creatorId/verify", updateCreatorVerification);
router.get("/comics", listComics);
router.patch("/comics/:comicId/moderate", updateComicStatus);
router.get("/marketplace/summary", getMarketplaceSummary);
router.get("/finance/summary", getFinanceSummary);
router.get("/finance/payouts", listPayouts);
router.post("/finance/payouts/:id/process", processPayout);
router.get("/audit-logs", listAuditLogs);

export default router;
