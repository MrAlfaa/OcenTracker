import { useState, useEffect, useRef } from 'react';
import { 
  FaFileDownload, FaCalendarAlt, FaFilter, FaChartBar, FaChartLine, 
  FaChartPie, FaChartArea, FaTable, FaSync, FaSearch, FaSpinner,
  FaTruck, FaUsers, FaBoxes, FaCheck, FaShippingFast, FaExclamationTriangle,
  FaFilePdf, FaFileExcel, FaFileCsv, FaPrint
} from 'react-icons/fa';
import axios from 'axios';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Report type definitions
type ReportType = 'shipments' | 'users' | 'drivers' | 'overview';
type TimeRange = 'today' | 'week' | 'month' | '3months' | '6months' | 'year' | 'custom';
type ViewFormat = 'chart' | 'table';
type ExportFormat = 'pdf' | 'excel' | 'csv';
type DateRange = { startDate: Date | null; endDate: Date | null };

// Report data interfaces
interface ShipmentReportData {
  byStatus: {
    status: string;
    count: number;
  }[];
  byDate: {
    date: string;
    count: number;
  }[];
  byOriginDestination: {
    name: string;
    count: number;
  }[];
  totalCount: number;
  avgDeliveryTime: number;
  detailedData: any[];
}

interface UserReportData {
  byRole: {
    role: string;
    count: number;
  }[];
  byStatus: {
    status: string;
    count: number;
  }[];
  byCreationDate: {
    date: string;
    count: number;
  }[];
  totalCount: number;
  detailedData: any[];
}

interface DriverReportData {
  byPerformance: {
    driverId: string;
    driverName: string;
    shipmentsDelivered: number;
    avgDeliveryTime: number;
  }[];
  totalDrivers: number;
  totalShipmentsDelivered: number;
  detailedData: any[];
}

interface OverviewReportData {
  systemStats: {
    totalUsers: number;
    totalShipments: number;
    activeShipments: number;
    deliveredShipments: number;
  };
  monthlyTrends: {
    month: string;
    shipments: number;
    users: number;
  }[];
}

type ReportData = ShipmentReportData | UserReportData | DriverReportData | OverviewReportData;

const Reports = () => {
  const [reportType, setReportType] = useState<ReportType>('overview');
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: null, endDate: null });
  const [viewFormat, setViewFormat] = useState<ViewFormat>('chart');
  const [filterOptions, setFilterOptions] = useState<Record<string, string>>({});
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  // Fetch report data based on selected parameters
  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Prepare dates for API call based on timeRange
      let startDate: Date | null = null;
      let endDate: Date | null = new Date();
      
      if (timeRange === 'custom' && dateRange.startDate && dateRange.endDate) {
        startDate = dateRange.startDate;
        endDate = dateRange.endDate;
      } else {
        const now = new Date();
        endDate = new Date(now);
        
        switch (timeRange) {
          case 'today':
            startDate = new Date(now);
            startDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate = new Date(now);
            startDate.setMonth(now.getMonth() - 1);
            break;
          case '3months':
            startDate = new Date(now);
            startDate.setMonth(now.getMonth() - 3);
            break;
          case '6months':
            startDate = new Date(now);
            startDate.setMonth(now.getMonth() - 6);
            break;
          case 'year':
            startDate = new Date(now);
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        }
      }
      
      // Prepare query parameters
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());
      
      // Add filter options to params
      Object.entries(filterOptions).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/reports/${reportType}?${params.toString()}`,
        {
          headers: {
            'x-auth-token': token
          }
        }
      );
      
      setReportData(response.data);
    } catch (err: any) {
      console.error('Error fetching report data:', err);
      setError(err.response?.data?.message || 'Failed to fetch report data');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  // Export report in selected format
  const exportReport = async (format: ExportFormat) => {
    try {
      setIsExporting(true);
      
      // Prepare dates for API call
      let startDate: Date | null = null;
      let endDate: Date | null = new Date();
      
      if (timeRange === 'custom' && dateRange.startDate && dateRange.endDate) {
        startDate = dateRange.startDate;
        endDate = dateRange.endDate;
      } else {
        const now = new Date();
        endDate = new Date(now);
        
        switch (timeRange) {
          case 'today':
            startDate = new Date(now);
            startDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate = new Date(now);
            startDate.setMonth(now.getMonth() - 1);
            break;
          case '3months':
            startDate = new Date(now);
            startDate.setMonth(now.getMonth() - 3);
            break;
          case '6months':
            startDate = new Date(now);
            startDate.setMonth(now.getMonth() - 6);
            break;
          case 'year':
            startDate = new Date(now);
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        }
      }
      
      // Prepare query parameters
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());
      params.append('format', format);
      
      // Add filter options to params
      Object.entries(filterOptions).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/reports/${reportType}/export?${params.toString()}`,
        {
          headers: {
            'x-auth-token': token
          },
          responseType: 'blob' // Important for handling file downloads
        }
      );
      
      // Create a download link and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename
      const date = new Date().toISOString().split('T')[0];
      const filename = `${reportType}_report_${date}.${format}`;
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccess(`Report exported successfully as ${format.toUpperCase()}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error exporting report:', err);
      setError(err.response?.data?.message || `Failed to export report as ${format.toUpperCase()}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Initialize or update chart when data or chart type changes
  useEffect(() => {
    if (!reportData || !chartRef.current || viewFormat !== 'chart') return;
    
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // Prepare chart data based on report type
    let chartData: any = {};
    let chartOptions: any = {};
    let chartType: any = 'bar';
    
    if (reportType === 'overview') {
      const typedData = reportData as OverviewReportData;
      const months = typedData.monthlyTrends.map(item => item.month);
      
      chartData = {
        labels: months,
        datasets: [
          {
            label: 'Shipments',
            data: typedData.monthlyTrends.map(item => item.shipments),
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
          },
          {
            label: 'Users',
            data: typedData.monthlyTrends.map(item => item.users),
            borderColor: '#8B5CF6',
            backgroundColor: 'rgba(139, 92, 246, 0.5)',
          }
        ]
      };
      
      chartType = 'line';
      chartOptions = {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Monthly Trends'
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
      };
    } else if (reportType === 'shipments') {
      const typedData = reportData as ShipmentReportData;
      
      chartData = {
        labels: typedData.byStatus.map(item => item.status),
        datasets: [
          {
            label: 'Shipments by Status',
            data: typedData.byStatus.map(item => item.count),
            backgroundColor: [
              'rgba(59, 130, 246, 0.7)',   // Blue
              'rgba(16, 185, 129, 0.7)',   // Green
              'rgba(245, 158, 11, 0.7)',   // Amber
              'rgba(239, 68, 68, 0.7)',    // Red
              'rgba(139, 92, 246, 0.7)',   // Purple
            ],
            borderWidth: 1
          }
        ]
      };
      
      chartType = 'pie';
      chartOptions = {
        responsive: true,
        plugins: {
          legend: {
            position: 'right',
          },
          title: {
            display: true,
            text: 'Shipments by Status'
          }
        }
      };
    } else if (reportType === 'users') {
      const typedData = reportData as UserReportData;
      
      chartData = {
        labels: typedData.byRole.map(item => item.role),
        datasets: [
          {
            label: 'Users by Role',
            data: typedData.byRole.map(item => item.count),
            backgroundColor: [
              'rgba(59, 130, 246, 0.7)',   // Blue
              'rgba(139, 92, 246, 0.7)',   // Purple
              'rgba(16, 185, 129, 0.7)',   // Green
              'rgba(245, 158, 11, 0.7)',   // Amber
            ],
            borderWidth: 1
          }
        ]
      };
      
      chartType = 'doughnut';
      chartOptions = {
        responsive: true,
        plugins: {
          legend: {
            position: 'right',
          },
          title: {
            display: true,
            text: 'Users by Role'
          }
        }
      };
    } else if (reportType === 'drivers') {
      const typedData = reportData as DriverReportData;
      
      chartData = {
        labels: typedData.byPerformance.map(item => item.driverName),
        datasets: [
          {
            label: 'Shipments Delivered',
            data: typedData.byPerformance.map(item => item.shipmentsDelivered),
            backgroundColor: 'rgba(59, 130, 246, 0.7)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1
          },
          {
            label: 'Avg. Delivery Time (hours)',
            data: typedData.byPerformance.map(item => item.avgDeliveryTime),
            backgroundColor: 'rgba(16, 185, 129, 0.7)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 1
          }
        ]
      };
      
      chartOptions = {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Driver Performance'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      };
    }
    
    // Create chart
    chartInstance.current = new Chart(ctx, {
      type: chartType,
      data: chartData,
      options: chartOptions
    });
    
  }, [reportData, reportType, viewFormat]);

  // Get filter fields based on report type
  const getFilterFields = () => {
    switch (reportType) {
      case 'shipments':
        return (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filterOptions.status || ''}
                onChange={(e) => setFilterOptions({ ...filterOptions, status: e.target.value })}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Transit">In Transit</option>
                <option value="Delivered">Delivered</option>
                <option value="Delayed">Delayed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Origin</label>
              <input
                type="text"
                value={filterOptions.origin || ''}
                onChange={(e) => setFilterOptions({ ...filterOptions, origin: e.target.value })}
                placeholder="Filter by origin"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
              <input
                type="text"
                value={filterOptions.destination || ''}
                onChange={(e) => setFilterOptions({ ...filterOptions, destination: e.target.value })}
                placeholder="Filter by destination"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
        );
      case 'users':
        return (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={filterOptions.role || ''}
                onChange={(e) => setFilterOptions({ ...filterOptions, role: e.target.value })}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              >
                <option value="">All Roles</option>
                <option value="user">Regular Users</option>
                <option value="admin">Admins</option>
                <option value="driver">Drivers</option>
                <option value="superAdmin">Super Admins</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filterOptions.active || ''}
                onChange={(e) => setFilterOptions({ ...filterOptions, active: e.target.value })}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              >
                <option value="">All Statuses</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                value={filterOptions.search || ''}
                onChange={(e) => setFilterOptions({ ...filterOptions, search: e.target.value })}
                placeholder="Search by name or email"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
        );
      case 'drivers':
        return (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={filterOptions.sortBy || ''}
                onChange={(e) => setFilterOptions({ ...filterOptions, sortBy: e.target.value })}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              >
                <option value="shipmentsDelivered">Shipments Delivered</option>
                <option value="avgDeliveryTime">Average Delivery Time</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Driver</label>
              <input
                type="text"
                value={filterOptions.driverName || ''}
                onChange={(e) => setFilterOptions({ ...filterOptions, driverName: e.target.value })}
                placeholder="Search by driver name"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Get table content based on report type
  const getTableContent = () => {
    if (!reportData) return null;
    
    if (reportType === 'overview') {
      const typedData = reportData as OverviewReportData;
      
      return (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">System Overview</h3>
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-base font-medium text-gray-900">
                Current Statistics
              </h3>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Total Users</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {typedData.systemStats.totalUsers}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Total Shipments</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {typedData.systemStats.totalShipments}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Active Shipments</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {typedData.systemStats.activeShipments}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Delivered Shipments</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {typedData.systemStats.deliveredShipments}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mt-8 mb-3">Monthly Trends</h3>
          <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shipments
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Users
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {typedData.monthlyTrends.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.shipments}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.users}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    } else if (reportType === 'shipments') {
      const typedData = reportData as ShipmentReportData;
      
      return (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Shipment Statistics</h3>
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3">
              <div className="p-4 border-b md:border-b-0 md:border-r border-gray-200">
                <p className="text-sm text-gray-500">Total Shipments</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">
                  {typedData.totalCount}
                </p>
              </div>
              <div className="p-4 border-b md:border-b-0 md:border-r border-gray-200">
                <p className="text-sm text-gray-500">Average Delivery Time</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">
                  {typedData.avgDeliveryTime.toFixed(1)} hours
                </p>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-500">Status Distribution</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {typedData.byStatus.map((item, index) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {item.status}: {item.count}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-3">Detailed Shipment Data</h3>
          <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tracking Number
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Origin
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destination
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {typedData.detailedData.slice(0, 10).map((shipment, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {shipment.trackingNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        shipment.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                        shipment.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                        shipment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        shipment.status === 'Delayed' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {shipment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {shipment.origin}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {shipment.destination}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(shipment.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {typedData.detailedData.length > 10 && (
              <div className="px-6 py-3 bg-gray-50 text-center">
                <span className="text-sm text-gray-500">
                  Showing 10 of {typedData.detailedData.length} shipments. Export for complete data.
                </span>
              </div>
            )}
          </div>
        </div>
      );
    } else if (reportType === 'users') {
      const typedData = reportData as UserReportData;
      
      return (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">User Statistics</h3>
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-4 border-b md:border-b-0 md:border-r border-gray-200">
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">
                  {typedData.totalCount}
                </p>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-500">Role Distribution</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {typedData.byRole.map((item, index) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {item.role}: {item.count}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-3">User Details</h3>
          <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {typedData.detailedData.slice(0, 10).map((user, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {user.userID}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'superAdmin' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                        user.role === 'driver' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {typedData.detailedData.length > 10 && (
              <div className="px-6 py-3 bg-gray-50 text-center">
                <span className="text-sm text-gray-500">
                  Showing 10 of {typedData.detailedData.length} users. Export for complete data.
                </span>
              </div>
            )}
          </div>
        </div>
      );
    } else if (reportType === 'drivers') {
      const typedData = reportData as DriverReportData;
      
      return (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Driver Performance</h3>
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-4 border-b md:border-b-0 md:border-r border-gray-200">
                <p className="text-sm text-gray-500">Total Drivers</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">
                  {typedData.totalDrivers}
                </p>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-500">Total Deliveries</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">
                  {typedData.totalShipmentsDelivered}
                </p>
              </div>
            </div>
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-3">Driver Statistics</h3>
          <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shipments Delivered
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg. Delivery Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {typedData.byPerformance.map((driver, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <FaTruck className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {driver.driverName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {driver.driverId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {driver.shipmentsDelivered}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {driver.avgDeliveryTime.toFixed(1)} hours
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ 
                            width: `${Math.min(100, (driver.shipmentsDelivered / 
                              (Math.max(...typedData.byPerformance.map(d => d.shipmentsDelivered)) || 1)) * 100)}%` 
                          }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="pb-5 border-b border-gray-200 mb-5 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => exportReport('pdf')}
              disabled={isExporting || !reportData}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {isExporting ? <FaSpinner className="animate-spin mr-2 h-4 w-4" /> : <FaFilePdf className="mr-2 h-4 w-4" />}
              Export PDF
            </button>
            <button
              type="button"
              onClick={() => exportReport('excel')}
              disabled={isExporting || !reportData}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isExporting ? <FaSpinner className="animate-spin mr-2 h-4 w-4" /> : <FaFileExcel className="mr-2 h-4 w-4" />}
              Export Excel
            </button>
            <button
              type="button"
              onClick={() => exportReport('csv')}
              disabled={isExporting || !reportData}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isExporting ? <FaSpinner className="animate-spin mr-2 h-4 w-4" /> : <FaFileCsv className="mr-2 h-4 w-4" />}
              Export CSV
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              disabled={!reportData}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <FaPrint className="mr-2 h-4 w-4" />
              Print
            </button>
          </div>
        </div>
      </div>

      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaCheck className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaExclamationTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Report Parameters</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => {
                  setReportType(e.target.value as ReportType);
                  setFilterOptions({});
                }}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              >
                <option value="overview">System Overview</option>
                <option value="shipments">Shipment Reports</option>
                <option value="users">User Reports</option>
                <option value="drivers">Driver Reports</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              >
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="year">Last Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">View Format</label>
              <div className="flex mt-1 rounded-md shadow-sm">
                <button
                  type="button"
                  onClick={() => setViewFormat('chart')}
                  className={`relative inline-flex items-center px-4 py-2 rounded-l-md border ${
                    viewFormat === 'chart' 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  } text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                >
                  <FaChartBar className="mr-2 h-4 w-4" />
                  Chart
                </button>
                <button
                  type="button"
                  onClick={() => setViewFormat('table')}
                  className={`relative inline-flex items-center px-4 py-2 rounded-r-md border ${
                    viewFormat === 'table' 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  } text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                >
                  <FaTable className="mr-2 h-4 w-4" />
                  Table
                </button>
              </div>
            </div>
            
            {timeRange === 'custom' && (
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Custom Date Range</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={dateRange.startDate ? dateRange.startDate.toISOString().split('T')[0] : ''}
                      onChange={(e) => {
                        const newDate = e.target.value ? new Date(e.target.value) : null;
                        setDateRange({ ...dateRange, startDate: newDate });
                      }}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">End Date</label>
                    <input
                      type="date"
                      value={dateRange.endDate ? dateRange.endDate.toISOString().split('T')[0] : ''}
                      onChange={(e) => {
                        const newDate = e.target.value ? new Date(e.target.value) : null;
                        setDateRange({ ...dateRange, endDate: newDate });
                      }}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {reportType !== 'overview' && (
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FaFilter className="mr-2 text-blue-500" />
                  Filters
                </h3>
                {Object.keys(filterOptions).length > 0 && (
                  <button
                    type="button"
                    onClick={() => setFilterOptions({})}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
              
              {getFilterFields()}
            </div>
          )}
          
          <div className="mt-6">
            <button
              type="button"
              onClick={fetchReportData}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2 h-4 w-4" />
                  Generating Report...
                </>
              ) : (
                <>
                  <FaSync className="mr-2 h-4 w-4" />
                  Generate Report
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {loading && !reportData && (
        <div className="mt-6 bg-white shadow rounded-lg p-8 flex items-center justify-center">
          <FaSpinner className="animate-spin h-8 w-8 text-blue-500 mr-3" />
          <span className="text-gray-600">Generating report...</span>
        </div>
      )}

      {reportData && (
        <div className="mt-6 bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Report Results</h2>
            <span className="text-sm text-gray-500">
              <FaCalendarAlt className="inline mr-2" />
              {timeRange === 'custom' && dateRange.startDate && dateRange.endDate
                ? `${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}`
                : timeRange === 'today'
                ? 'Today'
                : timeRange === 'week'
                ? 'Last 7 Days'
                : timeRange === 'month'
                ? 'Last 30 Days'
                : timeRange === '3months'
                ? 'Last 3 Months'
                : timeRange === '6months'
                ? 'Last 6 Months'
                : 'Last Year'}
            </span>
          </div>
          
          {viewFormat === 'chart' && (
            <div className="h-80 mb-8">
              <canvas ref={chartRef}></canvas>
            </div>
          )}
          
          {viewFormat === 'table' && getTableContent()}
        </div>
      )}
    </div>
  );
};

export default Reports;