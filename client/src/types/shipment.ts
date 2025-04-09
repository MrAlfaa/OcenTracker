export interface TrackingEvent {
  status: string;
  location: string;
  timestamp: string;
}

export interface Shipment {
  _id: string;
  trackingNumber: string;
  status: string;
  origin: string;
  destination: string;
  estimatedDelivery: string;
  trackingHistory: TrackingEvent[];
}
