/**
 * Seed script: Import Amazon Sales CSV into PostgreSQL
 *
 * Usage:
 *   node database/seed/importCSV.js [path-to-csv]
 *
 * If no path is provided, defaults to: backend/Amazon Sales.csv
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csv from 'csv-parser';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../backend/.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'ai_bi_dashboard',
});

const CSV_PATH = process.argv[2] || path.resolve(__dirname, '../../backend/Amazon Sales.csv');

async function runMigration() {
  const migrationPath = path.resolve(__dirname, '../migrations/001_create_sales_table.sql');
  const sql = fs.readFileSync(migrationPath, 'utf-8');
  await pool.query(sql);
  console.log('✅ Migration executed — sales table created');
}

async function importCSV() {
  console.log(`📂 Reading CSV from: ${CSV_PATH}`);

  if (!fs.existsSync(CSV_PATH)) {
    throw new Error(`CSV file not found at: ${CSV_PATH}`);
  }

  const rows = [];
  await new Promise((resolve, reject) => {
    fs.createReadStream(CSV_PATH)
      .pipe(csv({
        mapHeaders: ({ header }) => header.trim().replace(/^\uFEFF/, '')
      }))
      .on('data', (row) => {
        // Skip rows where order_id is missing or empty
        if (!row.order_id || row.order_id.trim() === '') return;

        // Trim all values in the row
        const cleanRow = {};
        for (const key in row) {
          cleanRow[key] = row[key] ? row[key].trim() : row[key];
        }
        rows.push(cleanRow);
      })
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`📊 Parsed ${rows.length} rows from CSV`);

  // Clear existing data
  await pool.query('TRUNCATE TABLE sales');
  console.log('🗑️  Cleared existing data');

  // Insert in batches of 500
  const batchSize = 500;
  let inserted = 0;

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const columns = [
      'order_id', 'order_date', 'product_id', 'product_category',
      'price', 'discount_percent', 'quantity_sold', 'customer_region',
      'payment_method', 'rating', 'review_count', 'discounted_price', 'total_revenue'
    ];

    const placeholders = batch.map((_, rowIdx) =>
      `(${columns.map((_, colIdx) => `$${rowIdx * columns.length + colIdx + 1}`).join(', ')})`
    ).join(', ');

    const values = batch.flatMap((row, idx) => {
      const orderId = parseInt(row.order_id);
      if (isNaN(orderId)) {
        console.log(`\n❌ Invalid order_id at batch index ${idx}:`, JSON.stringify(row));
      }
      return [
        orderId || null,
        row.order_date || null,
        parseInt(row.product_id) || null,
        row.product_category || null,
        parseFloat(row.price) || null,
        parseInt(row.discount_percent) || null,
        parseInt(row.quantity_sold) || null,
        row.customer_region || null,
        row.payment_method || null,
        parseFloat(row.rating) || null,
        parseInt(row.review_count) || null,
        parseFloat(row.discounted_price) || null,
        parseFloat(row.total_revenue) || null,
      ];
    });

    await pool.query(
      `INSERT INTO sales (${columns.join(', ')}) VALUES ${placeholders}`,
      values
    );

    inserted += batch.length;
    process.stdout.write(`\r⏳ Inserted ${inserted}/${rows.length} rows...`);
  }

  console.log(`\n✅ Successfully imported ${inserted} rows into 'sales' table`);
}

async function main() {
  try {
    console.log('\n🚀 Starting database setup...\n');
    await runMigration();
    await importCSV();

    // Quick verification
    const result = await pool.query('SELECT COUNT(*) as count FROM sales');
    console.log(`\n📈 Verification: ${result.rows[0].count} total rows in sales table`);

    const sample = await pool.query('SELECT * FROM sales LIMIT 3');
    console.log('\n📋 Sample data:');
    console.table(sample.rows);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
