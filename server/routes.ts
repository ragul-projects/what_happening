import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { nanoid } from "nanoid";
import { z } from "zod";
import { insertPasteSchema, supportedLanguages } from "@shared/schema";
import { add } from "date-fns";

// Initialize database with example pastes if needed
async function initializeDatabase() {
  try {
    // Check if we have any pastes in the database
    const existingPastes = await storage.getRecentPastes(1);
    
    // If no pastes exist, create some examples
    if (existingPastes.length === 0) {
      console.log('[express] Initializing database with example pastes...');
      
      // Use the createInitialPastes method from the DatabaseStorage class
      await (storage as any).createInitialPastes();
      
      console.log('[express] Database initialized with example pastes');
    }
  } catch (error) {
    console.error('[express] Error initializing database:', error);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize database with example pastes
  await initializeDatabase();
  // Create a new paste
  app.post("/api/pastes", async (req, res) => {
    try {
      const pasteData = insertPasteSchema.parse(req.body);
      
      // Generate a unique ID for the paste
      const pasteId = nanoid(8);
      
      // Handle expiration time
      let expiresAt = null;
      if (req.body.expirationMinutes) {
        expiresAt = add(new Date(), { minutes: req.body.expirationMinutes });
      }
      
      // Create the paste
      const paste = await storage.createPaste({
        ...pasteData,
        pasteId,
        expiresAt,
      });
      
      res.status(201).json({ pasteId: paste.pasteId });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid paste data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating paste" });
    }
  });

  // Get a paste by ID
  app.get("/api/pastes/:pasteId", async (req, res) => {
    try {
      const { pasteId } = req.params;
      const paste = await storage.getPasteByPasteId(pasteId);
      
      if (!paste) {
        return res.status(404).json({ message: "Paste not found" });
      }
      
      // Check if paste has expired
      if (paste.expiresAt && new Date(paste.expiresAt) < new Date()) {
        await storage.deletePaste(paste.id);
        return res.status(404).json({ message: "Paste has expired" });
      }
      
      // Increment view count
      await storage.incrementViews(paste.id);
      
      // Return the paste without the internal ID
      const { id, ...pasteData } = paste;
      res.json(pasteData);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving paste" });
    }
  });

  // Get recent public pastes
  app.get("/api/pastes", async (req, res) => {
    try {
      const pastes = await storage.getRecentPastes();
      res.json(pastes.map(({ id, ...paste }) => paste));
    } catch (error) {
      res.status(500).json({ message: "Error retrieving pastes" });
    }
  });

  // Get a list of supported languages
  app.get("/api/languages", (_req, res) => {
    res.json(supportedLanguages);
  });

  // Get related pastes for a given paste
  app.get("/api/pastes/:pasteId/related", async (req, res) => {
    try {
      const { pasteId } = req.params;
      const paste = await storage.getPasteByPasteId(pasteId);
      
      if (!paste) {
        return res.status(404).json({ message: "Paste not found" });
      }
      
      const relatedPastes = await storage.getRelatedPastes(paste.language, paste.id);
      res.json(relatedPastes.map(({ id, ...paste }) => paste));
    } catch (error) {
      res.status(500).json({ message: "Error retrieving related pastes" });
    }
  });

  // Delete a paste
  app.delete("/api/pastes/:pasteId", async (req, res) => {
    try {
      const { pasteId } = req.params;
      const paste = await storage.getPasteByPasteId(pasteId);
      
      if (!paste) {
        return res.status(404).json({ message: "Paste not found" });
      }
      
      await storage.deletePaste(paste.id);
      res.json({ message: "Paste deleted successfully" });
    } catch (error) {
      console.error("Error deleting paste:", error);
      res.status(500).json({ message: "Error deleting paste" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
