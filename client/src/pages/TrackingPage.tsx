import React from 'react';
import TrackingForm from '../components/TrackingForm';
import ShipmentDetails from '../components/ShipmentDetails';
import { useState } from 'react';
import { Shipment } from '../types/shipment';

const TrackingPage: React.FC = () => {
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const trackShipment = async (trackingNumber: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Make sure the API URL is correct
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      console.log('API URL:', apiUrl); // Debug log
      
      const response = await fetch(`${apiUrl}/api/shipments/track/${trackingNumber}`);
      console.log('Response status:', response.status); // Debug log
      
      // Check if the response is JSON
      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType); // Debug log
      
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text); // Debug log
        throw new Error('Server returned an invalid response format');
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Shipment not found');
      }
      
      const data = await response.json();
      console.log('Shipment data:', data); // Debug log
      setShipment(data);
    } catch (err) {
      console.error('Error tracking shipment:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while tracking the shipment');
      setShipment(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-blue-600">Track Your Shipment</h1>
        
        <TrackingForm onSubmit={trackShipment} />
        
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Searching for your shipment...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-6" role="alert">
            <p>{error}</p>
          </div>
        )}
        
        {shipment && !loading && <ShipmentDetails shipment={shipment} />}
      </div>
    </div>
  );
};

export default TrackingPage;
