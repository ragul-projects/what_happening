import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Use Neon Database URL if available, otherwise use the default DATABASE_URL
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "Database connection URL must be set. Did you forget to provision a database?",
  );
}

console.log("Connecting to database...");
export const pool = new Pool({ connectionString: databaseUrl });

// Debug queries
const logQuery = (query: string, params: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('SQL Query:', query);
    console.log('Parameters:', params);
  }
};

export const db = drizzle(pool, { schema, logger: { logQuery } });