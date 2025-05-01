import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBox, FaExchangeAlt, FaSpinner, FaTruck, FaCheckCircle, FaExclamationTriangle, FaArrowRight, FaClipboardCheck, FaSync } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Define shipment type
interface TrackingEvent {
  status: string;
  location: string;
  timestamp: string;
}

interface Shipment {
  _id: string;
  trackingNumber: string;
  status: string;
  origin: string;
  destination: string;
  estimatedDelivery: string;
  senderId?: string;
  senderName?: string;
  recipientId?: string;
  recipientName?: string;
  recipientEmail?: string;
  recipientAddress?: string;
  recipientPhone?: string;
  itemTypes?: string[];
  branch?: string;
  notes?: string;
  trackingHistory: TrackingEvent[];
  createdAt: string;
  updatedAt: string;
  handoverRequested?: boolean;
  handoverConfirmed?: boolean;
  handoverRequestedAt?: string;
  handoverNote?: string;
  adminHandoverNote?: string;
  // Add these properties for pickup functionality
  pickupRequested?: boolean;
  pickupConfirmed?: boolean;
  pickupRequestedAt?: string;
}

interface Driver {
  _id: string;
  userID: string;
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  createdAt: string;
}

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  let bgColor = 'bg-gray-100 text-gray-800';
  let icon = <FaTruck className="mr-1" />;

  switch (status.toLowerCase()) {
    case 'pending':
      bgColor = 'bg-yellow-100 text-yellow-800';
      icon = <FaExclamationTriangle className="mr-1" />;
      break;
    case 'in transit':
      bgColor = 'bg-blue-100 text-blue-800';
      icon = <FaTruck className="mr-1" />;
      break;
    case 'picked up':
      bgColor = 'bg-purple-100 text-purple-800';
      icon = <FaClipboardCheck className="mr-1" />;
      break;
    case 'delivered':
      bgColor = 'bg-green-100 text-green-800';
      icon = <FaCheckCircle className="mr-1" />;
      break;
    case 'delayed':
      bgColor = 'bg-orange-100 text-orange-800';
      icon = <FaExclamationTriangle className="mr-1" />;
      break;
    case 'handover requested':
      bgColor = 'bg-yellow-100 text-yellow-800';
      icon = <FaExchangeAlt className="mr-1" />;
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor}`}>
      {icon}
      {status}
    </span>
  );
};

const Drivers = () => {
  const [userRole, setUserRole] = useState<string>('');
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [assignedShipments, setAssignedShipments] = useState<Shipment[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [pickupNote, setPickupNote] = useState('');
  const [handoverNote, setHandoverNote] = useState('');
  const [processingAction, setProcessingAction] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    // Get user role from token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setUserRole(decoded.role);
        
        // If user is a driver, fetch their assigned shipments
        if (decoded.role === 'driver') {
          fetchDriverShipments();
        } else {
          // If admin or superAdmin, fetch all drivers
          fetchDrivers();
        }
      } catch (err) {
        console.error('Error decoding token:', err);
        setError('Authentication error. Please login again.');
      }
    }
    setIsLoading(false);
  }, []);

  const fetchDrivers = async () => {
    try {
      setIsRefreshing(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `${API_URL}/api/users/drivers`,
        {
          headers: {
            'x-auth-token': token
          }
        }
      );
      
      setDrivers(response.data);
      setError('');
      setIsLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error fetching drivers');
      setIsLoading(false);
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchDriverShipments = async () => {
    try {
      setIsRefreshing(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `${API_URL}/api/shipments/driver`,
        {
          headers: {
            'x-auth-token': token
          }
        }
      );
      
      setAssignedShipments(response.data);
      setError('');
      setIsLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error fetching assigned shipments');
      setIsLoading(false);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePickup = async (shipmentId: string) => {
    try {
      setProcessingAction(true);
      const token = localStorage.getItem('token');
      
      await axios.put(
        `${API_URL}/api/shipments/driver/${shipmentId}/request-pickup`,
        { notes: pickupNote },
        {
          headers: {
            'x-auth-token': token
          }
        }
      );
      
      // Refresh shipments
      fetchDriverShipments();
      setPickupNote('');
      setActionSuccess('Pickup request sent successfully! Waiting for sender confirmation.');
      
      // Clear success message after 3 seconds
      setTimeout(() => setActionSuccess(''), 3000);
      setProcessingAction(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error requesting pickup');
      setProcessingAction(false);
    }
  };

  const handleHandover = async (shipmentId: string) => {
    try {
      setProcessingAction(true);
      const token = localStorage.getItem('token');
      
      await axios.put(
        `${API_URL}/api/shipments/driver/${shipmentId}/request-handover`,
        { 
          notes: handoverNote,
          branchLocation: selectedShipment?.destination 
        },
        {
          headers: {
            'x-auth-token': token
          }
        }
      );
      
      // Refresh shipments
      fetchDriverShipments();
      setHandoverNote('');
      setActionSuccess('Handover request sent successfully! Waiting for admin confirmation.');
      
      // Clear success message after 3 seconds
      setTimeout(() => setActionSuccess(''), 3000);
      setProcessingAction(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error requesting handover');
      setProcessingAction(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Render different content based on user role
  if (userRole === 'driver') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Assigned Shipments</h1>
          
          {/* New Refresh Button for Driver View */}
          <button
            onClick={fetchDriverShipments}
            disabled={isRefreshing}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            title="Refresh shipments"
          >
            <FaSync className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{error}</p>
          </div>
        )}
        
        {actionSuccess && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
            <p>{actionSuccess}</p>
          </div>
        )}
        
        {isLoading ? (
          <div className="p-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Loading shipments...</p>
          </div>
        ) : assignedShipments.length === 0 ? (
          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <FaBox className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500">No shipments assigned to you at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Shipments List */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="px-4 py-5 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Assigned Shipments</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tracking
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Destination
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {assignedShipments.map(shipment => (
                      <tr 
                        key={shipment._id} 
                        onClick={() => setSelectedShipment(shipment)}
                        className={`cursor-pointer hover:bg-gray-50 ${selectedShipment?._id === shipment._id ? 'bg-blue-50' : ''}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                          {shipment.trackingNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <StatusBadge status={shipment.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {shipment.destination}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(shipment.updatedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Shipment Details and Actions */}
            {selectedShipment ? (
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="px-4 py-5 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">Shipment Details</h2>
                  <StatusBadge status={selectedShipment.status} />
                </div>
                
                <div className="p-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Tracking Number</dt>
                      <dd className="mt-1 text-sm text-gray-900">{selectedShipment.trackingNumber}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Created</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formatDate(selectedShipment.createdAt)}</dd>
                    </div>
                    
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Sender</dt>
                      <dd className="mt-1 text-sm text-gray-900">{selectedShipment.senderName}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Recipient</dt>
                      <dd className="mt-1 text-sm text-gray-900">{selectedShipment.recipientName}</dd>
                    </div>
                    
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Pickup Address</dt>
                      <dd className="mt-1 text-sm text-gray-900">{selectedShipment.recipientAddress}</dd>
                    </div>
                    
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Contact Number</dt>
                      <dd className="mt-1 text-sm text-gray-900">{selectedShipment.recipientPhone}</dd>
                    </div>
                    
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Destination Branch</dt>
                      <dd className="mt-1 text-sm text-gray-900">{selectedShipment.destination}</dd>
                    </div>
                    
                    {selectedShipment.itemTypes && selectedShipment.itemTypes.length > 0 && (
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">Item Types</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          <div className="flex flex-wrap gap-2">
                            {selectedShipment.itemTypes.map((type, idx) => (
                              <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {type}
                              </span>
                            ))}
                          </div>
                        </dd>
                      </div>
                    )}
                  </dl>
                  
                  {/* Driver Actions */}
                  <div className="mt-8 border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
                    
                    {/* Workflow visualization */}
                    <div className="flex items-center justify-between mb-6">
                      <div className={`flex flex-col items-center ${selectedShipment.status === 'In Transit' ? 'text-blue-600' : selectedShipment.status === 'Picked Up' ? 'text-gray-400' : 'text-blue-600'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedShipment.status === 'In Transit' ? 'bg-blue-100 border-2 border-blue-500' : selectedShipment.status === 'Picked Up' ? 'bg-gray-100' : 'bg-blue-100 border-2 border-blue-500'}`}>
                          <FaTruck className="h-5 w-5" />
                        </div>
                        <span className="mt-2 text-sm font-medium">Assigned</span>
                      </div>
                      
                      <div className="flex-1 h-0.5 mx-2 bg-gray-200"></div>
                      
                      <div className={`flex flex-col items-center ${selectedShipment.status === 'Picked Up' ? 'text-purple-600' : 'text-gray-400'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedShipment.status === 'Picked Up' ? 'bg-purple-100 border-2 border-purple-500' : 'bg-gray-100'}`}>
                          <FaClipboardCheck className="h-5 w-5" />
                        </div>
                        <span className="mt-2 text-sm font-medium">Picked Up</span>
                      </div>
                      
                      <div className="flex-1 h-0.5 mx-2 bg-gray-200"></div>
                      
                      <div className={`flex flex-col items-center text-gray-400`}>
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <FaArrowRight className="h-5 w-5" />
                        </div>
                        <span className="mt-2 text-sm font-medium">Handed Over</span>
                      </div>
                    </div>
                    
                    {/* Action buttons based on current status */}
                    {selectedShipment.status === 'In Transit' && (
                      <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                          <h4 className="text-sm font-medium text-blue-800 mb-2">Mark as Picked Up</h4>
                          <p className="text-xs text-blue-600 mb-3">
                            Use this action when you have collected the package from the sender.
                          </p>
                          <div className="space-y-3">
                            <textarea
                              value={pickupNote}
                              onChange={(e) => setPickupNote(e.target.value)}
                              placeholder="Add notes about the pickup (optional)"
                              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              rows={2}
                            />
                            <button
                              onClick={() => handlePickup(selectedShipment._id)}
                              disabled={processingAction}
                              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              {processingAction ? (
                                <FaSpinner className="animate-spin mr-2" />
                              ) : (
                                <FaClipboardCheck className="mr-2" />
                              )}
                              Confirm Pickup
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {selectedShipment.status === 'Picked Up' && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Request Handover to Branch</h4>
                        <div className="space-y-3">
                          <textarea
                            value={handoverNote}
                            onChange={(e) => setHandoverNote(e.target.value)}
                            placeholder="Add notes about this handover (optional)"
                            rows={2}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                          <button
                            onClick={() => handleHandover(selectedShipment._id)}
                            disabled={processingAction}
                            className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                          >
                            {processingAction ? (
                              <FaSpinner className="animate-spin mr-2" />
                            ) : (
                              <FaExchangeAlt className="mr-2" />
                            )}
                            Request Handover to Branch
                          </button>
                        </div>
                      </div>
                    )}

                    {selectedShipment.status === 'Handover Requested' && (
                      <div className="mt-4 bg-yellow-50 p-4 rounded-md border border-yellow-100">
                        <h4 className="text-sm font-medium text-yellow-800 mb-2">Handover Confirmation Pending</h4>
                        <p className="text-xs text-yellow-600 mb-3">
                          Waiting for admin to confirm your handover request.
                        </p>
                        <div className="flex items-center justify-center">
                          <FaSpinner className="animate-spin text-yellow-500 mr-2" />
                          <span className="text-sm text-yellow-700">Awaiting confirmation...</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Tracking History */}
                  <div className="mt-8 border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Tracking History</h3>
                    <div className="flow-root">
                      <ul className="-mb-8">
                        {selectedShipment.trackingHistory.map((event, idx) => (
                          <li key={idx}>
                            <div className="relative pb-8">
                              {idx !== selectedShipment.trackingHistory.length - 1 ? (
                                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                              ) : null}
                              <div className="relative flex space-x-3">
                                <div>
                                  <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                                    <FaTruck className="h-4 w-4 text-white" />
                                  </span>
                                </div>
                                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                  <div>
                                    <p className="text-sm text-gray-900">{event.status} <span className="text-gray-500">at {event.location}</span></p>
                                  </div>
                                  <div className="text-right text-sm whitespace-nowrap text-gray-500">
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
                </div>
              </div>
            ) : (
              <div className="bg-white shadow-md rounded-lg p-8 text-center">
                <FaBox className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a shipment</h3>
                <p className="text-gray-500">
                  Click on a shipment from the list to view details and perform actions.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  } else {
    // Admin view - list of drivers
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Drivers Management</h1>
          
          {/* New Refresh Button for Admin View */}
          <button
            onClick={fetchDrivers}
            disabled={isRefreshing}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            title="Refresh driver list"
          >
            <FaSync className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{error}</p>
          </div>
        )}
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {isLoading || isRefreshing ? (
            <div className="p-6 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-600">{isRefreshing ? 'Refreshing drivers...' : 'Loading drivers...'}</p>
            </div>
          ) : drivers.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No drivers found
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {drivers.map((driver) => (
                  <tr key={driver._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{driver.userID}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{driver.firstName} {driver.lastName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{driver.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{driver.company || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(driver.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }
};

export default Drivers;