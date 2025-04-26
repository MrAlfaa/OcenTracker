import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shipment } from '../types/shipment';

interface User {
  userID: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface SendShipmentFormProps {
  onShipmentCreated: (shipment: Shipment) => void;
}

const SendShipmentForm: React.FC<SendShipmentFormProps> = ({ onShipmentCreated }) => {
  const [step, setStep] = useState(1);
  const [itemTypes, setItemTypes] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [branch, setBranch] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const { token } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const itemTypeOptions = [
    'Documents', 'Electronics', 'Clothing', 'Books', 
    'Groceries', 'Food', 'Medicine', 'Fragile Items', 'Other'
  ];
  
  const branchOptions = [
    'Colombo', 'Kandy', 'Galle', 'Jaffna', 'Batticaloa',
    'Negombo', 'Matara', 'Anuradhapura', 'Ratnapura', 'Trincomalee'
  ];

  useEffect(() => {
    if (searchTerm.length >= 2) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const searchUsers = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/users/search?query=${searchTerm}`, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token || ''
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to search users');
      }
      
      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      console.error('Error searching users:', err);
      setSearchResults([]);
    }
  };

  const handleItemTypeToggle = (type: string) => {
    if (itemTypes.includes(type)) {
      setItemTypes(itemTypes.filter(t => t !== type));
    } else {
      setItemTypes([...itemTypes, type]);
    }
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (!selectedUser) {
        throw new Error('Please select a recipient');
      }
      
      if (itemTypes.length === 0) {
        throw new Error('Please select at least one item type');
      }
      
      if (!branch) {
        throw new Error('Please select a branch');
      }
      
      const shipmentData = {
        itemTypes,
        recipientId: selectedUser.userID,
        recipientName: `${selectedUser.firstName} ${selectedUser.lastName}`,
        recipientEmail: selectedUser.email,
        branch,
        notes,
        requestedDate: new Date().toISOString()
      };
      
      const response = await fetch(`${apiUrl}/api/shipments/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token || ''
        },
        body: JSON.stringify(shipmentData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create shipment');
      }
      
      const newShipment = await response.json();
      setSuccess(`Shipment request created successfully! Tracking number: ${newShipment.trackingNumber}`);
      
      // Reset form
      setItemTypes([]);
      setSelectedUser(null);
      setBranch('');
      setNotes('');
      setStep(1);
      
      onShipmentCreated(newShipment);
    } catch (err) {
      console.error('Error creating shipment:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while creating the shipment');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && itemTypes.length === 0) {
      setError('Please select at least one item type');
      return;
    }
    
    if (step === 2 && !selectedUser) {
      setError('Please select a recipient');
      return;
    }
    
    if (step === 3 && !branch) {
      setError('Please select a branch');
      return;
    }
    
    setError(null);
    setStep(step + 1);
  };

  const prevStep = () => {
    setError(null);
    setStep(step - 1);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Send a Package</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{success}</p>
        </div>
      )}
      
      {/* Step indicator */}
      <div className="flex mb-6">
        <div className={`flex-1 border-t-2 pt-2 ${step >= 1 ? 'border-blue-600' : 'border-gray-300'}`}>
          <p className={`text-sm font-medium ${step >= 1 ? 'text-blue-600' : 'text-gray-500'}`}>Item Type</p>
        </div>
        <div className={`flex-1 border-t-2 pt-2 ${step >= 2 ? 'border-blue-600' : 'border-gray-300'}`}>
          <p className={`text-sm font-medium ${step >= 2 ? 'text-blue-600' : 'text-gray-500'}`}>Recipient</p>
        </div>
        <div className={`flex-1 border-t-2 pt-2 ${step >= 3 ? 'border-blue-600' : 'border-gray-300'}`}>
          <p className={`text-sm font-medium ${step >= 3 ? 'text-blue-600' : 'text-gray-500'}`}>Branch</p>
        </div>
        <div className={`flex-1 border-t-2 pt-2 ${step >= 4 ? 'border-blue-600' : 'border-gray-300'}`}>
          <p className={`text-sm font-medium ${step >= 4 ? 'text-blue-600' : 'text-gray-500'}`}>Confirm</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* Step 1: Select Item Types */}
        {step === 1 && (
          <div>
            <h3 className="text-lg font-medium mb-3 text-gray-700">What type of items are you sending?</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              {itemTypeOptions.map(type => (
                <div 
                  key={type}
                  className={`border rounded-md p-3 cursor-pointer transition-colors ${
                    itemTypes.includes(type) 
                      ? 'bg-blue-50 border-blue-500' 
                      : 'hover:bg-gray-50 border-gray-300'
                  }`}
                  onClick={() => handleItemTypeToggle(type)}
                >
                  <span className="text-sm font-medium">{type}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Step 2: Select Recipient */}
        {step === 2 && (
          <div>
            <h3 className="text-lg font-medium mb-3 text-gray-700">Who are you sending to?</h3>
            <div className="mb-4">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search by user ID or name
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter user ID or name"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
              
              {searchResults.length > 0 && (
                <div className="mt-2 border border-gray-200 rounded-md shadow-sm bg-white max-h-60 overflow-y-auto">
                  {searchResults.map(user => (
                    <div 
                      key={user.userID}
                      className="p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleUserSelect(user)}
                    >
                      <div className="font-medium">{user.firstName} {user.lastName}</div>
                      <div className="text-sm text-gray-500">ID: {user.userID} • {user.email}</div>
                    </div>
                  ))}
                </div>
              )}
              
              {selectedUser && (
                <div className="mt-4 p-3 border border-gray-200 rounded-md bg-blue-50">
                  <div className="font-medium">{selectedUser.firstName} {selectedUser.lastName}</div>
                  <div className="text-sm text-gray-500">ID: {selectedUser.userID} • {selectedUser.email}</div>
                  <button
                    type="button"
                    className="mt-2 text-sm text-red-600 hover:text-red-800"
                    onClick={() => setSelectedUser(null)}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Step 3: Select Branch */}
        {step === 3 && (
          <div>
            <h3 className="text-lg font-medium mb-3 text-gray-700">Select nearest branch to the recipient</h3>
            <div className="mb-4">
              <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-1">
                Branch Location
              </label>
              <select
                id="branch"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              >
                <option value="">Select a branch</option>
                {branchOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
        )}
        
        {/* Step 4: Add Notes & Confirm */}
        {step === 4 && (
          <div>
            <h3 className="text-lg font-medium mb-3 text-gray-700">Add notes and confirm shipping details</h3>
            
            <div className="mb-4">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes (optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Add any special instructions or notes about your shipment"
              />
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <h4 className="font-medium text-gray-700 mb-2">Shipment Summary</h4>
              <div className="text-sm">
                <p><span className="text-gray-500">Item Types:</span> {itemTypes.join(', ')}</p>
                <p className="mt-1">
                  <span className="text-gray-500">Recipient:</span> {selectedUser?.firstName} {selectedUser?.lastName} (ID: {selectedUser?.userID})
                </p>
                <p className="mt-1"><span className="text-gray-500">Branch:</span> {branch}</p>
                {notes && <p className="mt-1"><span className="text-gray-500">Notes:</span> {notes}</p>}
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-between mt-6">
          {step > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Back
            </button>
          )}
          
          {step < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="ml-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="ml-auto bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {loading ? 'Processing...' : 'Submit Request'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default SendShipmentForm;