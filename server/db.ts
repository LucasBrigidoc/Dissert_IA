import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Use native pg driver with SSL configured to accept self-signed certificates in Replit
// This avoids the WebSocket SSL certificate issues with @neondatabase/serverless
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false  // Required for Replit environment
  }
});

export const db = drizzle(pool, { schema });
