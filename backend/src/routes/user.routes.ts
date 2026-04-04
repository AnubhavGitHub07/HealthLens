import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { userValidation } from '../validators';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/profile', UserController.getProfile);
router.put('/profile', userValidation.updateProfile, UserController.updateProfile);
router.delete('/account', UserController.deleteAccount);

router.get('/settings', UserController.getSettings);
router.put('/settings', UserController.updateSettings);

router.get('/health-data', UserController.getHealthData);
router.post('/health-data/metric', UserController.addHealthMetric);

export default router;
