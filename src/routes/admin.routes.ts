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