import { Router } from "express";
import {
  getNotifications,
  markNotificationAsRead,
  registerDevice,
} from "../controller/notifications.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Chapters
 *   description: Endpoints for managing comic chapters and drafts
 */

/**
 * @swagger
 * /notifications/devices/register:
 *   post:
 *     summary: Register device token for push notifications
 *     description: Registers a mobile device token (FCM/APNs) for the authenticated reader to receive push notifications.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - platform
 *             properties:
 *               token:
 *                 type: string
 *                 example: "fcm_device_token_here"
 *               platform:
 *                 type: string
 *                 example: "android"
 *                 enum: [android, ios]
 *     responses:
 *       200:
 *         description: Device registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/devices/register", registerDevice);

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get notifications for authenticated reader
 *     description: Fetches all notifications for the authenticated reader, ordered from newest to oldest.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "notif_123"
 *                       title:
 *                         type: string
 *                         example: "New chapter available"
 *                       body:
 *                         type: string
 *                         example: "Comic X just dropped a new chapter"
 *                       type:
 *                         type: string
 *                         example: "NEW_CHAPTER"
 *                       comicId:
 *                         type: string
 *                         example: "comic_abc123"
 *                       chapterId:
 *                         type: string
 *                         example: "chap_def456"
 *                       isRead:
 *                         type: boolean
 *                         example: false
 *                       createdAt:
 *                         type: string
 *                         example: "2026-01-06T12:30:00Z"
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/notifications", getNotifications);

/**
 * @swagger
 * /notifications/{notificationId}/read:
 *   patch:
 *     summary: Mark notification as read
 *     description: Marks a specific notification as read for the authenticated reader.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "notif_123"
 *     responses:
 *       200:
 *         description: Notification marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Internal server error
 */
router.patch("/notifications/:notificationId/read", markNotificationAsRead);

export default router;
