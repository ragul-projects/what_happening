import { db, pool } from './server/db';
import { sql } from 'drizzle-orm';

async function recreateDatabase() {
  console.log('Dropping and recreating the pastes table...');
  
  try {
    // Drop existing table if it exists
    await db.execute(sql`DROP TABLE IF EXISTS pastes`);
    
    // Create the pastes table with the correct schema
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS pastes (
        id SERIAL PRIMARY KEY,
        paste_id TEXT NOT NULL UNIQUE,
        title TEXT DEFAULT 'Untitled',
        content TEXT NOT NULL,
        language TEXT DEFAULT 'plaintext',
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        views INTEGER NOT NULL DEFAULT 0,
        expires_at TIMESTAMP WITH TIME ZONE,
        author_name TEXT DEFAULT 'Anonymous',
        tags TEXT[],
        is_file BOOLEAN DEFAULT FALSE,
        file_name TEXT,
        file_type TEXT
      )
    `);
    
    console.log('Database table recreated successfully');
    
  } catch (error) {
    console.error('Error recreating database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the recreation function
recreateDatabase()
  .then(() => {
    console.log('Database recreation complete');
    process.exit(0);
  })
  .catch(err => {
    console.error('Database recreation failed:', err);
    process.exit(1);
  });