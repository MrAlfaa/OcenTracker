import React, { useState, useEffect } from 'react';
import TrackingForm from '../components/TrackingForm';
import ShipmentDetails from '../components/ShipmentDetails';
import SendShipmentForm from '../components/SendShipmentForm';
import { Shipment } from '../types/shipment';
import { useAuth } from '../context/AuthContext';
import { FaSearch, FaPaperPlane, FaBoxOpen, FaSpinner, FaShippingFast } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const TrackingPage: React.FC = () => {
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [serviceTab, setServiceTab] = useState<'send' | 'receive'>('send');
  const { isAuthenticated } = useAuth();

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
    setShipment(newShipment);
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
                    <div className="py-12 text-center">
                      <div className="inline-block p-4 bg-blue-100 rounded-full mb-6">
                        <FaBoxOpen className="text-4xl text-blue-600" />
                      </div>
                      <h3 className="text-2xl font-semibold text-gray-800 mb-3">Receive Package</h3>
                      <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
                        We're working on this feature! Soon you'll be able to manage incoming packages with ease.
                      </p>
                      <span className="inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-50">
                        Coming Soon
                      </span>
                    </div>
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
