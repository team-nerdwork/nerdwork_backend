import { and, desc, eq } from "drizzle-orm";
import { db } from "../config/db";
import { readerProfile } from "../model/profile";
import { getUserJwtFromToken } from "./library.controller";
import { deviceTokens, notifications } from "../model/notification";

export const registerDevice = async (req, res) => {
  const userId = getUserJwtFromToken(req);
  const { token, platform } = req.body;

  const [reader] = await db
    .select()
    .from(readerProfile)
    .where(eq(readerProfile.userId, userId));

  // avoid duplicates
  await db
    .insert(deviceTokens)
    .values({
      readerId: reader.id,
      token,
      platform,
    })
    .onConflictDoNothing();

  res.json({ success: true });
};

export const getNotifications = async (req, res) => {
  try {
    const userId = getUserJwtFromToken(req);

    const [reader] = await db
      .select()
      .from(readerProfile)
      .where(eq(readerProfile.userId, userId));

    if (!reader) {
      return res.status(404).json({
        success: false,
        message: "Reader not found",
      });
    }

    const data = await db
      .select()
      .from(notifications)
      .where(eq(notifications.readerId, reader.id))
      .orderBy(desc(notifications.createdAt));

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err: any) {
    console.error("Get Notifications Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = getUserJwtFromToken(req);

    const [reader] = await db
      .select()
      .from(readerProfile)
      .where(eq(readerProfile.userId, userId));

    if (!reader) {
      return res.status(404).json({
        success: false,
        message: "Reader not found",
      });
    }

    const result = await db
      .update(notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.readerId, reader.id)
        )
      )
      .returning();

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (err: any) {
    console.error("Mark Notification Read Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
