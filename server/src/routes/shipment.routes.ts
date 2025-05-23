import express from 'express';
import Shipment from '../models/shipment.model';
import { authMiddleware } from '../middleware/auth.middleware';
import { generateTrackingNumber } from '../utils/shipment.utils';
import { adminAuthMiddleware } from '../middleware/adminAuth.middleware';

const router = express.Router();

// Get shipment by tracking number
router.get('/track/:trackingNumber', async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    
    if (!trackingNumber) {
      return res.status(400).json({ message: 'Tracking number is required' });
    }
    
    const shipment = await Shipment.findOne({ trackingNumber });
    
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    
    // Ensure we're sending JSON
    res.setHeader('Content-Type', 'application/json');
    return res.json(shipment);
  } catch (error) {
    console.error('Error tracking shipment:', error);
    return res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Create a new shipment (for testing purposes)
router.post('/', async (req, res) => {
  try {
    const newShipment = new Shipment(req.body);
    const savedShipment = await newShipment.save();
    res.status(201).json(savedShipment);
  } catch (error) {
    console.error('Error creating shipment:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Send a package - protected route
router.post('/send', authMiddleware, async (req, res) => {
  try {
    const { 
      itemTypes, 
      recipientId, 
      recipientName, 
      recipientEmail,
      recipientAddress, // New field
      recipientPhone,   // New field
      branch, 
      notes 
    } = req.body;
    
    // Generate a tracking number (format: OCT + timestamp + random chars)
    const trackingNumber = generateTrackingNumber();
    
    // Current date plus 3 days for estimated delivery
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 3);
    
    const newShipment = new Shipment({
      trackingNumber,
      status: 'Pending',
      origin: 'Processing Center',
      destination: branch,
      estimatedDelivery,
      
      // Send specific fields
      senderId: req.user.userID,
      senderName: `${req.user.firstName} ${req.user.lastName}`,
      recipientId,
      recipientName,
      recipientEmail,
      recipientAddress, // New field
      recipientPhone,   // New field
      itemTypes,
      branch,
      notes,
      requestedDate: new Date(),
      shipmentType: 'send',
      
      // Initial tracking event
      trackingHistory: [{
        status: 'Shipment Requested',
        location: 'Online System',
        timestamp: new Date()
      }]
    });
    
    const savedShipment = await newShipment.save();
    res.status(201).json(savedShipment);
  } catch (error) {
    console.error('Error creating send shipment:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Get all shipments (admin only)
router.get('/admin', authMiddleware, adminAuthMiddleware, async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};
    
    console.log('Admin shipments query:', { status, search });
    
    // Filter by status if provided
    if (status && typeof status === 'string') {
      // Use exact case matching for status
      query = { ...query, status: status };
    }
    
    // Search by tracking number, sender, or recipient
    if (search && typeof search === 'string') {
      query = {
        ...query,
        $or: [
          { trackingNumber: { $regex: search, $options: 'i' } },
          { senderName: { $regex: search, $options: 'i' } },
          { recipientName: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    console.log('MongoDB query:', JSON.stringify(query));
    
    const shipments = await Shipment.find(query).sort({ createdAt: -1 });
    console.log(`Found ${shipments.length} shipments matching criteria`);
    
    res.json(shipments);
  } catch (error) {
    console.error('Error fetching shipments:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Update shipment status (admin only)
router.put('/admin/:id/status', authMiddleware, adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, location, driverId, notes } = req.body;
    
    const shipment = await Shipment.findById(id);
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    
    // Update status
    shipment.status = status;
    
    // Add tracking event
    shipment.trackingHistory.push({
      status,
      location: location || 'Processing Center',
      timestamp: new Date()
    });
    
    // Add driver ID if provided
    if (driverId) {
      shipment.driverId = driverId;
    }
    
    // Add notes if provided
    if (notes) {
      shipment.notes = notes;
    }
    
    const updatedShipment = await shipment.save();
    res.json(updatedShipment);
  } catch (error) {
    console.error('Error updating shipment:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Assign driver to shipment (admin only)
router.put('/admin/:id/assign-driver', authMiddleware, adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { driverId, driverName } = req.body;
    
    if (!driverId || !driverName) {
      return res.status(400).json({ message: 'Driver ID and name are required' });
    }
    
    const shipment = await Shipment.findById(id);
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    
    // Update shipment with driver info
    shipment.driverId = driverId;
    shipment.driverName = driverName;
    shipment.status = 'In Transit';
    
    // Add tracking event
    shipment.trackingHistory.push({
      status: 'Driver Assigned',
      location: 'Processing Center',
      timestamp: new Date()
    });
    
    const updatedShipment = await shipment.save();
    res.json(updatedShipment);
  } catch (error) {
    console.error('Error assigning driver:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get shipments assigned to a specific driver
router.get('/driver', authMiddleware, async (req, res) => {
  try {
    // Only allow drivers to access this endpoint
    if (req.user.role !== 'driver') {
      return res.status(403).json({ message: 'Access denied. Driver role required.' });
    }
    
    // Find shipments assigned to this driver
    const shipments = await Shipment.find({ 
      driverId: req.user.id,
      status: { $in: ['In Transit', 'Picked Up'] } // Only show active shipments
    }).sort({ updatedAt: -1 });
    
    res.json(shipments);
  } catch (error) {
    console.error('Error fetching driver shipments:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Driver action: Mark shipment as picked up
router.put('/driver/:id/pickup', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    
    // Only allow drivers to access this endpoint
    if (req.user.role !== 'driver') {
      return res.status(403).json({ message: 'Access denied. Driver role required.' });
    }
    
    const shipment = await Shipment.findById(id);
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    
    // Verify this shipment is assigned to the requesting driver
    if (shipment.driverId !== req.user.id) {
      return res.status(403).json({ message: 'This shipment is not assigned to you' });
    }
    
    // Update shipment status
    shipment.status = 'Picked Up';
    
    // Add tracking event
    shipment.trackingHistory.push({
      status: 'Picked Up by Driver',
      location: 'Sender Location',
      timestamp: new Date()
    });
    
    // Add notes if provided
    if (notes) {
      shipment.notes = notes;
    }
    
    const updatedShipment = await shipment.save();
    res.json(updatedShipment);
  } catch (error) {
    console.error('Error updating shipment pickup:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Driver action: Mark shipment as handed over to branch
router.put('/driver/:id/handover', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes, branchLocation } = req.body;
    
    // Only allow drivers to access this endpoint
    if (req.user.role !== 'driver') {
      return res.status(403).json({ message: 'Access denied. Driver role required.' });
    }
    
    const shipment = await Shipment.findById(id);
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    
    // Verify this shipment is assigned to the requesting driver
    if (shipment.driverId !== req.user.id) {
      return res.status(403).json({ message: 'This shipment is not assigned to you' });
    }
    
    // Update shipment status
    shipment.status = 'In Transit';
    
    // Add tracking event
    shipment.trackingHistory.push({
      status: 'Handed Over to Branch',
      location: branchLocation || shipment.destination,
      timestamp: new Date()
    });
    
    // Add notes if provided
    if (notes) {
      shipment.notes = notes;
    }
    
    const updatedShipment = await shipment.save();
    res.json(updatedShipment);
  } catch (error) {
    console.error('Error updating shipment handover:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get shipments for a specific user
router.get('/user', authMiddleware, async (req, res) => {
  try {
    const { status } = req.query;
    // Create a query that includes both sent and received shipments
    let query: any = {
      $or: [
        { senderId: req.user.userID }, // Shipments sent by user
        { 
          recipientId: req.user.userID, 
          recipientConfirmed: true    // Confirmed received shipments
        }
      ]
    };
    
    // Filter by status if provided
    if (status && typeof status === 'string') {
      // Handle comma-separated status values
      const statusArray = status.split(',');
      if (statusArray.length > 0) {
        query.status = { $in: statusArray };
      }
    }
    
    // This will return all fields including driverName, createdAt, and updatedAt
    const shipments = await Shipment.find(query).sort({ createdAt: -1 });
    res.json(shipments);
  } catch (error) {
    console.error('Error fetching user shipments:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Driver action: Request pickup (modified from existing pickup route)
router.put('/driver/:id/request-pickup', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    
    // Only allow drivers to access this endpoint
    if (req.user.role !== 'driver') {
      return res.status(403).json({ message: 'Access denied. Driver role required.' });
    }
    
    const shipment = await Shipment.findById(id);
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    
    // Verify this shipment is assigned to the requesting driver
    if (shipment.driverId !== req.user.id) {
      return res.status(403).json({ message: 'This shipment is not assigned to you' });
    }
    
    // Update shipment status
    shipment.status = 'Pickup Requested';
    shipment.pickupRequested = true;
    shipment.pickupRequestedAt = new Date();
    
    // Add tracking event
    shipment.trackingHistory.push({
      status: 'Pickup Requested by Driver',
      location: 'Sender Location',
      timestamp: new Date()
    });
    
    // Add notes if provided
    if (notes) {
      shipment.notes = notes;
    }
    
    const updatedShipment = await shipment.save();
    res.json(updatedShipment);
  } catch (error) {
    console.error('Error updating shipment pickup request:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Client action: Confirm pickup
router.put('/user/:id/confirm-pickup', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const shipment = await Shipment.findById(id);
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    
    // Verify this shipment belongs to the requesting user
    if (shipment.senderId !== req.user.userID) {
      return res.status(403).json({ message: 'This shipment does not belong to you' });
    }
    
    // Verify pickup was requested
    if (!shipment.pickupRequested) {
      return res.status(400).json({ message: 'No pickup request found for this shipment' });
    }
    
    // Update shipment status
    shipment.status = 'Picked Up';
    shipment.pickupConfirmed = true;
    
    // Add tracking event
    shipment.trackingHistory.push({
      status: 'Pickup Confirmed by Sender',
      location: 'Sender Location',
      timestamp: new Date()
    });
    
    const updatedShipment = await shipment.save();
    res.json(updatedShipment);
  } catch (error) {
    console.error('Error confirming shipment pickup:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Driver action: Request handover to branch
router.put('/driver/:id/request-handover', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes, branchLocation } = req.body;
    
    // Only allow drivers to access this endpoint
    if (req.user.role !== 'driver') {
      return res.status(403).json({ message: 'Access denied. Driver role required.' });
    }
    
    const shipment = await Shipment.findById(id);
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    
    // Verify this shipment is assigned to the requesting driver
    if (shipment.driverId !== req.user.id) {
      return res.status(403).json({ message: 'This shipment is not assigned to you' });
    }
    
    // Update shipment status
    shipment.status = 'Handover Requested';
    shipment.handoverRequested = true;
    shipment.handoverRequestedAt = new Date();
    shipment.handoverNote = notes || '';
    
    // Add tracking event
    shipment.trackingHistory.push({
      status: 'Handover Requested by Driver',
      location: branchLocation || shipment.destination,
      timestamp: new Date()
    });
    
    const updatedShipment = await shipment.save();
    res.json(updatedShipment);
  } catch (error) {
    console.error('Error requesting shipment handover:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Admin action: Confirm handover
router.put('/admin/:id/confirm-handover', authMiddleware, adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNote } = req.body;
    
    const shipment = await Shipment.findById(id);
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    
    // Verify handover was requested
    if (!shipment.handoverRequested) {
      return res.status(400).json({ message: 'No handover request found for this shipment' });
    }
    
    // Update shipment status
    shipment.status = 'In Transit';
    shipment.handoverConfirmed = true;
    shipment.adminHandoverNote = adminNote || '';
    
    // Add tracking event
    shipment.trackingHistory.push({
      status: 'Handover Confirmed by Admin',
      location: shipment.destination,
      timestamp: new Date()
    });
    
    const updatedShipment = await shipment.save();
    res.json(updatedShipment);
  } catch (error) {
    console.error('Error confirming shipment handover:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get incoming shipments (where the user is a recipient)
router.get('/incoming', authMiddleware, async (req, res) => {
  try {
    const { userID } = req.user;
    
    // Find shipments where the logged-in user is the recipient
    // Important: We need to include shipments with status "Delivered To Recipient"
    const shipments = await Shipment.find({ 
      recipientId: userID,
      status: { $ne: 'Delivery Completed' } // Exclude completed deliveries only
    }).sort({ createdAt: -1 });
    
    console.log(`Found ${shipments.length} incoming shipments for user ${userID}`);
    res.json(shipments);
  } catch (error) {
    console.error('Error fetching incoming shipments:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Admin endpoint to mark shipment as delivered to recipient
router.put('/admin/:id/deliver', authMiddleware, adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { location, notes } = req.body;
    
    const shipment = await Shipment.findById(id);
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    
    // Update shipment status
    shipment.status = 'Delivered To Recipient';
    shipment.deliveredToRecipient = true;
    shipment.deliveredToRecipientAt = new Date();
    
    // Add tracking event
    shipment.trackingHistory.push({
      status: 'Delivered To Recipient',
      location: location || shipment.destination,
      timestamp: new Date()
    });
    
    // Add notes if provided
    if (notes) {
      shipment.notes = notes;
    }
    
    const updatedShipment = await shipment.save();
    res.json(updatedShipment);
  } catch (error) {
    console.error('Error marking shipment as delivered:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Recipient endpoint to confirm delivery
router.put('/recipient/:id/confirm-delivery', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { confirmationNote } = req.body;
    
    const shipment = await Shipment.findById(id);
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    
    // Check if shipment is delivered to recipient
    if (!shipment.deliveredToRecipient) {
      return res.status(400).json({ message: 'Shipment has not been marked as delivered yet' });
    }
    
    // Verify this shipment is for the requesting user
    if (shipment.recipientId !== req.user.userID) {
      return res.status(403).json({ message: 'This shipment is not addressed to you' });
    }
    
    // Update shipment status
    shipment.status = 'Delivery Completed';
    shipment.recipientConfirmed = true;
    shipment.recipientConfirmationNote = confirmationNote || '';
    shipment.recipientConfirmedAt = new Date();
    
    // Add tracking event
    shipment.trackingHistory.push({
      status: 'Delivery Confirmed by Recipient',
      location: shipment.destination,
      timestamp: new Date()
    });
    
    const updatedShipment = await shipment.save();
    res.json(updatedShipment);
  } catch (error) {
    console.error('Error confirming delivery:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
