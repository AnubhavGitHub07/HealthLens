import { Router } from 'express';
import { ChatController } from '../controllers/ChatController';
import { chatValidation } from '../validators';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/message', chatValidation.sendMessage, ChatController.sendMessage);
router.get('/history', ChatController.getChatHistory);
router.delete('/:messageId', ChatController.deleteChatMessage);
router.post('/:messageId/rate', ChatController.rateChatMessage);
router.get('/stats', ChatController.getChatStats);

export default router;
