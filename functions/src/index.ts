import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';
import { storage } from './storage';
import { setupRoutes } from './routes';

// Initialize Firebase Admin
admin.initializeApp();

// Create Express app
const app = express();

// Enable CORS
app.use(cors({ origin: true }));

// Setup routes
setupRoutes(app, storage);

// Export the Express app as a Firebase Function
export const api = functions.https.onRequest(app); 