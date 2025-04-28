import mongoose, { Document, Schema } from 'mongoose';

export interface TrackingEvent {
  status: string;
  location: string;
  timestamp: Date;
}

export interface IShipment extends Document {
  trackingNumber: string;
  status: string;
  origin: string;
  destination: string;
  estimatedDelivery: Date;
  trackingHistory: TrackingEvent[];
  createdAt: Date;
  updatedAt: Date;
  
  // Fields for send functionality
  senderId?: string;
  senderName?: string;
  recipientId?: string;
  recipientName?: string;
  recipientEmail?: string;
  recipientAddress?: string; // New field
  recipientPhone?: string;   // New field
  itemTypes?: string[];
  branch?: string;
  notes?: string;
  requestedDate?: Date;
  shipmentType?: 'regular' | 'send' | 'receive';

  // New fields for driver assignment
  driverId?: string;
  driverName?: string;
}
const shipmentSchema = new Schema(
  {
    trackingNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['Pending', 'In Transit', 'Delivered', 'Delayed', 'Cancelled', 'Picked Up'],
      default: 'Pending',
    },
    origin: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    estimatedDelivery: {
      type: Date,
      required: true,
    },
    trackingHistory: [
      {
        status: {
          type: String,
          required: true,
        },
        location: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    
    // Fields for send functionality
    senderId: {
      type: String,
      trim: true,
    },
    senderName: {
      type: String,
      trim: true,
    },
    recipientId: {
      type: String,
      trim: true,
    },
    recipientName: {
      type: String,
      trim: true,
    },
    recipientEmail: {
      type: String,
      trim: true,
    },
    recipientAddress: {
      type: String,
      trim: true,
    },
    recipientPhone: {
      type: String,
      trim: true,
    },
    itemTypes: [String],
    branch: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    requestedDate: {
      type: Date,
    },
    shipmentType: {
      type: String,
      enum: ['regular', 'send', 'receive'],
      default: 'regular',
    },
    driverId: {
      type: String,
      trim: true,
    },
    driverName: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IShipment>('Shipment', shipmentSchema);
