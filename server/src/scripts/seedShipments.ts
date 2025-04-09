import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Shipment from '../models/shipment.model';

dotenv.config();

const sampleShipments = [
  {
    trackingNumber: 'OCT12345678',
    status: 'In Transit',
    origin: 'Shanghai, China',
    destination: 'Los Angeles, USA',
    estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    trackingHistory: [
      {
        status: 'Order Placed',
        location: 'Shanghai, China',
        timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      },
      {
        status: 'Shipment Prepared',
        location: 'Shanghai, China',
        timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
      },
      {
        status: 'Departed Port',
        location: 'Shanghai, China',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
      {
        status: 'In Transit',
        location: 'Pacific Ocean',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      }
    ]
  },
  {
    trackingNumber: 'OCT87654321',
    status: 'Delivered',
    origin: 'Rotterdam, Netherlands',
    destination: 'New York, USA',
    estimatedDelivery: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    trackingHistory: [
      {
        status: 'Order Placed',
        location: 'Rotterdam, Netherlands',
        timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      },
      {
        status: 'Shipment Prepared',
        location: 'Rotterdam, Netherlands',
        timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      },
      {
        status: 'Departed Port',
        location: 'Rotterdam, Netherlands',
        timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
      },
      {
        status: 'In Transit',
        location: 'Atlantic Ocean',
        timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
      },
      {
        status: 'Arrived at Port',
        location: 'New York, USA',
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      },
      {
        status: 'Customs Clearance',
        location: 'New York, USA',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
      {
        status: 'Delivered',
        location: 'New York, USA',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      }
    ]
  },
  {
    trackingNumber: 'OCT55667788',
    status: 'Pending',
    origin: 'Singapore',
    destination: 'Sydney, Australia',
    estimatedDelivery: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    trackingHistory: [
      {
        status: 'Order Placed',
        location: 'Singapore',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        status: 'Pending',
        location: 'Singapore',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      }
    ]
  }
];

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Clear existing shipments
      await Shipment.deleteMany({});
      console.log('Cleared existing shipments');
      
      // Insert sample shipments
      const result = await Shipment.insertMany(sampleShipments);
      console.log(`Added ${result.length} sample shipments to the database`);
      
      console.log('Sample data:');
      result.forEach(shipment => {
        console.log(`- ${shipment.trackingNumber}: ${shipment.status} (${shipment.origin} → ${shipment.destination})`);
      });
    } catch (error) {
      console.error('Error seeding database:', error);
    } finally {
      // Close the connection
      mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
