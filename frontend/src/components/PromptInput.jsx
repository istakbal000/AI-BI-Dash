import { useState, useRef } from 'react';
import { Send, Sparkles, Upload, Loader2 } from 'lucide-react';

const DEMO_PROMPTS = [
  "Show monthly sales revenue for 2023 broken down by region",
  "What are the top 5 product categories by total revenue?",
  "Show average rating by payment method",
  "Compare quantity sold across regions for Electronics",
  "Show the distribution of discount percentages",
  "What is the total revenue for each quarter?",
];

export default function PromptInput({ onSubmit, onUpload, loading }) {
  const [query, setQuery] = useState('');
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && !loading) {
      onSubmit(query.trim());
      setQuery('');
    }
  };

  const handleDemoClick = (prompt) => {
    setQuery(prompt);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file && onUpload) {
      await onUpload(file);
      e.target.value = '';
    }
  };

  return (
    <div className="w-full">
      {/* Main Input Area */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl shadow-purple-500/5 transition-all duration-300 focus-within:border-purple-500/50 focus-within:shadow-purple-500/10">
          <Sparkles className="absolute left-4 w-5 h-5 text-purple-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask anything about your data..."
            className="flex-1 bg-transparent text-white placeholder-gray-500 py-4 pl-12 pr-4 text-lg outline-none"
            disabled={loading}
          />
          <div className="flex items-center gap-2 pr-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-xl transition-all duration-200"
              title="Upload CSV"
            >
              <Upload className="w-5 h-5" />
            </button>
            <button
              type="submit"
              disabled={!query.trim() || loading}
              className="p-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 shadow-lg shadow-purple-500/25"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />
      </form>

      {/* Demo Prompts */}
      <div className="mt-4 flex flex-wrap gap-2">
        {DEMO_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleDemoClick(prompt)}
            className="px-3 py-1.5 text-xs text-gray-400 bg-gray-800/50 hover:bg-gray-700/50 hover:text-purple-300 border border-gray-700/40 rounded-full transition-all duration-200 hover:border-purple-500/30"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
