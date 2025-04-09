import express from 'express';
import { register, login, getCurrentUser } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// Register route
router.post('/register', register);

// Login route
router.post('/login', login);

// Get current user route (protected)
router.get('/me', authMiddleware, getCurrentUser);

export default router;
