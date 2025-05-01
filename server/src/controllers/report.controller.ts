import { Request, Response } from 'express';
import User from '../models/user.model';
import Shipment from '../models/shipment.model';
import fs from 'fs';
import path from 'path';
import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { TrackingEvent } from '../models/shipment.model';


// Generate overview report data
export const getOverviewReport = async (req: Request, res: Response) => {
  try {
    // Parse date parameters
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
    
    // Default start date to 6 months ago if not provided
    if (!startDate) {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
      sixMonthsAgo.setDate(1); // Start of month
    }
    
    // Get current system stats
    const totalUsers = await User.countDocuments();
    const totalShipments = await Shipment.countDocuments();
    const activeShipments = await Shipment.countDocuments({
      status: { $in: ['Pending', 'In Transit', 'Delayed'] }
    });
    const deliveredShipments = await Shipment.countDocuments({ status: 'Delivered' });
    
    // Get monthly trends
    const months = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Calculate 6 months of data
    const currentDate = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(currentDate.getMonth() - 5);
    
    for (let i = 0; i < 6; i++) {
      const monthDate = new Date(sixMonthsAgo);
      monthDate.setMonth(sixMonthsAgo.getMonth() + i);
      
      const startOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const endOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);
      
      // Count shipments for this month
      const shipmentsCount = await Shipment.countDocuments({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      });
      
      // Count users registered this month
      const usersCount = await User.countDocuments({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      });
      
      months.push({
        month: monthNames[monthDate.getMonth()],
        shipments: shipmentsCount,
        users: usersCount
      });
    }
    
    // Prepare and send response
    res.json({
      systemStats: {
        totalUsers,
        totalShipments,
        activeShipments,
        deliveredShipments
      },
      monthlyTrends: months
    });
  } catch (error) {
    console.error('Error generating overview report:', error);
    res.status(500).json({ message: 'Error generating report' });
  }
};

// Generate shipment report data
export const getShipmentReport = async (req: Request, res: Response) => {
  try {
    // Parse date parameters
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
    
    // Default start date to 30 days ago if not provided
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Build filter query
    const filterQuery: any = {
      createdAt: { $lte: endDate }
    };
    
    if (startDate) {
      filterQuery.createdAt.$gte = startDate;
    } else {
      filterQuery.createdAt.$gte = thirtyDaysAgo;
    }
    
    // Add additional filters if provided
    if (req.query.status) {
      filterQuery.status = req.query.status;
    }
    
    if (req.query.origin) {
      filterQuery.origin = { $regex: req.query.origin, $options: 'i' };
    }
    
    if (req.query.destination) {
      filterQuery.destination = { $regex: req.query.destination, $options: 'i' };
    }
    
    // Get shipments
    const shipments = await Shipment.find(filterQuery)
      .sort({ createdAt: -1 })
      .lean();
    
    // Calculate statistics
    // 1. Total count
    const totalCount = shipments.length;
    
    // 2. Status distribution
    const statusCounts: Record<string, number> = {};
    shipments.forEach(shipment => {
      const status = shipment.status;
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    const byStatus = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count
    }));
    
    // 3. Origin/Destination distribution
    const originCounts: Record<string, number> = {};
    const destCounts: Record<string, number> = {};
    
    shipments.forEach(shipment => {
      originCounts[shipment.origin] = (originCounts[shipment.origin] || 0) + 1;
      destCounts[shipment.destination] = (destCounts[shipment.destination] || 0) + 1;
    });
    
    const byOriginDestination = [
      ...Object.entries(originCounts).map(([name, count]) => ({
        name: `From: ${name}`,
        count
      })),
      ...Object.entries(destCounts).map(([name, count]) => ({
        name: `To: ${name}`,
        count
      }))
    ];
    
    // 4. Date distribution
    const dateCounts: Record<string, number> = {};
    shipments.forEach(shipment => {
      const dateStr = new Date(shipment.createdAt).toISOString().split('T')[0];
      dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
    });
    
    const byDate = Object.entries(dateCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // 5. Average delivery time
    let avgDeliveryTime = 0;
    const deliveredShipments = shipments.filter(s => s.status === 'Delivered');
    
    if (deliveredShipments.length > 0) {
      const totalHours = deliveredShipments.reduce((total, shipment) => {
        // Find the time between creation and delivery
        const createTime = new Date(shipment.createdAt).getTime();
        
        // Find delivery event
        const deliveryEvent = shipment.trackingHistory.find(event => 
          event.status.toLowerCase().includes('deliver')
        );
        
        const deliveryTime = deliveryEvent 
          ? new Date(deliveryEvent.timestamp).getTime() 
          : new Date().getTime();
        
        const hours = (deliveryTime - createTime) / (1000 * 60 * 60);
        return total + hours;
      }, 0);
      
      avgDeliveryTime = totalHours / deliveredShipments.length;
    }
    
    // Prepare response
    res.json({
      totalCount,
      byStatus,
      byDate,
      byOriginDestination,
      avgDeliveryTime,
      detailedData: shipments
    });
  } catch (error) {
    console.error('Error generating shipment report:', error);
    res.status(500).json({ message: 'Error generating report' });
  }
};

// Generate user report data
export const getUserReport = async (req: Request, res: Response) => {
  try {
    // Parse date parameters
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
    
    // Default start date to 30 days ago if not provided
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Build filter query
    const filterQuery: any = {
      createdAt: { $lte: endDate }
    };
    
    if (startDate) {
      filterQuery.createdAt.$gte = startDate;
    } else {
      filterQuery.createdAt.$gte = thirtyDaysAgo;
    }
    
    // Add additional filters if provided
    if (req.query.role) {
      filterQuery.role = req.query.role;
    }
    
    if (req.query.active) {
      filterQuery.active = req.query.active === 'true';
    }
    
    if (req.query.search) {
      const searchTerm = req.query.search as string;
      filterQuery.$or = [
        { firstName: { $regex: searchTerm, $options: 'i' } },
        { lastName: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
        { userID: { $regex: searchTerm, $options: 'i' } }
      ];
    }
    
    // Get users
    const users = await User.find(filterQuery)
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();
    
    // Calculate statistics
    // 1. Total count
    const totalCount = users.length;
    
    // 2. Role distribution
    const roleCounts: Record<string, number> = {};
    users.forEach(user => {
      const role = user.role;
      roleCounts[role] = (roleCounts[role] || 0) + 1;
    });
    
    const byRole = Object.entries(roleCounts).map(([role, count]) => ({
      role,
      count
    }));
    
    // 3. Status distribution
    const activeCount = users.filter(user => user.active).length;
    const inactiveCount = users.filter(user => !user.active).length;
    
    const byStatus = [
      { status: 'Active', count: activeCount },
      { status: 'Inactive', count: inactiveCount }
    ];
    
    // 4. Creation date distribution
    const dateCounts: Record<string, number> = {};
    users.forEach(user => {
      const dateStr = new Date(user.createdAt).toISOString().split('T')[0];
      dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
    });
    
    const byCreationDate = Object.entries(dateCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Prepare response
    res.json({
      totalCount,
      byRole,
      byStatus,
      byCreationDate,
      detailedData: users
    });
  } catch (error) {
    console.error('Error generating user report:', error);
    res.status(500).json({ message: 'Error generating report' });
  }
};

// Generate driver report data
export const getDriverReport = async (req: Request, res: Response) => {
  try {
    // Parse date parameters
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
    
    // Default start date to 30 days ago if not provided
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Get all drivers
    const driverQuery: any = { role: 'driver' };
    
    if (req.query.driverName) {
      const nameSearch = req.query.driverName as string;
      driverQuery.$or = [
        { firstName: { $regex: nameSearch, $options: 'i' } },
        { lastName: { $regex: nameSearch, $options: 'i' } }
      ];
    }
    
    const drivers = await User.find(driverQuery)
      .select('-password')
      .lean();
    
    // Get completed shipments within date range
    const shipmentQuery: any = {
      status: 'Delivered',
      createdAt: { $lte: endDate }
    };
    
    if (startDate) {
      shipmentQuery.createdAt.$gte = startDate;
    } else {
      shipmentQuery.createdAt.$gte = thirtyDaysAgo;
    }
    
    const completedShipments = await Shipment.find(shipmentQuery).lean();
    
    // Calculate driver performance
    const driverPerformance: any[] = [];
    const driverShipments: Record<string, any[]> = {};
    
    // Group shipments by driver
    completedShipments.forEach(shipment => {
      if (shipment.driverId) {
        if (!driverShipments[shipment.driverId]) {
          driverShipments[shipment.driverId] = [];
        }
        driverShipments[shipment.driverId].push(shipment);
      }
    });
    
    // Calculate performance metrics for each driver
    drivers.forEach(driver => {
      const driverShipmentList = driverShipments[driver.userID] || [];
      const shipmentsDelivered = driverShipmentList.length;
      
      let avgDeliveryTime = 0;
      if (shipmentsDelivered > 0) {
        const totalHours = driverShipmentList.reduce((total, shipment) => {
          // Find the time between first "In Transit" event and "Delivered" event
          const inTransitEvent = shipment.trackingHistory.find((event: TrackingEvent) => 
            event.status === 'In Transit'
          );
          
          const deliveryEvent = shipment.trackingHistory.find((event: TrackingEvent) => 
            event.status === 'Delivered'
          );
          
          
          if (!inTransitEvent || !deliveryEvent) return total;
          
          const transitTime = new Date(inTransitEvent.timestamp).getTime();
          const deliveryTime = new Date(deliveryEvent.timestamp).getTime();
          
          const hours = (deliveryTime - transitTime) / (1000 * 60 * 60);
          return total + hours;
        }, 0);
        
        avgDeliveryTime = totalHours / shipmentsDelivered;
      }
      
      driverPerformance.push({
        driverId: driver.userID,
        driverName: `${driver.firstName} ${driver.lastName}`,
        shipmentsDelivered,
        avgDeliveryTime
      });
    });
    
    // Sort by shipments delivered or avg delivery time
    const sortBy = req.query.sortBy as string || 'shipmentsDelivered';
    if (sortBy === 'avgDeliveryTime') {
      driverPerformance.sort((a, b) => a.avgDeliveryTime - b.avgDeliveryTime);
    } else {
      driverPerformance.sort((a, b) => b.shipmentsDelivered - a.shipmentsDelivered);
    }
    
    // Prepare response
    res.json({
      totalDrivers: drivers.length,
      totalShipmentsDelivered: completedShipments.length,
      byPerformance: driverPerformance,
      detailedData: driverPerformance
    });
  } catch (error) {
    console.error('Error generating driver report:', error);
    res.status(500).json({ message: 'Error generating report' });
  }
};

// Export report
export const exportReport = async (req: Request, res: Response) => {
  try {
    const reportType = req.params.reportType;
    const format = req.query.format || 'csv';
    
    // Get report data based on type
    let reportData;
    let fileNamePrefix;
    
    switch (reportType) {
      case 'overview':
        reportData = await getOverviewReportData(req);
        fileNamePrefix = 'system_overview';
        break;
      case 'shipments':
        reportData = await getShipmentReportData(req);
        fileNamePrefix = 'shipment_report';
        break;
      case 'users':
        reportData = await getUserReportData(req);
        fileNamePrefix = 'user_report';
        break;
      case 'drivers':
        reportData = await getDriverReportData(req);
        fileNamePrefix = 'driver_report';
        break;
      default:
        return res.status(400).json({ message: 'Invalid report type' });
    }
    
    // Format date for filename
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `${fileNamePrefix}_${dateStr}`;
    
    // Export based on requested format
    if (format === 'csv') {
      return exportCsv(res, reportData, fileName, reportType);
    } else if (format === 'excel') {
      return exportExcel(res, reportData, fileName, reportType);
    } else if (format === 'pdf') {
      return exportPdf(res, reportData, fileName, reportType);
    } else {
      return res.status(400).json({ message: 'Invalid export format' });
    }
  } catch (error) {
    console.error('Error exporting report:', error);
    res.status(500).json({ message: 'Error exporting report' });
  }
};

// Helper functions for fetching different report types
async function getOverviewReportData(req: Request) {
  // Reuse logic from getOverviewReport
  const startDate = req.query.startDate ? new Date(req.query.startDate as string) : null;
  const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
  
  // Default start date to 6 months ago if not provided
  if (!startDate) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1); // Start of month
  }
  
  // Get current system stats
  const totalUsers = await User.countDocuments();
  const totalShipments = await Shipment.countDocuments();
  const activeShipments = await Shipment.countDocuments({
    status: { $in: ['Pending', 'In Transit', 'Delayed'] }
  });
  const deliveredShipments = await Shipment.countDocuments({ status: 'Delivered' });
  
  // Get monthly trends
  const months = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Calculate 6 months of data
  const currentDate = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(currentDate.getMonth() - 5);
  
  for (let i = 0; i < 6; i++) {
    const monthDate = new Date(sixMonthsAgo);
    monthDate.setMonth(sixMonthsAgo.getMonth() + i);
    
    const startOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const endOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);
    
    // Count shipments for this month
    const shipmentsCount = await Shipment.countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });
    
    // Count users registered this month
    const usersCount = await User.countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });
    
    months.push({
      month: monthNames[monthDate.getMonth()],
      shipments: shipmentsCount,
      users: usersCount
    });
  }
  
  return {
    systemStats: {
      totalUsers,
      totalShipments,
      activeShipments,
      deliveredShipments
    },
    monthlyTrends: months
  };
}

async function getShipmentReportData(req: Request) {
  // Reuse logic from getShipmentReport
  const startDate = req.query.startDate ? new Date(req.query.startDate as string) : null;
  const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
  
  // Default start date to 30 days ago if not provided
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  // Build filter query
  const filterQuery: any = {
    createdAt: { $lte: endDate }
  };
  
  if (startDate) {
    filterQuery.createdAt.$gte = startDate;
  } else {
    filterQuery.createdAt.$gte = thirtyDaysAgo;
  }
  
  // Add additional filters if provided
  if (req.query.status) {
    filterQuery.status = req.query.status;
  }
  
  if (req.query.origin) {
    filterQuery.origin = { $regex: req.query.origin, $options: 'i' };
  }
  
  if (req.query.destination) {
    filterQuery.destination = { $regex: req.query.destination, $options: 'i' };
  }
  
  // Get shipments
  const shipments = await Shipment.find(filterQuery)
    .sort({ createdAt: -1 })
    .lean();
  
  // Rest of logic is the same as getShipmentReport
  // I'm just returning the shipments for simplicity in the export function
  return {
    shipments,
    dateRange: {
      startDate: startDate || thirtyDaysAgo,
      endDate
    }
  };
}

async function getUserReportData(req: Request) {
  // Reuse logic from getUserReport
  const startDate = req.query.startDate ? new Date(req.query.startDate as string) : null;
  const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
  
  // Default start date to 30 days ago if not provided
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  // Build filter query
  const filterQuery: any = {
    createdAt: { $lte: endDate }
  };
  
  if (startDate) {
    filterQuery.createdAt.$gte = startDate;
  } else {
    filterQuery.createdAt.$gte = thirtyDaysAgo;
  }
  
  // Add additional filters if provided
  if (req.query.role) {
    filterQuery.role = req.query.role;
  }
  
  if (req.query.active) {
    filterQuery.active = req.query.active === 'true';
  }
  
  if (req.query.search) {
    const searchTerm = req.query.search as string;
    filterQuery.$or = [
      { firstName: { $regex: searchTerm, $options: 'i' } },
      { lastName: { $regex: searchTerm, $options: 'i' } },
      { email: { $regex: searchTerm, $options: 'i' } },
      { userID: { $regex: searchTerm, $options: 'i' } }
    ];
  }
  
  // Get users
  const users = await User.find(filterQuery)
    .select('-password')
    .sort({ createdAt: -1 })
    .lean();
  
  return {
    users,
    dateRange: {
      startDate: startDate || thirtyDaysAgo,
      endDate
    }
  };
}

async function getDriverReportData(req: Request) {
  // Get driver performance data similar to getDriverReport
  const drivers = await User.find({ role: 'driver' })
    .select('-password')
    .lean();
  
  const driverIds = drivers.map(d => d.userID);
  
  // Get completed shipments
  const shipments = await Shipment.find({
    status: 'Delivered',
    driverId: { $in: driverIds }
  }).lean();
  
  // Map drivers with their shipments
  const driverShipments = drivers.map(driver => {
    const driverShipmentList = shipments.filter(s => s.driverId === driver.userID);
    
    return {
      driverId: driver.userID,
      driverName: `${driver.firstName} ${driver.lastName}`,
      email: driver.email,
      shipmentsDelivered: driverShipmentList.length,
      shipments: driverShipmentList
    };
  });
  
  return {
    drivers: driverShipments,
    allShipments: shipments
  };
}

// Export to CSV
function exportCsv(res: Response, data: any, fileName: string, reportType: string) {
  let fields: string[] = [];
  let csvData: any[] = [];
  
  // Prepare data based on report type
  if (reportType === 'overview') {
    // For overview, we'll create two sections: system stats and monthly trends
    // First, the system stats
    fields = ['Metric', 'Value'];
    csvData = [
      { Metric: 'Total Users', Value: data.systemStats.totalUsers },
      { Metric: 'Total Shipments', Value: data.systemStats.totalShipments },
      { Metric: 'Active Shipments', Value: data.systemStats.activeShipments },
      { Metric: 'Delivered Shipments', Value: data.systemStats.deliveredShipments },
    ];
    
    // Create CSV parser and transform data
    const json2csvParser = new Parser({ fields });
    const systemStatsCsv = json2csvParser.parse(csvData);
    
    // Now for monthly trends
    fields = ['Month', 'Shipments', 'Users'];
    csvData = data.monthlyTrends.map((item: any) => ({
      Month: item.month,
      Shipments: item.shipments,
      Users: item.users
    }));
    
    const trendsCsvParser = new Parser({ fields });
    const trendsCsv = trendsCsvParser.parse(csvData);
    
    // Combine both sections
    const combinedCsv = `SYSTEM OVERVIEW\n${systemStatsCsv}\n\nMONTHLY TRENDS\n${trendsCsv}`;
    
    // Set headers and send response
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}.csv`);
    return res.send(combinedCsv);
  } else if (reportType === 'shipments') {
    // For shipments, we'll export all shipment data
    fields = [
      'Tracking Number',
      'Status',
      'Origin',
      'Destination',
      'Created Date',
      'Estimated Delivery',
      'Sender Name',
      'Recipient Name'
    ];
    
    csvData = data.shipments.map((shipment: any) => ({
      'Tracking Number': shipment.trackingNumber,
      'Status': shipment.status,
      'Origin': shipment.origin,
      'Destination': shipment.destination,
      'Created Date': new Date(shipment.createdAt).toLocaleString(),
      'Estimated Delivery': new Date(shipment.estimatedDelivery).toLocaleDateString(),
      'Sender Name': shipment.senderName || 'N/A',
      'Recipient Name': shipment.recipientName || 'N/A'
    }));
    
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(csvData);
    
    // Set headers and send response
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}.csv`);
    return res.send(csv);
  } else if (reportType === 'users') {
    // For users, export all user data except sensitive fields
    fields = [
      'User ID',
      'Name',
      'Email',
      'Role',
      'Status',
      'Created Date'
    ];
    
    csvData = data.users.map((user: any) => ({
      'User ID': user.userID,
      'Name': `${user.firstName} ${user.lastName}`,
      'Email': user.email,
      'Role': user.role,
      'Status': user.active ? 'Active' : 'Inactive',
      'Created Date': new Date(user.createdAt).toLocaleString()
    }));
    
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(csvData);
    
    // Set headers and send response
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}.csv`);
    return res.send(csv);
  } else if (reportType === 'drivers') {
    // For drivers, export performance data
    fields = [
      'Driver ID',
      'Driver Name',
      'Email',
      'Shipments Delivered',
      'Delivery Rate'
    ];
    
    csvData = data.drivers.map((driver: any) => ({
      'Driver ID': driver.driverId,
      'Driver Name': driver.driverName,
      'Email': driver.email,
      'Shipments Delivered': driver.shipmentsDelivered,
      'Delivery Rate': `${(driver.shipmentsDelivered / Math.max(1, data.allShipments.length) * 100).toFixed(2)}%`
    }));
    
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(csvData);
    
    // Set headers and send response
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}.csv`);
    return res.send(csv);
  }
  
  // If report type not handled
  return res.status(400).json({ message: 'Export format not supported for this report type' });
}

// Export to Excel
function exportExcel(res: Response, data: any, fileName: string, reportType: string) {
  const workbook = new ExcelJS.Workbook();
  
  if (reportType === 'overview') {
    // Create overview sheet
    const overviewSheet = workbook.addWorksheet('System Overview');
    
    // Add system stats
    overviewSheet.addRow(['System Statistics', '']);
    overviewSheet.addRow(['Metric', 'Value']);
    overviewSheet.addRow(['Total Users', data.systemStats.totalUsers]);
    overviewSheet.addRow(['Total Shipments', data.systemStats.totalShipments]);
    overviewSheet.addRow(['Active Shipments', data.systemStats.activeShipments]);
    overviewSheet.addRow(['Delivered Shipments', data.systemStats.deliveredShipments]);
    
    // Add spacing
    overviewSheet.addRow([]);
    overviewSheet.addRow([]);
    
    // Add monthly trends
    overviewSheet.addRow(['Monthly Trends', '', '']);
    overviewSheet.addRow(['Month', 'Shipments', 'Users']);
    data.monthlyTrends.forEach((item: any) => {
      overviewSheet.addRow([item.month, item.shipments, item.users]);
    });
    
    // Style the headings
    ['A1', 'A8'].forEach(cell => {
      overviewSheet.getCell(cell).font = { bold: true, size: 14 };
    });
    
    ['A2', 'A9'].forEach(cell => {
      overviewSheet.getCell(cell).font = { bold: true };
      overviewSheet.getCell(cell).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
    });
    
    // Set column widths
    overviewSheet.getColumn('A').width = 20;
    overviewSheet.getColumn('B').width = 15;
    overviewSheet.getColumn('C').width = 15;
  } else if (reportType === 'shipments') {
    // Create shipments sheet
    const shipmentsSheet = workbook.addWorksheet('Shipments');
    
    // Add headers
    shipmentsSheet.addRow([
      'Tracking Number',
      'Status',
      'Origin',
      'Destination',
      'Created Date',
      'Estimated Delivery',
      'Sender Name',
      'Recipient Name'
    ]);
    
    // Add shipment data
    data.shipments.forEach((shipment: any) => {
      shipmentsSheet.addRow([
        shipment.trackingNumber,
        shipment.status,
        shipment.origin,
        shipment.destination,
        new Date(shipment.createdAt).toLocaleString(),
        new Date(shipment.estimatedDelivery).toLocaleDateString(),
        shipment.senderName || 'N/A',
        shipment.recipientName || 'N/A'
      ]);
    });
    
    // Style header row
    const headerRow = shipmentsSheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    
    // Set column widths
    shipmentsSheet.columns.forEach(column => {
      column.width = 20;
    });
  } else if (reportType === 'users') {
    // Create users sheet
    const usersSheet = workbook.addWorksheet('Users');
    
    // Add headers
    usersSheet.addRow([
      'User ID',
      'First Name',
      'Last Name',
      'Email',
      'Role',
      'Status',
      'Created Date'
    ]);
    
    // Add user data
    data.users.forEach((user: any) => {
      usersSheet.addRow([
        user.userID,
        user.firstName,
        user.lastName,
        user.email,
        user.role,
        user.active ? 'Active' : 'Inactive',
        new Date(user.createdAt).toLocaleString()
      ]);
    });
    
    // Style header row
    const headerRow = usersSheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    
    // Set column widths
    usersSheet.columns.forEach(column => {
      column.width = 20;
    });
  } else if (reportType === 'drivers') {
    // Create drivers sheet
    const driversSheet = workbook.addWorksheet('Driver Performance');
    
    // Add headers
    driversSheet.addRow([
      'Driver ID',
      'Driver Name',
      'Email',
      'Shipments Delivered',
      'Delivery Rate'
    ]);
    
    // Add driver data
    data.drivers.forEach((driver: any) => {
      driversSheet.addRow([
        driver.driverId,
        driver.driverName,
        driver.email,
        driver.shipmentsDelivered,
        `${(driver.shipmentsDelivered / Math.max(1, data.allShipments.length) * 100).toFixed(2)}%`
      ]);
    });
    
    // Style header row
    const headerRow = driversSheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    
    // Set column widths
    driversSheet.columns.forEach(column => {
      column.width = 20;
    });
  }
  
  // Set response headers
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=${fileName}.xlsx`);
  
  // Write to response
  return workbook.xlsx.write(res)
    .then(() => {
      res.status(200).end();
    });
}

// Export to PDF
function exportPdf(res: Response, data: any, fileName: string, reportType: string) {
  // Create PDF document
  const doc = new PDFDocument();
  
  // Set response headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${fileName}.pdf`);
  
  // Pipe PDF to response
  doc.pipe(res);
  
  // Add title
  let title = '';
  switch (reportType) {
    case 'overview':
      title = 'System Overview Report';
      break;
    case 'shipments':
      title = 'Shipment Report';
      break;
    case 'users':
      title = 'User Report';
      break;
    case 'drivers':
      title = 'Driver Performance Report';
      break;
  }
  
  doc.fontSize(20).text(title, { align: 'center' });
  doc.moveDown();
  
  // Add date range
  const currentDate = new Date().toLocaleDateString();
  doc.fontSize(12).text(`Generated on: ${currentDate}`, { align: 'center' });
  doc.moveDown(2);
  
  // Add content based on report type
  if (reportType === 'overview') {
    // System stats table
    doc.fontSize(16).text('System Statistics', { align: 'left' });
    doc.moveDown();
    
    // Create table
    const stats = [
      ['Metric', 'Value'],
      ['Total Users', data.systemStats.totalUsers.toString()],
      ['Total Shipments', data.systemStats.totalShipments.toString()],
      ['Active Shipments', data.systemStats.activeShipments.toString()],
      ['Delivered Shipments', data.systemStats.deliveredShipments.toString()]
    ];
    
    createTable(doc, stats);
    doc.moveDown(2);
    
    // Monthly trends table
    doc.fontSize(16).text('Monthly Trends', { align: 'left' });
    doc.moveDown();
    
    const trends = [
      ['Month', 'Shipments', 'Users']
    ];
    
    data.monthlyTrends.forEach((item: any) => {
      trends.push([item.month, item.shipments.toString(), item.users.toString()]);
    });
    
    createTable(doc, trends);
  } else if (reportType === 'shipments') {
    // Shipment report
    doc.fontSize(14).text(`Total Shipments: ${data.shipments.length}`, { align: 'left' });
    doc.moveDown();
    
    // Date range
    doc.fontSize(12).text(
      `Date Range: ${data.dateRange.startDate.toLocaleDateString()} to ${data.dateRange.endDate.toLocaleDateString()}`, 
      { align: 'left' }
    );
    doc.moveDown(2);
    
    // Create table headers
    const shipmentRows = [
      ['Tracking #', 'Status', 'Origin', 'Destination', 'Created Date']
    ];
    
    // Add data rows (limit to 100 rows for PDF readability)
    const maxRows = Math.min(data.shipments.length, 100);
    for (let i = 0; i < maxRows; i++) {
      const shipment = data.shipments[i];
      shipmentRows.push([
        shipment.trackingNumber,
        shipment.status,
        shipment.origin,
        shipment.destination,
        new Date(shipment.createdAt).toLocaleDateString()
      ]);
    }
    
    createTable(doc, shipmentRows);
    
    if (data.shipments.length > 100) {
      doc.moveDown();
      doc.font('Helvetica-Oblique')  // Set font to italic version
      .fontSize(10)
      .text(`Note: Only showing first 100 of ${data.shipments.length} shipments.`, { 
        align: 'center'
      });
    }
  } else if (reportType === 'users') {
    // User report
    doc.fontSize(14).text(`Total Users: ${data.users.length}`, { align: 'left' });
    doc.moveDown();
    
    // Date range
    doc.fontSize(12).text(
      `Date Range: ${data.dateRange.startDate.toLocaleDateString()} to ${data.dateRange.endDate.toLocaleDateString()}`, 
      { align: 'left' }
    );
    doc.moveDown(2);
    
    // Create table headers
    const userRows = [
      ['User ID', 'Name', 'Email', 'Role', 'Status']
    ];
    
    // Add data rows (limit to 100 rows for PDF readability)
    const maxRows = Math.min(data.users.length, 100);
    for (let i = 0; i < maxRows; i++) {
      const user = data.users[i];
      userRows.push([
        user.userID,
        `${user.firstName} ${user.lastName}`,
        user.email,
        user.role,
        user.active ? 'Active' : 'Inactive'
      ]);
    }
    
    createTable(doc, userRows);
    
    if (data.users.length > 100) {
      doc.moveDown();
      doc.font('Helvetica-Oblique')  // Set font to italic version
   .fontSize(10)
   .text(`Note: Only showing first 100 of ${data.users.length} users.`, { 
     align: 'center'
   });
      
    }
  } else if (reportType === 'drivers') {
    // Driver report
    doc.fontSize(14).text(`Total Drivers: ${data.drivers.length}`, { align: 'left' });
    doc.moveDown(2);
    
    // Create table headers
    const driverRows = [
      ['Driver ID', 'Name', 'Shipments Delivered', 'Delivery Rate']
    ];
    
    // Add data rows
    data.drivers.forEach((driver: any) => {
      driverRows.push([
        driver.driverId,
        driver.driverName,
        driver.shipmentsDelivered.toString(),
        `${(driver.shipmentsDelivered / Math.max(1, data.allShipments.length) * 100).toFixed(2)}%`
      ]);
    });
    
    createTable(doc, driverRows);
  }
  
  // Finalize PDF
  doc.end();
}

// Helper function to create tables in PDF
function createTable(doc: PDFKit.PDFDocument, tableData: string[][]) {
  const tableTop = doc.y;
  const tableLeft = 50;
  
  // Calculate column widths
  const columnCount = tableData[0].length;
  const tableWidth = 500; // Fixed width
  const columnWidth = tableWidth / columnCount;
  
  // Draw header row
  doc.font('Helvetica-Bold');
  tableData[0].forEach((header, i) => {
    doc.text(header, tableLeft + (i * columnWidth), tableTop, {
      width: columnWidth,
      align: 'left'
    });
  });
  
  // Draw horizontal line below header
  doc.moveTo(tableLeft, tableTop + 20)
     .lineTo(tableLeft + tableWidth, tableTop + 20)
     .stroke();
  
  // Draw data rows
  doc.font('Helvetica');
  let rowTop = tableTop + 30;
  
  for (let i = 1; i < tableData.length; i++) {
    const row = tableData[i];
    
    row.forEach((cell, j) => {
      doc.text(cell, tableLeft + (j * columnWidth), rowTop, {
        width: columnWidth,
        align: 'left'
      });
    });
    
    rowTop += 20;
    
    // If we're about to go off the page, start a new page
    if (rowTop > 700) {
      doc.addPage();
      rowTop = 50;
      
      // Redraw headers on new page
      doc.font('Helvetica-Bold');
      tableData[0].forEach((header, j) => {
        doc.text(header, tableLeft + (j * columnWidth), rowTop, {
          width: columnWidth,
          align: 'left'
        });
      });
      
      doc.moveTo(tableLeft, rowTop + 20)
         .lineTo(tableLeft + tableWidth, rowTop + 20)
         .stroke();
      
      doc.font('Helvetica');
      rowTop += 30;
    }
  }
}