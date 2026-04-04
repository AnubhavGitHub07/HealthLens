import { body, param, query } from 'express-validator';

export const authValidation = {
  signup: [
    body('firstName')
      .trim()
      .notEmpty()
      .withMessage('First name is required')
      .isLength({ min: 2 })
      .withMessage('First name must be at least 2 characters'),
    body('lastName')
      .trim()
      .notEmpty()
      .withMessage('Last name is required')
      .isLength({ min: 2 })
      .withMessage('Last name must be at least 2 characters'),
    body('email')
      .trim()
      .isEmail()
      .withMessage('Valid email is required')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain uppercase, lowercase, number and special character')
  ],
  login: [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Valid email is required')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ]
};

export const reportValidation = {
  upload: [
    body('fileName')
      .notEmpty()
      .withMessage('File name is required')
  ]
};

export const chatValidation = {
  sendMessage: [
    body('message')
      .trim()
      .notEmpty()
      .withMessage('Message cannot be empty')
      .isLength({ min: 1, max: 5000 })
      .withMessage('Message must be between 1 and 5000 characters'),
    body('reportId')
      .optional()
      .isMongoId()
      .withMessage('Invalid report ID')
  ]
};

export const userValidation = {
  updateProfile: [
    body('firstName')
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage('First name must be at least 2 characters'),
    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage('Last name must be at least 2 characters'),
    body('dateOfBirth')
      .optional()
      .isISO8601()
      .withMessage('Valid date is required'),
    body('gender')
      .optional()
      .isIn(['male', 'female', 'other'])
      .withMessage('Invalid gender')
  ]
};

export const analyzerValidation = {
  analyzeReport: [
    param('reportId')
      .isMongoId()
      .withMessage('Invalid report ID')
  ],
  getRecommendations: [
    query('period')
      .optional()
      .isIn(['week', 'month', 'quarter', 'year'])
      .withMessage('Invalid period')
  ]
};
