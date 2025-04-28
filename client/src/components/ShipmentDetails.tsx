import React from 'react';
import { Shipment } from '../types/shipment';
import { FaBox, FaMapMarkerAlt, FaRegClock, FaHistory, FaRoute, FaTruck, FaCalendarCheck } from 'react-icons/fa';

interface ShipmentDetailsProps {
  shipment: Shipment;
}

const ShipmentDetails: React.FC<ShipmentDetailsProps> = ({ shipment }) => {
  // Format date from ISO string
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'numeric', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get appropriate status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in transit':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delayed':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
      default:
        return 'bg-purple-100 text-purple-800 border-purple-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <FaBox className="mr-2" /> Shipment Information
        </h2>
      </div>

      <div className="p-6">
        {/* Main shipment details */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Tracking Number</h3>
              <p className="text-lg font-bold text-gray-800 mt-1">{shipment.trackingNumber}</p>
            </div>

            <div className="flex items-center">
              <h3 className="text-sm font-medium text-gray-500 mr-2">Status</h3>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(shipment.status)}`}>
                {shipment.status}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 flex items-center">
                <FaRoute className="mr-1 text-blue-500" /> Origin
              </h3>
              <p className="text-gray-800 mt-1">{shipment.origin}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 flex items-center">
                <FaMapMarkerAlt className="mr-1 text-blue-500" /> Destination
              </h3>
              <p className="text-gray-800 mt-1">{shipment.destination}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 flex items-center">
                <FaCalendarCheck className="mr-1 text-blue-500" /> Estimated Delivery
              </h3>
              <p className="text-gray-800 mt-1 font-medium">{formatDate(shipment.estimatedDelivery)}</p>
            </div>

            {/* Show sender info if available */}
            {shipment.senderName && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Sender</h3>
                <p className="text-gray-800 mt-1">{shipment.senderName}</p>
                <p className="text-gray-600 text-sm">ID: {shipment.senderId}</p>
              </div>
            )}

            {/* Show recipient info if available */}
            {shipment.recipientName && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Recipient</h3>
                <p className="text-gray-800 mt-1">{shipment.recipientName}</p>
                {shipment.recipientEmail && <p className="text-gray-600 text-sm">{shipment.recipientEmail}</p>}
              </div>
            )}

            {/* Show shipment type if available */}
            {shipment.shipmentType && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Shipment Type</h3>
                <p className="text-gray-800 mt-1 capitalize">{shipment.shipmentType}</p>
              </div>
            )}
          </div>
        </div>

        {/* Additional shipment details if available */}
        {shipment.recipientAddress && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Delivery Address</h3>
            <p className="text-gray-800">{shipment.recipientAddress}</p>
            {shipment.recipientPhone && (
              <p className="text-gray-700 mt-2">Contact: {shipment.recipientPhone}</p>
            )}
          </div>
        )}

        {/* Item types if available */}
        {shipment.itemTypes && shipment.itemTypes.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Item Types</h3>
            <div className="flex flex-wrap gap-2">
              {shipment.itemTypes.map((type, index) => (
                <span 
                  key={index} 
                  className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tracking History */}
        <div className="mt-6">
          <h3 className="text-md font-medium text-gray-700 flex items-center mb-4">
            <FaHistory className="mr-2 text-blue-600" /> Tracking History
          </h3>
          
          <div className="space-y-4">
            {shipment.trackingHistory.map((event, index) => (
              <div 
                key={index}
                className="relative pl-8 pb-4 border-l-2 border-blue-200 last:border-l-0"
              >
                <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-blue-500"></div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-blue-700">{event.status}</h4>
                    <span className="text-sm text-gray-500">{formatDate(event.timestamp)}</span>
                  </div>
                  <p className="text-gray-600 mt-1 flex items-center">
                    <FaMapMarkerAlt className="mr-1 text-gray-400" size={12} /> 
                    {event.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes if available */}
        {shipment.notes && (
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Notes</h3>
            <p className="text-gray-800 italic">{shipment.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShipmentDetails;
