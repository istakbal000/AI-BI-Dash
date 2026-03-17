import { generateSQL, generateFollowUpSQL } from '../services/geminiService.js';
import { executeQuery, getTableSchema, getAllTables } from '../services/queryService.js';
import { recommendChartType, formatChartData, generateKPIMetrics } from '../services/chartService.js';
import { queryDB } from '../config/db.js';
import fs from 'fs';
import csv from 'csv-parser';

/**
 * POST /api/query
 * Accept a natural language query, generate SQL via Gemini, execute, and return chart data
 */
export const handleQuery = async (req, res, next) => {
  try {
    const { query, table } = req.body;

    if (!query || query.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Query is required. Please enter a question about your data.',
      });
    }

    const tableName = table || 'sales';

    // Step 1: Generate SQL from natural language via Gemini
    const aiResult = await generateSQL(query, tableName);

    // Step 2: Execute the SQL query
    const queryResult = await executeQuery(aiResult.sql);

    // Step 3: Determine chart type
    const { chartType, reason } = recommendChartType(
      queryResult.rows,
      queryResult.fields,
      aiResult.chartType
    );

    // Step 4: Format data for frontend
    const chartData = formatChartData(
      queryResult.rows,
      aiResult.xAxis,
      aiResult.yAxis,
      chartType
    );

    // Step 5: Generate KPI metrics if applicable
    const kpis = chartType === 'kpi' ? generateKPIMetrics(queryResult.rows, queryResult.fields) : [];

    // Step 6: Return structured response
    res.json({
      success: true,
      data: {
        query: query,
        sql: aiResult.sql,
        chartType,
        chartReason: reason,
        xAxis: aiResult.xAxis,
        yAxis: aiResult.yAxis,
        title: aiResult.title,
        description: aiResult.description,
        chartData,
        kpis,
        rowCount: queryResult.rowCount,
        fields: queryResult.fields,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/schema
 * Return database schema information
 */
export const handleGetSchema = async (req, res, next) => {
  try {
    const tables = await getAllTables();
    const schema = {};

    for (const table of tables) {
      schema[table] = await getTableSchema(table);
    }

    res.json({
      success: true,
      data: { tables, schema },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/upload
 * Upload a CSV file, create a table, and import data
 */
export const handleUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded. Please upload a CSV file.',
      });
    }

    const filePath = req.file.path;
    const originalName = req.file.originalname.replace(/\.csv$/i, '');
    const tableName = originalName
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/_+/g, '_')
      .substring(0, 63);

    // Read columns from CSV header
    const rows = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => rows.push(row))
        .on('end', resolve)
        .on('error', reject);
    });

    if (rows.length === 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        error: 'CSV file is empty.',
      });
    }

    const columns = Object.keys(rows[0]);

    // Infer column types
    const columnDefs = columns.map((col) => {
      const colName = col.toLowerCase().replace(/[^a-z0-9_]/g, '_');
      const sampleValues = rows.slice(0, 100).map((r) => r[col]).filter((v) => v !== '' && v !== null);

      let type = 'TEXT';
      if (sampleValues.every((v) => !isNaN(v) && v.toString().includes('.'))) {
        type = 'FLOAT';
      } else if (sampleValues.every((v) => !isNaN(v) && !v.toString().includes('.'))) {
        type = 'INTEGER';
      } else if (sampleValues.every((v) => !isNaN(Date.parse(v)))) {
        type = 'DATE';
      }

      return { original: col, name: colName, type };
    });

    // Drop table if exists and create new one
    await queryDB(`DROP TABLE IF EXISTS "${tableName}"`);

    const createSQL = `CREATE TABLE "${tableName}" (
      ${columnDefs.map((c) => `"${c.name}" ${c.type}`).join(',\n      ')}
    )`;
    await queryDB(createSQL);

    // Insert data in batches
    const batchSize = 500;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const placeholders = batch
        .map(
          (_, rowIdx) =>
            `(${columnDefs.map((_, colIdx) => `$${rowIdx * columnDefs.length + colIdx + 1}`).join(', ')})`
        )
        .join(', ');

      const values = batch.flatMap((row) => columnDefs.map((c) => {
        const val = row[c.original];
        if (val === '' || val === null || val === undefined) return null;
        if (c.type === 'FLOAT') return parseFloat(val) || null;
        if (c.type === 'INTEGER') return parseInt(val) || null;
        return val;
      }));

      const insertSQL = `INSERT INTO "${tableName}" (${columnDefs.map((c) => `"${c.name}"`).join(', ')}) VALUES ${placeholders}`;
      await queryDB(insertSQL, values);
    }

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      data: {
        tableName,
        columns: columnDefs,
        rowCount: rows.length,
        message: `Successfully imported ${rows.length} rows into table "${tableName}"`,
      },
    });
  } catch (error) {
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

/**
 * POST /api/followup
 * Accept a follow-up natural language message + conversation history,
 * generate a refined SQL, and return new chart data.
 */
export const handleFollowUp = async (req, res, next) => {
  try {
    const { followUpQuery, conversationHistory, table } = req.body;

    if (!followUpQuery || followUpQuery.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Follow-up query is required.',
      });
    }

    const tableName = table || 'sales';

    // Step 1: Generate refined SQL using conversation history as context
    const aiResult = await generateFollowUpSQL(
      followUpQuery,
      conversationHistory || [],
      tableName
    );

    // Step 2: Execute the refined SQL
    const queryResult = await executeQuery(aiResult.sql);

    // Step 3: Determine chart type
    const { chartType, reason } = recommendChartType(
      queryResult.rows,
      queryResult.fields,
      aiResult.chartType
    );

    // Step 4: Format data for frontend
    const chartData = formatChartData(
      queryResult.rows,
      aiResult.xAxis,
      aiResult.yAxis,
      chartType
    );

    // Step 5: Generate KPI metrics if applicable
    const kpis = chartType === 'kpi' ? generateKPIMetrics(queryResult.rows, queryResult.fields) : [];

    // Step 6: Return structured response
    res.json({
      success: true,
      data: {
        query: followUpQuery,
        sql: aiResult.sql,
        chartType,
        chartReason: reason,
        xAxis: aiResult.xAxis,
        yAxis: aiResult.yAxis,
        title: aiResult.title,
        description: aiResult.description,
        chartData,
        kpis,
        rowCount: queryResult.rowCount,
        fields: queryResult.fields,
      },
    });
  } catch (error) {
    next(error);
  }
};
