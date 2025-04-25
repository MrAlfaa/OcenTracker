import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import Counter from '../models/counter.model'; // Import the counter model

// Function to get the next userID with 4 digits format (0001, 0002, etc.)
const getNextUserID = async (): Promise<string> => {
  const counter = await Counter.findByIdAndUpdate(
    { _id: 'userID' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  
  // Format the number to have 4 digits with leading zeros
  return counter.seq.toString().padStart(4, '0');
};

// Register a new user
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, company } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Get a unique userID with 4 digits format
    const userID = await getNextUserID();

    // Create new user with userID
    const user = new User({
      userID,
      email,
      password,
      firstName,
      lastName,
      company,
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, userID: user.userID },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        userID: user.userID,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        company: user.company,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, userID: user.userID },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        userID: user.userID,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        company: user.company,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Check if super admin exists
export const checkSuperAdminExists = async (req: Request, res: Response) => {
  try {
    const superAdmin = await User.findOne({ role: 'superAdmin' });
    console.log('Super admin check:', !!superAdmin); // Add logging
    res.json({ exists: !!superAdmin });
  } catch (error) {
    console.error('Check super admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create super admin
export const createSuperAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ role: 'superAdmin' });
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super admin already exists' });
    }

    // Get a unique userID with 4 digits format
    const userID = await getNextUserID();

    // Create super admin
    const superAdmin = new User({
      userID,
      email,
      password,
      firstName,
      lastName,
      role: 'superAdmin',
    });

    await superAdmin.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: superAdmin._id, email: superAdmin.email, role: superAdmin.role, userID: superAdmin.userID },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: superAdmin._id,
        userID: superAdmin.userID,
        email: superAdmin.email,
        firstName: superAdmin.firstName,
        lastName: superAdmin.lastName,
        role: superAdmin.role,
      },
    });
  } catch (error) {
    console.error('Create super admin error:', error);
    res.status(500).json({ message: 'Server error during super admin creation' });
  }
};
