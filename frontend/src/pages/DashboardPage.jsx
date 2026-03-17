import { useAuth } from '../context/AuthContext';
import { useDashboard } from '../hooks/useDashboard';
import PromptInput from '../components/PromptInput';
import Dashboard from '../components/Dashboard';
import ChatPanel from '../components/ChatPanel';
import {
  Loader2,
  AlertCircle,
  X,
  History,
  Sparkles,
  BarChart3,
  PieChart,
  TrendingUp,
  Database,
  LogOut,
  User,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const {
    loading,
    error,
    result,
    history,
    conversationHistory,
    executeQuery,
    executeFollowUp,
    handleUpload,
    clearError,
    selectHistoryItem,
    clearConversation,
  } = useDashboard();

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl opacity-20" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-xl sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">
                    AI BI <span className="text-indigo-400">Dash</span>
                  </h1>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Studio Environment</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="hidden md:flex items-center gap-4 text-xs text-gray-500 font-medium">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5">
                    <Database className="w-3.5 h-3.5" />
                    PostgreSQL
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Gemini 1.5
                  </span>
                </div>

                <div className="h-8 w-[1px] bg-white/10 hidden md:block" />

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 px-3 py-1.5 bg-white/5 rounded-xl border border-white/5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-sm font-bold leading-none">{user?.full_name}</p>
                      <p className="text-[10px] text-gray-500 mt-1">{user?.email}</p>
                    </div>
                  </div>
                  <button 
                    onClick={logout}
                    className="p-2.5 hover:bg-red-500/10 hover:text-red-500 text-gray-400 rounded-xl border border-transparent transition-all flex items-center gap-2 group"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="text-xs font-bold sm:block hidden">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex gap-8">
            {/* Main Content */}
            <div className="flex-1 min-w-0 space-y-8">
              {/* Hero section when no result */}
              {!result && !loading && (
                <div className="text-center py-16">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm mb-6">
                    <Sparkles className="w-4 h-4" />
                    AI-Powered Analytics
                  </div>
                  <h2 className="text-4xl font-bold text-white mb-4">
                    Ask questions, get{' '}
                    <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                      instant insights
                    </span>
                  </h2>
                  <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
                    Type a natural language question about your data and watch as AI generates
                    interactive dashboards in seconds.
                  </p>

                  {/* Feature cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-12">
                    {[
                      { icon: BarChart3, title: 'Bar Charts', desc: 'Compare categories' },
                      { icon: TrendingUp, title: 'Line Charts', desc: 'Track trends' },
                      { icon: PieChart, title: 'Pie Charts', desc: 'See distributions' },
                    ].map(({ icon: Icon, title, desc }) => (
                      <div
                        key={title}
                        className="p-4 bg-gray-900/40 border border-gray-800/50 rounded-xl"
                      >
                        <Icon className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-white">{title}</p>
                        <p className="text-xs text-gray-500">{desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prompt Input */}
              <PromptInput
                onSubmit={executeQuery}
                onUpload={handleUpload}
                loading={loading}
              />

              {/* Error Display */}
              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl animate-in fade-in duration-300">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-red-400 font-medium">Error Processing Query</p>
                    <p className="text-sm text-red-300/70 mt-1">{error}</p>
                  </div>
                  <button
                    onClick={clearError}
                    className="p-1 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
                    <Sparkles className="w-6 h-6 text-purple-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-gray-400 mt-6 text-sm">Analyzing your query with AI...</p>
                  <p className="text-gray-600 text-xs mt-1">Generating SQL and visualizations</p>
                </div>
              )}

              {/* Dashboard Result */}
              {result && !loading && <Dashboard result={result} />}

              {/* Follow-up Chat Panel — only shown when a result exists */}
              {result && (
                <ChatPanel
                  conversationHistory={conversationHistory}
                  onFollowUp={executeFollowUp}
                  onClear={clearConversation}
                  loading={loading}
                  currentResult={result}
                />
              )}
            </div>

            {/* History Sidebar */}
            {history.length > 0 && (
              <aside className="hidden lg:block w-72 shrink-0">
                <div className="sticky top-24">
                  <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <History className="w-4 h-4 text-gray-400" />
                      <h3 className="text-sm font-semibold text-gray-300">Query History</h3>
                    </div>
                    <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
                      {history.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => selectHistoryItem(item)}
                          className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
                            result?.id === item.id
                              ? 'bg-purple-500/10 border border-purple-500/30'
                              : 'bg-gray-800/30 border border-transparent hover:bg-gray-800/50 hover:border-gray-700/50'
                          }`}
                        >
                          <p className="text-sm text-gray-300 line-clamp-2">{item.query}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-xs text-gray-600">{item.timestamp}</span>
                            <span className="text-xs px-1.5 py-0.5 bg-gray-700/50 rounded text-gray-400">
                              {item.chartType}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
