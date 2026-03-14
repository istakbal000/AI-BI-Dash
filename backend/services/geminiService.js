import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env.js';

const genAI = new GoogleGenerativeAI(env.geminiApiKey);

/**
 * Schema context for Gemini — describes available tables and columns
 */
const getSchemaContext = (tableName = 'sales', columns = null) => {
  const defaultColumns = `
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

  return `
Table: ${tableName}
Columns:
${columns || defaultColumns}
  `;
};

/**
 * System prompt for Gemini SQL generation
 */
const SYSTEM_PROMPT = `You are an expert data analyst. Convert the user's natural language question into a PostgreSQL SQL query using the provided database schema.

IMPORTANT RULES:
1. Only generate SELECT queries. Never generate INSERT, UPDATE, DELETE, DROP, ALTER, or any DDL/DML statements.
2. Always use proper PostgreSQL syntax.
3. Use aggregate functions (SUM, AVG, COUNT, etc.) when appropriate.
4. Use GROUP BY when using aggregate functions with non-aggregated columns.
5. Use ORDER BY to sort results meaningfully.
6. Limit results to 100 rows max unless the user asks for more.
7. For date-based queries, use EXTRACT or DATE_TRUNC functions.
8. Always alias calculated columns with meaningful names.
9. When referring to "Q1", "Q2", "Q3", "Q4", use EXTRACT(QUARTER FROM order_date).
10. When referring to "monthly", use EXTRACT(MONTH FROM order_date) or TO_CHAR(order_date, 'Month').

You MUST respond with ONLY a valid JSON object (no markdown, no code fences, no explanation) in this exact format:
{
  "sql": "YOUR SQL QUERY HERE",
  "chart_type": "line|bar|pie|scatter|table|kpi",
  "x_axis": "column_name_for_x_axis",
  "y_axis": "column_name_for_y_axis",
  "title": "A short descriptive title for the chart",
  "description": "A brief description of what the data shows"
}

Chart type selection rules:
- Use "line" for time-series or trend data (when dates are involved)
- Use "bar" for category comparisons
- Use "pie" for distribution/proportion data (e.g., breakdown by category, region)
- Use "scatter" for correlation between two numeric values
- Use "table" for detailed row-level data
- Use "kpi" for single aggregate values (e.g., total revenue, average rating)
`;

/**
 * Convert natural language query to SQL using Gemini
 */
export const generateSQL = async (userQuery, tableName = 'sales', columns = null) => {
  try {
    const schemaContext = getSchemaContext(tableName, columns);

    const prompt = `
Database Schema:
${schemaContext}

User Question: "${userQuery}"

Generate the SQL query and visualization config as JSON.`;

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-flash-latest',
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
      title: parsed.title || 'Query Results',
      description: parsed.description || '',
    };
  } catch (error) {
    console.error('Gemini API Error:', error.message);
    throw new Error(`Failed to generate SQL from AI: ${error.message}`);
  }
};
