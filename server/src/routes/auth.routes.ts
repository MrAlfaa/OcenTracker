import express from 'express';
import { 
  register, 
  login, 
  getCurrentUser, 
  checkSuperAdminExists, 
  createSuperAdmin 
} from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// Register route
router.post('/register', register);

// Login route
router.post('/login', login);

// Get current user route (protected)
router.get('/me', authMiddleware, getCurrentUser);

// Super admin routes
router.get('/check-super-admin', checkSuperAdminExists);
router.post('/create-super-admin', createSuperAdmin);

// Import the admin auth middleware
import { adminAuthMiddleware } from '../middleware/adminAuth.middleware';

// Admin protected routes
router.get('/admin/users', adminAuthMiddleware, /* adminController.getUsers */);
router.get('/admin/dashboard-stats', adminAuthMiddleware, /* adminController.getDashboardStats */);

export default router;
