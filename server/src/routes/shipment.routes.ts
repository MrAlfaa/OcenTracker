import express from 'express';
import Shipment from '../models/shipment.model';
import { authMiddleware } from '../middleware/auth.middleware';
import { generateTrackingNumber } from '../utils/shipment.utils';

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

export default router;
