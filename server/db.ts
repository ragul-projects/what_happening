import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Use the provided Neon DB URL
const databaseUrl = "postgresql://neondb_owner:npg_SbHyI6cdZnU5@ep-wispy-cloud-a4f57e4w-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";

if (!databaseUrl) {
  throw new Error(
    "Database connection URL must be set. Did you forget to provision a database?",
  );
}

console.log("Connecting to Neon database...");
export const pool = new Pool({ connectionString: databaseUrl });

// Debug queries
const logQuery = (query: string, params: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('SQL Query:', query);
    console.log('Parameters:', params);
  }
};

export const db = drizzle(pool, { schema, logger: { logQuery } });