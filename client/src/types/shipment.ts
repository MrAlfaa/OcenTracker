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
  
  // Fields for send functionality
  senderId?: string;
  senderName?: string;
  recipientId?: string;
  recipientName?: string;
  recipientEmail?: string;
  recipientAddress?: string;
  recipientPhone?: string;
  itemTypes?: string[];
  branch?: string;
  notes?: string;
  requestedDate?: string;
  shipmentType?: 'regular' | 'send' | 'receive';
}
