import express from 'express';
import { 
  getAllSettings, 
  updateSetting, 
  bulkUpdateSettings,
  createSetting 
} from '../controllers/setting.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminAuthMiddleware } from '../middleware/adminAuth.middleware';

const router = express.Router();

// All settings routes should be protected for admins
router.use(authMiddleware, adminAuthMiddleware);

// Get all settings
router.get('/', getAllSettings);

// Update a setting
router.put('/:key', updateSetting);

// Bulk update settings
router.put('/', bulkUpdateSettings);

// Create a new setting (only for super admins)
router.post('/', createSetting);

export default router;