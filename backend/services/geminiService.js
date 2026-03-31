import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env.js';

const genAI = new GoogleGenerativeAI(env.geminiApiKey);

/**
 * Schema context for Gemini — describes all available tables and their columns
 * @param {Array<{name: string, columns: string}>} tables
 */
const getSchemaContext = (tables = []) => {
  const defaultSalesColumns = `
  order_id INTEGER
  order_date DATE
  product_id INTEGER
  product_category TEXT
  price FLOAT
  discount_percent INTEGER
  quantity_sold INTEGER
  customer_region TEXT
  payment_method TEXT
  rating FLOAT
  review_count INTEGER
  discounted_price FLOAT
  total_revenue FLOAT (calculated as discounted_price * quantity_sold)`;

  if (!tables || tables.length === 0) {
    return `Table: sales\nColumns:\n${defaultSalesColumns}`;
  }

  return tables.map(t => `
Table: ${t.name}
Columns:
${t.columns}
  `).join('\n---\n');
};

/**
 * System prompt for Gemini SQL generation
 */
const SYSTEM_PROMPT = `You are an expert data analyst. Convert the user's natural language question into a PostgreSQL SQL query using the provided database schema.

If the user's question is unrelated to the provided database schema, data analysis, or business metrics (e.g., greetings, general conversation, personal questions, or comments like "today is a nice day"), you must indicate that it is out of scope.

IMPORTANT RULES:
1. Only generate SELECT queries. Never generate INSERT, UPDATE, DELETE, DROP, ALTER, or any DDL/DML statements.
2. Always use proper PostgreSQL syntax.
3. Use aggregate functions (SUM, AVG, COUNT, etc.) when appropriate.
4. Use GROUP BY when using aggregate functions with non-aggregated columns.
5. Use ORDER BY to sort results meaningfully.
6. When multiple tables are provided, use JOINs to correlate them if necessary. ALWAYS use table aliases (e.g., s.order_id) when querying multiple tables to avoid ambiguity.
7. Limit results to 100 rows max unless the user asks for more.
7. For date-based queries, use EXTRACT or DATE_TRUNC functions.
8. Always alias calculated columns with meaningful names.
9. When referring to "Q1", "Q2", "Q3", "Q4", use EXTRACT(QUARTER FROM order_date).
10. When referring to "monthly", use EXTRACT(MONTH FROM order_date) or TO_CHAR(order_date, 'Month').
11. ALWAYS order the results by the X-axis column (usually date or time) in ascending order to ensure correct line chart rendering.

You MUST respond with ONLY a valid JSON object (no markdown, no code fences, no explanation) in this exact format:
{
  "sql": "YOUR SQL QUERY HERE" or null,
  "is_out_of_scope": true/false,
  "chart_type": "line|bar|pie|scatter|table|kpi|heatmap",
  "x_axis": "column_name_for_x_axis",
  "y_axis": "column_name_for_y_axis",
  "z_axis": "column_name_for_value_in_heatmap" or null,
  "title": "A short descriptive title for the chart",
  "description": "A brief description of what the data shows, or an explanation if out of scope"
}

Chart type selection rules:
- Use "line" for time-series or trend data (when dates are involved)
- Use "bar" for category comparisons
- Use "pie" for distribution/proportion data (e.g., breakdown by category, region)
- Use "scatter" for correlation between two numeric values
- Use "table" for detailed row-level data
- Use "kpi" for single aggregate values (e.g., total revenue, average rating)
- Use "heatmap" for analyzing density or correlation between two categorical dimensions (e.g., Sales by Region AND Category)
`;

/**
 * Convert natural language query to SQL using Gemini
 * @param {string} userQuery
 * @param {Array<{name: string, columns: string}>} tables - Array of available tables
 */
export const generateSQL = async (userQuery, tables = []) => {
  try {
    const schemaContext = getSchemaContext(tables);

    const prompt = `
Database Schema:
${schemaContext}

User Question: "${userQuery}"

Generate the SQL query and visualization config as JSON.`;

    const model = genAI.getGenerativeModel({ 
      model: env.geminiModel,
      systemInstruction: SYSTEM_PROMPT 
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    // Clean up the response — remove markdown code fences if present
    let cleaned = text;
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.slice(0, -3);
    }
    cleaned = cleaned.trim();

    const parsed = JSON.parse(cleaned);

    // Check for out of scope
    if (parsed.is_out_of_scope || !parsed.sql) {
      const msg = parsed.description || "I'm sorry, I can only help with data-related questions about your business metrics.";
      throw new Error(`OUT_OF_SCOPE: ${msg}`);
    }

    // Validate — ensure no destructive SQL
    const sqlUpper = parsed.sql.toUpperCase().trim();
    const forbidden = ['INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER', 'CREATE', 'TRUNCATE', 'GRANT', 'REVOKE'];
    for (const keyword of forbidden) {
      if (sqlUpper.startsWith(keyword)) {
        throw new Error(`Forbidden SQL operation detected: ${keyword}`);
      }
    }

    return {
      sql: parsed.sql,
      chartType: parsed.chart_type || 'bar',
      xAxis: parsed.x_axis || '',
      yAxis: parsed.y_axis || '',
      zAxis: parsed.z_axis || '',
      title: parsed.title || 'Query Results',
      description: parsed.description || '',
    };
  } catch (error) {
    console.error('Gemini API Error:', error.message);
    throw new Error(`Failed to generate SQL from AI: ${error.message}`);
  }
};

/**
 * Generate a refined SQL query based on a follow-up message and conversation history
 * @param {string} followUpQuery - the user's follow-up message
 * @param {Array<{query: string, sql: string, title: string}>} history - previous turns
 * @param {Array<{name: string, columns: string}>} tables - Array of available tables
 */
export const generateFollowUpSQL = async (followUpQuery, history = [], tables = []) => {
  try {
    const schemaContext = getSchemaContext(tables);

    // Build conversation history block
    const historyBlock = history
      .map((turn, i) => `Turn ${i + 1}:
  User asked: "${turn.query}"
  Generated SQL: ${turn.sql}`)
      .join('\n\n');

    const prompt = `
Database Schema:
${schemaContext}

Conversation History:
${historyBlock || '(No previous turns)'}

User Follow-up: "${followUpQuery}"

Based on the conversation history above, generate a refined SQL query that applies the user's requested modification.
Return ONLY the JSON object as specified — no explanation.`;

    const model = genAI.getGenerativeModel({
      model: env.geminiModel,
      systemInstruction: SYSTEM_PROMPT,
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    // Clean up potential markdown fences
    let cleaned = text;
    if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
    else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
    if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
    cleaned = cleaned.trim();

    const parsed = JSON.parse(cleaned);

    // Check for out of scope
    if (parsed.is_out_of_scope || !parsed.sql) {
      const msg = parsed.description || "I'm sorry, I can only help with data-related questions about your business metrics.";
      throw new Error(`OUT_OF_SCOPE: ${msg}`);
    }

    // Validate — ensure no destructive SQL
    const sqlUpper = parsed.sql.toUpperCase().trim();
    const forbidden = ['INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER', 'CREATE', 'TRUNCATE', 'GRANT', 'REVOKE'];
    for (const keyword of forbidden) {
      if (sqlUpper.startsWith(keyword)) {
        throw new Error(`Forbidden SQL operation detected: ${keyword}`);
      }
    }

    return {
      sql: parsed.sql,
      chartType: parsed.chart_type || 'bar',
      xAxis: parsed.x_axis || '',
      yAxis: parsed.y_axis || '',
      zAxis: parsed.z_axis || '',
      title: parsed.title || 'Query Results',
      description: parsed.description || '',
    };
  } catch (error) {
    console.error('Gemini Follow-up Error:', error.message);
    throw new Error(`Failed to generate follow-up SQL: ${error.message}`);
  }
};
