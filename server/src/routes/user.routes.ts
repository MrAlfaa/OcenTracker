import express from 'express';
import { 
  createUser, 
  getDrivers, 
  getAllUsers, 
  getUserById, 
  updateUserStatus,
  searchUsers 
} from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminAuthMiddleware } from '../middleware/adminAuth.middleware';

const router = express.Router();

// Admin routes for user management
router.get('/all', authMiddleware, adminAuthMiddleware, getAllUsers);
router.get('/:id', authMiddleware, adminAuthMiddleware, getUserById);
router.put('/:id/status', authMiddleware, adminAuthMiddleware, updateUserStatus);

// Existing routes
router.post('/create', authMiddleware, createUser);
router.get('/drivers', authMiddleware, getDrivers);
router.get('/search', authMiddleware, searchUsers);

export default router;