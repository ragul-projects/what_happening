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
      console.error("Error creating paste:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid paste data", errors: error.errors });
      }
      
      // Check for specific error types if necessary
      if (error.toString().includes("PayloadTooLargeError")) {
        return res.status(413).json({ message: "File is too large. Please upload a smaller file." });
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
  
  // Admin authentication endpoint
  app.post("/api/admin/verify", (req, res) => {
    try {
      const { password } = req.body;
      
      if (!password) {
        return res.status(400).json({ success: false, message: "Password is required" });
      }
      
      // Check against environment variable
      const adminPassword = process.env.ADMIN_PASSWORD;
      
      if (!adminPassword) {
        console.error("ADMIN_PASSWORD environment variable is not set");
        return res.status(500).json({ success: false, message: "Server configuration error" });
      }
      
      const isAuthenticated = password === adminPassword;
      
      return res.json({ 
        success: isAuthenticated,
        message: isAuthenticated ? "Authentication successful" : "Authentication failed" 
      });
    } catch (error) {
      console.error("Admin authentication error:", error);
      res.status(500).json({ success: false, message: "Authentication error" });
    }
  });
  
  // Update a paste (requires admin authentication)
  app.put("/api/pastes/:pasteId", async (req, res) => {
    try {
      const { pasteId } = req.params;
      const { content, adminPassword } = req.body;
      
      // Verify admin password
      const actualAdminPassword = process.env.ADMIN_PASSWORD;
      
      if (!actualAdminPassword || adminPassword !== actualAdminPassword) {
        return res.status(403).json({ message: "Unauthorized: Admin access required" });
      }
      
      // Get the paste
      const paste = await storage.getPasteByPasteId(pasteId);
      
      if (!paste) {
        return res.status(404).json({ message: "Paste not found" });
      }
      
      // Update the paste content
      const success = await storage.updatePaste(paste.id, content);
      
      if (success) {
        return res.json({ message: "Paste updated successfully" });
      } else {
        return res.status(500).json({ message: "Failed to update paste" });
      }
    } catch (error) {
      console.error("Error updating paste:", error);
      res.status(500).json({ message: "Error updating paste" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
