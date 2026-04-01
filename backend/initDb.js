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
    
    // Test database connection first
    console.log('🔍 Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');
    
    // Read and execute migrations
    const migrationsDir = path.join(__dirname, '../database/migrations');
    
    // Check if migrations directory exists
    if (!fs.existsSync(migrationsDir)) {
      console.log('⚠️ Migrations directory not found, skipping database initialization');
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
    
    // Verify users table exists
    console.log('🔍 Verifying users table...');
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('✅ Users table exists');
    } else {
      console.log('❌ Users table not found');
    }
    
    console.log('✅ Database initialization complete');
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    console.error('Error details:', error);
    // Don't throw - allow server to start even if DB init fails
    // This allows Render to show error logs
  }
};
