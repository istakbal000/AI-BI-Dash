import { useState, useCallback } from 'react';
import { sendQuery, uploadCSV, getSchema } from '../services/apiService';

/**
 * Custom hook for dashboard state management
 */
export const useDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [schema, setSchema] = useState(null);

  /**
   * Execute a natural language query
   */
  const executeQuery = useCallback(async (query, table = 'sales') => {
    setLoading(true);
    setError(null);

    try {
      const response = await sendQuery(query, table);

      if (response.success) {
        const entry = {
          id: Date.now(),
          query,
          timestamp: new Date().toLocaleTimeString(),
          ...response.data,
        };
        setResult(entry);
        setHistory((prev) => [entry, ...prev]);
      } else {
        setError(response.error || 'Unknown error occurred');
      }
    } catch (err) {
      const message =
        err.response?.data?.error || err.message || 'Failed to process query';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Upload a CSV file
   */
  const handleUpload = useCallback(async (file) => {
    setLoading(true);
    setError(null);

    try {
      const response = await uploadCSV(file);
      if (response.success) {
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (err) {
      const message =
        err.response?.data?.error || err.message || 'Failed to upload file';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch database schema
   */
  const fetchSchema = useCallback(async () => {
    try {
      const response = await getSchema();
      if (response.success) {
        setSchema(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch schema:', err);
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => setError(null), []);

  /**
   * Select a history item to re-display
   */
  const selectHistoryItem = useCallback((item) => {
    setResult(item);
    setError(null);
  }, []);

  return {
    loading,
    error,
    result,
    history,
    schema,
    executeQuery,
    handleUpload,
    fetchSchema,
    clearError,
    selectHistoryItem,
  };
};
