"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupRoutes = void 0;
const nanoid_1 = require("nanoid");
const config_1 = require("./config");
function setupRoutes(app, storage) {
    // Create a new paste
    app.post('/api/pastes', async (req, res) => {
        try {
            const { content, title, language, expiresAt, authorName, tags, isFile, fileName, fileType } = req.body;
            if (!content) {
                return res.status(400).json({ message: 'Content is required' });
            }
            const pasteId = (0, nanoid_1.nanoid)(8);
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
            const { id } = paste, pasteData = __rest(paste, ["id"]);
            return res.json(pasteData);
        }
        catch (error) {
            console.error('Error creating paste:', error);
            return res.status(500).json({ message: 'Error creating paste' });
        }
    });
    // Get a paste by ID
    app.get('/api/pastes/:pasteId', async (req, res) => {
        try {
            const { pasteId } = req.params;
            const paste = await storage.getPasteByPasteId(pasteId);
            if (!paste) {
                return res.status(404).json({ message: 'Paste not found' });
            }
            // Increment views
            await storage.incrementViews(paste.id);
            const { id } = paste, pasteData = __rest(paste, ["id"]);
            return res.json(pasteData);
        }
        catch (error) {
            console.error('Error getting paste:', error);
            return res.status(500).json({ message: 'Error getting paste' });
        }
    });
    // Get recent pastes
    app.get('/api/pastes', async (req, res) => {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
            const pastes = await storage.getRecentPastes(limit);
            return res.json(pastes.map((_a) => {
                var { id } = _a, paste = __rest(_a, ["id"]);
                return paste;
            }));
        }
        catch (error) {
            console.error('Error getting recent pastes:', error);
            return res.status(500).json({ message: 'Error getting recent pastes' });
        }
    });
    // Update a paste (requires admin authentication)
    app.put('/api/pastes/:pasteId', async (req, res) => {
        try {
            const { pasteId } = req.params;
            const { content, adminPassword } = req.body;
            if (!content) {
                return res.status(400).json({ message: 'Content is required' });
            }
            if (adminPassword !== config_1.env.adminPassword) {
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
                    const { id } = updatedPaste, pasteData = __rest(updatedPaste, ["id"]);
                    return res.json({
                        message: 'Paste updated successfully',
                        paste: pasteData
                    });
                }
            }
            return res.status(500).json({ message: 'Failed to update paste' });
        }
        catch (error) {
            console.error('Error updating paste:', error);
            return res.status(500).json({ message: 'Error updating paste' });
        }
    });
    // Delete a paste (requires admin authentication)
    app.delete('/api/pastes/:pasteId', async (req, res) => {
        try {
            const { pasteId } = req.params;
            const { adminPassword } = req.body;
            if (adminPassword !== config_1.env.adminPassword) {
                return res.status(403).json({ message: 'Unauthorized: Admin access required' });
            }
            const paste = await storage.getPasteByPasteId(pasteId);
            if (!paste) {
                return res.status(404).json({ message: 'Paste not found' });
            }
            await storage.deletePaste(paste.id);
            return res.json({ message: 'Paste deleted successfully' });
        }
        catch (error) {
            console.error('Error deleting paste:', error);
            return res.status(500).json({ message: 'Error deleting paste' });
        }
    });
}
exports.setupRoutes = setupRoutes;
//# sourceMappingURL=routes.js.map