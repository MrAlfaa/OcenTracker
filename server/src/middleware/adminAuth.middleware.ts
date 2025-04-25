import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';

// This is the main middleware function both routes are trying to import
export const adminAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded;

    // Check if user is admin or superAdmin
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'admin' && user.role !== 'superAdmin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Add a function that checks for specific roles
export const roleAuthMiddleware = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if no token
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
      // Verify token
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
      req.user = decoded;

      // Check if user exists and has one of the allowed roles
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ 
          message: `Access denied. Required roles: ${allowedRoles.join(', ')}` 
        });
      }

      next();
    } catch (err) {
      res.status(401).json({ message: 'Token is not valid' });
    }
  };
};

// Create specific middleware for different role combinations
export const superAdminOnly = roleAuthMiddleware(['superAdmin']);
export const adminAndSuperAdmin = roleAuthMiddleware(['admin', 'superAdmin']);
export const allRoles = roleAuthMiddleware(['user', 'admin', 'superAdmin', 'driver']);
export const driverAccess = roleAuthMiddleware(['driver', 'admin', 'superAdmin']);