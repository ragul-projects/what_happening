import { config } from "dotenv";

// Load environment variables
config();

export const env = {
  adminPassword: process.env.ADMIN_PASSWORD || "kit@123",
  databaseUrl: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_SbHyI6cdZnU5@ep-wispy-cloud-a4f57e4w-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require",
  nodeEnv: process.env.NODE_ENV || "development"
}; 