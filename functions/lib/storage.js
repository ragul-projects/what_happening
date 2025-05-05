"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.DatabaseStorage = void 0;
const schema_1 = require("./schema");
const db_1 = require("./db");
const drizzle_orm_1 = require("drizzle-orm");
class DatabaseStorage {
    async createPaste(pasteData) {
        try {
            const inserted = await db_1.db.insert(schema_1.pastes).values({
                pasteId: pasteData.pasteId,
                title: pasteData.title || "Untitled",
                content: pasteData.content,
                language: pasteData.language || "plaintext",
                expiresAt: pasteData.expiresAt,
                authorName: pasteData.authorName || "Anonymous",
                isFile: pasteData.isFile || false,
                fileName: pasteData.fileName || null,
                fileType: pasteData.fileType || null,
                tags: pasteData.tags || []
            }).returning();
            if (!inserted || inserted.length === 0) {
                throw new Error("Failed to create paste: No rows returned");
            }
            return inserted[0];
        }
        catch (error) {
            console.error("Error in createPaste:", error);
            throw error;
        }
    }
    async getPasteById(id) {
        const currentDate = new Date();
        try {
            const paste = await db_1.db.query.pastes.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.pastes.id, id), (0, drizzle_orm_1.or)((0, drizzle_orm_1.isNull)(schema_1.pastes.expiresAt), (0, drizzle_orm_1.gt)(schema_1.pastes.expiresAt, currentDate)))
            });
            return paste || undefined;
        }
        catch (error) {
            console.error("[storage] Error in getPasteById:", error);
            return undefined;
        }
    }
    async getPasteByPasteId(pasteId) {
        const currentDate = new Date();
        try {
            const paste = await db_1.db.query.pastes.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.pastes.pasteId, pasteId), (0, drizzle_orm_1.or)((0, drizzle_orm_1.isNull)(schema_1.pastes.expiresAt), (0, drizzle_orm_1.gt)(schema_1.pastes.expiresAt, currentDate)))
            });
            return paste || undefined;
        }
        catch (error) {
            console.error("[storage] Error in getPasteByPasteId:", error);
            return undefined;
        }
    }
    async incrementViews(id) {
        try {
            await db_1.db.update(schema_1.pastes)
                .set({ views: (0, drizzle_orm_1.sql) `views + 1` })
                .where((0, drizzle_orm_1.eq)(schema_1.pastes.id, id));
        }
        catch (error) {
            console.error("[storage] Error in incrementViews:", error);
        }
    }
    async getRecentPastes(limit) {
        const currentDate = new Date();
        try {
            const queryOptions = {
                where: (0, drizzle_orm_1.or)((0, drizzle_orm_1.isNull)(schema_1.pastes.expiresAt), (0, drizzle_orm_1.gt)(schema_1.pastes.expiresAt, currentDate)),
                orderBy: [(0, drizzle_orm_1.desc)(schema_1.pastes.createdAt)]
            };
            if (limit !== undefined) {
                queryOptions.limit = limit;
            }
            const results = await db_1.db.query.pastes.findMany(queryOptions);
            console.log("[storage] Successfully fetched recent pastes:", results.length);
            return results;
        }
        catch (error) {
            console.error("[storage] Error in getRecentPastes:", error);
            return [];
        }
    }
    async getRelatedPastes(language, excludeId, limit = 3) {
        const currentDate = new Date();
        try {
            const whereConditions = [
                (0, drizzle_orm_1.eq)(schema_1.pastes.language, language),
                (0, drizzle_orm_1.or)((0, drizzle_orm_1.isNull)(schema_1.pastes.expiresAt), (0, drizzle_orm_1.gt)(schema_1.pastes.expiresAt, currentDate))
            ];
            if (excludeId !== undefined) {
                whereConditions.push((0, drizzle_orm_1.ne)(schema_1.pastes.id, excludeId));
            }
            const results = await db_1.db.query.pastes.findMany({
                where: (0, drizzle_orm_1.and)(...whereConditions),
                orderBy: [(0, drizzle_orm_1.desc)(schema_1.pastes.views)],
                limit: limit,
            });
            console.log("[storage] Successfully fetched related pastes:", results.length);
            return results;
        }
        catch (error) {
            console.error("[storage] Error in getRelatedPastes:", error);
            return [];
        }
    }
    async deletePaste(id) {
        try {
            await db_1.db.delete(schema_1.pastes)
                .where((0, drizzle_orm_1.eq)(schema_1.pastes.id, id));
        }
        catch (error) {
            console.error("[storage] Error in deletePaste:", error);
        }
    }
    async updatePaste(id, content) {
        try {
            console.log(`[storage] Updating paste with ID ${id}, content length: ${content.length}`);
            const existingPaste = await db_1.db.query.pastes.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.pastes.id, id)
            });
            if (!existingPaste) {
                console.error(`[storage] Cannot update paste with ID ${id} - not found`);
                return false;
            }
            const [updatedPaste] = await db_1.db.update(schema_1.pastes)
                .set({ content })
                .where((0, drizzle_orm_1.eq)(schema_1.pastes.id, id))
                .returning();
            if (updatedPaste) {
                console.log(`[storage] Successfully updated paste:`, {
                    id: updatedPaste.id,
                    pasteId: updatedPaste.pasteId,
                    contentLength: updatedPaste.content.length,
                    contentPreview: updatedPaste.content.substring(0, 30)
                });
                return true;
            }
            return false;
        }
        catch (error) {
            console.error("[storage] Error in updatePaste:", error);
            return false;
        }
    }
}
exports.DatabaseStorage = DatabaseStorage;
exports.storage = new DatabaseStorage();
//# sourceMappingURL=storage.js.map