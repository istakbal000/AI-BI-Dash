import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env.js';

const genAI = new GoogleGenerativeAI(env.geminiApiKey);

/**
 * Schema context for Copilot
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
  discounted_price FLOAT (calculated as price * (1 - discount_percent/100))
  total_revenue FLOAT (calculated as discounted_price * quantity_sold)`;

  return `
Table: ${tableName}
Columns:
${columns || defaultColumns}
  `;
};

/**
 * Generate insights from query results
 */
export const generateInsights = async (queryData, userQuery, tableName = 'sales', columns = null) => {
  try {
    const schemaContext = getSchemaContext(tableName, columns);
    const dataSample = JSON.stringify(queryData.slice(0, 20), null, 2);

    const systemPrompt = `You are an expert business analyst AI. Analyze the provided query results and generate meaningful business insights.

Generate 3-5 concise, actionable insights that highlight:
- Key trends and patterns
- Anomalies or outliers
- Comparative observations
- Business implications

Respond ONLY with a valid JSON array of insight objects (no markdown, no code fences):
[
  {
    "type": "trend|anomaly|comparison|opportunity|warning",
    "title": "Brief insight title",
    "description": "Detailed explanation with context",
    "impact": "high|medium|low",
    "metric": "relevant metric name if applicable"
  }
]`;

    const prompt = `
Database Schema:
${schemaContext}

Original User Query: "${userQuery}"

Query Results Sample (${queryData.length} total rows):
${dataSample}

Generate business insights based on this data.`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      systemInstruction: systemPrompt
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Clean up response
    let cleaned = text;
    if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
    else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
    if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
    cleaned = cleaned.trim();

    const insights = JSON.parse(cleaned);
    return Array.isArray(insights) ? insights : [insights];
  } catch (error) {
    console.error('Insight Generation Error:', error.message);
    return [];
  }
};

/**
 * Perform root cause analysis on a "why" question
 */
export const performRootCauseAnalysis = async (whyQuestion, queryData, tableName = 'sales', columns = null) => {
  try {
    const schemaContext = getSchemaContext(tableName, columns);
    const dataSample = JSON.stringify(queryData.slice(0, 30), null, 2);

    const systemPrompt = `You are an expert business analyst performing root cause analysis. When given a "why" question and data, identify the underlying causes and contributing factors.

Provide a structured analysis with:
- Primary root cause
- Contributing factors
- Supporting evidence from the data
- Recommended investigations

Respond ONLY with a valid JSON object (no markdown, no code fences):
{
  "primaryCause": {
    "factor": "Main root cause explanation",
    "confidence": "high|medium|low",
    "evidence": ["Data point 1", "Data point 2"]
  },
  "contributingFactors": [
    {
      "factor": "Contributing factor description",
      "weight": "major|minor"
    }
  ],
  "dataPatterns": [
    {
      "pattern": "Observed pattern description",
      "correlation": "positive|negative|none"
    }
  ],
  "recommendations": ["Actionable next step 1", "Actionable next step 2"]
}`;

    const prompt = `
Database Schema:
${schemaContext}

User's "Why" Question: "${whyQuestion}"

Query Results Sample (${queryData.length} total rows):
${dataSample}

Perform root cause analysis to answer why this pattern occurred.`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      systemInstruction: systemPrompt
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Clean up response
    let cleaned = text;
    if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
    else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
    if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
    cleaned = cleaned.trim();

    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Root Cause Analysis Error:', error.message);
    return {
      primaryCause: { factor: 'Unable to determine root cause', confidence: 'low', evidence: [] },
      contributingFactors: [],
      dataPatterns: [],
      recommendations: ['Review the data manually for patterns']
    };
  }
};

/**
 * Run what-if simulation
 */
export const runWhatIfSimulation = async (scenario, queryData, tableName = 'sales', columns = null) => {
  try {
    const schemaContext = getSchemaContext(tableName, columns);
    const dataSample = JSON.stringify(queryData.slice(0, 20), null, 2);

    const systemPrompt = `You are a business simulation expert. Given a scenario and current data, project the outcomes of proposed changes.

Scenarios can include:
- Discount percentage changes
- Price adjustments
- Regional filtering effects
- Volume changes

Calculate projected metrics and provide impact analysis.

Respond ONLY with a valid JSON object (no markdown, no code fences):
{
  "scenario": {
    "description": "What was simulated",
    "parameters": { "key": "value" }
  },
  "baselineMetrics": {
    "currentValue": number,
    "metricName": "description"
  },
  "projectedMetrics": {
    "projectedValue": number,
    "changePercent": number,
    "changeAbsolute": number
  },
  "impactBySegment": [
    {
      "segment": "segment name (e.g., region, category)",
      "currentValue": number,
      "projectedValue": number,
      "impactPercent": number
    }
  ],
  "riskAssessment": {
    "level": "low|medium|high",
    "factors": ["Risk factor 1", "Risk factor 2"]
  },
  "confidence": "high|medium|low"
}`;

    const prompt = `
Database Schema:
${schemaContext}

Simulation Scenario: "${scenario}"

Current Data Sample (${queryData.length} total rows):
${dataSample}

Run the what-if simulation and provide projected outcomes.`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      systemInstruction: systemPrompt
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Clean up response
    let cleaned = text;
    if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
    else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
    if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
    cleaned = cleaned.trim();

    return JSON.parse(cleaned);
  } catch (error) {
    console.error('What-If Simulation Error:', error.message);
    return {
      scenario: { description: scenario, parameters: {} },
      baselineMetrics: { currentValue: 0, metricName: 'Unknown' },
      projectedMetrics: { projectedValue: 0, changePercent: 0, changeAbsolute: 0 },
      impactBySegment: [],
      riskAssessment: { level: 'high', factors: ['Simulation failed'] },
      confidence: 'low'
    };
  }
};

/**
 * Generate recommendations based on data analysis
 */
export const generateRecommendations = async (queryData, context = {}, tableName = 'sales', columns = null) => {
  try {
    const schemaContext = getSchemaContext(tableName, columns);
    const dataSample = JSON.stringify(queryData.slice(0, 20), null, 2);
    const contextStr = JSON.stringify(context, null, 2);

    const systemPrompt = `You are a strategic business advisor AI. Based on the data analysis, provide actionable recommendations to improve business outcomes.

Recommendations should be:
- Specific and actionable
- Prioritized by impact and effort
- Supported by data evidence
- Time-bound where applicable

Respond ONLY with a valid JSON array of recommendation objects (no markdown, no code fences):
[
  {
    "priority": 1,
    "category": "revenue|cost|marketing|operations|product|customer",
    "title": "Recommendation title",
    "description": "Detailed recommendation with context",
    "expectedImpact": {
      "metric": "metric to improve",
      "estimatedChange": "e.g., +15% or $50K"
    },
    "implementation": {
      "effort": "low|medium|high",
      "timeline": "immediate|short-term|medium-term|long-term",
      "steps": ["Step 1", "Step 2"]
    },
    "supportingData": ["Data point supporting this recommendation"]
  }
]`;

    const prompt = `
Database Schema:
${schemaContext}

Analysis Context:
${contextStr}

Query Results Sample (${queryData.length} total rows):
${dataSample}

Generate prioritized business recommendations based on this analysis.`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      systemInstruction: systemPrompt
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Clean up response
    let cleaned = text;
    if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
    else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
    if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
    cleaned = cleaned.trim();

    const recommendations = JSON.parse(cleaned);
    return Array.isArray(recommendations) ? recommendations : [recommendations];
  } catch (error) {
    console.error('Recommendation Generation Error:', error.message);
    return [];
  }
};

/**
 * Main copilot analysis function - combines all features
 */
export const analyzeWithCopilot = async (analysisRequest) => {
  const {
    queryData,
    userQuery,
    enableInsights = true,
    enableRootCause = false,
    whyQuestion = null,
    enableSimulation = false,
    simulationScenario = null,
    enableRecommendations = true,
    tableName = 'sales',
    columns = null
  } = analysisRequest;

  const result = {
    insights: [],
    root_cause: null,
    simulation: null,
    recommendations: []
  };

  // Run enabled analyses in parallel
  const promises = [];

  if (enableInsights && queryData.length > 0) {
    promises.push(
      generateInsights(queryData, userQuery, tableName, columns)
        .then(insights => { result.insights = insights; })
    );
  }

  if (enableRootCause && whyQuestion && queryData.length > 0) {
    promises.push(
      performRootCauseAnalysis(whyQuestion, queryData, tableName, columns)
        .then(rootCause => { result.root_cause = rootCause; })
    );
  }

  if (enableSimulation && simulationScenario && queryData.length > 0) {
    promises.push(
      runWhatIfSimulation(simulationScenario, queryData, tableName, columns)
        .then(simulation => { result.simulation = simulation; })
    );
  }

  if (enableRecommendations && queryData.length > 0) {
    const context = {
      userQuery,
      hasRootCause: enableRootCause,
      hasSimulation: enableSimulation
    };
    promises.push(
      generateRecommendations(queryData, context, tableName, columns)
        .then(recommendations => { result.recommendations = recommendations; })
    );
  }

  await Promise.all(promises);

  return result;
};
