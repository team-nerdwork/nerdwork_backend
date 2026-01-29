import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "../config/db";
import { creatorProfile } from "../model/profile";
import { getUserJwtFromToken } from "./library.controller";
import {
  chapterLikes,
  chapters,
  chapterViews,
  comics,
  comicSubscribers,
  creatorTransactions,
} from "../model/schema";

export const getCreatorAnalytics = async (req, res) => {
  try {
    const userId = getUserJwtFromToken(req);

    const [creator] = await db
      .select()
      .from(creatorProfile)
      .where(eq(creatorProfile.userId, userId));

    if (!creator) return res.status(404).json({ message: "creator not found" });

    const creatorComics = await db
      .select({ id: comics.id, title: comics.title })
      .from(comics)
      .where(eq(comics.creatorId, creator.id));

    const comicIds = creatorComics.map((c) => c.id);

    // Total Reads
    const [{ totalReads }] = await db
      .select({
        totalReads: sql<number>`COUNT(*)`,
      })
      .from(chapterViews)
      .innerJoin(chapters, eq(chapterViews.chapterId, chapters.id))
      .where(inArray(chapters.comicId, comicIds));

    // Active Readers
    const [{ activeReaders }] = await db
      .select({
        activeReaders: sql<number>`COUNT(DISTINCT ${chapterViews.readerId})`,
      })
      .from(chapterViews)
      .innerJoin(chapters, eq(chapterViews.chapterId, chapters.id))
      .where(inArray(chapters.comicId, comicIds));

    // Total Likes
    const [{ totalLikes }] = await db
      .select({
        totalLikes: sql<number>`COUNT(*)`,
      })
      .from(chapterLikes)
      .innerJoin(chapters, eq(chapterLikes.chapterId, chapters.id))
      .where(inArray(chapters.comicId, comicIds));

    // Total Revenue
    const [{ totalRevenue }] = await db
      .select({
        totalRevenue: sql<number>`SUM(${creatorTransactions.nwtAmount})`,
      })
      .from(creatorTransactions)
      .where(
        and(
          eq(creatorTransactions.creatorId, creator.id),
          eq(creatorTransactions.transactionType, "earning"),
        ),
      );

    // Top Comic
    const topComic = await db
      .select({
        comicId: chapters.comicId,
        reads: sql<number>`COUNT(*)`,
      })
      .from(chapterViews)
      .innerJoin(chapters, eq(chapterViews.chapterId, chapters.id))
      .where(inArray(chapters.comicId, comicIds))
      .groupBy(chapters.comicId)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(1);

    let topComicData = null;

    if (topComic.length) {
      const comic = creatorComics.find((c) => c.id === topComic[0].comicId);
      topComicData = {
        id: comic?.id,
        title: comic?.title,
        reads: topComic[0].reads,
      };
    }

    // Reads Over Time
    const readsChart = await db
      .select({
        date: sql<string>`DATE(${chapterViews.viewedAt})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(chapterViews)
      .innerJoin(chapters, eq(chapterViews.chapterId, chapters.id))
      .where(inArray(chapters.comicId, comicIds))
      .groupBy(sql`DATE(${chapterViews.viewedAt})`)
      .orderBy(sql`DATE(${chapterViews.viewedAt}) ASC`);

    // Likes Over Time
    const likesChart = await db
      .select({
        date: sql<string>`DATE(${chapterLikes.viewedAt})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(chapterLikes)
      .innerJoin(chapters, eq(chapterLikes.chapterId, chapters.id))
      .where(inArray(chapters.comicId, comicIds))
      .groupBy(sql`DATE(${chapterLikes.viewedAt})`)
      .orderBy(sql`DATE(${chapterLikes.viewedAt})`);

    //   subscribers chart
    const subscribersChart = await db
      .select({
        date: sql<string>`DATE(${comicSubscribers.subscribedAt})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(comicSubscribers)
      .where(inArray(comicSubscribers.comicId, comicIds))
      .groupBy(sql`DATE(${comicSubscribers.subscribedAt})`)
      .orderBy(sql`DATE(${comicSubscribers.subscribedAt})`);

    // Revenue Over Time
    const revenueChart = await db
      .select({
        date: sql<string>`DATE(${creatorTransactions.createdAt})`,
        amount: sql<number>`SUM(${creatorTransactions.nwtAmount})`,
      })
      .from(creatorTransactions)
      .where(
        and(
          eq(creatorTransactions.creatorId, creator.id),
          eq(creatorTransactions.transactionType, "earning"),
        ),
      )
      .groupBy(sql`DATE(${creatorTransactions.createdAt})`)
      .orderBy(sql`DATE(${creatorTransactions.createdAt}) ASC`);

    return res.json({
      success: true,
      summary: {
        totalReads,
        activeReaders,
        totalLikes,
        totalRevenue: Number(totalRevenue) || 0,
        topComic: topComicData,
      },
      chart: {
        reads: readsChart,
        likes: likesChart,
        subscribers: subscribersChart,
        revenue: revenueChart,
      },
    });
  } catch (err: any) {
    console.error("GetAnalytics Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
