import { queryDB } from '../config/db.js';

/**
 * Execute a SQL query and return results
 */
export const executeQuery = async (sql) => {
  try {
    const result = await queryDB(sql);
    return {
      rows: result.rows,
      rowCount: result.rowCount,
      fields: result.fields.map((f) => ({
        name: f.name,
        dataTypeID: f.dataTypeID,
      })),
    };
  } catch (error) {
    console.error('Query execution error:', error.message);
    throw error;
  }
};

/**
 * Get schema information for a given table
 */
export const getTableSchema = async (tableName = 'sales') => {
  const sql = `
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = $1
    ORDER BY ordinal_position;
  `;
  const result = await queryDB(sql, [tableName]);
  return result.rows;
};

/**
 * Get all available tables in the public schema
 */
export const getAllTables = async () => {
  const sql = `
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `;
  const result = await queryDB(sql);
  return result.rows.map((r) => r.table_name);
};

/**
 * Get a sample of data from a table
 */
export const getTableSample = async (tableName, limit = 5) => {
  const sql = `SELECT * FROM "${tableName}" LIMIT ${parseInt(limit)}`;
  const result = await queryDB(sql);
  return result.rows;
};
