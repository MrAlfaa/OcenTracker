import express from 'express';
import { createUser, getDrivers } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminAuthMiddleware } from '../middleware/adminAuth.middleware';

const router = express.Router();

// Create user (admin/driver) - only accessible by superAdmin
router.post('/create', authMiddleware, createUser);

// Get all drivers - accessible by admin, superAdmin, and driver roles
router.get('/drivers', authMiddleware, getDrivers);

// Get a specific driver by ID
router.get('/drivers/:id', authMiddleware, adminAuthMiddleware, /* getDriverById */);

// Update driver information (for future implementation)
router.put('/drivers/:id', authMiddleware, adminAuthMiddleware, /* updateDriver */);

export default router;