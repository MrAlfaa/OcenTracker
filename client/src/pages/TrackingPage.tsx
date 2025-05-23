import React, { useState, useEffect } from 'react';
import TrackingForm from '../components/TrackingForm';
import ShipmentDetails from '../components/ShipmentDetails';
import SendShipmentForm from '../components/SendShipmentForm';
import { Shipment } from '../types/shipment';
import { useAuth } from '../context/AuthContext';
import { FaSearch, FaPaperPlane, FaBoxOpen, FaSpinner, FaShippingFast, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const TrackingPage: React.FC = () => {
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [serviceTab, setServiceTab] = useState<'send' | 'receive'>('send');
  const { isAuthenticated, token, user } = useAuth();
  const [recentlyCreatedShipment, setRecentlyCreatedShipment] = useState<string | null>(null);
  const [incomingShipments, setIncomingShipments] = useState<Shipment[]>([]);
  const [loadingIncomingShipments, setLoadingIncomingShipments] = useState<boolean>(false);
  const [incomingShipmentsError, setIncomingShipmentsError] = useState<string | null>(null);
  const [confirmationNote, setConfirmationNote] = useState('');
  const [confirmingDelivery, setConfirmingDelivery] = useState(false);
  const [confirmationSuccess, setConfirmationSuccess] = useState(false);

  const trackShipment = async (trackingNumber: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/shipments/track/${trackingNumber}`);
      
      // Check if the response is JSON
      const contentType = response.headers.get('content-type');
      
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned an invalid response format');
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Shipment not found');
      }
      
      const data = await response.json();
      setShipment(data);
    } catch (err) {
      console.error('Error tracking shipment:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while tracking the shipment');
      setShipment(null);
    } finally {
      setLoading(false);
    }
  };

  const handleShipmentCreated = (newShipment: Shipment) => {
    setRecentlyCreatedShipment(newShipment.trackingNumber);
    // Set the service tab to 'send' (as it doesn't have a 'track' option)
    setServiceTab('send');
    
    // Clear this message after some time
    setTimeout(() => {
      setRecentlyCreatedShipment(null);
    }, 10000); // Clear after 10 seconds
  };

  // Fetch incoming shipments for the user
  const fetchIncomingShipments = async () => {
    if (!isAuthenticated || !token) return;
    
    setLoadingIncomingShipments(true);
    setIncomingShipmentsError(null);
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      console.log('Fetching incoming shipments...');
      const response = await fetch(`${apiUrl}/api/shipments/incoming`, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch incoming shipments');
      }
      
      const data = await response.json();
      console.log('Incoming shipments data:', data); // Debug log
      setIncomingShipments(data);
    } catch (err) {
      console.error('Error fetching incoming shipments:', err);
      setIncomingShipmentsError(err instanceof Error ? err.message : 'An error occurred while fetching your incoming shipments');
    } finally {
      setLoadingIncomingShipments(false);
    }
  };

  // Fetch incoming shipments when the receive tab is selected and user is authenticated
  useEffect(() => {
    if (serviceTab === 'receive' && isAuthenticated) {
      fetchIncomingShipments();
    }
  }, [serviceTab, isAuthenticated]);

  // Format date for better display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // New function to handle delivery confirmation
  const confirmDelivery = async (shipmentId: string) => {
    if (!isAuthenticated || !token) return;
    
    setConfirmingDelivery(true);
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/shipments/recipient/${shipmentId}/confirm-delivery`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ confirmationNote })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to confirm delivery');
      }
      
      // Refresh the incoming shipments
      fetchIncomingShipments();
      setConfirmationSuccess(true);
      setConfirmationNote('');
      
      // Reset success state after some time
      setTimeout(() => {
        setConfirmationSuccess(false);
      }, 5000);
    } catch (err) {
      console.error('Error confirming delivery:', err);
      setIncomingShipmentsError(err instanceof Error ? err.message : 'An error occurred while confirming delivery');
    } finally {
      setConfirmingDelivery(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-3">
              <span className="text-blue-600">Shipment</span> Services
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Track, send, and receive shipments with our comprehensive shipping solutions.
            </p>
          </div>
          
          {/* Tracking Section - Always at Top */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-5">
              <div className="flex items-center justify-center">
                <FaShippingFast className="text-2xl mr-3" />
                <h2 className="text-2xl font-bold">Track Your Shipment</h2>
              </div>
              <p className="text-blue-100 text-center mt-2">
                Enter your tracking number below to get real-time updates on your package.
              </p>
            </div>
            <div className="p-6">
              <TrackingForm onSubmit={trackShipment} />
              
              {loading && (
                <div className="bg-blue-50 rounded-lg p-8 text-center mt-6">
                  <FaSpinner className="animate-spin text-blue-600 text-3xl mx-auto mb-4" />
                  <p className="text-blue-800 font-medium">Searching for your shipment...</p>
                  <p className="text-blue-600 text-sm mt-2">This may take a few moments</p>
                </div>
              )}
              
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mt-6" role="alert">
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
              
              {shipment && !loading && (
                <div className="mt-6">
                  <ShipmentDetails shipment={shipment} />
                </div>
              )}
            </div>
          </div>
          
          {/* Service Options Section with Tabs */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200">
              <button
                className={`flex-1 py-4 px-6 flex items-center justify-center gap-2 font-medium transition-all ${
                  serviceTab === 'send' 
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                    : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                }`}
                onClick={() => setServiceTab('send')}
              >
                <FaPaperPlane className={serviceTab === 'send' ? "text-blue-600" : "text-gray-400"} />
                <span>Send Package</span>
              </button>
              <button
                className={`flex-1 py-4 px-6 flex items-center justify-center gap-2 font-medium transition-all ${
                  serviceTab === 'receive' 
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                    : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                }`}
                onClick={() => setServiceTab('receive')}
              >
                <FaBoxOpen className={serviceTab === 'receive' ? "text-blue-600" : "text-gray-400"} />
                <span>Receive Package</span>
              </button>
            </div>
            
            {/* Tab Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {serviceTab === 'send' && (
                  <motion.div
                    key="send"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-800 mb-3">Send a Package</h2>
                      <p className="text-gray-600">
                        Complete the form below to arrange the sending of a package to your recipient.
                      </p>
                    </div>
                    
                    {recentlyCreatedShipment && (
                      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-6">
                        <div className="flex">
                          <div className="ml-3">
                            <p className="text-sm text-green-700">
                              Shipment created successfully! Your tracking number is <span className="font-bold">{recentlyCreatedShipment}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {!isAuthenticated ? (
                      <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-6">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-6 w-6 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <h3 className="text-lg font-medium text-yellow-800">Authentication Required</h3>
                            <p className="mt-1 text-yellow-700">
                              Please <a href="/login" className="font-medium underline text-yellow-800 hover:text-yellow-900">sign in</a> to 
                              send a package. Creating an account helps us manage your shipments and provide better service.
                            </p>
                            <div className="mt-3">
                              <a href="/login" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700">
                                Sign In
                              </a>
                              <a href="/register" className="ml-3 inline-flex items-center px-4 py-2 border border-yellow-300 text-sm font-medium rounded-md text-yellow-700 bg-white hover:bg-yellow-50">
                                Create Account
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <SendShipmentForm onShipmentCreated={handleShipmentCreated} />
                    )}
                  </motion.div>
                )}
                
                {serviceTab === 'receive' && (
                  <motion.div
                    key="receive"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-800 mb-3">Receive Package</h2>
                      <p className="text-gray-600">
                        View and manage packages that are being sent to you.
                      </p>
                    </div>
                    
                    {!isAuthenticated ? (
                      <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-6">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-6 w-6 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <h3 className="text-lg font-medium text-yellow-800">Authentication Required</h3>
                            <p className="mt-1 text-yellow-700">
                              Please <a href="/login" className="font-medium underline text-yellow-800 hover:text-yellow-900">sign in</a> to 
                              view packages being sent to you.
                            </p>
                            <div className="mt-3">
                              <a href="/login" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700">
                                Sign In
                              </a>
                              <a href="/register" className="ml-3 inline-flex items-center px-4 py-2 border border-yellow-300 text-sm font-medium rounded-md text-yellow-700 bg-white hover:bg-yellow-50">
                                Create Account
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : loadingIncomingShipments ? (
                      <div className="bg-blue-50 rounded-lg p-8 text-center mt-6">
                        <FaSpinner className="animate-spin text-blue-600 text-3xl mx-auto mb-4" />
                        <p className="text-blue-800 font-medium">Loading your incoming packages...</p>
                      </div>
                    ) : incomingShipmentsError ? (
                      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mt-6" role="alert">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-red-700">{incomingShipmentsError}</p>
                          </div>
                        </div>
                      </div>
                    ) : incomingShipments.length === 0 ? (
                      <div className="bg-gray-50 rounded-lg p-8 text-center">
                        <FaBoxOpen className="text-gray-400 text-5xl mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-700 mb-2">No Incoming Packages</h3>
                        <p className="text-gray-600">
                          You don't have any packages addressed to you at the moment.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {confirmationSuccess && (
                          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-6">
                            <div className="flex">
                              <div className="flex-shrink-0">
                                <FaCheckCircle className="h-5 w-5 text-green-500" />
                              </div>
                              <div className="ml-3">
                                <p className="text-sm text-green-700">
                                  Delivery confirmed successfully! Thank you.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {incomingShipments.map((incomingShipment) => (
                          <div key={incomingShipment._id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                              <div>
                                <h3 className="text-lg font-medium text-gray-900">
                                  Tracking #: {incomingShipment.trackingNumber}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  From: {incomingShipment.senderName}
                                </p>
                              </div>
                              <div>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  incomingShipment.status === 'Delivered To Recipient' 
                                    ? 'bg-yellow-100 text-yellow-800' 
                                    : incomingShipment.status === 'Delivery Completed'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {incomingShipment.status === 'Delivered To Recipient' 
                                    ? <FaExclamationTriangle className="mr-1" />
                                    : incomingShipment.status === 'Delivery Completed'
                                    ? <FaCheckCircle className="mr-1" />
                                    : null
                                  }
                                  {incomingShipment.status}
                                </span>
                              </div>
                            </div>
                            <div className="p-4">
                              <div className="mb-4">
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Origin:</span> {incomingShipment.origin}
                                </p>
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Destination:</span> {incomingShipment.destination}
                                </p>
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Expected Delivery:</span> {formatDate(incomingShipment.estimatedDelivery)}
                                </p>
                                {incomingShipment.itemTypes && incomingShipment.itemTypes.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-sm text-gray-600 font-medium mb-1">Item Types:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {incomingShipment.itemTypes.map((type, index) => (
                                        <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                          {type}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              {/* Delivery Confirmation UI - Show only if delivered but not confirmed */}
                              {incomingShipment.status === 'Delivered To Recipient' && !incomingShipment.recipientConfirmed && (
                                <div className="mt-4 bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                                  <h4 className="flex items-center text-md font-medium text-yellow-800 mb-2">
                                    <FaExclamationTriangle className="text-yellow-600 mr-2" />
                                    Delivery Confirmation Required
                                  </h4>
                                  <p className="text-sm text-yellow-700 mb-4">
                                    This package has been marked as delivered to you on {incomingShipment.deliveredToRecipientAt ? formatDate(incomingShipment.deliveredToRecipientAt) : 'recently'}.
                                    Please confirm that you have received it.
                                  </p>
                                  
                                  <div className="space-y-3">
                                    <textarea
                                      value={confirmationNote}
                                      onChange={(e) => setConfirmationNote(e.target.value)}
                                      placeholder="Add notes about the delivery (optional)"
                                      rows={2}
                                      className="shadow-sm focus:ring-yellow-500 focus:border-yellow-500 block w-full sm:text-sm border-yellow-300 rounded-md"
                                    />
                                    <button
                                      onClick={() => confirmDelivery(incomingShipment._id)}
                                      disabled={confirmingDelivery}
                                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
                                    >
                                      {confirmingDelivery ? (
                                        <>
                                          <FaSpinner className="animate-spin mr-2" />
                                          Processing...
                                        </>
                                      ) : (
                                        <>
                                          <FaCheckCircle className="mr-2" />
                                          Confirm Delivery
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              )}
                              
                              <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center">
                                <div>
                                  {incomingShipment.recipientConfirmed && (
                                    <div className="text-green-600 text-sm flex items-center mb-3">
                                      <FaCheckCircle className="mr-1" />
                                      Delivery confirmed on {formatDate(incomingShipment.recipientConfirmedAt || '')}
                                    </div>
                                  )}
                                </div>
                                <button
                                  onClick={() => trackShipment(incomingShipment.trackingNumber)}
                                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                  <FaSearch className="mr-1.5 -ml-0.5" />
                                  Track Details
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          {/* Additional Helpful Information */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-blue-600 mb-3">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nationwide Coverage</h3>
              <p className="text-gray-600">Delivering to all major cities and regions across Sri Lanka.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-blue-600 mb-3">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Realtime Tracking</h3>
              <p className="text-gray-600">Monitor your shipment's progress with our advanced tracking system.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-blue-600 mb-3">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Secure Shipping</h3>
              <p className="text-gray-600">Your packages are handled with care and delivered securely.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackingPage;
