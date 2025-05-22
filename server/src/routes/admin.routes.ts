import express from 'express';
import { getDashboardStats } from '../controllers/admin.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminAuthMiddleware } from '../middleware/adminAuth.middleware';

const router = express.Router();

// Get dashboard statistics
router.get('/dashboard-stats', authMiddleware, adminAuthMiddleware, getDashboardStats);

export default router;