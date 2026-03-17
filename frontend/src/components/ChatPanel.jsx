import { useState, useRef, useEffect } from 'react';
import {
  Send, Loader2, MessageSquare, RotateCcw, User, Bot, Sparkles,
} from 'lucide-react';

/**
 * ChatPanel — Conversational follow-up interface rendered below a dashboard result.
 *
 * Props:
 *  - conversationHistory: [{query, sql, title}]  Previous turns
 *  - onFollowUp(text): () => void                Submit a follow-up
 *  - onClear: () => void                         Start a new conversation
 *  - loading: bool                               Global loading state
 *  - currentResult: object                       The latest chart result (to show latest title)
 */
export default function ChatPanel({ conversationHistory, onFollowUp, onClear, loading, currentResult }) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to the bottom whenever history changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory, loading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    onFollowUp(trimmed);
    setInput('');
  };

  // Build chat bubbles from conversationHistory
  const turns = conversationHistory || [];

  return (
    <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl overflow-hidden">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Chat with your dashboard</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {turns.length > 0 ? `${turns.length} turn${turns.length !== 1 ? 's' : ''} in this conversation` : 'Ask a follow-up question to refine the chart'}
            </p>
          </div>
        </div>
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-purple-400 px-3 py-1.5 rounded-lg hover:bg-purple-500/10 transition-all duration-200 border border-transparent hover:border-purple-500/20"
          title="Start a new conversation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          New conversation
        </button>
      </div>

      {/* Chat messages */}
      <div className="max-h-64 overflow-y-auto px-5 py-4 space-y-3">
        {turns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Sparkles className="w-8 h-8 text-purple-500/40 mb-3" />
            <p className="text-sm text-gray-500">No follow-up messages yet.</p>
            <p className="text-xs text-gray-600 mt-1">Try: <span className="italic text-gray-500">"Now filter to only Electronics"</span></p>
          </div>
        ) : (
          turns.map((turn, idx) => (
            <div key={idx} className="space-y-2">
              {/* User bubble */}
              <div className="flex items-start gap-2.5 justify-end">
                <div className="max-w-[80%] bg-purple-600/20 border border-purple-500/20 rounded-2xl rounded-tr-sm px-4 py-2.5">
                  <p className="text-sm text-purple-100">{turn.query}</p>
                </div>
                <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5 text-purple-400" />
                </div>
              </div>
              {/* AI bubble */}
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <div className="max-w-[80%] bg-gray-800/60 border border-gray-700/40 rounded-2xl rounded-tl-sm px-4 py-2.5">
                  <p className="text-sm text-gray-300">
                    ✓ Chart updated
                    {turn.title ? <span className="text-gray-500"> — <span className="italic">{turn.title}</span></span> : ''}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Loading indicator for in-progress follow-up */}
        {loading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="bg-gray-800/60 border border-gray-700/40 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Follow-up Input */}
      <div className="px-5 pb-5 pt-2 border-t border-gray-700/30">
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative flex items-center bg-gray-800/60 border border-gray-700/40 rounded-xl transition-all duration-200 focus-within:border-purple-500/50 focus-within:shadow-sm focus-within:shadow-purple-500/10">
            <Sparkles className="absolute left-3.5 w-4 h-4 text-purple-500/60 shrink-0" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='Refine: "Filter to East Coast only", "Change to pie chart"...'
              className="flex-1 bg-transparent text-white placeholder-gray-600 py-3 pl-10 pr-3 text-sm outline-none"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="mr-2 p-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 shadow-md shadow-purple-500/20 shrink-0"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </form>

        {/* Suggested follow-up chips */}
        {turns.length === 0 && !loading && (
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              'Filter to East Coast only',
              'Show top 3 only',
              'Change to a line chart',
              'Sort by highest value',
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setInput(suggestion)}
                className="text-xs px-3 py-1 text-gray-500 bg-gray-800/40 hover:bg-gray-700/50 hover:text-purple-300 border border-gray-700/30 hover:border-purple-500/30 rounded-full transition-all duration-150"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
