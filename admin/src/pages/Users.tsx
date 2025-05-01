import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  FaUser, FaSearch, FaEdit, FaCheck, FaTimes, FaSpinner, 
  FaUserCheck, FaUserSlash, FaUserCog, FaUsers, FaUserTie,
  FaDownload, FaFilter, FaSortAmountDown, FaSortAmountUp,
  FaEnvelope, FaIdCard, FaCalendarAlt, FaLightbulb,
  FaChartPie, FaSync,FaShieldAlt, FaTruckMoving
} from 'react-icons/fa';

// API URL from environment
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface User {
  _id: string;
  userID: string;
  email: string;
  firstName: string;
  lastName: string;
  company?: string;
  role: string;
  active: boolean;
  createdAt: string;
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingAction, setProcessingAction] = useState(false);
  const [currentTab, setCurrentTab] = useState<'all' | 'active' | 'inactive'>('all');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [sortField, setSortField] = useState<'name' | 'role' | 'userID' | 'createdAt'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [exportingData, setExportingData] = useState(false);

  // Calculate dashboard statistics
  const statistics = useMemo(() => {
    return {
      totalUsers: users.length,
      activeUsers: users.filter(user => user.active).length,
      inactiveUsers: users.filter(user => !user.active).length,
      adminUsers: users.filter(user => user.role === 'admin').length,
      driverUsers: users.filter(user => user.role === 'driver').length,
      regularUsers: users.filter(user => user.role === 'user').length,
      superAdminUsers: users.filter(user => user.role === 'superAdmin').length,
      recentUsers: users.filter(user => {
        const createdDate = new Date(user.createdAt);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return createdDate >= thirtyDaysAgo;
      }).length
    };
  }, [users]);

  // Fetch users on initial load
  useEffect(() => {
    fetchUsers();
  }, []);

  // Apply filtering, sorting, and search
  useEffect(() => {
    let result = [...users];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(user => 
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.userID.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply active/inactive filter
    if (currentTab === 'active') {
      result = result.filter(user => user.active);
    } else if (currentTab === 'inactive') {
      result = result.filter(user => !user.active);
    }
    
    // Apply role filter
    if (roleFilter !== 'all') {
      result = result.filter(user => user.role === roleFilter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'name':
          comparison = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
          break;
        case 'role':
          comparison = a.role.localeCompare(b.role);
          break;
        case 'userID':
          comparison = a.userID.localeCompare(b.userID);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredUsers(result);
  }, [users, searchTerm, currentTab, roleFilter, sortField, sortDirection]);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/users/all`, {
        headers: {
          'x-auth-token': token
        }
      });
      
      setUsers(response.data);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Toggle user active status
  const toggleUserStatus = async (userId: string, setActive: boolean) => {
    try {
      setProcessingAction(true);
      
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/api/users/${userId}/status`, 
        { active: setActive },
        {
          headers: {
            'x-auth-token': token
          }
        }
      );
      
      // Update the user in the list
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId ? { ...user, active: setActive } : user
        )
      );
      
      // Update selected user if it's the same one
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser({ ...selectedUser, active: setActive });
      }
      
      // Show success notification
      setNotification({
        type: 'success',
        message: `User ${setActive ? 'activated' : 'deactivated'} successfully`
      });
      
      // Clear notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
      
    } catch (err: any) {
      console.error('Error updating user status:', err);
      
      // Show error notification
      setNotification({
        type: 'error',
        message: err.response?.data?.message || `Failed to ${setActive ? 'activate' : 'deactivate'} user`
      });
      
      // Clear notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } finally {
      setProcessingAction(false);
    }
  };

  // Export users data to CSV
  const exportUserData = () => {
    try {
      setExportingData(true);
      
      // Create CSV content
      const headers = ['User ID', 'First Name', 'Last Name', 'Email', 'Role', 'Status', 'Company', 'Created Date'];
      
      const csvContent = [
        headers.join(','),
        ...filteredUsers.map(user => [
          user.userID,
          `"${user.firstName}"`,
          `"${user.lastName}"`,
          user.email,
          user.role,
          user.active ? 'Active' : 'Inactive',
          user.company ? `"${user.company}"` : '',
          new Date(user.createdAt).toLocaleDateString()
        ].join(','))
      ].join('\n');
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setNotification({
        type: 'success',
        message: 'User data exported successfully'
      });
      
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (err) {
      console.error('Error exporting user data:', err);
      setNotification({
        type: 'error',
        message: 'Failed to export user data'
      });
      
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } finally {
      setExportingData(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'superAdmin':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'driver':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superAdmin':
        return <FaShieldAlt className="text-purple-500" />;
      case 'admin':
        return <FaUserTie className="text-blue-500" />;
      case 'driver':
        return <FaTruckMoving className="text-green-500" />;
      default:
        return <FaUser className="text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="pb-5 border-b border-gray-200 mb-5 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
          <p className="mt-2 text-sm text-gray-500">View and manage all user accounts in the system</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <button
            onClick={() => fetchUsers()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FaSync className="mr-2 -ml-1 h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={exportUserData}
            disabled={exportingData || filteredUsers.length === 0}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {exportingData ? <FaSpinner className="animate-spin mr-2 -ml-1 h-4 w-4" /> : <FaDownload className="mr-2 -ml-1 h-4 w-4" />}
            Export CSV
          </button>
        </div>
      </div>
      
      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {/* Total Users Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5 flex items-center">
            <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
              <FaUsers className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Users
                </dt>
                <dd>
                  <div className="text-lg font-semibold text-gray-900">
                    {statistics.totalUsers}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="font-medium text-blue-700 hover:underline cursor-pointer" onClick={() => { setCurrentTab('all'); setRoleFilter('all'); }}>
                View all users
              </span>
            </div>
          </div>
        </div>
        
        {/* Active Users Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5 flex items-center">
            <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
              <FaUserCheck className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Active Users
                </dt>
                <dd>
                  <div className="text-lg font-semibold text-gray-900">
                    {statistics.activeUsers}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="font-medium text-green-700 hover:underline cursor-pointer" onClick={() => setCurrentTab('active')}>
                View active users
              </span>
            </div>
          </div>
        </div>
        
        {/* Inactive Users Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5 flex items-center">
            <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
              <FaUserSlash className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Inactive Users
                </dt>
                <dd>
                  <div className="text-lg font-semibold text-gray-900">
                    {statistics.inactiveUsers}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="font-medium text-red-700 hover:underline cursor-pointer" onClick={() => setCurrentTab('inactive')}>
                View inactive users
              </span>
            </div>
          </div>
        </div>
        
        {/* User Types Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <FaChartPie className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    User Roles
                  </dt>
                  <dd>
                    <div className="text-lg font-semibold text-gray-900">
                      {statistics.regularUsers} Regular
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-2 flex justify-around items-center text-xs text-gray-500">
              <div className="flex flex-col items-center">
                <span className="font-bold text-blue-600">{statistics.adminUsers}</span>
                <span>Admins</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-bold text-green-600">{statistics.driverUsers}</span>
                <span>Drivers</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-bold text-purple-600">{statistics.superAdminUsers}</span>
                <span>Super Admins</span>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="font-medium text-purple-700 hover:underline cursor-pointer" onClick={() => { setCurrentTab('all'); setRoleFilter('all'); }}>
                View role distribution
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Notification */}
      {notification && (
        <div className={`p-4 mb-6 rounded-md ${notification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {notification.type === 'success' ? (
                <FaCheck className="h-5 w-5 text-green-400" />
              ) : (
                <FaTimes className="h-5 w-5 text-red-400" />
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button 
                  onClick={() => setNotification(null)}
                  className={`inline-flex rounded-md p-1.5 ${
                    notification.type === 'success' ? 'text-green-500 hover:bg-green-100' : 'text-red-500 hover:bg-red-100'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    notification.type === 'success' ? 'focus:ring-green-500' : 'focus:ring-red-500'
                  }`}
                >
                  <span className="sr-only">Dismiss</span>
                  <FaTimes className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Search, Filter, and Sort Bar */}
      <div className="bg-white shadow rounded-lg p-5 mb-6">
        <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
          {/* Search */}
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Users
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, or ID"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 py-2 sm:text-sm border-gray-300 rounded-md"
              />
              {searchTerm && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <FaTimes className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Role Filter */}
          <div>
            <label htmlFor="role-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <div className="relative">
              <select
                id="role-filter"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full py-2 pl-3 pr-10 text-sm border-gray-300 rounded-md appearance-none"
              >
                <option value="all">All Roles</option>
                <option value="user">Regular Users</option>
                <option value="admin">Admins</option>
                <option value="driver">Drivers</option>
                <option value="superAdmin">Super Admins</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <FaFilter className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
          
          {/* Sort */}
          <div>
            <label htmlFor="sort-field" className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <div className="flex space-x-2">
              <select
                id="sort-field"
                value={sortField}
                onChange={(e) => setSortField(e.target.value as any)}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full py-2 pl-3 pr-10 text-sm border-gray-300 rounded-md appearance-none"
              >
                <option value="name">Name</option>
                <option value="role">Role</option>
                <option value="userID">User ID</option>
                <option value="createdAt">Created Date</option>
              </select>
              <button
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {sortDirection === 'asc' ? <FaSortAmountDown className="h-4 w-4" /> : <FaSortAmountUp className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Status Tabs */}
        <div className="mt-4 border-t border-gray-200 pt-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentTab('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${
                currentTab === 'all' 
                  ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                  : 'text-gray-700 hover:bg-gray-100 border border-transparent'
              }`}
            >
              <FaUsers className="mr-2" />
              All Users
              <span className="ml-2 bg-gray-200 text-gray-700 py-0.5 px-2 rounded-full text-xs">
                {users.length}
              </span>
            </button>
            <button
              onClick={() => setCurrentTab('active')}
              className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${
                currentTab === 'active' 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'text-gray-700 hover:bg-gray-100 border border-transparent'
              }`}
            >
              <FaUserCheck className="mr-2" />
              Active
              <span className="ml-2 bg-green-200 text-green-700 py-0.5 px-2 rounded-full text-xs">
                {statistics.activeUsers}
              </span>
            </button>
            <button
              onClick={() => setCurrentTab('inactive')}
              className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${
                currentTab === 'inactive' 
                  ? 'bg-red-100 text-red-800 border border-red-200' 
                  : 'text-gray-700 hover:bg-gray-100 border border-transparent'
              }`}
            >
              <FaUserSlash className="mr-2" />
              Inactive
              <span className="ml-2 bg-red-200 text-red-700 py-0.5 px-2 rounded-full text-xs">
                {statistics.inactiveUsers}
              </span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6">
        {/* User List */}
        <div className="lg:w-2/3">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center">
              <h2 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                <FaUsers className="mr-2 text-blue-500" />
                Users List
                <span className="ml-2 text-sm text-gray-500">
                  ({filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'})
                </span>
              </h2>
            </div>
            
            {loading ? (
              <div className="p-8 text-center">
                <FaSpinner className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-4" />
                <p className="text-gray-500">Loading users...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                  <FaTimes className="h-8 w-8 text-red-500" />
                </div>
                <p className="text-red-500 font-medium mb-2">{error}</p>
                <button
                  onClick={fetchUsers}
                  className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FaSync className="mr-2 -ml-1" />
                  Retry
                </button>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <FaUser className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium mb-2">No users found</p>
                <p className="text-sm text-gray-400 mb-4">
                  {searchTerm 
                    ? "No users match your search criteria." 
                    : roleFilter !== 'all'
                    ? `No ${roleFilter} users found.`
                    : currentTab === 'active'
                    ? "No active users found."
                    : currentTab === 'inactive'
                    ? "No inactive users found."
                    : "No users exist in the system."
                  }
                </p>
                <button
                  onClick={() => { setSearchTerm(''); setRoleFilter('all'); setCurrentTab('all'); }}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map(user => (
                      <tr 
                        key={user._id} 
                        onClick={() => setSelectedUser(user)}
                        className={`cursor-pointer hover:bg-gray-50 transition-colors ${selectedUser?._id === user._id ? 'bg-blue-50' : ''}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                              <div className="text-sm font-bold">
                                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <FaEnvelope className="mr-1 h-3 w-3" /> {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 flex items-center">
                            <FaIdCard className="mr-1 h-3 w-3" /> {user.userID}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                            {getRoleIcon(user.role)}
                            <span className="ml-1">{user.role}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {user.active 
                              ? <><FaUserCheck className="mr-1" /> Active</> 
                              : <><FaUserSlash className="mr-1" /> Inactive</>
                            }
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedUser(user);
                            }}
                            className="text-blue-600 hover:text-blue-900 font-medium flex items-center justify-end"
                          >
                            <FaEdit className="mr-1" /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        
        {/* User Details */}
        <div className="lg:w-1/3">
          {selectedUser ? (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-5 flex items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                  {getRoleIcon(selectedUser.role)}
                  <span className="ml-2">User Details</span>
                </h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedUser.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {selectedUser.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="p-6">
                {/* User profile header */}
                <div className="flex flex-col items-center mb-6 pb-6 border-b border-gray-200">
                  <div className="h-24 w-24 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4">
                    {selectedUser.firstName.charAt(0)}{selectedUser.lastName.charAt(0)}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 text-center">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h2>
                  <div className="flex items-center mt-1 text-sm text-gray-500">
                    <FaIdCard className="mr-1" />
                    <span>ID: {selectedUser.userID}</span>
                  </div>
                  <div className="mt-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(selectedUser.role)}`}>
                      {getRoleIcon(selectedUser.role)}
                      <span className="ml-1">{selectedUser.role}</span>
                    </span>
                  </div>
                </div>
                
                {/* User details */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                      <FaEnvelope className="mr-2" />
                      Contact Information
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="mb-3">
                        <span className="block text-xs text-gray-500">Email Address</span>
                        <span className="block text-sm font-medium text-gray-900">{selectedUser.email}</span>
                      </div>
                      
                      {selectedUser.company && (
                        <div>
                          <span className="block text-xs text-gray-500">Company</span>
                          <span className="block text-sm font-medium text-gray-900">{selectedUser.company}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                      <FaCalendarAlt className="mr-2" />
                      Account Information
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="block text-xs text-gray-500">Created On</span>
                          <span className="block text-sm font-medium text-gray-900">{formatDate(selectedUser.createdAt)}</span>
                        </div>
                        <div>
                          <span className="block text-xs text-gray-500">Status</span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedUser.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {selectedUser.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-500 mb-4 flex items-center">
                    <FaUserCog className="mr-2" />
                    Account Actions
                  </h4>
                  
                  <div className="space-y-4">
                    {selectedUser.role !== 'superAdmin' && (
                      <button
                        onClick={() => toggleUserStatus(selectedUser._id, !selectedUser.active)}
                        disabled={processingAction}
                        className={`w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                          selectedUser.active 
                            ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                            : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                        } focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50`}
                      >
                        {processingAction ? (
                          <FaSpinner className="animate-spin mr-2" />
                        ) : selectedUser.active ? (
                          <FaUserSlash className="mr-2" />
                        ) : (
                          <FaUserCheck className="mr-2" />
                        )}
                        {selectedUser.active ? 'Deactivate Account' : 'Activate Account'}
                      </button>
                    )}
                    
                    {selectedUser.role === 'superAdmin' && (
                      <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center">
                        <FaShieldAlt className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-1">Super Admin Account</p>
                        <p className="text-xs text-gray-500">Super Admin accounts have special privileges and cannot be modified from this interface.</p>
                      </div>
                    )}
                    
                    <button
                      onClick={() => setSelectedUser(null)}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <FaTimes className="mr-2" />
                      Close Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                <FaUser className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-500 mb-2">No User Selected</h3>
              <p className="text-sm text-gray-400 mb-6 max-w-sm mx-auto">
                Select a user from the list to view their profile details and manage their account.
              </p>
              <div className="bg-blue-50 rounded-lg p-4 text-left max-w-sm mx-auto">
                <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                  <FaLightbulb className="mr-2 text-blue-600" />
                  Quick Tip
                </h4>
                <p className="text-xs text-blue-700">
                  You can filter users by role, status, and search by name or email. Use the filters above to quickly find the users you're looking for.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Users;