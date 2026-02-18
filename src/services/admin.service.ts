import { and, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { db } from "../config/db";
import {
  authUsers,
  comics,
  creatorProfile,
  creatorTransactions,
  nftOrders,
  userProfiles,
  userTransactions,
  userWallets,
  chapters,
  chapterViews,
} from "../model/schema";
import { adminAuditLogs } from "../model/admin";
import { nfts } from "../model/nft/nft.schema";

const toNumber = (value: any) =>
  value === null || value === undefined ? 0 : Number(value);

const getLastMonths = (count: number) => {
  const months = [] as { key: string; label: string }[];
  const now = new Date();
  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = date.toISOString().slice(0, 7);
    const label = date.toLocaleString("en-US", { month: "short" });
    months.push({ key, label });
  }
  return months;
};

const getLastDays = (count: number) => {
  const days = [] as { key: string; label: string }[];
  const now = new Date();
  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    const label = date.toLocaleString("en-US", { weekday: "short" });
    days.push({ key, label });
  }
  return days;
};

const normalizePagination = (
  page?: number | string,
  pageSize?: number | string,
) => {
  const safePage = Math.max(Number(page) || 1, 1);
  const safePageSize = Math.min(Math.max(Number(pageSize) || 20, 1), 100);
  const offset = (safePage - 1) * safePageSize;
  return { page: safePage, pageSize: safePageSize, offset };
};

export async function getAdminOverview() {
  const [{ totalUsers = 0 }] = await db
    .select({ totalUsers: sql<number>`COUNT(*)` })
    .from(authUsers);

  const [{ totalCreators = 0 }] = await db
    .select({ totalCreators: sql<number>`COUNT(*)` })
    .from(creatorProfile);

  const [{ monthlyRevenue = 0 }] = await db
    .select({
      monthlyRevenue: sql<number>`COALESCE(SUM(${creatorTransactions.platformFee}), 0)`,
    })
    .from(creatorTransactions)
    .where(sql`${creatorTransactions.createdAt} >= now() - interval '30 days'`);

  const [{ nftSales7d = 0 }] = await db
    .select({ nftSales7d: sql<number>`COUNT(*)` })
    .from(nftOrders)
    .where(sql`${nftOrders.createdAt} >= now() - interval '7 days'`);

  const months = getLastMonths(6);

  const revenueRows = await db
    .select({
      month: sql<string>`to_char(date_trunc('month', ${creatorTransactions.createdAt}), 'YYYY-MM')`,
      revenue: sql<number>`COALESCE(SUM(${creatorTransactions.platformFee}), 0)`,
    })
    .from(creatorTransactions)
    .where(sql`${creatorTransactions.createdAt} >= now() - interval '6 months'`)
    .groupBy(sql`date_trunc('month', ${creatorTransactions.createdAt})`)
    .orderBy(sql`date_trunc('month', ${creatorTransactions.createdAt})`);

  const userRows = await db
    .select({
      month: sql<string>`to_char(date_trunc('month', ${authUsers.createdAt}), 'YYYY-MM')`,
      users: sql<number>`COUNT(*)`,
    })
    .from(authUsers)
    .where(sql`${authUsers.createdAt} >= now() - interval '6 months'`)
    .groupBy(sql`date_trunc('month', ${authUsers.createdAt})`)
    .orderBy(sql`date_trunc('month', ${authUsers.createdAt})`);

  const revenueMap = new Map(
    revenueRows.map((row) => [row.month, toNumber(row.revenue)]),
  );
  const userMap = new Map(
    userRows.map((row) => [row.month, Number(row.users)]),
  );

  const revenueAndUsers = months.map((month) => ({
    month: month.label,
    revenue: revenueMap.get(month.key) || 0,
    users: userMap.get(month.key) || 0,
  }));

  const days = getLastDays(7);

  const nftSalesRows = await db
    .select({
      day: sql<string>`to_char(date_trunc('day', ${nftOrders.createdAt}), 'YYYY-MM-DD')`,
      sales: sql<number>`COUNT(*)`,
    })
    .from(nftOrders)
    .where(sql`${nftOrders.createdAt} >= now() - interval '7 days'`)
    .groupBy(sql`date_trunc('day', ${nftOrders.createdAt})`)
    .orderBy(sql`date_trunc('day', ${nftOrders.createdAt})`);

  const nftSalesMap = new Map(
    nftSalesRows.map((row) => [row.day, Number(row.sales)]),
  );

  const nftSales = days.map((day) => ({
    day: day.label,
    sales: nftSalesMap.get(day.key) || 0,
  }));

  const topCreatorsRows = await db
    .select({
      id: creatorProfile.id,
      name: creatorProfile.creatorName,
      revenue: sql<number>`COALESCE(SUM(${creatorTransactions.nwtAmount}), 0)`,
    })
    .from(creatorProfile)
    .leftJoin(
      creatorTransactions,
      eq(creatorTransactions.creatorId, creatorProfile.id),
    )
    .groupBy(creatorProfile.id)
    .orderBy(desc(sql`COALESCE(SUM(${creatorTransactions.nwtAmount}), 0)`))
    .limit(5);

  const nftCounts = await db
    .select({
      creatorId: creatorProfile.id,
      nfts: sql<number>`COALESCE(COUNT(${nfts.id}), 0)`,
    })
    .from(creatorProfile)
    .leftJoin(authUsers, eq(creatorProfile.userId, authUsers.id))
    .leftJoin(userProfiles, eq(userProfiles.authUserId, authUsers.id))
    .leftJoin(userWallets, eq(userWallets.userProfileId, userProfiles.id))
    .leftJoin(nfts, eq(nfts.creatorId, userWallets.id))
    .groupBy(creatorProfile.id);

  const nftCountMap = new Map(
    nftCounts.map((row) => [row.creatorId, Number(row.nfts)]),
  );

  return {
    summary: {
      totalUsers: Number(totalUsers),
      totalCreators: Number(totalCreators),
      monthlyRevenue: toNumber(monthlyRevenue),
      nftSales7d: Number(nftSales7d),
    },
    charts: {
      revenueAndUsers,
      nftSales,
    },
    topCreators: topCreatorsRows.map((creator) => ({
      id: creator.id,
      name: creator.name,
      revenue: toNumber(creator.revenue),
      nfts: nftCountMap.get(creator.id) || 0,
    })),
    systemStatus: [
      { name: "API Services", status: "operational" },
      { name: "Database", status: "operational" },
      { name: "Blockchain", status: "operational" },
      { name: "IPFS Storage", status: "degraded" },
      { name: "CDN", status: "operational" },
    ],
  };
}

export async function listUsers({ query, status, page, pageSize }) {
  const {
    page: safePage,
    pageSize: safePageSize,
    offset,
  } = normalizePagination(page, pageSize);

  const conditions = [] as any[];
  if (query) {
    const q = `%${query}%`;
    conditions.push(
      or(
        ilike(authUsers.email, q),
        ilike(authUsers.username, q),
        ilike(userProfiles.displayName, q),
        ilike(userProfiles.firstName, q),
        ilike(userProfiles.lastName, q),
      ),
    );
  }

  if (status === "suspended") {
    conditions.push(sql`${authUsers.lockedUntil} > now()`);
  }

  if (status === "inactive") {
    conditions.push(
      sql`${authUsers.isActive} = false AND (${authUsers.lockedUntil} IS NULL OR ${authUsers.lockedUntil} <= now())`,
    );
  }

  if (status === "active") {
    conditions.push(
      sql`${authUsers.isActive} = true AND (${authUsers.lockedUntil} IS NULL OR ${authUsers.lockedUntil} <= now())`,
    );
  }

  const whereClause = conditions.length ? and(...conditions) : undefined;

  const rows = await db
    .select({
      id: authUsers.id,
      email: authUsers.email,
      username: authUsers.username,
      createdAt: authUsers.createdAt,
      isActive: authUsers.isActive,
      lockedUntil: authUsers.lockedUntil,
      displayName: userProfiles.displayName,
      firstName: userProfiles.firstName,
      lastName: userProfiles.lastName,
      nftsOwned: sql<number>`COALESCE((
        SELECT COUNT(*) FROM nfts n
        JOIN user_wallets uw ON n.user_wallet_id = uw.id
        WHERE uw.user_profile_id = ${userProfiles.id}
      ), 0)`,
      spent: sql<number>`COALESCE((
        SELECT SUM(ut.usd_amount) FROM user_transactions ut
        JOIN reader_profile rp ON ut.reader_id = rp.id
        WHERE rp.user_id = ${authUsers.id} AND ut.transaction_type = 'spend'
      ), 0)`,
    })
    .from(authUsers)
    .leftJoin(userProfiles, eq(userProfiles.authUserId, authUsers.id))
    .where(whereClause)
    .orderBy(desc(authUsers.createdAt))
    .limit(safePageSize)
    .offset(offset);

  const countRows = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(authUsers)
    .leftJoin(userProfiles, eq(userProfiles.authUserId, authUsers.id))
    .where(whereClause);

  const [{ count = 0 }] = countRows;

  const now = new Date();

  const data = rows.map((row) => {
    const computedStatus =
      row.lockedUntil && row.lockedUntil > now
        ? "suspended"
        : row.isActive
          ? "active"
          : "inactive";

    const name =
      row.displayName ||
      [row.firstName, row.lastName].filter(Boolean).join(" ") ||
      row.email;

    return {
      id: row.id,
      name,
      email: row.email,
      status: computedStatus,
      joined: row.createdAt,
      nftsOwned: toNumber(row.nftsOwned),
      spent: toNumber(row.spent),
    };
  });

  return {
    data,
    pagination: {
      page: safePage,
      pageSize: safePageSize,
      total: Number(count),
    },
  };
}

export async function updateUserStatus({
  authUserId,
  status,
  durationDays = 30,
}) {
  if (!authUserId) {
    throw new Error("User id is required");
  }

  const updates: any = {};

  if (status === "suspended") {
    const lockedUntil = new Date();
    lockedUntil.setDate(lockedUntil.getDate() + Number(durationDays || 30));
    updates.lockedUntil = lockedUntil;
    updates.isActive = true;
  } else if (status === "inactive" || status === "banned") {
    updates.isActive = false;
    updates.lockedUntil = null;
  } else if (status === "active") {
    updates.isActive = true;
    updates.lockedUntil = null;
  } else {
    throw new Error("Invalid status value");
  }

  const [updated] = await db
    .update(authUsers)
    .set(updates)
    .where(eq(authUsers.id, authUserId))
    .returning();

  return updated;
}

export async function listCreators({ query, status, page, pageSize }) {
  const {
    page: safePage,
    pageSize: safePageSize,
    offset,
  } = normalizePagination(page, pageSize);

  const conditions = [] as any[];
  if (query) {
    const q = `%${query}%`;
    conditions.push(
      or(
        ilike(creatorProfile.creatorName, q),
        ilike(creatorProfile.fullName, q),
        ilike(authUsers.email, q),
      ),
    );
  }

  if (status) {
    conditions.push(eq(creatorProfile.verificationStatus, status));
  }

  const whereClause = conditions.length ? and(...conditions) : undefined;

  const rows = await db
    .select({
      id: creatorProfile.id,
      creatorName: creatorProfile.creatorName,
      fullName: creatorProfile.fullName,
      email: authUsers.email,
      verificationStatus: creatorProfile.verificationStatus,
      createdAt: creatorProfile.createdAt,
      works: sql<number>`COALESCE((SELECT COUNT(*) FROM comics c WHERE c.creator_id = ${creatorProfile.id}), 0)`,
      revenue: sql<number>`COALESCE((SELECT SUM(ct.nwt_amount) FROM creator_transactions ct WHERE ct.creator_id = ${creatorProfile.id}), 0)`,
    })
    .from(creatorProfile)
    .leftJoin(authUsers, eq(creatorProfile.userId, authUsers.id))
    .where(whereClause)
    .orderBy(desc(creatorProfile.createdAt))
    .limit(safePageSize)
    .offset(offset);

  const countQuery = db
    .select({ count: sql<number>`COUNT(*)` })
    .from(creatorProfile)
    .leftJoin(authUsers, eq(creatorProfile.userId, authUsers.id))
    .where(whereClause);

  const [{ count = 0 }] = await countQuery;

  const data = rows.map((row) => ({
    id: row.id,
    name: row.creatorName || row.fullName,
    email: row.email,
    status: row.verificationStatus,
    works: Number(row.works),
    revenue: toNumber(row.revenue),
    rating: null,
  }));

  return {
    data,
    pagination: {
      page: safePage,
      pageSize: safePageSize,
      total: Number(count),
    },
  };
}

export async function updateCreatorVerification({ creatorId, status }) {
  if (!creatorId) {
    throw new Error("Creator id is required");
  }

  if (!status || !["pending", "verified", "rejected"].includes(status)) {
    throw new Error("Invalid verification status");
  }

  const updates: any = {
    verificationStatus: status,
    verifiedAt: status === "verified" ? new Date() : null,
  };

  const [updated] = await db
    .update(creatorProfile)
    .set(updates)
    .where(eq(creatorProfile.id, creatorId))
    .returning();

  return updated;
}

export async function listComics({ query, status, page, pageSize }) {
  const {
    page: safePage,
    pageSize: safePageSize,
    offset,
  } = normalizePagination(page, pageSize);

  const conditions = [] as any[];
  if (query) {
    const q = `%${query}%`;
    conditions.push(ilike(comics.title, q));
  }

  if (status) {
    conditions.push(eq(comics.comicStatus, status));
  }

  const whereClause = conditions.length ? and(...conditions) : undefined;

  const rows = await db
    .select({
      id: comics.id,
      title: comics.title,
      slug: comics.slug,
      creatorId: creatorProfile.id,
      creatorName: creatorProfile.creatorName,
      comicStatus: comics.comicStatus,
      createdAt: comics.createdAt,
      noOfChapters: comics.noOfChapters,
      genre: comics.genre,
      views: sql<number>`COALESCE((
        SELECT COUNT(*) FROM chapter_views cv
        JOIN chapters ch ON cv.chapter_id = ch.id
        WHERE ch.comic_id = ${comics.id}
      ), 0)`,
      sales: sql<number>`COALESCE((
        SELECT COUNT(*) FROM creator_transactions ct
        WHERE ct.content_id = ${comics.id} AND ct.transaction_type = 'earning'
      ), 0)`,
      revenue: sql<number>`COALESCE((
        SELECT SUM(ct.nwt_amount) FROM creator_transactions ct
        WHERE ct.content_id = ${comics.id} AND ct.transaction_type = 'earning'
      ), 0)`,
    })
    .from(comics)
    .leftJoin(creatorProfile, eq(comics.creatorId, creatorProfile.id))
    .where(whereClause)
    .orderBy(desc(comics.createdAt))
    .limit(safePageSize)
    .offset(offset);

  const [{ count = 0 }] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(comics)
    .leftJoin(creatorProfile, eq(comics.creatorId, creatorProfile.id))
    .where(whereClause);

  const data = rows.map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    creator: row.creatorName,
    status: row.comicStatus,
    submitted: row.createdAt,
    chapters: row.noOfChapters,
    genre: row.genre,
    views: Number(row.views),
    sales: Number(row.sales),
    revenue: toNumber(row.revenue),
  }));

  return {
    data,
    pagination: {
      page: safePage,
      pageSize: safePageSize,
      total: Number(count),
    },
  };
}

export async function updateComicStatus({ comicId, status }) {
  if (!comicId) {
    throw new Error("Comic id is required");
  }

  if (!status) {
    throw new Error("Status is required");
  }

  const [updated] = await db
    .update(comics)
    .set({ comicStatus: status })
    .where(eq(comics.id, comicId))
    .returning();

  return updated;
}

export async function getMarketplaceSummary() {
  const [{ totalNfts = 0 }] = await db
    .select({ totalNfts: sql<number>`COUNT(*)` })
    .from(nfts);

  const [{ sales7d = 0, volume7d = 0 }] = await db
    .select({
      sales7d: sql<number>`COUNT(*)`,
      volume7d: sql<number>`COALESCE(SUM(${nftOrders.price}), 0)`,
    })
    .from(nftOrders)
    .where(sql`${nftOrders.createdAt} >= now() - interval '7 days'`);

  return {
    totalNftsMinted: Number(totalNfts),
    sales7d: Number(sales7d),
    volume7d: toNumber(volume7d),
  };
}

export async function getFinanceSummary() {
  const [{ platformRevenue = 0 }] = await db
    .select({
      platformRevenue: sql<number>`COALESCE(SUM(${creatorTransactions.platformFee}), 0)`,
    })
    .from(creatorTransactions);

  const [{ pendingPayouts = 0 }] = await db
    .select({
      pendingPayouts: sql<number>`COALESCE(SUM(${creatorTransactions.nwtAmount}), 0)`,
    })
    .from(creatorTransactions)
    .where(
      and(
        eq(creatorTransactions.transactionType, "withdrawal"),
        eq(creatorTransactions.status, "pending"),
      ),
    );

  const [{ completedPayouts = 0 }] = await db
    .select({
      completedPayouts: sql<number>`COALESCE(SUM(${creatorTransactions.nwtAmount}), 0)`,
    })
    .from(creatorTransactions)
    .where(
      and(
        eq(creatorTransactions.transactionType, "withdrawal"),
        eq(creatorTransactions.status, "completed"),
      ),
    );

  return {
    platformRevenue: toNumber(platformRevenue),
    pendingPayouts: toNumber(pendingPayouts),
    completedPayouts: toNumber(completedPayouts),
    platformFeePercent: 12.5,
  };
}

export async function listPayouts({ status, page, pageSize }) {
  const {
    page: safePage,
    pageSize: safePageSize,
    offset,
  } = normalizePagination(page, pageSize);

  const conditions = [
    eq(creatorTransactions.transactionType, "withdrawal"),
  ] as any[];

  if (status) {
    conditions.push(eq(creatorTransactions.status, status));
  }

  const whereClause = conditions.length ? and(...conditions) : undefined;

  const rows = await db
    .select({
      id: creatorTransactions.id,
      creatorName: creatorProfile.creatorName,
      amount: creatorTransactions.nwtAmount,
      status: creatorTransactions.status,
      createdAt: creatorTransactions.createdAt,
    })
    .from(creatorTransactions)
    .leftJoin(
      creatorProfile,
      eq(creatorTransactions.creatorId, creatorProfile.id),
    )
    .where(whereClause)
    .orderBy(desc(creatorTransactions.createdAt))
    .limit(safePageSize)
    .offset(offset);

  const countQuery = db
    .select({ count: sql<number>`COUNT(*)` })
    .from(creatorTransactions)
    .leftJoin(
      creatorProfile,
      eq(creatorTransactions.creatorId, creatorProfile.id),
    )
    .where(whereClause || sql`1=1`);

  const [{ count = 0 }] = await countQuery;

  const data = rows.map((row) => ({
    id: row.id,
    creator: row.creatorName,
    amount: toNumber(row.amount),
    status: row.status,
    date: row.createdAt,
  }));

  return {
    data,
    pagination: {
      page: safePage,
      pageSize: safePageSize,
      total: Number(count),
    },
  };
}

export async function processPayout({ payoutId, status }) {
  if (!payoutId) {
    throw new Error("Payout id is required");
  }

  const nextStatus = status || "completed";

  const [updated] = await db
    .update(creatorTransactions)
    .set({
      status: nextStatus,
      processedAt: new Date(),
    })
    .where(eq(creatorTransactions.id, payoutId))
    .returning();

  return updated;
}

export async function listAuditLogs({ page, pageSize }) {
  const {
    page: safePage,
    pageSize: safePageSize,
    offset,
  } = normalizePagination(page, pageSize);

  const rows = await db
    .select({
      id: adminAuditLogs.id,
      action: adminAuditLogs.action,
      status: adminAuditLogs.status,
      targetType: adminAuditLogs.targetType,
      targetId: adminAuditLogs.targetId,
      metadata: adminAuditLogs.metadata,
      createdAt: adminAuditLogs.createdAt,
      adminId: adminAuditLogs.adminId,
    })
    .from(adminAuditLogs)
    .orderBy(desc(adminAuditLogs.createdAt))
    .limit(safePageSize)
    .offset(offset);

  const [{ count = 0 }] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(adminAuditLogs);

  return {
    data: rows,
    pagination: {
      page: safePage,
      pageSize: safePageSize,
      total: Number(count),
    },
  };
}

export async function createAuditLog(
  adminId: string,
  action: string,
  targetType: string,
  targetId: string,
  status: string,
  metadata?: any,
) {
  if (!adminId) {
    return;
  }

  await db.insert(adminAuditLogs).values({
    adminId,
    action,
    targetType,
    targetId,
    status,
    metadata,
  });
}
