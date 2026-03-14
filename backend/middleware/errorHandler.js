/**
 * Global error handler middleware
 * Catches all unhandled errors and returns structured JSON responses
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);

  // PostgreSQL specific errors
  if (err.code === '42P01') {
    return res.status(400).json({
      success: false,
      error: 'Table not found. Please check your query references a valid table.',
      details: err.message,
    });
  }

  if (err.code === '42703') {
    return res.status(400).json({
      success: false,
      error: 'Column not found. The query references a column that does not exist.',
      details: err.message,
    });
  }

  if (err.code === '42601') {
    return res.status(400).json({
      success: false,
      error: 'SQL syntax error. The generated query has invalid syntax.',
      details: err.message,
    });
  }

  // Generic error response
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
  });
};
