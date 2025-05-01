import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shipment } from '../types/shipment';
import { Link } from 'react-router-dom';
import { FaBox,FaExchangeAlt, FaSpinner, FaTruck, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaShippingFast, FaMapMarkedAlt, FaPrint, FaSearch } from 'react-icons/fa';

// Status badge component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let bgColor = 'bg-gray-100 text-gray-800';
  let icon = <FaBox className="mr-1" />;

  switch (status.toLowerCase()) {
    case 'pending':
      bgColor = 'bg-yellow-100 text-yellow-800';
      icon = <FaExclamationTriangle className="mr-1" />;
      break;
    case 'pickup requested':
      bgColor = 'bg-yellow-100 text-yellow-800';
      icon = <FaTruck className="mr-1" />;
      break;
    case 'picked up':
      bgColor = 'bg-purple-100 text-purple-800';
      icon = <FaBox className="mr-1" />;
      break;
    case 'handover requested':
      bgColor = 'bg-yellow-100 text-yellow-800';
      icon = <FaExchangeAlt className="mr-1" />;
      break;
    case 'in transit':
      bgColor = 'bg-blue-100 text-blue-800';
      icon = <FaTruck className="mr-1" />;
      break;
    case 'delivered':
      bgColor = 'bg-green-100 text-green-800';
      icon = <FaCheckCircle className="mr-1" />;
      break;
    case 'delayed':
      bgColor = 'bg-orange-100 text-orange-800';
      icon = <FaExclamationTriangle className="mr-1" />;
      break;
    case 'cancelled':
      bgColor = 'bg-red-100 text-red-800';
      icon = <FaTimesCircle className="mr-1" />;
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor}`}>
      {icon}
      {status}
    </span>
  );
};

const ShipmentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ongoing' | 'completed' | 'cancelled'>('ongoing');
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredShipments, setFilteredShipments] = useState<Shipment[]>([]);
  
  const { token } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchShipments();
  }, [activeTab]);

  // Filter shipments based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredShipments(shipments);
    } else {
      const filtered = shipments.filter(
        shipment => 
          shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          shipment.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (shipment.recipientName && shipment.recipientName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredShipments(filtered);
    }
  }, [searchTerm, shipments]);

  const fetchShipments = async () => {
    setLoading(true);
    try {
      // Define status filters based on active tab
      let statusFilter = '';
      switch (activeTab) {
        case 'ongoing':
          statusFilter = 'Pending,In Transit,Picked Up,Delayed,Pickup Requested';
          break;
        case 'completed':
          statusFilter = 'Delivered';
          break;
        case 'cancelled':
          statusFilter = 'Cancelled';
          break;
      }

      const response = await fetch(
        `${apiUrl}/api/shipments/user?status=${statusFilter}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token || ''
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch shipments');
      }

      const data = await response.json();
      setShipments(data);
      setFilteredShipments(data);
      setSelectedShipment(null);
      setError(null);
    } catch (err) {
      console.error('Error fetching shipments:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching shipments');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Move the confirmPickup function inside the component
  const confirmPickup = async (shipmentId: string) => {
    try {
      setLoading(true);
      
      const response = await fetch(
        `${apiUrl}/api/shipments/user/${shipmentId}/confirm-pickup`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token || ''
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to confirm pickup');
      }

      // Refresh shipments
      fetchShipments();
      
      // Show success message
      // You could add a success state here if you want to show a message
      
    } catch (err) {
      console.error('Error confirming pickup:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while confirming pickup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with icon */}
        <div className="mb-8 text-center md:text-left md:flex md:items-center md:justify-between">
          <div className="flex items-center justify-center md:justify-start">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <FaShippingFast className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Shipments</h1>
              <p className="mt-1 text-gray-600">Track and manage all your shipments in one place</p>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Link
              to="/tracking"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaBox className="mr-2 -ml-1" />
              Send New Package
            </Link>
          </div>
        </div>

        {/* Search bar */}
        <div className="mb-6">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 py-3 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search by tracking number, destination, or recipient"
            />
          </div>
        </div>

        {/* Tab Navigation - Enhanced */}
        <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('ongoing')}
              className={`flex-1 py-4 px-4 text-center ${
                activeTab === 'ongoing'
                  ? 'bg-blue-50 border-b-2 border-blue-500 text-blue-600 font-medium'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              } transition-colors duration-150 ease-in-out`}
            >
              <div className="flex flex-col items-center">
                <FaTruck className={`h-5 w-5 ${activeTab === 'ongoing' ? 'text-blue-500' : 'text-gray-400'}`} />
                <span className="mt-1">Ongoing</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex-1 py-4 px-4 text-center ${
                activeTab === 'completed'
                  ? 'bg-green-50 border-b-2 border-green-500 text-green-600 font-medium'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              } transition-colors duration-150 ease-in-out`}
            >
              <div className="flex flex-col items-center">
                <FaCheckCircle className={`h-5 w-5 ${activeTab === 'completed' ? 'text-green-500' : 'text-gray-400'}`} />
                <span className="mt-1">Completed</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('cancelled')}
              className={`flex-1 py-4 px-4 text-center ${
                activeTab === 'cancelled'
                  ? 'bg-red-50 border-b-2 border-red-500 text-red-600 font-medium'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              } transition-colors duration-150 ease-in-out`}
            >
              <div className="flex flex-col items-center">
                <FaTimesCircle className={`h-5 w-5 ${activeTab === 'cancelled' ? 'text-red-500' : 'text-gray-400'}`} />
                <span className="mt-1">Cancelled</span>
              </div>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12 bg-white rounded-lg shadow-sm">
            <div className="text-center">
              <FaSpinner className="animate-spin text-blue-500 text-4xl mx-auto mb-4" />
              <p className="text-gray-600">Loading your shipments...</p>
            </div>
          </div>
        ) : filteredShipments.length === 0 ? (
          <div className="bg-white shadow-sm rounded-lg p-8 text-center">
            <FaBox className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No shipments found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? 
                "No shipments match your search criteria." :
                activeTab === 'ongoing' 
                  ? "You don't have any ongoing shipments at the moment." 
                  : activeTab === 'completed'
                  ? "You don't have any completed shipments yet."
                  : "You don't have any cancelled shipments."}
            </p>
            {searchTerm ? (
              <button
                onClick={() => setSearchTerm('')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Clear Search
              </button>
            ) : activeTab !== 'ongoing' ? (
              <button
                onClick={() => setActiveTab('ongoing')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                View Ongoing Shipments
              </button>
            ) : null}
            <Link
              to="/tracking"
              className="ml-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Send a Package
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6">
            {/* Shipments List */}
            <div className="lg:w-2/5">
              <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="px-4 py-5 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">
                    {activeTab === 'ongoing' 
                      ? 'Ongoing Shipments' 
                      : activeTab === 'completed'
                      ? 'Completed Shipments'
                      : 'Cancelled Shipments'}
                  </h2>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {filteredShipments.length} {filteredShipments.length === 1 ? 'shipment' : 'shipments'}
                  </span>
                </div>
                <div className="overflow-y-auto max-h-[600px]">
                  {filteredShipments.map(shipment => (
                    <div 
                      key={shipment._id} 
                      onClick={() => setSelectedShipment(shipment)}
                      className={`p-4 border-b border-gray-100 cursor-pointer transition-colors duration-150 ease-in-out hover:bg-gray-50 ${selectedShipment?._id === shipment._id ? 'bg-blue-50' : ''}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-blue-600">{shipment.trackingNumber}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(shipment.createdAt).toLocaleDateString()} • {shipment.destination}
                          </p>
                        </div>
                        <StatusBadge status={shipment.status} />
                      </div>
                      {shipment.recipientName && (
                        <p className="text-xs text-gray-600 mt-2">
                          To: {shipment.recipientName}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Shipment Details */}
            <div className="lg:w-3/5">
              {selectedShipment ? (
                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">Shipment Details</h2>
                      <p className="text-sm text-gray-500">Tracking: {selectedShipment.trackingNumber}</p>
                    </div>
                    <StatusBadge status={selectedShipment.status} />
                  </div>
                  
                  <div className="p-6">
                    {/* Pickup Confirmation UI */}
                    {selectedShipment.status === 'Pickup Requested' && selectedShipment.pickupRequested && !selectedShipment.pickupConfirmed && (
                      <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">Pickup Confirmation Required</h3>
                            <div className="mt-2 text-sm text-yellow-700">
                              <p>
                                Driver {selectedShipment.driverName} has requested to pick up this shipment. 
                                Please confirm when the package has been handed over to the driver.
                              </p>
                              <p className="mt-1 text-xs text-yellow-600">
                                Requested at: {formatDate(selectedShipment.pickupRequestedAt || '')}
                              </p>
                            </div>
                            <div className="mt-4">
                              <button
                                type="button"
                                onClick={() => confirmPickup(selectedShipment._id)}
                                disabled={loading}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                              >
                                {loading ? (
                                  <>
                                    <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <FaCheckCircle className="-ml-1 mr-2 h-4 w-4" />
                                    Confirm Pickup
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Shipment Progress Visualization - Enhanced */}
                    {activeTab === 'ongoing' && (
                      <div className="mb-8">
                        <h3 className="text-base font-medium text-gray-900 mb-4">Shipment Progress</h3>
                        
                        <div className="relative">
                          <div className="overflow-hidden h-2 mb-6 text-xs flex rounded-full bg-gray-200">
                            {(() => {
                              let progressWidth = '0%';
                              let progressColor = 'bg-blue-500';
                              
                              switch (selectedShipment.status.toLowerCase()) {
                                case 'pending':
                                  progressWidth = '10%';
                                  break;
                                case 'pickup requested':
                                  progressWidth = '25%';
                                  progressColor = 'bg-yellow-500';
                                  break;
                                case 'picked up':
                                  progressWidth = '40%';
                                  break;
                                case 'in transit':
                                  progressWidth = '70%';
                                  break;
                                case 'delivered':
                                  progressWidth = '100%';
                                  progressColor = 'bg-green-500';
                                  break;
                                case 'delayed':
                                  progressWidth = '50%';
                                  progressColor = 'bg-yellow-500';
                                  break;
                                case 'cancelled':
                                  progressWidth = '100%';
                                  progressColor = 'bg-red-500';
                                  break;
                              }
                              return (
                                <div 
                                  style={{ width: progressWidth }}
                                  className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${progressColor} transition-all duration-500 ease-in-out`}
                                ></div>
                              );
                            })()}
                          </div>
                          
                          <div className="flex justify-between text-xs text-gray-600">
                            <div className={`flex flex-col items-center ${selectedShipment.status.toLowerCase() === 'pending' ? 'text-blue-600 font-medium' : ''}`}>
                              <div className={`w-4 h-4 rounded-full mb-1 ${selectedShipment.status.toLowerCase() === 'pending' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                              <span>Pending</span>
                            </div>
                            <div className={`flex flex-col items-center ${selectedShipment.status.toLowerCase() === 'pickup requested' ? 'text-yellow-600 font-medium' : ''}`}>
                              <div className={`w-4 h-4 rounded-full mb-1 ${selectedShipment.status.toLowerCase() === 'pickup requested' ? 'bg-yellow-500' : 'bg-gray-300'}`}></div>
                              <span>Pickup</span>
                            </div>
                            <div className={`flex flex-col items-center ${selectedShipment.status.toLowerCase() === 'in transit' ? 'text-blue-600 font-medium' : ''}`}>
                              <div className={`w-4 h-4 rounded-full mb-1 ${selectedShipment.status.toLowerCase() === 'in transit' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                              <span>In Transit</span>
                            </div>
                            <div className={`flex flex-col items-center ${selectedShipment.status.toLowerCase() === 'delivered' ? 'text-green-600 font-medium' : ''}`}>
                              <div className={`w-4 h-4 rounded-full mb-1 ${selectedShipment.status.toLowerCase() === 'delivered' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                              <span>Delivered</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Shipment Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Shipment Information</h4>
                        <dl className="space-y-2">
                          <div>
                            <dt className="text-xs font-medium text-gray-500">Created</dt>
                            <dd className="mt-1 text-sm text-gray-900">{formatDate(selectedShipment.createdAt)}</dd>
                          </div>
                          <div>
                            <dt className="text-xs font-medium text-gray-500">Origin</dt>
                            <dd className="mt-1 text-sm text-gray-900">{selectedShipment.origin}</dd>
                          </div>
                          <div>
                            <dt className="text-xs font-medium text-gray-500">Destination</dt>
                            <dd className="mt-1 text-sm text-gray-900">{selectedShipment.destination}</dd>
                          </div>
                          <div>
                            <dt className="text-xs font-medium text-gray-500">Estimated Delivery</dt>
                            <dd className="mt-1 text-sm text-gray-900">{formatDate(selectedShipment.estimatedDelivery)}</dd>
                          </div>
                        </dl>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Contact Information</h4>
                        <dl className="space-y-2">
                          {selectedShipment.senderName && (
                            <div>
                              <dt className="text-xs font-medium text-gray-500">Sender</dt>
                              <dd className="mt-1 text-sm text-gray-900">{selectedShipment.senderName}</dd>
                            </div>
                          )}
                          
                          {selectedShipment.recipientName && (
                            <div>
                              <dt className="text-xs font-medium text-gray-500">Recipient</dt>
                              <dd className="mt-1 text-sm text-gray-900">{selectedShipment.recipientName}</dd>
                            </div>
                          )}
                          
                          {selectedShipment.driverName && (
                            <div>
                              <dt className="text-xs font-medium text-gray-500">Assigned Driver</dt>
                              <dd className="mt-1 text-sm text-gray-900">{selectedShipment.driverName}</dd>
                            </div>
                          )}
                          
                          {selectedShipment.recipientPhone && (
                            <div>
                              <dt className="text-xs font-medium text-gray-500">Contact Number</dt>
                              <dd className="mt-1 text-sm text-gray-900">{selectedShipment.recipientPhone}</dd>
                            </div>
                          )}
                        </dl>
                      </div>
                    </div>
                    
                    {/* Additional Details */}
                    <div className="mt-6 space-y-6">
                      {selectedShipment.recipientAddress && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Delivery Address</h4>
                          <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{selectedShipment.recipientAddress}</p>
                        </div>
                      )}
                      
                      {selectedShipment.itemTypes && selectedShipment.itemTypes.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Item Types</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedShipment.itemTypes.map((type, idx) => (
                              <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {selectedShipment.notes && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
                          <p className="text-sm text-gray-900 italic bg-gray-50 p-3 rounded-md">{selectedShipment.notes}</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Tracking History - Enhanced */}
                    <div className="mt-8 border-t border-gray-200 pt-6">
                      <h3 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                        <FaTruck className="mr-2 text-blue-500" />
                        Tracking History
                      </h3>
                      
                      <div className="flow-root">
                        <ul className="-mb-8">
                          {selectedShipment.trackingHistory.map((event, idx) => (
                            <li key={idx}>
                              <div className="relative pb-8">
                                {idx !== selectedShipment.trackingHistory.length - 1 ? (
                                  <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-blue-200" aria-hidden="true"></span>
                                ) : null}
                                <div className="relative flex space-x-3">
                                  <div>
                                    <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                                      {event.status.toLowerCase().includes('delivered') ? (
                                        <FaCheckCircle className="h-4 w-4 text-white" />
                                      ) : event.status.toLowerCase().includes('transit') ? (
                                        <FaTruck className="h-4 w-4 text-white" />
                                      ) : (
                                        <FaBox className="h-4 w-4 text-white" />
                                      )}
                                    </span>
                                  </div>
                                  <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">{event.status}</p>
                                      <p className="text-xs text-gray-500 mt-1">{event.location}</p>
                                    </div>
                                    <div className="text-right text-xs whitespace-nowrap text-gray-500">
                                      {formatDate(event.timestamp)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    {/* Action Buttons - Enhanced */}
                    <div className="mt-8 border-t border-gray-200 pt-6 flex flex-wrap gap-4 justify-between">
                      <Link
                        to={`/tracking?tracking=${selectedShipment.trackingNumber}`}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <FaMapMarkedAlt className="mr-2 -ml-1" />
                        Track on Map
                      </Link>
                      
                      <button
                        onClick={() => window.print()}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <FaPrint className="mr-2 -ml-1" />
                        Print Details
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white shadow-sm rounded-lg p-8 text-center">
                  <div className="bg-blue-50 rounded-full p-4 inline-flex items-center justify-center mb-4">
                    <FaBox className="h-8 w-8 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a shipment</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Click on a shipment from the list to view its details and tracking information.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Action Button */}
        <div className="mt-8 flex justify-between">
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Back to Profile
          </Link>
          
          <Link
            to="/tracking"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Send a New Package
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ShipmentsPage;