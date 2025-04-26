import React, { useState, useEffect } from 'react';
import TrackingForm from '../components/TrackingForm';
import ShipmentDetails from '../components/ShipmentDetails';
import SendShipmentForm from '../components/SendShipmentForm';
import { Shipment } from '../types/shipment';
import { useAuth } from '../context/AuthContext';
import { FaSearch, FaPaperPlane, FaBoxOpen, FaSpinner, FaArrowRight, FaShippingFast, FaBox } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const TrackingPage: React.FC = () => {
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'track' | 'send' | 'receive' | null>(null);
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
      setActiveSection('track');
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
    setActiveSection('track');
  };

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-3">
              <span className="text-blue-600">OceanTracker</span> Shipping Services
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The fastest and most reliable way to track, send, and receive shipments worldwide.
            </p>
          </div>
          
          {/* Tracking Section - Always Visible at Top */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-10">
            <div className="bg-blue-600 text-white p-5">
              <div className="flex items-center justify-center">
                <FaShippingFast className="text-2xl mr-3" />
                <h2 className="text-2xl font-bold">Track Your Shipment</h2>
              </div>
              <p className="text-blue-100 text-center mt-2">
                Enter your tracking number below to get real-time updates on your package's journey.
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
          
          {/* Service Options Section */}
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {/* Send Package Option */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all hover:shadow-xl">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-5">
                <div className="flex items-center justify-center">
                  <FaPaperPlane className="text-2xl mr-3" />
                  <h2 className="text-2xl font-bold">Send Package</h2>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  Complete a form to arrange the sending of a package to your recipient. Track your shipment from pickup to delivery.
                </p>
                <button
                  onClick={() => setActiveSection(activeSection === 'send' ? null : 'send')}
                  className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
                >
                  {activeSection === 'send' ? 'Hide Form' : 'Send Now'}
                  <FaArrowRight className="ml-2" />
                </button>
                
                <AnimatePresence>
                  {activeSection === 'send' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-6 overflow-hidden"
                    >
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
                </AnimatePresence>
              </div>
            </div>
            
            {/* Receive Package Option */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all hover:shadow-xl">
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-5">
                <div className="flex items-center justify-center">
                  <FaBoxOpen className="text-2xl mr-3" />
                  <h2 className="text-2xl font-bold">Receive Package</h2>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  Schedule a package delivery to your address. Get notified when your package is on its way and when it arrives.
                </p>
                <button
                  onClick={() => setActiveSection(activeSection === 'receive' ? null : 'receive')}
                  className="w-full bg-green-100 hover:bg-green-200 text-green-700 font-semibold py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
                >
                  {activeSection === 'receive' ? 'Hide Details' : 'Receive Now'}
                  <FaArrowRight className="ml-2" />
                </button>
                
                <AnimatePresence>
                  {activeSection === 'receive' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-6 overflow-hidden"
                    >
                      <div className="py-6 text-center">
                        <div className="inline-block p-4 bg-green-100 rounded-full mb-6">
                          <FaBoxOpen className="text-4xl text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">Receive Package</h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                          We're working on this feature! Soon you'll be able to manage incoming packages with ease.
                        </p>
                        <span className="inline-flex items-center px-4 py-2 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-green-50">
                          Coming Soon
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
          
          {/* Features Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Our Shipping Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md transform transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="text-blue-600 mb-3">
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nationwide Coverage</h3>
                <p className="text-gray-600">Delivering to all major cities and regions across Sri Lanka with reliable service.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md transform transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="text-blue-600 mb-3">
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Realtime Tracking</h3>
                <p className="text-gray-600">Monitor your shipment's progress with our advanced tracking system, updated every step of the way.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md transform transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="text-blue-600 mb-3">
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Secure Shipping</h3>
                <p className="text-gray-600">Your packages are handled with care and delivered securely with our trusted delivery partners.</p>
              </div>
            </div>
          </div>
          
          {/* Testimonials Section */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-10">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">What Our Customers Say</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl mr-4">
                    JD
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">John Doe</h4>
                    <p className="text-sm text-gray-500">Business Owner, Colombo</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">"OceanTracker has revolutionized how we handle shipments. Their tracking system is incredibly reliable and user-friendly."</p>
              </div>
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xl mr-4">
                    SR
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Sarah Rodriguez</h4>
                    <p className="text-sm text-gray-500">Online Retailer, Kandy</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">"We've been using OceanTracker for our e-commerce deliveries for over a year. Their service is prompt and their staff is always helpful."</p>
              </div>
            </div>
          </div>
          
          {/* CTA Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg overflow-hidden">
            <div className="md:flex items-center">
              <div className="p-8 md:w-2/3">
                <h2 className="text-2xl font-bold text-white mb-3">Ready to ship with confidence?</h2>
                <p className="text-blue-100 mb-6">Join thousands of satisfied customers who trust OceanTracker with their shipments every day.</p>
                <div className="flex flex-wrap gap-3">
                  <a href="/register" className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-blue-50 transition-colors">
                    Create an Account
                  </a>
                  <a href="/contact" className="border border-white text-white font-semibold px-6 py-3 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors">
                    Contact Sales
                  </a>
                </div>
              </div>
              <div className="hidden md:block md:w-1/3">
                <div className="h-full bg-blue-500 p-8 flex items-center justify-center">
                  <FaBox className="text-white text-8xl opacity-25" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackingPage;
