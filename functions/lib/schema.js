"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pastes = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.pastes = (0, pg_core_1.pgTable)('pastes', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    pasteId: (0, pg_core_1.text)('paste_id').notNull().unique(),
    title: (0, pg_core_1.text)('title'),
    content: (0, pg_core_1.text)('content').notNull(),
    language: (0, pg_core_1.text)('language'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    views: (0, pg_core_1.integer)('views').default(0).notNull(),
    expiresAt: (0, pg_core_1.timestamp)('expires_at'),
    authorName: (0, pg_core_1.text)('author_name'),
    tags: (0, pg_core_1.text)('tags').array(),
    isFile: (0, pg_core_1.boolean)('is_file'),
    fileName: (0, pg_core_1.text)('file_name'),
    fileType: (0, pg_core_1.text)('file_type')
});
//# sourceMappingURL=schema.js.map