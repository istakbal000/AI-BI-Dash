import { pool } from './config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Initialize database tables
 */
export const initDatabase = async () => {
  try {
    console.log('🔄 Initializing database...');
    
    // Read and execute migrations
    const migrationsDir = path.join(__dirname, '../database/migrations');
    
    // Check if migrations directory exists
    if (!fs.existsSync(migrationsDir)) {
      console.log('⚠️ Migrations directory not found');
      return;
    }
    
    const files = fs.readdirSync(migrationsDir).sort();
    
    for (const file of files) {
      if (file.endsWith('.sql')) {
        console.log(`📄 Running migration: ${file}`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        await pool.query(sql);
        console.log(`✅ Migration ${file} completed`);
      }
    }
    
    console.log('✅ Database initialization complete');
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    // Don't throw - allow server to start even if DB init fails
    // This allows Render to show error logs
  }
};
