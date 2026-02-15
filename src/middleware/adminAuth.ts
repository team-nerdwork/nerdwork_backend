import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "../config/db";
import { adminUsers } from "../model/admin";
import { JWT_SECRET } from "../config/envs";

export interface AdminAuthRequest extends Request {
  admin?: {
    id: string;
    email: string;
    displayName?: string | null;
    role: "admin";
  };
}

export const requireAdmin = async (
  req: AdminAuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing authorization token" });
    }

    if (!JWT_SECRET) {
      return res.status(500).json({ message: "JWT secret not configured" });
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);

    if (!decoded?.adminId || decoded?.role !== "admin") {
      return res.status(403).json({ message: "Invalid admin token" });
    }

    const [admin] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.id, decoded.adminId));

    if (!admin || admin.status !== "active") {
      return res.status(403).json({ message: "Admin access denied" });
    }

    req.admin = {
      id: admin.id,
      email: admin.email,
      displayName: admin.displayName,
      role: "admin",
    };

    return next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};