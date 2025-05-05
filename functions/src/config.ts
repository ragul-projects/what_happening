import { config } from 'dotenv';

// Load environment variables
config();

export const env = {
  adminPassword: process.env.ADMIN_PASSWORD || 'kit@123',
  databaseUrl: process.env.DATABASE_URL || '',
  nodeEnv: process.env.NODE_ENV || 'development'
}; 