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
  },
  { timestamps: true }
);

export default mongoose.model<IShipment>('Shipment', shipmentSchema);
