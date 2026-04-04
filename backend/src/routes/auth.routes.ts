import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authValidation } from '../validators';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/signup', authValidation.signup, AuthController.signup);
router.post('/login', authValidation.login, AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);

// Protected routes
router.post('/logout', authenticate, AuthController.logout);
router.get('/me', authenticate, AuthController.getCurrentUser);

export default router;
