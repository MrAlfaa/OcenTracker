import { useState, useEffect, useRef } from 'react';
import { 
  FaUsers, FaBoxes, FaShippingFast, FaCheckCircle, FaSpinner, 
  FaExclamationTriangle, FaCog, FaSearch, FaClock, FaCalendarAlt,
  FaTruck, FaTachometerAlt, FaChartLine, FaMapMarkerAlt, FaUserTie,
  FaBullhorn, FaSyncAlt
} from 'react-icons/fa';
import axios from 'axios';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

// API URL from environment
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Types for our statistics
interface DashboardStats {
  userStats: {
    total: number;
    active: number;
    inactive: number;
    admins: number;
    drivers: number;
    regular: number;
  };
  shipmentStats: {
    total: number;
    pending: number;
    inTransit: number;
    delivered: number;
    delayed: number;
    cancelled: number;
    activeShipments: number;
    completedShipments: number;
  };
  recentShipments: Array<{
    _id: string;
    trackingNumber: string;
    status: string;
    origin: string;
    destination: string;
    senderName?: string;
    recipientName?: string;
    createdAt: string;
  }>;
  recentUsers: Array<{
    _id: string;
    userID: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    createdAt: string;
  }>;
  monthlyShipments: Array<{
    month: string;
    count: number;
  }>;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const shipmentChartRef = useRef<HTMLCanvasElement>(null);
  const userRoleChartRef = useRef<HTMLCanvasElement>(null);
  const shipmentTrendChartRef = useRef<HTMLCanvasElement>(null);
  
  const shipmentChartInstance = useRef<Chart | null>(null);
  const userRoleChartInstance = useRef<Chart | null>(null);
  const shipmentTrendChartInstance = useRef<Chart | null>(null);

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/admin/dashboard-stats`, {
        headers: {
          'x-auth-token': token
        }
      });
      
      setStats(response.data);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('Error fetching dashboard stats:', err);
      setError(err.response?.data?.message || 'Failed to fetch dashboard statistics');
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize charts when data is available
  useEffect(() => {
    if (!stats) return;
    
    // Shipment Status Chart
    if (shipmentChartRef.current) {
      const ctx = shipmentChartRef.current.getContext('2d');
      
      if (ctx) {
        // Destroy existing chart if it exists
        if (shipmentChartInstance.current) {
          shipmentChartInstance.current.destroy();
        }
        
        shipmentChartInstance.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Pending', 'In Transit', 'Delivered', 'Delayed', 'Cancelled'],
            datasets: [{
              data: [
                stats.shipmentStats.pending,
                stats.shipmentStats.inTransit,
                stats.shipmentStats.delivered,
                stats.shipmentStats.delayed,
                stats.shipmentStats.cancelled
              ],
              backgroundColor: [
                '#FBBF24', // Amber for pending
                '#3B82F6', // Blue for in transit
                '#10B981', // Green for delivered
                '#F59E0B', // Orange for delayed
                '#EF4444'  // Red for cancelled
              ],
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'right',
                labels: {
                  boxWidth: 12,
                  font: {
                    size: 11
                  }
                }
              },
              title: {
                display: true,
                text: 'Shipment Status Distribution',
                font: {
                  size: 14
                }
              }
            },
            cutout: '70%'
          }
        });
      }
    }
    
    // User Roles Chart
    if (userRoleChartRef.current) {
      const ctx = userRoleChartRef.current.getContext('2d');
      
      if (ctx) {
        // Destroy existing chart if it exists
        if (userRoleChartInstance.current) {
          userRoleChartInstance.current.destroy();
        }
        
        userRoleChartInstance.current = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: ['Regular Users', 'Admins', 'Drivers'],
            datasets: [{
              data: [
                stats.userStats.regular,
                stats.userStats.admins,
                stats.userStats.drivers
              ],
              backgroundColor: [
                '#3B82F6', // Blue for regular users
                '#8B5CF6', // Purple for admins
                '#10B981'  // Green for drivers
              ],
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'right',
                labels: {
                  boxWidth: 12,
                  font: {
                    size: 11
                  }
                }
              },
              title: {
                display: true,
                text: 'User Role Distribution',
                font: {
                  size: 14
                }
              }
            }
          }
        });
      }
    }
    
    // Monthly Shipments Trend Chart
    if (shipmentTrendChartRef.current) {
      const ctx = shipmentTrendChartRef.current.getContext('2d');
      
      if (ctx) {
        // Destroy existing chart if it exists
        if (shipmentTrendChartInstance.current) {
          shipmentTrendChartInstance.current.destroy();
        }
        
        shipmentTrendChartInstance.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: stats.monthlyShipments.map(item => item.month),
            datasets: [{
              label: 'Shipments',
              data: stats.monthlyShipments.map(item => item.count),
              borderColor: '#3B82F6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              fill: true,
              tension: 0.2
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                display: false
              },
              title: {
                display: true,
                text: 'Monthly Shipment Trend',
                font: {
                  size: 14
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  precision: 0
                }
              }
            }
          }
        });
      }
    }
    
  }, [stats]);

  // Fetch data on initial load
  useEffect(() => {
    fetchDashboardStats();
    
    // Set up a polling interval to refresh data every 5 minutes
    const intervalId = setInterval(() => {
      fetchDashboardStats();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };
  
  // Function to format large numbers
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };
  
  // Function to get status badge color
  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'in transit':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
      case 'delivery completed':
        return 'bg-green-100 text-green-800';
      case 'delayed':
        return 'bg-orange-100 text-orange-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'delivered to recipient':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get role badge color
  const getRoleBadgeClass = (role: string) => {
    switch (role.toLowerCase()) {
      case 'superadmin':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'driver':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="pb-5 border-b border-gray-200 mb-5 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-500">Overview of your system's performance and statistics</p>
        </div>
        {lastUpdated && (
          <div className="mt-4 md:mt-0 text-sm text-gray-500 flex items-center">
            <FaClock className="mr-1" /> Last updated: {lastUpdated.toLocaleTimeString()}
            <button 
              onClick={fetchDashboardStats} 
              className="ml-3 inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              {isLoading ? <FaSpinner className="animate-spin mr-1" /> : <FaSyncAlt className="mr-1" />}
              Refresh
            </button>
          </div>
        )}
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaExclamationTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={fetchDashboardStats}
                className="mt-2 text-sm font-medium text-red-700 hover:text-red-600 focus:outline-none"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
      
      {isLoading && !stats ? (
        <div className="flex items-center justify-center h-64">
          <FaSpinner className="animate-spin h-8 w-8 text-blue-500 mr-3" />
          <span className="text-lg font-medium text-gray-600">Loading dashboard data...</span>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Users Card */}
            <div className="bg-white overflow-hidden shadow-sm rounded-lg hover:shadow-md transition-shadow">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <FaUsers className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Users
                      </dt>
                      <dd>
                        {isLoading ? (
                          <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
                        ) : (
                          <div className="text-lg font-semibold text-gray-900">
                            {formatNumber(stats?.userStats.total || 0)}
                          </div>
                        )}
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-center text-sm">
                  <div className="text-green-600 flex items-center">
                    <span className="font-medium">{stats?.userStats.active || 0} Active</span>
                  </div>
                  <a 
                    href="/users" 
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    View all
                  </a>
                </div>
              </div>
            </div>
            
            {/* Total Shipments Card */}
            <div className="bg-white overflow-hidden shadow-sm rounded-lg hover:shadow-md transition-shadow">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                    <FaBoxes className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Shipments
                      </dt>
                      <dd>
                        {isLoading ? (
                          <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
                        ) : (
                          <div className="text-lg font-semibold text-gray-900">
                            {formatNumber(stats?.shipmentStats.total || 0)}
                          </div>
                        )}
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-center text-sm">
                  <div className="text-amber-600 flex items-center">
                    <span className="font-medium">{stats?.shipmentStats.pending || 0} Pending</span>
                  </div>
                  <a 
                    href="/shipments" 
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    View all
                  </a>
                </div>
              </div>
            </div>
            
            {/* Active Shipments Card */}
            <div className="bg-white overflow-hidden shadow-sm rounded-lg hover:shadow-md transition-shadow">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <FaShippingFast className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Active Shipments
                      </dt>
                      <dd>
                        {isLoading ? (
                          <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
                        ) : (
                          <div className="text-lg font-semibold text-gray-900">
                            {formatNumber(stats?.shipmentStats.activeShipments || 0)}
                          </div>
                        )}
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-center text-sm">
                  <div className="text-blue-600 flex items-center">
                    <span className="font-medium">{stats?.shipmentStats.inTransit || 0} In Transit</span>
                  </div>
                  <a 
                    href="/shipments?status=active" 
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    View active
                  </a>
                </div>
              </div>
            </div>
            
            {/* Completed Shipments Card */}
            <div className="bg-white overflow-hidden shadow-sm rounded-lg hover:shadow-md transition-shadow">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                    <FaCheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Completed Shipments
                      </dt>
                      <dd>
                        {isLoading ? (
                          <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
                        ) : (
                          <div className="text-lg font-semibold text-gray-900">
                            {formatNumber(stats?.shipmentStats.completedShipments || 0)}
                          </div>
                        )}
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-center text-sm">
                  <div className="text-green-600 flex items-center">
                    <span className="font-medium">
                      {formatNumber(stats?.shipmentStats.completedShipments || 0)} Delivered
                    </span>
                  </div>
                  <a 
                    href="/shipments?status=completed" 
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    View completed
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          {/* Additional Cards Row */}
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Drivers Card */}
            <div className="bg-white overflow-hidden shadow-sm rounded-lg hover:shadow-md transition-shadow">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <FaTruck className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Active Drivers
                      </dt>
                      <dd>
                        {isLoading ? (
                          <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                        ) : (
                          <div className="text-lg font-semibold text-gray-900">
                            {stats?.userStats.drivers || 0}
                          </div>
                        )}
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4">
                  <a 
                    href="/drivers" 
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    Manage drivers →
                  </a>
                </div>
              </div>
            </div>
            
            {/* Admins Card */}
            <div className="bg-white overflow-hidden shadow-sm rounded-lg hover:shadow-md transition-shadow">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <FaUserTie className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        System Administrators
                      </dt>
                      <dd>
                        {isLoading ? (
                          <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                        ) : (
                          <div className="text-lg font-semibold text-gray-900">
                            {stats?.userStats.admins || 0}
                          </div>
                        )}
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4">
                  <a 
                    href="/role-creation" 
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    Manage administrators →
                  </a>
                </div>
              </div>
            </div>
            
            {/* System Status Card */}
            <div className="bg-white overflow-hidden shadow-sm rounded-lg hover:shadow-md transition-shadow">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-teal-500 rounded-md p-3">
                    <FaTachometerAlt className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        System Status
                      </dt>
                      <dd>
                        <div className="text-lg font-semibold text-green-600">
                          Operational
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="bg-green-50 rounded px-3 py-1 text-xs text-green-800 flex items-center justify-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                    API: Online
                  </div>
                  <div className="bg-green-50 rounded px-3 py-1 text-xs text-green-800 flex items-center justify-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                    DB: Connected
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Chart and Recent Activity Section */}
          <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Charts Section */}
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <FaChartLine className="mr-2 text-blue-500" />
                Analytics Overview
              </h2>
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Shipment Status Chart */}
                <div className="bg-gray-50 rounded-lg p-4 h-64 flex flex-col">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Shipment Status</h3>
                  {isLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                      <FaSpinner className="animate-spin h-8 w-8 text-blue-500" />
                    </div>
                  ) : (
                    <div className="flex-1 relative">
                      <canvas ref={shipmentChartRef}></canvas>
                    </div>
                  )}
                </div>
                
                {/* User Role Chart */}
                <div className="bg-gray-50 rounded-lg p-4 h-64 flex flex-col">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">User Distribution</h3>
                  {isLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                      <FaSpinner className="animate-spin h-8 w-8 text-blue-500" />
                    </div>
                  ) : (
                    <div className="flex-1 relative">
                      <canvas ref={userRoleChartRef}></canvas>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Shipment Trend Chart */}
              <div className="mt-6 bg-gray-50 rounded-lg p-4 h-64 flex flex-col">
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <FaCalendarAlt className="mr-2 text-blue-500" />
                  Monthly Shipment Trend
                </h3>
                {isLoading ? (
                  <div className="flex-1 flex items-center justify-center">
                    <FaSpinner className="animate-spin h-8 w-8 text-blue-500" />
                  </div>
                ) : (
                  <div className="flex-1 relative">
                    <canvas ref={shipmentTrendChartRef}></canvas>
                  </div>
                )}
              </div>
            </div>
            
            {/* Recent Activity Section */}
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <FaBullhorn className="mr-2 text-blue-500" />
                  Recent Activity
                </h2>
              </div>
              
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 sm:px-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Recent Updates</span>
                  <div className="flex space-x-2">
                    <button
                      className="px-3 py-1 text-xs font-medium rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100"
                      aria-current="page"
                    >
                      Shipments
                    </button>
                    <button
                      className="px-3 py-1 text-xs font-medium rounded-md text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                    >
                      Users
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Recent Shipment Activity */}
              <div className="divide-y divide-gray-200 overflow-hidden overflow-y-auto" style={{ maxHeight: '400px' }}>
                {isLoading ? (
                  <div className="p-8 text-center">
                    <FaSpinner className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-500">Loading recent activity...</p>
                  </div>
                ) : stats?.recentShipments && stats.recentShipments.length > 0 ? (
                  stats.recentShipments.map((shipment) => (
                    <div key={shipment._id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 pt-1">
                          <div className="h-8 w-8 rounded-md bg-blue-100 flex items-center justify-center">
                            <FaShippingFast className="h-4 w-4 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium text-blue-600">
                              {shipment.trackingNumber}
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(shipment.status)}`}>
                              {shipment.status}
                            </span>
                          </div>
                          <div className="mt-1 text-sm text-gray-600">
                            <div className="flex items-center text-xs text-gray-500">
                              <FaMapMarkerAlt className="mr-1 text-gray-400" />
                              <span>From: {shipment.origin}</span>
                              <span className="mx-2">→</span>
                              <span>To: {shipment.destination}</span>
                            </div>
                          </div>
                          <div className="mt-1 flex justify-between items-center">
                            <div className="text-xs text-gray-500">
                              {shipment.senderName && <span>Sender: {shipment.senderName}</span>}
                              {shipment.recipientName && (
                                <span className="ml-2">
                                  Recipient: {shipment.recipientName}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-400">
                              {new Date(shipment.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-gray-500">No recent shipments found</p>
                  </div>
                )}
              </div>
              
              {/* "View All" Link */}
              <div className="bg-gray-50 px-4 py-3 sm:px-6">
                <div className="text-sm">
                  <a
                    href="/shipments"
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    View all shipments <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Access Section */}
          <div className="mt-6 bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Access</h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <a
                href="/shipments/create"
                className="bg-blue-50 hover:bg-blue-100 rounded-lg p-4 flex flex-col items-center justify-center transition-all"
              >
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                  <FaBoxes className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Create Shipment</span>
              </a>
              
              <a
                href="/users"
                className="bg-purple-50 hover:bg-purple-100 rounded-lg p-4 flex flex-col items-center justify-center transition-all"
              >
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                  <FaUsers className="h-5 w-5 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Manage Users</span>
              </a>
              
              <a
                href="/drivers"
                className="bg-green-50 hover:bg-green-100 rounded-lg p-4 flex flex-col items-center justify-center transition-all"
              >
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mb-2">
                  <FaTruck className="h-5 w-5 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Drivers</span>
              </a>
              
              <a
                href="/search"
                className="bg-amber-50 hover:bg-amber-100 rounded-lg p-4 flex flex-col items-center justify-center transition-all"
              >
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center mb-2">
                  <FaSearch className="h-5 w-5 text-amber-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Search</span>
              </a>
              
              <a
                href="/reports"
                className="bg-red-50 hover:bg-red-100 rounded-lg p-4 flex flex-col items-center justify-center transition-all"
              >
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mb-2">
                  <FaChartLine className="h-5 w-5 text-red-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Reports</span>
              </a>
              
              <a
                href="/settings"
                className="bg-gray-50 hover:bg-gray-100 rounded-lg p-4 flex flex-col items-center justify-center transition-all"
              >
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                  <FaCog className="h-5 w-5 text-gray-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Settings</span>
              </a>
            </div>
          </div>
          
          {/* System Notices */}
          <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-100">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaBullhorn className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">System Notification</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Welcome to the Ocean Tracker Administration Dashboard. This interface provides real-time statistics and management tools for your shipping operations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
