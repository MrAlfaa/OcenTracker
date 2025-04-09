import express from 'express';
import Shipment from '../models/shipment.model';

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

export default router;
