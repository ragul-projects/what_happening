import { pastes as pastesTable, type Paste } from "./schema";
import { db } from "./db";
import { eq, desc, ne, isNull, and, or, sql, gt } from "drizzle-orm";

export interface IStorage {
  createPaste(paste: Omit<Paste, "id" | "views" | "createdAt"> & { pasteId: string }): Promise<Paste>;
  getPasteById(id: number): Promise<Paste | undefined>;
  getPasteByPasteId(pasteId: string): Promise<Paste | undefined>;
  incrementViews(id: number): Promise<void>;
  getRecentPastes(limit?: number): Promise<Paste[]>;
  getRelatedPastes(language: string, excludeId?: number, limit?: number): Promise<Paste[]>;
  deletePaste(id: number): Promise<void>;
  updatePaste(id: number, content: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async createPaste(pasteData: Omit<Paste, "id" | "views" | "createdAt"> & { pasteId: string }): Promise<Paste> {
    try {
      const inserted = await db.insert(pastesTable).values({
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
    } catch (error) {
      console.error("Error in createPaste:", error);
      throw error;
    }
  }

  async getPasteById(id: number): Promise<Paste | undefined> {
    const currentDate = new Date();
    
    try {
      const paste = await db.query.pastes.findFirst({
        where: and(
          eq(pastesTable.id, id),
          or(
            isNull(pastesTable.expiresAt),
            gt(pastesTable.expiresAt, currentDate)
          )
        )
      });
      
      return paste || undefined;
    } catch (error) {
      console.error("[storage] Error in getPasteById:", error);
      return undefined;
    }
  }

  async getPasteByPasteId(pasteId: string): Promise<Paste | undefined> {
    const currentDate = new Date();
    
    try {
      const paste = await db.query.pastes.findFirst({
        where: and(
          eq(pastesTable.pasteId, pasteId),
          or(
            isNull(pastesTable.expiresAt),
            gt(pastesTable.expiresAt, currentDate)
          )
        )
      });
      
      return paste || undefined;
    } catch (error) {
      console.error("[storage] Error in getPasteByPasteId:", error);
      return undefined;
    }
  }

  async incrementViews(id: number): Promise<void> {
    try {
      await db.update(pastesTable)
        .set({ views: sql`views + 1` })
        .where(eq(pastesTable.id, id));
    } catch (error) {
      console.error("[storage] Error in incrementViews:", error);
    }
  }

  async getRecentPastes(limit?: number): Promise<Paste[]> {
    const currentDate = new Date();
    
    try {
      const queryOptions: any = {
        where: or(
          isNull(pastesTable.expiresAt),
          gt(pastesTable.expiresAt, currentDate)
        ),
        orderBy: [desc(pastesTable.createdAt)]
      };
      
      if (limit !== undefined) {
        queryOptions.limit = limit;
      }
      
      const results = await db.query.pastes.findMany(queryOptions);
      
      console.log("[storage] Successfully fetched recent pastes:", results.length);
      return results;
    } catch (error) {
      console.error("[storage] Error in getRecentPastes:", error);
      return [];
    }
  }

  async getRelatedPastes(language: string, excludeId?: number, limit: number = 3): Promise<Paste[]> {
    const currentDate = new Date();
    
    try {
      const whereConditions = [
        eq(pastesTable.language, language),
        or(
          isNull(pastesTable.expiresAt),
          gt(pastesTable.expiresAt, currentDate)
        )
      ];
      
      if (excludeId !== undefined) {
        whereConditions.push(ne(pastesTable.id, excludeId));
      }
      
      const results = await db.query.pastes.findMany({
        where: and(...whereConditions),
        orderBy: [desc(pastesTable.views)],
        limit: limit,
      });
      
      console.log("[storage] Successfully fetched related pastes:", results.length);
      return results;
    } catch (error) {
      console.error("[storage] Error in getRelatedPastes:", error);
      return [];
    }
  }

  async deletePaste(id: number): Promise<void> {
    try {
      await db.delete(pastesTable)
        .where(eq(pastesTable.id, id));
    } catch (error) {
      console.error("[storage] Error in deletePaste:", error);
    }
  }

  async updatePaste(id: number, content: string): Promise<boolean> {
    try {
      console.log(`[storage] Updating paste with ID ${id}, content length: ${content.length}`);
      
      const existingPaste = await db.query.pastes.findFirst({
        where: eq(pastesTable.id, id)
      });
      
      if (!existingPaste) {
        console.error(`[storage] Cannot update paste with ID ${id} - not found`);
        return false;
      }
      
      const [updatedPaste] = await db.update(pastesTable)
        .set({ content })
        .where(eq(pastesTable.id, id))
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
    } catch (error) {
      console.error("[storage] Error in updatePaste:", error);
      return false;
    }
  }
}

export const storage = new DatabaseStorage(); 