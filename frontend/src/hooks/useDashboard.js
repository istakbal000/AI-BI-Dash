import { useState, useCallback } from 'react';
import { sendQuery, uploadCSV, getSchema, sendFollowUp } from '../services/apiService';

/**
 * Custom hook for dashboard state management
 */
export const useDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [schema, setSchema] = useState(null);
  // conversationHistory tracks {query, sql, title} pairs for follow-up context
  const [conversationHistory, setConversationHistory] = useState([]);
  // activeTable tracks which table the current conversation is about
  const [activeTable, setActiveTable] = useState('sales');

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
        // Reset conversation history on a fresh query
        setConversationHistory([{ query, sql: response.data.sql, title: response.data.title }]);
        setActiveTable(table || 'sales');
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
   * Execute a follow-up query using conversation history as context
   */
  const executeFollowUp = useCallback(async (followUpQuery) => {
    setLoading(true);
    setError(null);

    try {
      const response = await sendFollowUp(followUpQuery, conversationHistory, activeTable);

      if (response.success) {
        const entry = {
          id: Date.now(),
          query: followUpQuery,
          timestamp: new Date().toLocaleTimeString(),
          isFollowUp: true,
          ...response.data,
        };
        setResult(entry);
        setHistory((prev) => [entry, ...prev]);
        // Append this turn to the conversation history
        setConversationHistory((prev) => [
          ...prev,
          { query: followUpQuery, sql: response.data.sql, title: response.data.title },
        ]);
      } else {
        setError(response.error || 'Unknown error occurred');
      }
    } catch (err) {
      const message =
        err.response?.data?.error || err.message || 'Failed to process follow-up';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [conversationHistory, activeTable]);

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

  /**
   * Clear the current conversation and reset dashboard
   */
  const clearConversation = useCallback(() => {
    setResult(null);
    setError(null);
    setConversationHistory([]);
  }, []);

  return {
    loading,
    error,
    result,
    history,
    schema,
    conversationHistory,
    executeQuery,
    executeFollowUp,
    handleUpload,
    fetchSchema,
    clearError,
    selectHistoryItem,
    clearConversation,
  };
};
