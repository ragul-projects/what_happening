import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { env } from "./config";

neonConfig.webSocketConstructor = ws;

console.log("Connecting to Neon database...");

let pool: Pool;
try {
  pool = new Pool({ connectionString: env.databaseUrl });
  
  // Test the connection
  pool.connect().then(() => {
    console.log("Successfully connected to the database");
  }).catch((error) => {
    console.error("Failed to connect to the database:", error);
  });
} catch (error) {
  console.error("Error initializing database pool:", error);
  throw new Error("Failed to initialize database connection");
}

// Debug queries
const logQuery = (query: string, params: any[]) => {
  if (env.nodeEnv === 'development') {
    console.log('SQL Query:', query);
    console.log('Parameters:', params);
  }
};

export const db = drizzle(pool, { schema, logger: { logQuery } });