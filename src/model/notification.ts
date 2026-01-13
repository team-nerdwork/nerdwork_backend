import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { readerProfile } from "./profile";
import { comics } from "./comic";
import { chapters } from "./chapter";

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),

  readerId: uuid("reader_id")
    .notNull()
    .references(() => readerProfile.id, { onDelete: "cascade" }),

  type: text("type").notNull(), // e.g. 'NEW_CHAPTER'

  comicId: uuid("comic_id").references(() => comics.id),

  chapterId: uuid("chapter_id").references(() => chapters.id),

  title: text("title").notNull(),
  body: text("body").notNull(),

  isRead: boolean("is_read").default(false).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const deviceTokens = pgTable("device_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),

  readerId: uuid("reader_id")
    .notNull()
    .references(() => readerProfile.id, { onDelete: "cascade" }),

  token: text("token").notNull(), // FCM / APNs token
  platform: text("platform").notNull(), // 'android' | 'ios'

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
