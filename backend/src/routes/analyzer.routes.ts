import { Router } from 'express';
import { AnalyzerController } from '../controllers/AnalyzerController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/:reportId/analyze', AnalyzerController.analyzeReport);
router.get('/recommendations', AnalyzerController.getRecommendations);
router.get('/trends', AnalyzerController.generateTrends);
router.get('/health-score', AnalyzerController.getHealthScore);

export default router;
