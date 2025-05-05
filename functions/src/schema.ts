import { pgTable, serial, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';

export const pastes = pgTable('pastes', {
  id: serial('id').primaryKey(),
  pasteId: text('paste_id').notNull().unique(),
  title: text('title'),
  content: text('content').notNull(),
  language: text('language'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  views: integer('views').default(0).notNull(),
  expiresAt: timestamp('expires_at'),
  authorName: text('author_name'),
  tags: text('tags').array(),
  isFile: boolean('is_file'),
  fileName: text('file_name'),
  fileType: text('file_type')
});

export type Paste = typeof pastes.$inferSelect;
export type InsertPaste = typeof pastes.$inferInsert; 