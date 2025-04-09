import React, { useState } from 'react';

interface TrackingFormProps {
  onSubmit: (trackingNumber: string) => void;
}

const TrackingForm: React.FC<TrackingFormProps> = ({ onSubmit }) => {
  const [trackingNumber, setTrackingNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      onSubmit(trackingNumber.trim());
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-8">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="tracking-number" className="block text-gray-700 text-sm font-bold mb-2">
            Enter Tracking Number
          </label>
          <input
            id="tracking-number"
            type="text"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="e.g., OCT12345678"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            required
          />
        </div>
        <div className="flex items-center justify-center">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline"
          >
            Track Shipment
          </button>
        </div>
      </form>
    </div>
  );
};

export default TrackingForm;
