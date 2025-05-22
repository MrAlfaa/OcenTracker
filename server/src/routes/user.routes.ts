import express from 'express';
import { 
  createUser, 
  getDrivers, 
  getAllUsers, 
  getUserById, 
  updateUserStatus,
  searchUsers,
  searchRecipients
} from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminAuthMiddleware } from '../middleware/adminAuth.middleware';

const router = express.Router();

// Create user (admin/driver) - only accessible by superAdmin
router.post('/create', authMiddleware, createUser);

// SPECIFIC ROUTES FIRST
// Get all drivers - accessible by admin, superAdmin, and driver roles
router.get('/drivers', authMiddleware, getDrivers);

// Admin-only search (for admin panel)
router.get('/search', authMiddleware, adminAuthMiddleware, searchUsers);

// New route for regular users to search recipients (for sending packages)
router.get('/recipients/search', authMiddleware, searchRecipients);

// Admin routes for user management
router.get('/all', authMiddleware, adminAuthMiddleware, getAllUsers);

// WILDCARD ROUTES LAST
// These routes should come after more specific routes
router.get('/:id', authMiddleware, adminAuthMiddleware, getUserById);
router.put('/:id/status', authMiddleware, adminAuthMiddleware, updateUserStatus);

export default router;