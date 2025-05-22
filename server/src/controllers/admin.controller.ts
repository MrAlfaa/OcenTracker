import { Request, Response } from 'express';
import User from '../models/user.model';
import Shipment from '../models/shipment.model';

// Get dashboard statistics
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Check if user is admin or superAdmin
    if (req.user.role !== 'admin' && req.user.role !== 'superAdmin') {
      return res.status(403).json({ message: 'Unauthorized. Admin privileges required.' });
    }

    // Get user statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ active: true });
    const inactiveUsers = await User.countDocuments({ active: false });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const driverUsers = await User.countDocuments({ role: 'driver' });
    const regularUsers = await User.countDocuments({ role: 'user' });

    // Get shipment statistics
    const totalShipments = await Shipment.countDocuments();
    const pendingShipments = await Shipment.countDocuments({ status: 'Pending' });
    const inTransitShipments = await Shipment.countDocuments({ status: 'In Transit' });
    const deliveredShipments = await Shipment.countDocuments({ status: { $in: ['Delivered', 'Delivery Completed'] } });
    const delayedShipments = await Shipment.countDocuments({ status: 'Delayed' });
    const cancelledShipments = await Shipment.countDocuments({ status: 'Cancelled' });

    // Get recent shipments
    const recentShipments = await Shipment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('trackingNumber status origin destination senderName recipientName createdAt')
      .lean();

    // Get recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('userID firstName lastName email role createdAt')
      .lean();

    // Monthly shipment data (for charts)
    const currentDate = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(currentDate.getMonth() - 5);
    
    const monthlyCounts = [];
    
    // Get monthly shipment counts for the last 6 months
    for (let i = 0; i < 6; i++) {
      const month = new Date(sixMonthsAgo);
      month.setMonth(sixMonthsAgo.getMonth() + i);
      
      const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
      const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      
      const count = await Shipment.countDocuments({
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      });
      
      monthlyCounts.push({
        month: month.toLocaleString('default', { month: 'short' }),
        count
      });
    }

    // Return all statistics
    res.json({
      userStats: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        admins: adminUsers,
        drivers: driverUsers,
        regular: regularUsers
      },
      shipmentStats: {
        total: totalShipments,
        pending: pendingShipments,
        inTransit: inTransitShipments,
        delivered: deliveredShipments,
        delayed: delayedShipments,
        cancelled: cancelledShipments,
        activeShipments: pendingShipments + inTransitShipments + delayedShipments,
        completedShipments: deliveredShipments
      },
      recentShipments,
      recentUsers,
      monthlyShipments: monthlyCounts
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};