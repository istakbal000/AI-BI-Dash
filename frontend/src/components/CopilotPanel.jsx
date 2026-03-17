import { useState, useEffect } from 'react';
import {
  Lightbulb,
  Search,
  Calculator,
  Target,
  Sparkles,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info,
  BarChart3,
  Zap,
  Brain
} from 'lucide-react';
import { analyzeWithCopilot, runSimulation, analyzeRootCause } from '../services/apiService';

const INSIGHT_ICONS = {
  trend: TrendingUp,
  anomaly: AlertTriangle,
  comparison: BarChart3,
  opportunity: Zap,
  warning: AlertTriangle,
  default: Info
};

const getInsightIcon = (type) => {
  return INSIGHT_ICONS[type?.toLowerCase()] || INSIGHT_ICONS.default;
};

const getImpactColor = (impact) => {
  switch (impact?.toLowerCase()) {
    case 'high': return 'text-red-400 bg-red-400/10 border-red-400/20';
    case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    case 'low': return 'text-green-400 bg-green-400/10 border-green-400/20';
    default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
  }
};

export default function CopilotPanel({ result, isVisible, onToggle }) {
  const [activeTab, setActiveTab] = useState('insights');
  const [isLoading, setIsLoading] = useState(false);
  const [copilotData, setCopilotData] = useState(null);
  const [whyQuestion, setWhyQuestion] = useState('');
  const [simulationParams, setSimulationParams] = useState({
    discountChange: 0,
    regionFilter: '',
    priceVariation: 0
  });
  const [simulationResult, setSimulationResult] = useState(null);
  const [rootCauseResult, setRootCauseResult] = useState(null);

  // Fetch copilot analysis when result changes and panel is visible
  useEffect(() => {
    if (isVisible && result?.chartData && !copilotData) {
      fetchCopilotAnalysis();
    }
  }, [isVisible, result]);

  const fetchCopilotAnalysis = async () => {
    if (!result?.chartData) return;

    setIsLoading(true);
    try {
      const response = await analyzeWithCopilot({
        queryData: result.chartData,
        userQuery: result.query || result.title || 'Data analysis',
        enableInsights: true,
        enableRecommendations: true,
        table: result.table || 'sales'
      });

      if (response.success) {
        setCopilotData(response.data);
      }
    } catch (error) {
      console.error('Copilot analysis failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhyAnalysis = async () => {
    if (!whyQuestion.trim() || !result?.chartData) return;

    setIsLoading(true);
    try {
      const response = await analyzeRootCause({
        whyQuestion,
        queryData: result.chartData,
        userQuery: result.query || result.title,
        table: result.table || 'sales'
      });

      if (response.success) {
        setRootCauseResult(response.data.root_cause);
      }
    } catch (error) {
      console.error('Root cause analysis failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulation = async () => {
    if (!result?.chartData) return;

    const scenarioParts = [];
    if (simulationParams.discountChange !== 0) {
      scenarioParts.push(`discount changed by ${simulationParams.discountChange}%`);
    }
    if (simulationParams.regionFilter) {
      scenarioParts.push(`only include region: ${simulationParams.regionFilter}`);
    }
    if (simulationParams.priceVariation !== 0) {
      scenarioParts.push(`price varied by ${simulationParams.priceVariation}%`);
    }

    if (scenarioParts.length === 0) return;

    const scenario = `What if ${scenarioParts.join(', ')}?`;

    setIsLoading(true);
    try {
      const response = await runSimulation({
        scenario,
        queryData: result.chartData,
        table: result.table || 'sales'
      });

      if (response.success) {
        setSimulationResult(response.data.simulation);
      }
    } catch (error) {
      console.error('Simulation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed right-4 top-24 z-40 p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
      >
        <Sparkles className="w-5 h-5 text-white" />
      </button>
    );
  }

  return (
    <div className="fixed right-4 top-24 z-40 w-96 max-h-[calc(100vh-8rem)] overflow-y-auto bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-xl border-b border-gray-700/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white">AI Copilot</span>
          </div>
          <button
            onClick={onToggle}
            className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ChevronUp className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700/50 overflow-x-auto">
        {[
          { id: 'insights', icon: Lightbulb, label: 'Insights' },
          { id: 'why', icon: Search, label: 'Why?' },
          { id: 'simulate', icon: Calculator, label: 'Simulate' },
          { id: 'recommend', icon: Target, label: 'Actions' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/5'
                : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && !isLoading && (
          <div className="space-y-3">
            {!copilotData?.insights?.length ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Run a query to generate insights</p>
              </div>
            ) : (
              copilotData.insights.map((insight, idx) => {
                const Icon = getInsightIcon(insight.type);
                const impactClass = getImpactColor(insight.impact);
                return (
                  <div
                    key={idx}
                    className="p-3 bg-gray-800/50 rounded-xl border border-gray-700/30 hover:border-purple-500/20 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-purple-500/10 rounded-lg shrink-0">
                        <Icon className="w-4 h-4 text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-white">{insight.title}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${impactClass}`}>
                            {insight.impact}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">{insight.description}</p>
                        {insight.metric && (
                          <p className="text-xs text-purple-400 mt-1.5">
                            Metric: {insight.metric}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Root Cause Tab */}
        {activeTab === 'why' && !isLoading && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400">Ask a "Why" question</label>
              <input
                type="text"
                value={whyQuestion}
                onChange={(e) => setWhyQuestion(e.target.value)}
                placeholder="Why did revenue drop in Q3?"
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
              />
              <button
                onClick={handleWhyAnalysis}
                disabled={!whyQuestion.trim() || !result?.chartData}
                className="w-full py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                Analyze Root Cause
              </button>
            </div>

            {rootCauseResult && (
              <div className="space-y-3 animate-in fade-in duration-300">
                {/* Primary Cause */}
                <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-medium text-red-400">Primary Cause</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-red-500/10 text-red-400 rounded-full">
                      {rootCauseResult.primaryCause?.confidence}
                    </span>
                  </div>
                  <p className="text-sm text-white mb-2">{rootCauseResult.primaryCause?.factor}</p>
                  {rootCauseResult.primaryCause?.evidence?.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-xs text-gray-500">Evidence:</span>
                      {rootCauseResult.primaryCause.evidence.map((ev, i) => (
                        <p key={i} className="text-xs text-gray-400 pl-2 border-l-2 border-red-500/30">
                          {ev}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Contributing Factors */}
                {rootCauseResult.contributingFactors?.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-gray-400">Contributing Factors</span>
                    {rootCauseResult.contributingFactors.map((factor, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-gray-800/30 rounded-lg">
                        <div className={`w-2 h-2 rounded-full ${factor.weight === 'major' ? 'bg-yellow-400' : 'bg-gray-500'}`} />
                        <span className="text-xs text-gray-300">{factor.factor}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recommendations */}
                {rootCauseResult.recommendations?.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-gray-400">Next Steps</span>
                    {rootCauseResult.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-2 bg-green-500/5 border border-green-500/10 rounded-lg">
                        <CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
                        <span className="text-xs text-gray-300">{rec}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Simulation Tab */}
        {activeTab === 'simulate' && !isLoading && (
          <div className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-400 block mb-1.5">Discount Change (%)</label>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={simulationParams.discountChange}
                  onChange={(e) => setSimulationParams(p => ({ ...p, discountChange: parseInt(e.target.value) }))}
                  className="w-full accent-purple-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>-50%</span>
                  <span className={simulationParams.discountChange !== 0 ? 'text-purple-400 font-medium' : ''}>
                    {simulationParams.discountChange > 0 ? '+' : ''}{simulationParams.discountChange}%
                  </span>
                  <span>+50%</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 block mb-1.5">Region Filter</label>
                <select
                  value={simulationParams.regionFilter}
                  onChange={(e) => setSimulationParams(p => ({ ...p, regionFilter: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500/50"
                >
                  <option value="">All Regions</option>
                  <option value="North">North</option>
                  <option value="South">South</option>
                  <option value="East">East</option>
                  <option value="West">West</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 block mb-1.5">Price Variation (%)</label>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  value={simulationParams.priceVariation}
                  onChange={(e) => setSimulationParams(p => ({ ...p, priceVariation: parseInt(e.target.value) }))}
                  className="w-full accent-purple-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>-30%</span>
                  <span className={simulationParams.priceVariation !== 0 ? 'text-purple-400 font-medium' : ''}>
                    {simulationParams.priceVariation > 0 ? '+' : ''}{simulationParams.priceVariation}%
                  </span>
                  <span>+30%</span>
                </div>
              </div>

              <button
                onClick={handleSimulation}
                disabled={!result?.chartData}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Calculator className="w-4 h-4" />
                Run Simulation
              </button>
            </div>

            {simulationResult && (
              <div className="space-y-3 animate-in fade-in duration-300">
                {/* Scenario Description */}
                <div className="p-2 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                  <p className="text-xs text-blue-400">{simulationResult.scenario?.description}</p>
                </div>

                {/* Metrics Comparison */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-gray-800/50 rounded-lg">
                    <span className="text-xs text-gray-500 block mb-1">Current</span>
                    <span className="text-lg font-semibold text-white">
                      {typeof simulationResult.baselineMetrics?.currentValue === 'number'
                        ? simulationResult.baselineMetrics.currentValue.toLocaleString()
                        : simulationResult.baselineMetrics?.currentValue}
                    </span>
                  </div>
                  <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <span className="text-xs text-purple-400 block mb-1">Projected</span>
                    <span className="text-lg font-semibold text-white">
                      {typeof simulationResult.projectedMetrics?.projectedValue === 'number'
                        ? simulationResult.projectedMetrics.projectedValue.toLocaleString()
                        : simulationResult.projectedMetrics?.projectedValue}
                    </span>
                    {simulationResult.projectedMetrics?.changePercent !== 0 && (
                      <span className={`text-xs ${simulationResult.projectedMetrics.changePercent > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {simulationResult.projectedMetrics.changePercent > 0 ? '+' : ''}
                        {simulationResult.projectedMetrics.changePercent.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Risk Assessment */}
                {simulationResult.riskAssessment && (
                  <div className={`p-2 rounded-lg border ${
                    simulationResult.riskAssessment.level === 'high'
                      ? 'bg-red-500/5 border-red-500/20'
                      : simulationResult.riskAssessment.level === 'medium'
                        ? 'bg-yellow-500/5 border-yellow-500/20'
                        : 'bg-green-500/5 border-green-500/20'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${
                        simulationResult.riskAssessment.level === 'high'
                          ? 'text-red-400'
                          : simulationResult.riskAssessment.level === 'medium'
                            ? 'text-yellow-400'
                            : 'text-green-400'
                      }`}>
                        Risk: {simulationResult.riskAssessment.level}
                      </span>
                      <span className="text-xs text-gray-500">Confidence: {simulationResult.confidence}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Recommendations Tab */}
        {activeTab === 'recommend' && !isLoading && (
          <div className="space-y-3">
            {!copilotData?.recommendations?.length ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Run a query to get recommendations</p>
              </div>
            ) : (
              copilotData.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-gray-800/50 rounded-xl border border-gray-700/30 hover:border-green-500/20 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center gap-1">
                      <span className="w-6 h-6 flex items-center justify-center bg-green-500/10 text-green-400 text-xs font-bold rounded-full">
                        {rec.priority}
                      </span>
                      <span className="text-[10px] text-gray-500 uppercase">{rec.category}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-white mb-1">{rec.title}</h4>
                      <p className="text-xs text-gray-400 mb-2">{rec.description}</p>

                      {rec.expectedImpact && (
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-3 h-3 text-green-400" />
                          <span className="text-xs text-green-400">
                            {rec.expectedImpact.metric}: {rec.expectedImpact.estimatedChange}
                          </span>
                        </div>
                      )}

                      {rec.implementation && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className={`px-1.5 py-0.5 rounded ${
                            rec.implementation.effort === 'low'
                              ? 'bg-green-500/10 text-green-400'
                              : rec.implementation.effort === 'medium'
                                ? 'bg-yellow-500/10 text-yellow-400'
                                : 'bg-red-500/10 text-red-400'
                          }`}>
                            {rec.implementation.effort} effort
                          </span>
                          <span className="text-gray-500">{rec.implementation.timeline}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
