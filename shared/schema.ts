import { pgTable, text, serial, integer, timestamp, array } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const pastes = pgTable("pastes", {
  id: serial("id").primaryKey(),
  pasteId: text("paste_id").notNull().unique(),
  title: text("title").default("Untitled"),
  content: text("content").notNull(),
  language: text("language").default("plaintext"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  views: integer("views").default(0).notNull(),
  expiresAt: timestamp("expires_at"),
  authorName: text("author_name").default("Anonymous"),
  tags: text("tags").array(),
});

export const insertPasteSchema = createInsertSchema(pastes).omit({
  id: true,
  views: true,
  createdAt: true,
  pasteId: true,
});

export type InsertPaste = z.infer<typeof insertPasteSchema>;
export type Paste = typeof pastes.$inferSelect;

export const supportedLanguages = [
  { name: "Plain Text", value: "plaintext" },
  { name: "JavaScript", value: "javascript" },
  { name: "TypeScript", value: "typescript" },
  { name: "HTML", value: "html" },
  { name: "CSS", value: "css" },
  { name: "Python", value: "python" },
  { name: "Java", value: "java" },
  { name: "C", value: "c" },
  { name: "C++", value: "cpp" },
  { name: "C#", value: "csharp" },
  { name: "Go", value: "go" },
  { name: "Rust", value: "rust" },
  { name: "PHP", value: "php" },
  { name: "Ruby", value: "ruby" },
  { name: "Bash", value: "bash" },
  { name: "SQL", value: "sql" },
];

export const expirationOptions = [
  { name: "Never", value: null },
  { name: "10 Minutes", value: 10 },
  { name: "1 Hour", value: 60 },
  { name: "1 Day", value: 1440 },
  { name: "1 Week", value: 10080 },
  { name: "1 Month", value: 43200 },
];
