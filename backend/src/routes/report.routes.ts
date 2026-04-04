import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { ReportController } from '../controllers/ReportController';
import { reportValidation } from '../validators';
import { authenticate } from '../middleware/auth';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and images are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// All routes require authentication
router.use(authenticate);

router.post('/upload', upload.single('file'), reportValidation.upload, ReportController.uploadReport);
router.get('/', ReportController.listReports);
router.get('/:reportId', ReportController.getReport);
router.put('/:reportId', ReportController.updateReport);
router.delete('/:reportId', ReportController.deleteReport);
router.get('/:reportId/analysis', ReportController.getAnalysisResult);

export default router;
