import { Request, Response } from 'express';
import User from '../models/user.model';
import Counter from '../models/counter.model';

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

// Create a new user (for admin/driver role creation)
export const createUser = async (req: Request, res: Response) => {
  try {
    // Check if user is superAdmin
    if (req.user.role !== 'superAdmin') {
      return res.status(403).json({ message: 'Only Super Admin can create users' });
    }

    const { email, password, firstName, lastName, role, company } = req.body;

    // Validate role
    if (role !== 'admin' && role !== 'driver') {
      return res.status(400).json({ message: 'Invalid role. Must be admin or driver' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Get a unique userID with 4 digits format
    const userID = await getNextUserID();

    // Create new user
    const user = new User({
      userID,
      email,
      password,
      firstName,
      lastName,
      role,
      company
    });

    await user.save();

    res.status(201).json({
      id: user._id,
      userID: user.userID,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      company: user.company,
      role: user.role,
    });
  } catch (error) {
    console.error('User creation error:', error);
    res.status(500).json({ message: 'Server error during user creation' });
  }
};

// Get all drivers
export const getDrivers = async (req: Request, res: Response) => {
  try {
    const drivers = await User.find({ role: 'driver' })
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json(drivers);
  } catch (error) {
    console.error('Get drivers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};