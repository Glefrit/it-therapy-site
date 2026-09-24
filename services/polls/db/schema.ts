import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const adminSessions = sqliteTable("admin_sessions", {
  tokenHash: text("token_hash").primaryKey(),
  expiresAt: integer("expires_at").notNull(),
});

export const adminLoginLimits = sqliteTable("admin_login_limits", {
  bucket: text("bucket").primaryKey(),
  attempts: integer("attempts").notNull(),
  expiresAt: integer("expires_at").notNull(),
});

export const polls = sqliteTable("polls", {
  id: text("id").primaryKey(),
  question: text("question").notNull(),
  createdAt: integer("created_at").notNull(),
}, (table) => [index("idx_polls_created_at").on(table.createdAt)]);

export const responses = sqliteTable("responses", {
  id: text("id").primaryKey(),
  pollId: text("poll_id").notNull().references(() => polls.id, { onDelete: "cascade" }),
  answer: text("answer").notNull(),
  createdAt: integer("created_at").notNull(),
}, (table) => [index("idx_responses_poll_created").on(table.pollId, table.createdAt)]);
