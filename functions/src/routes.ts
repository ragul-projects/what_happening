import { Request, Response } from 'express';
import { nanoid } from 'nanoid';
import { IStorage } from './storage';
import { env } from './config';

export function setupRoutes(app: any, storage: IStorage) {
  // Create a new paste
  app.post('/api/pastes', async (req: Request, res: Response) => {
    try {
      const { content, title, language, expiresAt, authorName, tags, isFile, fileName, fileType } = req.body;
      
      if (!content) {
        return res.status(400).json({ message: 'Content is required' });
      }
      
      const pasteId = nanoid(8);
      const paste = await storage.createPaste({
        pasteId,
        content,
        title,
        language,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        authorName,
        tags,
        isFile,
        fileName,
        fileType
      });
      
      const { id, ...pasteData } = paste;
      return res.json(pasteData);
    } catch (error) {
      console.error('Error creating paste:', error);
      return res.status(500).json({ message: 'Error creating paste' });
    }
  });
  
  // Get a paste by ID
  app.get('/api/pastes/:pasteId', async (req: Request, res: Response) => {
    try {
      const { pasteId } = req.params;
      const paste = await storage.getPasteByPasteId(pasteId);
      
      if (!paste) {
        return res.status(404).json({ message: 'Paste not found' });
      }
      
      // Increment views
      await storage.incrementViews(paste.id);
      
      const { id, ...pasteData } = paste;
      return res.json(pasteData);
    } catch (error) {
      console.error('Error getting paste:', error);
      return res.status(500).json({ message: 'Error getting paste' });
    }
  });
  
  // Get recent pastes
  app.get('/api/pastes', async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const pastes = await storage.getRecentPastes(limit);
      
      return res.json(pastes.map(({ id, ...paste }) => paste));
    } catch (error) {
      console.error('Error getting recent pastes:', error);
      return res.status(500).json({ message: 'Error getting recent pastes' });
    }
  });
  
  // Update a paste (requires admin authentication)
  app.put('/api/pastes/:pasteId', async (req: Request, res: Response) => {
    try {
      const { pasteId } = req.params;
      const { content, adminPassword } = req.body;
      
      if (!content) {
        return res.status(400).json({ message: 'Content is required' });
      }
      
      if (adminPassword !== env.adminPassword) {
        return res.status(403).json({ message: 'Unauthorized: Admin access required' });
      }
      
      const paste = await storage.getPasteByPasteId(pasteId);
      
      if (!paste) {
        return res.status(404).json({ message: 'Paste not found' });
      }
      
      const success = await storage.updatePaste(paste.id, content);
      
      if (success) {
        const updatedPaste = await storage.getPasteByPasteId(pasteId);
        if (updatedPaste) {
          const { id, ...pasteData } = updatedPaste;
          return res.json({
            message: 'Paste updated successfully',
            paste: pasteData
          });
        }
      }
      
      return res.status(500).json({ message: 'Failed to update paste' });
    } catch (error) {
      console.error('Error updating paste:', error);
      return res.status(500).json({ message: 'Error updating paste' });
    }
  });
  
  // Delete a paste (requires admin authentication)
  app.delete('/api/pastes/:pasteId', async (req: Request, res: Response) => {
    try {
      const { pasteId } = req.params;
      const { adminPassword } = req.body;
      
      if (adminPassword !== env.adminPassword) {
        return res.status(403).json({ message: 'Unauthorized: Admin access required' });
      }
      
      const paste = await storage.getPasteByPasteId(pasteId);
      
      if (!paste) {
        return res.status(404).json({ message: 'Paste not found' });
      }
      
      await storage.deletePaste(paste.id);
      return res.json({ message: 'Paste deleted successfully' });
    } catch (error) {
      console.error('Error deleting paste:', error);
      return res.status(500).json({ message: 'Error deleting paste' });
    }
  });
} 