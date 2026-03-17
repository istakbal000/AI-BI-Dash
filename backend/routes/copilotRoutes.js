import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  handleCopilotAnalyze,
  handleGenerateInsights,
  handleRootCauseAnalysis,
  handleWhatIfSimulation,
  handleGenerateRecommendations
} from '../controllers/copilotController.js';

const router = Router();

// Apply protect middleware to all routes
router.use(protect);

// POST /api/copilot/analyze - Full copilot analysis
router.post('/analyze', handleCopilotAnalyze);

// POST /api/copilot/insights - Generate insights only
router.post('/insights', handleGenerateInsights);

// POST /api/copilot/root-cause - Root cause analysis
router.post('/root-cause', handleRootCauseAnalysis);

// POST /api/copilot/simulate - What-if simulation
router.post('/simulate', handleWhatIfSimulation);

// POST /api/copilot/recommendations - Generate recommendations
router.post('/recommendations', handleGenerateRecommendations);

export default router;
