"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expirationOptions = exports.supportedLanguages = exports.insertPasteSchema = exports.pastes = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
exports.pastes = (0, pg_core_1.pgTable)("pastes", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    pasteId: (0, pg_core_1.text)("paste_id").notNull().unique(),
    title: (0, pg_core_1.text)("title").default("Untitled"),
    content: (0, pg_core_1.text)("content").notNull(),
    language: (0, pg_core_1.text)("language").default("plaintext"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    views: (0, pg_core_1.integer)("views").default(0).notNull(),
    expiresAt: (0, pg_core_1.timestamp)("expires_at"),
    authorName: (0, pg_core_1.text)("author_name").default("Anonymous"),
    tags: (0, pg_core_1.text)("tags").array(),
    isFile: (0, pg_core_1.boolean)("is_file").default(false),
    fileName: (0, pg_core_1.text)("file_name"),
    fileType: (0, pg_core_1.text)("file_type"),
});
exports.insertPasteSchema = (0, drizzle_zod_1.createInsertSchema)(exports.pastes).omit({
    id: true,
    views: true,
    createdAt: true,
    pasteId: true,
});
exports.supportedLanguages = [
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
    { name: "XML", value: "xml" },
];
exports.expirationOptions = [
    { name: "Never", value: null },
    { name: "10 Minutes", value: 10 },
    { name: "1 Hour", value: 60 },
    { name: "1 Day", value: 1440 },
    { name: "1 Week", value: 10080 },
    { name: "1 Month", value: 43200 },
];
