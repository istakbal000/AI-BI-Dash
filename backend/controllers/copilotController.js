import {
  analyzeWithCopilot,
  generateInsights,
  performRootCauseAnalysis,
  runWhatIfSimulation,
  generateRecommendations
} from '../services/copilotService.js';

/**
 * POST /api/copilot/analyze
 * Main copilot endpoint that runs all enabled analyses
 */
export const handleCopilotAnalyze = async (req, res, next) => {
  try {
    const {
      queryData,
      userQuery,
      enableInsights = true,
      enableRootCause = false,
      whyQuestion,
      enableSimulation = false,
      simulationScenario,
      enableRecommendations = true,
      table = 'sales',
      columns
    } = req.body;

    if (!queryData || !Array.isArray(queryData)) {
      return res.status(400).json({
        success: false,
        error: 'queryData array is required for analysis'
      });
    }

    const analysisRequest = {
      queryData,
      userQuery: userQuery || 'Data analysis',
      enableInsights,
      enableRootCause,
      whyQuestion,
      enableSimulation,
      simulationScenario,
      enableRecommendations,
      tableName: table,
      columns
    };

    const result = await analyzeWithCopilot(analysisRequest);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/copilot/insights
 * Generate insights from query results only
 */
export const handleGenerateInsights = async (req, res, next) => {
  try {
    const { queryData, userQuery, table = 'sales', columns } = req.body;

    if (!queryData || !Array.isArray(queryData)) {
      return res.status(400).json({
        success: false,
        error: 'queryData array is required'
      });
    }

    const insights = await generateInsights(queryData, userQuery || 'Data analysis', table, columns);

    res.json({
      success: true,
      data: { insights }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/copilot/root-cause
 * Perform root cause analysis on a "why" question
 */
export const handleRootCauseAnalysis = async (req, res, next) => {
  try {
    const { whyQuestion, queryData, table = 'sales', columns } = req.body;

    if (!whyQuestion || whyQuestion.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'whyQuestion is required for root cause analysis'
      });
    }

    if (!queryData || !Array.isArray(queryData)) {
      return res.status(400).json({
        success: false,
        error: 'queryData array is required'
      });
    }

    const rootCause = await performRootCauseAnalysis(whyQuestion, queryData, table, columns);

    res.json({
      success: true,
      data: { root_cause: rootCause }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/copilot/simulate
 * Run what-if simulation
 */
export const handleWhatIfSimulation = async (req, res, next) => {
  try {
    const { scenario, queryData, table = 'sales', columns } = req.body;

    if (!scenario || scenario.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'scenario description is required for simulation'
      });
    }

    if (!queryData || !Array.isArray(queryData)) {
      return res.status(400).json({
        success: false,
        error: 'queryData array is required'
      });
    }

    const simulation = await runWhatIfSimulation(scenario, queryData, table, columns);

    res.json({
      success: true,
      data: { simulation }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/copilot/recommendations
 * Generate recommendations based on data
 */
export const handleGenerateRecommendations = async (req, res, next) => {
  try {
    const { queryData, context, table = 'sales', columns } = req.body;

    if (!queryData || !Array.isArray(queryData)) {
      return res.status(400).json({
        success: false,
        error: 'queryData array is required'
      });
    }

    const recommendations = await generateRecommendations(queryData, context || {}, table, columns);

    res.json({
      success: true,
      data: { recommendations }
    });
  } catch (error) {
    next(error);
  }
};
