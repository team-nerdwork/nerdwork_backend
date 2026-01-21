import { Router } from "express";
import { getCreatorAnalytics } from "../controller/analytics.controller";

const router = Router();

router.get("/creator", getCreatorAnalytics);

/**
 * @swagger
 * /analytics/creator:
 *   get:
 *     summary: Get creator analytics (all-time)
 *     description: >
 *       Returns analytics data for a creator including total reads,
 *       active readers (unique), total likes, top comic, and chart data
 *       (reads, likes, subscribers grouped by date).
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Creator analytics fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalReads:
 *                       type: number
 *                       example: 2150
 *                     activeReaders:
 *                       type: number
 *                       example: 700
 *                     totalLikes:
 *                       type: number
 *                       example: 400
 *                     topComic:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "uuid"
 *                         title:
 *                           type: string
 *                           example: "Yohance"
 *                         reads:
 *                           type: number
 *                           example: 700
 *                 chart:
 *                   type: object
 *                   properties:
 *                     reads:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             example: "2026-01-07"
 *                           count:
 *                             type: number
 *                             example: 120
 *                     likes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             example: "2026-01-07"
 *                           count:
 *                             type: number
 *                             example: 40
 *                     subscribers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             example: "2026-01-07"
 *                           count:
 *                             type: number
 *                             example: 20
 *       401:
 *         description: Unauthorized (invalid or missing JWT)
 *       404:
 *         description: Creator profile not found
 *       500:
 *         description: Internal server error
 */

export default router;
