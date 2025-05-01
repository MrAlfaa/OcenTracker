import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch,FaExchangeAlt,FaBox, FaTruck, FaSpinner, FaCheckCircle, FaSync, FaExclamationTriangle, FaUser } from 'react-icons/fa';

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
  driverId?: string;
  driverName?: string;
  itemTypes?: string[];
  branch?: string;
  notes?: string;
  trackingHistory: TrackingEvent[];
  createdAt: string;
  updatedAt: string;
  // Add these properties for handover functionality
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


// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  let bgColor = 'bg-gray-100 text-gray-800';
  let icon = <FaSync className="mr-1" />;

  switch (status.toLowerCase()) {
    case 'pending':
      bgColor = 'bg-yellow-100 text-yellow-800';
      icon = <FaExclamationTriangle className="mr-1" />;
      break;
    case 'pickup requested':
      bgColor = 'bg-yellow-100 text-yellow-800';
      icon = <FaTruck className="mr-1" />;
      break;
    case 'handover requested':
      bgColor = 'bg-yellow-100 text-yellow-800';
      icon = <FaExchangeAlt className="mr-1" />;
      break;
    case 'in transit':
      bgColor = 'bg-blue-100 text-blue-800';
      icon = <FaTruck className="mr-1" />;
      break;
    case 'picked up':
      bgColor = 'bg-purple-100 text-purple-800';
      icon = <FaBox className="mr-1" />;
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
      icon = <FaExclamationTriangle className="mr-1" />;
      break;
    case 'delivered to recipient':
      bgColor = 'bg-purple-100 text-purple-800';
      icon = <FaCheckCircle className="mr-1" />;
      break;
    case 'delivery completed':
      bgColor = 'bg-green-100 text-green-800';
      icon = <FaCheckCircle className="mr-1" />;
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor}`}>
      {icon}
      {status}
    </span>
  );
};


const Shipments = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<string>('');
  const [processingAction, setProcessingAction] = useState(false);
  const [adminHandoverNote, setAdminHandoverNote] = useState('');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  // Fetch shipments
  const fetchShipments = async () => {
    setLoading(true);
    try {
      let url = `${API_URL}/api/shipments/admin`;
      const params = new URLSearchParams();
      
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const token = localStorage.getItem('token');
      const response = await axios.get(url, {
        headers: { 'x-auth-token': token }
      });
      
      setShipments(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching shipments:', err);
      setError('Failed to fetch shipments. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch drivers (for assignment)
  const fetchDrivers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/users/drivers`, {
        headers: { 'x-auth-token': token }
      });
      
      setDrivers(response.data);
    } catch (err) {
      console.error('Error fetching drivers:', err);
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    fetchShipments();
    fetchDrivers();
  }, []);
  
  // Fetch with filters
  const handleSearch = () => {
    fetchShipments();
  };
  
  // Handle status update
  const updateShipmentStatus = async (shipmentId: string, newStatus: string) => {
    try {
      setProcessingAction(true);
      const token = localStorage.getItem('token');
      
      await axios.put(`${API_URL}/api/shipments/admin/${shipmentId}/status`, 
        { status: newStatus, location: 'Processing Center' },
        { headers: { 'x-auth-token': token } }
      );
      
      // Refresh shipments and selected shipment
      fetchShipments();
      
      if (selectedShipment && selectedShipment._id === shipmentId) {
        const updatedShipment = await axios.get(`${API_URL}/api/shipments/track/${selectedShipment.trackingNumber}`);
        setSelectedShipment(updatedShipment.data);
      }
      
      setProcessingAction(false);
    } catch (err) {
      console.error('Error updating shipment status:', err);
      setProcessingAction(false);
    }
  };
  
  // Handle driver assignment
  const assignDriver = async (shipmentId: string) => {
    if (!selectedDriver) {
      alert('Please select a driver');
      return;
    }
    
    try {
      setProcessingAction(true);
      const token = localStorage.getItem('token');
      
      // Find the selected driver's name
      const driver = drivers.find(d => d._id === selectedDriver);
      if (!driver) return;
      
      const driverName = `${driver.firstName} ${driver.lastName}`;
      
      await axios.put(`${API_URL}/api/shipments/admin/${shipmentId}/assign-driver`, 
        { driverId: selectedDriver, driverName },
        { headers: { 'x-auth-token': token } }
      );
      
      // Refresh data
      fetchShipments();
      
      if (selectedShipment && selectedShipment._id === shipmentId) {
        const updatedShipment = await axios.get(`${API_URL}/api/shipments/track/${selectedShipment.trackingNumber}`);
        setSelectedShipment(updatedShipment.data);
      }
      
      setSelectedDriver('');
      setProcessingAction(false);
      
    } catch (err) {
      console.error('Error assigning driver:', err);
      setProcessingAction(false);
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };
  
  // Handle handover confirmation
  const confirmHandover = async (shipmentId: string) => {
    try {
      setProcessingAction(true);
      const token = localStorage.getItem('token');
      
      await axios.put(`${API_URL}/api/shipments/admin/${shipmentId}/confirm-handover`, 
        { adminNote: adminHandoverNote },
        { headers: { 'x-auth-token': token } }
      );
      
      // Refresh shipments and selected shipment
      fetchShipments();
      
      if (selectedShipment && selectedShipment._id === shipmentId) {
        const updatedShipment = await axios.get(`${API_URL}/api/shipments/track/${selectedShipment.trackingNumber}`);
        setSelectedShipment(updatedShipment.data);
      }
      
      setAdminHandoverNote('');
      setProcessingAction(false);
    } catch (err) {
      console.error('Error confirming handover:', err);
      setProcessingAction(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Shipments Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Process shipment requests and track their status
        </p>
      </div>
      
      {/* Search and filter */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by tracking number or name"
                className="pl-10 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          <div className="w-full md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              aria-label="Filter shipments by status"
              title="Filter shipments by status"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Transit">In Transit</option>
              <option value="Delivered">Delivered</option>
              <option value="Delayed">Delayed</option>
              <option value="Cancelled">Cancelled</option>
            </select>          </div>
          
          <div>
            <button
              onClick={handleSearch}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Search
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6">
        {/* Shipments List */}
        <div className="lg:w-1/2">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                All Shipments
              </h3>
            </div>
            
            {loading ? (
              <div className="p-8 text-center">
                <FaSpinner className="animate-spin text-blue-500 mx-auto h-8 w-8 mb-4" />
                <p className="text-gray-500">Loading shipments...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="text-red-500">{error}</p>
                <button
                  onClick={fetchShipments}
                  className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                >
                  Retry
                </button>
              </div>
            ) : shipments.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No shipments found.
              </div>
            ) : (
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
                    {shipments.map(shipment => (
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
                          {new Date(shipment.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        
        {/* Shipment Details */}
        <div className="lg:w-1/2">
          {selectedShipment ? (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Shipment Details
                </h3>
                <StatusBadge status={selectedShipment.status} />
              </div>
              
              <div className="px-4 py-5 sm:p-6">
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
                    <dt className="text-sm font-medium text-gray-500">Origin</dt>
                    <dd className="mt-1 text-sm text-gray-900">{selectedShipment.origin}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Destination</dt>
                    <dd className="mt-1 text-sm text-gray-900">{selectedShipment.destination}</dd>
                  </div>
                  
                  {selectedShipment.senderName && (
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Sender</dt>
                      <dd className="mt-1 text-sm text-gray-900">{selectedShipment.senderName}</dd>
                    </div>
                  )}
                  
                  {selectedShipment.recipientName && (
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Recipient</dt>
                      <dd className="mt-1 text-sm text-gray-900">{selectedShipment.recipientName}</dd>
                    </div>
                  )}
                  
                  {selectedShipment.driverName && (
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Assigned Driver</dt>
                      <dd className="mt-1 text-sm text-gray-900 flex items-center">
                        <FaUser className="text-blue-500 mr-1" />
                        {selectedShipment.driverName}
                      </dd>
                    </div>
                  )}
                  
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
                  
                  {selectedShipment.recipientAddress && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Delivery Address</dt>
                      <dd className="mt-1 text-sm text-gray-900">{selectedShipment.recipientAddress}</dd>
                    </div>
                  )}
                  
                  {selectedShipment.recipientPhone && (
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Contact Number</dt>
                      <dd className="mt-1 text-sm text-gray-900">{selectedShipment.recipientPhone}</dd>
                    </div>
                  )}
                  
                  {selectedShipment.notes && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Notes</dt>
                      <dd className="mt-1 text-sm text-gray-900 italic">{selectedShipment.notes}</dd>
                    </div>
                  )}
                </dl>
                
                {/* Process Shipment Actions - Enhanced UI */}
                <div className="mt-8 border-t border-gray-200 pt-6">
  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-4 mb-6">
    <h4 className="text-md font-semibold text-blue-800 mb-1 flex items-center">
      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
      </svg>
      Shipment Workflow Management
    </h4>
    <p className="text-sm text-blue-600">
      Current Status: <span className="font-medium">{selectedShipment.status}</span>
    </p>
  </div>
                  
                  {/* Status transition flowchart */}
                  <div className="mb-6 overflow-x-auto">
    <div className="flex space-x-2 items-center min-w-max pb-3">
      <div className={`px-3 py-1 rounded-full text-xs font-medium ${selectedShipment.status === 'Pending' ? 'bg-yellow-200 text-yellow-800 ring-2 ring-yellow-300' : 'bg-gray-100 text-gray-800'}`}>
        Pending
      </div>
      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
      </svg>
      <div className={`px-3 py-1 rounded-full text-xs font-medium ${selectedShipment.driverId ? 'bg-purple-200 text-purple-800 ring-2 ring-purple-300' : 'bg-gray-100 text-gray-800'}`}>
        Driver Assigned
      </div>
      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
      </svg>
      <div className={`px-3 py-1 rounded-full text-xs font-medium ${selectedShipment.status === 'In Transit' ? 'bg-blue-200 text-blue-800 ring-2 ring-blue-300' : 'bg-gray-100 text-gray-800'}`}>
        In Transit
      </div>
      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
      </svg>
      <div className={`px-3 py-1 rounded-full text-xs font-medium ${selectedShipment.status === 'Delivered' ? 'bg-green-200 text-green-800 ring-2 ring-green-300' : 'bg-gray-100 text-gray-800'}`}>
        Delivered
      </div>
    </div>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Status Update Actions */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
      <h5 className="font-medium text-gray-700 mb-3 flex items-center">
        <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
        </svg>
        Update Status
      </h5>

      <div className="space-y-3">
        {selectedShipment.status === 'Pending' && (
          <button
            onClick={() => updateShipmentStatus(selectedShipment._id, 'In Transit')}
            disabled={processingAction}
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 transition-colors"
            title="Mark this shipment as in transit"
          >
            {processingAction ? <FaSpinner className="animate-spin mr-2" /> : <FaTruck className="mr-2" />}
            Mark In Transit
          </button>
        )}
        
        {selectedShipment.status === 'In Transit' && (
          <button
            onClick={() => updateShipmentStatus(selectedShipment._id, 'Delivered')}
            disabled={processingAction}
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300 transition-colors"
            title="Mark this shipment as delivered"
          >
            {processingAction ? <FaSpinner className="animate-spin mr-2" /> : <FaCheckCircle className="mr-2" />}
            Mark Delivered
          </button>
        )}
        
        {['In Transit', 'Pending'].includes(selectedShipment.status) && (
          <button
            onClick={() => updateShipmentStatus(selectedShipment._id, 'Delayed')}
            disabled={processingAction}
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:bg-yellow-300 transition-colors"
            title="Mark this shipment as delayed"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Mark Delayed
          </button>
        )}
        
        {selectedShipment.status === 'Pending' && (
          <button
            onClick={() => updateShipmentStatus(selectedShipment._id, 'Cancelled')}
            disabled={processingAction}
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300 transition-colors"
            title="Cancel this shipment"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            Cancel Shipment
          </button>
        )}
      </div>
    </div>


                    {/* Driver Assignment Section */}
                    {['Pending', 'In Transit'].includes(selectedShipment.status) && (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <h5 className="font-medium text-gray-700 mb-3 flex items-center">
          <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
          {selectedShipment.driverId ? 'Change Driver' : 'Assign Driver'}
        </h5>

        {selectedShipment.driverId ? (
          <div className="mb-3 p-3 bg-blue-50 rounded-md border border-blue-100">
            <p className="text-sm text-blue-800 font-medium flex items-center">
              <FaUser className="text-blue-500 mr-2" />
              Currently Assigned: {selectedShipment.driverName}
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-500 mb-3">
            Assign a driver to handle this shipment
          </p>
        )}

        <div className="space-y-3">
          <select
            value={selectedDriver}
            onChange={(e) => setSelectedDriver(e.target.value)}
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            aria-label="Select a driver to assign"
            title="Select a driver to assign"
          >
            <option value="">Select a driver</option>
            {drivers.map(driver => (
              <option key={driver._id} value={driver._id}>
                {driver.firstName} {driver.lastName}
              </option>
            ))}
          </select>
          
          <button
            onClick={() => assignDriver(selectedShipment._id)}
            disabled={processingAction || !selectedDriver}
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 transition-colors"
          >
            {processingAction ? (
              <FaSpinner className="animate-spin mr-2" />
            ) : (
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
              </svg>
            )}
            {selectedShipment.driverId ? 'Change Driver' : 'Assign Driver'}
          </button>
        </div>
      </div>
    )}
  </div>
  {/* Handover Confirmation UI */}
  {selectedShipment.status === 'Handover Requested' && selectedShipment.handoverRequested && !selectedShipment.handoverConfirmed && (
    <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <h4 className="text-md font-semibold text-yellow-800 mb-2 flex items-center">
        <FaExchangeAlt className="mr-2" />
        Handover Confirmation Required
      </h4>
      <p className="text-sm text-yellow-700 mb-3">
        Driver {selectedShipment.driverName} has requested to hand over this shipment to the branch.
        {selectedShipment.handoverRequestedAt && (
          <span className="block mt-1 text-xs">
            Requested at: {formatDate(selectedShipment.handoverRequestedAt)}
          </span>
        )}
      </p>
      
      {selectedShipment.handoverNote && (
        <div className="mb-4 p-3 bg-white rounded-md border border-yellow-100">
          <p className="text-xs font-medium text-gray-500 mb-1">Driver's Note:</p>
          <p className="text-sm text-gray-700">{selectedShipment.handoverNote}</p>
        </div>
      )}
      
      <div className="mb-4">
        <label htmlFor="adminHandoverNote" className="block text-sm font-medium text-gray-700 mb-1">
          Admin Review Note (optional)
        </label>
        <textarea
          id="adminHandoverNote"
          value={adminHandoverNote}
          onChange={(e) => setAdminHandoverNote(e.target.value)}
          rows={2}
          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
          placeholder="Add any notes about this handover"
        />
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={() => confirmHandover(selectedShipment._id)}
          disabled={processingAction}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300"
        >
          {processingAction ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              Processing...
            </>
          ) : (
            <>
              <FaCheckCircle className="mr-2" />
              Confirm Handover
            </>
          )}
        </button>
      </div>
    </div>
  )}
</div>                        
                {/* Tracking History */}
                <div className="mt-8 border-t border-gray-200 pt-6">
  <h4 className="text-sm font-medium text-gray-700 mb-4">Tracking History</h4>
  
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
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <FaBox className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500">Select a shipment to view details</h3>
              <p className="mt-2 text-sm text-gray-400">
                You can update the status, assign drivers, and manage the shipment process from here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shipments;
