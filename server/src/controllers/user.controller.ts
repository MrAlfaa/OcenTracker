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
    
    console.log(`Found ${drivers.length} drivers`);
    res.json(drivers);
  } catch (error) {
    console.error('Get drivers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Search users by name or ID
export const searchUsers = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    // Search for users with role 'user' by userID, firstName, or lastName
    const users = await User.find({
      role: 'user',
      $or: [
        { userID: { $regex: query, $options: 'i' } },
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } }
      ]
    })
    .select('userID firstName lastName email')
    .limit(10);
    
    res.json(users);
  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({ message: 'Server error during user search' });
  }
};

// Search recipients for sending packages (accessible to regular users)
export const searchRecipients = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    // Don't allow users to search for themselves
    const currentUserID = req.user.userID;
    
    // Search for users with role 'user' by userID, firstName, or lastName
    const users = await User.find({
      role: 'user',
      userID: { $ne: currentUserID }, // Exclude the current user
      $or: [
        { userID: { $regex: query, $options: 'i' } },
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } }
      ]
    })
    .select('userID firstName lastName email')
    .limit(10);
    
    res.json(users);
  } catch (error) {
    console.error('Recipient search error:', error);
    res.status(500).json({ message: 'Server error during recipient search' });
  }
};

// Get all users (for admin)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    // Check if user has appropriate role
    if (req.user.role !== 'admin' && req.user.role !== 'superAdmin') {
      return res.status(403).json({ message: 'Unauthorized. Admin privileges required.' });
    }

    // Get users (exclude passwords)
    const users = await User.find({ role: { $ne: 'superAdmin' } })
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user by ID (for admin)
export const getUserById = async (req: Request, res: Response) => {
  try {
    // Check if user has appropriate role
    if (req.user.role !== 'admin' && req.user.role !== 'superAdmin') {
      return res.status(403).json({ message: 'Unauthorized. Admin privileges required.' });
    }

    const { id } = req.params;
    
    // Get user by ID (exclude password)
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user status (activate/deactivate)
export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    // Check if user has appropriate role
    if (req.user.role !== 'admin' && req.user.role !== 'superAdmin') {
      return res.status(403).json({ message: 'Unauthorized. Admin privileges required.' });
    }

    const { id } = req.params;
    const { active } = req.body;
    
    // Don't allow superAdmins to be deactivated
    const userToUpdate = await User.findById(id);
    if (!userToUpdate) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (userToUpdate.role === 'superAdmin') {
      return res.status(403).json({ message: 'Super Admin accounts cannot be modified' });
    }
    
    // Update user status
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { active: active },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};