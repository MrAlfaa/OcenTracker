import React from 'react';
import { Shipment } from '../types/shipment';

interface ShipmentDetailsProps {
  shipment: Shipment;
}

const ShipmentDetails: React.FC<ShipmentDetailsProps> = ({ shipment }) => {
  // Add safety checks for data
  if (!shipment) return null;
  
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-600">Shipment Information</h2>
      
      <div className="mb-6">
        <div className="flex justify-between border-b pb-2 mb-2">
          <span className="font-semibold">Tracking Number:</span>
          <span>{shipment.trackingNumber}</span>
        </div>
        <div className="flex justify-between border-b pb-2 mb-2">
          <span className="font-semibold">Status:</span>
          <span className={`font-medium ${getStatusColor(shipment.status)}`}>{shipment.status}</span>
        </div>
        <div className="flex justify-between border-b pb-2 mb-2">
          <span className="font-semibold">Origin:</span>
          <span>{shipment.origin}</span>
        </div>
        <div className="flex justify-between border-b pb-2 mb-2">
          <span className="font-semibold">Destination:</span>
          <span>{shipment.destination}</span>
        </div>
        <div className="flex justify-between border-b pb-2 mb-2">
          <span className="font-semibold">Estimated Delivery:</span>
          <span>{shipment.estimatedDelivery ? new Date(shipment.estimatedDelivery).toLocaleDateString() : 'N/A'}</span>
        </div>
      </div>
      
      <h3 className="text-xl font-bold mb-3 text-blue-600">Tracking History</h3>
      <div className="space-y-4">
        {shipment.trackingHistory && shipment.trackingHistory.length > 0 ? (
          shipment.trackingHistory.map((event, index) => (
            <div key={index} className="border-l-4 border-blue-500 pl-4 py-1">
              <div className="font-semibold">{event.status}</div>
              <div className="text-sm text-gray-600">{event.location}</div>
              <div className="text-xs text-gray-500">
                {event.timestamp ? new Date(event.timestamp).toLocaleString() : 'N/A'}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No tracking history available</p>
        )}
      </div>
    </div>
  );
};

function getStatusColor(status: string): string {
  if (!status) return 'text-gray-600';
  
  switch (status.toLowerCase()) {
    case 'delivered':
      return 'text-green-600';
    case 'in transit':
      return 'text-blue-600';
    case 'pending':
      return 'text-yellow-600';
    case 'delayed':
      return 'text-orange-600';
    default:
      return 'text-gray-600';
  }
}

export default ShipmentDetails;
