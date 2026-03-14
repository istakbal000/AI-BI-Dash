/**
 * Chart selection engine
 * Rule-based chart type recommendation based on data characteristics
 */

/**
 * Analyze query results and recommend the best chart type
 */
export const recommendChartType = (data, fields, aiSuggestion) => {
  if (!data || data.length === 0) {
    return { chartType: 'table', reason: 'No data available' };
  }

  // If AI already suggested a type, validate it
  if (aiSuggestion && isValidChartType(aiSuggestion)) {
    return { chartType: aiSuggestion, reason: 'AI recommended' };
  }

  const fieldNames = fields.map((f) => f.name.toLowerCase());
  const hasDateField = fieldNames.some((n) =>
    ['date', 'month', 'year', 'quarter', 'day', 'week', 'order_date', 'created_at'].some((d) => n.includes(d))
  );
  const hasCategoryField = fieldNames.some((n) =>
    ['category', 'region', 'type', 'name', 'method', 'status', 'group'].some((c) => n.includes(c))
  );
  const numericFields = fieldNames.filter((n) =>
    ['revenue', 'price', 'total', 'count', 'sum', 'avg', 'average', 'quantity', 'amount', 'rating', 'sales', 'profit', 'discount'].some((num) =>
      n.includes(num)
    )
  );

  // Single row = KPI card
  if (data.length === 1 && numericFields.length > 0) {
    return { chartType: 'kpi', reason: 'Single aggregate value' };
  }

  // Time series → line chart
  if (hasDateField && numericFields.length > 0) {
    return { chartType: 'line', reason: 'Time-series data detected' };
  }

  // Category with few items → pie chart
  if (hasCategoryField && numericFields.length > 0 && data.length <= 8) {
    return { chartType: 'pie', reason: 'Categorical distribution with few categories' };
  }

  // Category comparison → bar chart
  if (hasCategoryField && numericFields.length > 0) {
    return { chartType: 'bar', reason: 'Categorical comparison' };
  }

  // Two numeric columns → scatter
  if (numericFields.length >= 2 && !hasDateField && !hasCategoryField) {
    return { chartType: 'scatter', reason: 'Numeric correlation data' };
  }

  // Fallback to bar chart
  if (numericFields.length > 0) {
    return { chartType: 'bar', reason: 'Default for numeric data' };
  }

  return { chartType: 'table', reason: 'Raw data display' };
};

/**
 * Validate chart type
 */
const isValidChartType = (type) => {
  return ['line', 'bar', 'pie', 'scatter', 'table', 'kpi'].includes(type);
};

/**
 * Format data for Recharts consumption
 */
export const formatChartData = (rows, xAxis, yAxis, chartType) => {
  if (!rows || rows.length === 0) return [];

  return rows.map((row) => {
    const formatted = {};
    for (const [key, value] of Object.entries(row)) {
      // Convert numeric strings to numbers for Recharts
      if (value !== null && !isNaN(value) && value !== '') {
        formatted[key] = parseFloat(value);
      } else {
        formatted[key] = value;
      }
    }
    return formatted;
  });
};

/**
 * Generate KPI metrics from single-row result
 */
export const generateKPIMetrics = (rows, fields) => {
  if (!rows || rows.length === 0) return [];

  const row = rows[0];
  return fields.map((field) => ({
    label: field.name
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase()),
    value: row[field.name],
    type: typeof row[field.name] === 'number' ? 'number' : 'text',
  }));
};
