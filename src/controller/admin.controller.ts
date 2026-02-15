import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { eq } from "drizzle-orm";
import { db } from "../config/db";
import { adminUsers } from "../model/admin";
import {
  ADMIN_EMAIL_ALLOWLIST,
  GOOGLE_CLIENT_ID,
  JWT_SECRET,
} from "../config/envs";
import type { AdminAuthRequest } from "../middleware/adminAuth";
import * as adminService from "../services/admin.service";

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

const parseAllowlist = () =>
  (ADMIN_EMAIL_ALLOWLIST || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

export const adminSignIn = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: "Google ID token required" });
    }

    if (!GOOGLE_CLIENT_ID) {
      return res.status(500).json({ message: "Google client id missing" });
    }

    if (!JWT_SECRET) {
      return res.status(500).json({ message: "JWT secret not configured" });
    }

    const ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email) {
      return res.status(400).json({ message: "Invalid Google token" });
    }

    const email = payload.email.toLowerCase();
    const allowlist = parseAllowlist();

    if (allowlist.length && !allowlist.includes(email)) {
      return res.status(403).json({ message: "Admin access denied" });
    }

    const [existingAdmin] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.email, email));

    let admin = existingAdmin;

    if (!admin) {
      if (!allowlist.length) {
        return res
          .status(403)
          .json({ message: "Admin access not provisioned" });
      }

      const [created] = await db
        .insert(adminUsers)
        .values({
          email,
          displayName: payload.name || email.split("@")[0],
          status: "active",
          lastLoginAt: new Date(),
        })
        .returning();
      admin = created;
    } else {
      if (admin.status !== "active") {
        return res.status(403).json({ message: "Admin access disabled" });
      }

      await db
        .update(adminUsers)
        .set({
          lastLoginAt: new Date(),
          displayName: payload.name || admin.displayName,
        })
        .where(eq(adminUsers.id, admin.id));
    }

    const token = jwt.sign(
      { adminId: admin.id, email: admin.email, role: "admin" },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    return res.json({
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.displayName || payload.name || admin.email,
      },
    });
  } catch (err: any) {
    console.error("Admin sign-in error:", err);
    return res.status(500).json({ message: err.message || "Login failed" });
  }
};

export const getAdminOverview = async (req, res) => {
  try {
    const data = await adminService.getAdminOverview();
    return res.json(data);
  } catch (err: any) {
    console.error("Get admin overview error:", err);
    return res.status(500).json({ message: err.message });
  }
};

export const listUsers = async (req, res) => {
  try {
    const data = await adminService.listUsers({
      query: req.query.query,
      status: req.query.status,
      page: req.query.page,
      pageSize: req.query.pageSize,
    });
    return res.json(data);
  } catch (err: any) {
    console.error("List users error:", err);
    return res.status(500).json({ message: err.message });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { status, durationDays, reason } = req.body || {};
    const authUserId = req.params.authUserId;

    const user = await adminService.updateUserStatus({
      authUserId,
      status,
      durationDays,
    });

    const adminId = (req as AdminAuthRequest).admin?.id;
    if (adminId) {
      await adminService.createAuditLog(
        adminId,
        "user.status.update",
        "auth_user",
        authUserId,
        "success",
        { status, durationDays, reason },
      );
    }

    return res.json({ success: true, user });
  } catch (err: any) {
    console.error("Update user status error:", err);
    return res.status(500).json({ message: err.message });
  }
};

export const listCreators = async (req, res) => {
  try {
    const data = await adminService.listCreators({
      query: req.query.query,
      status: req.query.status,
      page: req.query.page,
      pageSize: req.query.pageSize,
    });
    return res.json(data);
  } catch (err: any) {
    console.error("List creators error:", err);
    return res.status(500).json({ message: err.message });
  }
};

export const updateCreatorVerification = async (req, res) => {
  try {
    const { status, note } = req.body || {};
    const creatorId = req.params.creatorId;

    const creator = await adminService.updateCreatorVerification({
      creatorId,
      status,
    });

    const adminId = (req as AdminAuthRequest).admin?.id;
    if (adminId) {
      await adminService.createAuditLog(
        adminId,
        "creator.verify",
        "creator_profile",
        creatorId,
        "success",
        { status, note },
      );
    }

    return res.json({ success: true, creator });
  } catch (err: any) {
    console.error("Update creator verification error:", err);
    return res.status(500).json({ message: err.message });
  }
};

export const listComics = async (req, res) => {
  try {
    const data = await adminService.listComics({
      query: req.query.query,
      status: req.query.status,
      page: req.query.page,
      pageSize: req.query.pageSize,
    });
    return res.json(data);
  } catch (err: any) {
    console.error("List comics error:", err);
    return res.status(500).json({ message: err.message });
  }
};

export const updateComicStatus = async (req, res) => {
  try {
    const { status, note } = req.body || {};
    const comicId = req.params.comicId;

    const comic = await adminService.updateComicStatus({ comicId, status });

    const adminId = (req as AdminAuthRequest).admin?.id;
    if (adminId) {
      await adminService.createAuditLog(
        adminId,
        "comic.moderate",
        "comics",
        comicId,
        "success",
        { status, note },
      );
    }

    return res.json({ success: true, comic });
  } catch (err: any) {
    console.error("Update comic status error:", err);
    return res.status(500).json({ message: err.message });
  }
};

export const getMarketplaceSummary = async (req, res) => {
  try {
    const data = await adminService.getMarketplaceSummary();
    return res.json(data);
  } catch (err: any) {
    console.error("Marketplace summary error:", err);
    return res.status(500).json({ message: err.message });
  }
};

export const getFinanceSummary = async (req, res) => {
  try {
    const data = await adminService.getFinanceSummary();
    return res.json(data);
  } catch (err: any) {
    console.error("Finance summary error:", err);
    return res.status(500).json({ message: err.message });
  }
};

export const listPayouts = async (req, res) => {
  try {
    const data = await adminService.listPayouts({
      status: req.query.status,
      page: req.query.page,
      pageSize: req.query.pageSize,
    });
    return res.json(data);
  } catch (err: any) {
    console.error("List payouts error:", err);
    return res.status(500).json({ message: err.message });
  }
};

export const processPayout = async (req, res) => {
  try {
    const payoutId = req.params.id;
    const { status } = req.body || {};

    const payout = await adminService.processPayout({ payoutId, status });

    const adminId = (req as AdminAuthRequest).admin?.id;
    if (adminId) {
      await adminService.createAuditLog(
        adminId,
        "payout.process",
        "creator_transactions",
        payoutId,
        "success",
        { status },
      );
    }

    return res.json({ success: true, payout });
  } catch (err: any) {
    console.error("Process payout error:", err);
    return res.status(500).json({ message: err.message });
  }
};

export const listAuditLogs = async (req, res) => {
  try {
    const data = await adminService.listAuditLogs({
      page: req.query.page,
      pageSize: req.query.pageSize,
    });
    return res.json(data);
  } catch (err: any) {
    console.error("List audit logs error:", err);
    return res.status(500).json({ message: err.message });
  }
};