import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shipment } from '../types/shipment';
import { FaUser, FaMapMarkerAlt, FaBoxOpen, FaCheck, FaSpinner, FaEdit } from 'react-icons/fa';

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
  const [isSearching, setIsSearching] = useState(false);
  
  // Create a ref to track whether form is being submitted
  const isSubmitting = useRef(false);
  
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
      setIsSearching(true);
      const timeoutId = setTimeout(() => {
        searchUsers();
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
      setIsSearching(false);
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
      setIsSearching(false);
    } catch (err) {
      console.error('Error searching users:', err);
      setSearchResults([]);
      setIsSearching(false);
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

  // Completely separated submit handler that's only called from the final submit button
  const submitShipment = async () => {
    // Prevent double submission
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    
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
      isSubmitting.current = false;
    }
  };

  // Form submission handler - now prevents default and separates logic
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only submit in step 4
    if (step === 4) {
      submitShipment();
    } else {
      console.error(`Form submitted at incorrect step ${step}`);
    }
  };

  const nextStep = (e: React.MouseEvent) => {
    // Prevent any possible form submission
    e.preventDefault();
    
    console.log(`Attempting to move from step ${step} to ${step + 1}`);
    
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
    console.log(`Successfully moved to step ${step + 1}`);
  };

  const prevStep = (e: React.MouseEvent) => {
    // Prevent any possible form submission
    e.preventDefault();
    
    console.log(`Moving from step ${step} to ${step - 1}`);
    setError(null);
    setStep(step - 1);
  };

  const renderStepCircle = (stepNumber: number, label: string) => {
    return (
      <div className="flex flex-col items-center">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
          step >= stepNumber 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-200 text-gray-600'
        }`}>
          {step > stepNumber ? <FaCheck size={12} /> : stepNumber}
        </div>
        <span className={`text-xs mt-1 ${
          step >= stepNumber 
            ? 'text-blue-600 font-medium' 
            : 'text-gray-500'
        }`}>
          {label}
        </span>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center mb-4 text-blue-600">
              <FaBoxOpen className="mr-2" />
              <h3 className="text-lg font-medium text-gray-800">What type of items are you sending?</h3>
            </div>
            <p className="text-gray-600 mb-4">Select all that apply. This helps us handle your shipment appropriately.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              {itemTypeOptions.map(type => (
                <div 
                  key={type}
                  className={`border rounded-md p-4 cursor-pointer transition-all ${
                    itemTypes.includes(type) 
                      ? 'bg-blue-100 border-blue-500 shadow-sm' 
                      : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                  }`}
                  onClick={() => handleItemTypeToggle(type)}
                >
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 w-5 h-5 mr-2 rounded-full border ${
                      itemTypes.includes(type) 
                        ? 'bg-blue-500 border-blue-500' 
                        : 'border-gray-400'
                    } flex items-center justify-center`}>
                      {itemTypes.includes(type) && <div className="w-2 h-2 rounded-full bg-white"></div>}
                    </div>
                    <span className={`text-sm font-medium ${
                      itemTypes.includes(type) ? 'text-blue-700' : 'text-gray-700'
                    }`}>{type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center mb-4 text-blue-600">
              <FaUser className="mr-2" />
              <h3 className="text-lg font-medium text-gray-800">Who are you sending to?</h3>
            </div>
            <p className="text-gray-600 mb-4">Search for a registered user by ID or name.</p>
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Enter user ID or name"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <FaSpinner className="animate-spin text-blue-500" />
                  </div>
                )}
              </div>
              
              {searchResults.length > 0 && (
                <div className="mt-2 border border-gray-200 rounded-lg shadow-sm bg-white max-h-60 overflow-y-auto divide-y divide-gray-100">
                  {searchResults.map(user => (
                    <div 
                      key={user.userID}
                      className="p-4 cursor-pointer hover:bg-blue-50 transition-colors"
                      onClick={() => handleUserSelect(user)}
                    >
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold mr-3">
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{user.firstName} {user.lastName}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded mr-2">ID: {user.userID}</span>
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {searchTerm.length >= 2 && searchResults.length === 0 && !isSearching && (
                <div className="mt-2 p-3 text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                  No users found matching "{searchTerm}"
                </div>
              )}
              
              {selectedUser && (
                <div className="mt-4 p-4 border border-blue-200 rounded-lg bg-blue-50">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold mr-3">
                        {selectedUser.firstName.charAt(0)}{selectedUser.lastName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800 text-lg">{selectedUser.firstName} {selectedUser.lastName}</div>
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center mt-1">
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">ID: {selectedUser.userID}</span>
                            <span className="mx-2">•</span>
                            {selectedUser.email}
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                      onClick={() => setSelectedUser(null)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center mb-4 text-blue-600">
              <FaMapMarkerAlt className="mr-2" />
              <h3 className="text-lg font-medium text-gray-800">Select nearest branch to the recipient</h3>
            </div>
            <p className="text-gray-600 mb-4">Choose the branch location that's most convenient for your recipient.</p>
            <div className="mb-4">
              <div className="relative">
                <select
                  id="branch"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg appearance-none"
                  title="Select a branch location"
                  aria-label="Select a branch location"
                >
                  <option value="">Select a branch</option>
                  {branchOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
              
              {branch && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h4 className="font-medium text-gray-800 mb-2">Branch Information: {branch}</h4>
                  <p className="text-sm text-gray-600">
                    Our {branch} branch is ready to handle your shipment. Operating hours are Monday to Friday, 9:00 AM to 5:00 PM.
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center mb-4 text-blue-600">
              <FaEdit className="mr-2" />
              <h3 className="text-lg font-medium text-gray-800">Add notes and confirm shipping details</h3>
            </div>
            
            <div className="mb-5">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes (optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md bg-gray-50 p-3"
                placeholder="Add any special instructions or notes about your shipment"
              />
            </div>
            
            <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 mb-4">
              <h4 className="font-medium text-gray-800 mb-3 text-lg">Shipment Summary</h4>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-24 text-sm font-medium text-gray-500">Item Types:</div>
                  <div className="flex-1 flex flex-wrap gap-1">
                    {itemTypes.map(type => (
                      <span key={type} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-24 text-sm font-medium text-gray-500">Recipient:</div>
                  <div className="flex-1">
                    <p className="text-gray-800">{selectedUser?.firstName} {selectedUser?.lastName}</p>
                    <p className="text-xs text-gray-500">ID: {selectedUser?.userID} • {selectedUser?.email}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-24 text-sm font-medium text-gray-500">Branch:</div>
                  <div className="flex-1 text-gray-800">{branch}</div>
                </div>
                
                {notes && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-24 text-sm font-medium text-gray-500">Notes:</div>
                    <div className="flex-1 text-gray-800 text-sm">{notes}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 shadow-lg rounded-lg p-6 mb-8 border border-blue-100">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6" role="alert">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-6" role="alert">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Step Progress Indicator */}
      <div className="flex justify-between items-center mb-8 px-8">
        {renderStepCircle(1, 'Items')}
        <div className={`flex-1 h-0.5 mx-2 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
        {renderStepCircle(2, 'Recipient')}
        <div className={`flex-1 h-0.5 mx-2 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
        {renderStepCircle(3, 'Branch')}
        <div className={`flex-1 h-0.5 mx-2 ${step >= 4 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
        {renderStepCircle(4, 'Notes & Confirm')}
      </div>
      
      {/* Form with noValidate to prevent browser validation */}
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {renderCurrentStep()}
        
        {/* Navigation Buttons */}
        <div className="flex justify-between pt-2">
          {step > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back
            </button>
          ) : (
            <div></div> // Empty div to maintain layout
          )}
          
          {step < 4 ? (
            <button
              type="button" 
              onClick={nextStep}
              className="inline-flex items-center px-5 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Continue
            </button>
          ) : (
            <button
              type="button" // Changed to button type to avoid form submission behavior
              onClick={() => submitShipment()}
              disabled={loading}
              className="inline-flex items-center px-5 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Processing...
                </>
              ) : (
                'Submit Request'
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default SendShipmentForm;