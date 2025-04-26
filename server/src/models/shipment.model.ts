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
  
  // New fields for send functionality
  senderId?: string;
  senderName?: string;
  recipientId?: string;
  recipientName?: string;
  recipientEmail?: string;
  itemTypes?: string[];
  branch?: string;
  notes?: string;
  requestedDate?: Date;
  shipmentType?: 'regular' | 'send' | 'receive';
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
      enum: ['Pending', 'In Transit', 'Delivered', 'Delayed', 'Cancelled'],
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
    
    // New fields for send functionality
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
  },
  { timestamps: true }
);

export default mongoose.model<IShipment>('Shipment', shipmentSchema);
