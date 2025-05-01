import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaUserPlus, FaEnvelope, FaLock, FaBuilding, 
  FaIdCard, FaUserShield, FaTruck, FaInfoCircle, 
  FaCheckCircle, FaExclamationTriangle, FaSpinner, 
  FaEye, FaEyeSlash, FaArrowRight
} from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  company?: string;
}

const RoleCreation = () => {
  const [formData, setFormData] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'admin',
    company: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userRole, setUserRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showRoleInfo, setShowRoleInfo] = useState(false);
  
  useEffect(() => {
    // Get user role from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setUserRole(decoded.role);
        
        // If not superAdmin, show error
        if (decoded.role !== 'superAdmin') {
          setError('Only Super Admins can access this page');
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        setError('Authentication error');
      }
    }
  }, []);

  // Calculate password strength whenever password changes
  useEffect(() => {
    const password = formData.password;
    let strength = 0;
    
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    setPasswordStrength(strength);
  }, [formData.password]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${API_URL}/api/users/create`,
        formData,
        {
          headers: {
            'x-auth-token': token
          }
        }
      );

      setSuccess(`User ${formData.email} with ${formData.role} role created successfully`);
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'admin',
        company: ''
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error creating user');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleDescription = (role: string) => {
    switch(role) {
      case 'admin':
        return 'Admins can manage users, shipments, and system settings. They have access to all features except creating new admins.';
      case 'driver':
        return 'Drivers can view assigned shipments, update shipment status, and request handovers. They have limited access to the system.';
      default:
        return '';
    }
  };

  const getPasswordStrengthLabel = () => {
    if (formData.password.length === 0) return '';
    if (passwordStrength === 0) return 'Very Weak';
    if (passwordStrength === 1) return 'Weak';
    if (passwordStrength === 2) return 'Medium';
    if (passwordStrength === 3) return 'Strong';
    return 'Very Strong';
  };

  const getPasswordStrengthColor = () => {
    if (formData.password.length === 0) return 'bg-gray-200';
    if (passwordStrength === 0) return 'bg-red-500';
    if (passwordStrength === 1) return 'bg-red-400';
    if (passwordStrength === 2) return 'bg-yellow-400';
    if (passwordStrength === 3) return 'bg-green-400';
    return 'bg-green-500';
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  if (userRole !== 'superAdmin') {
    return (
      <div className="p-8 bg-white rounded-lg shadow-lg text-center">
        <FaExclamationTriangle className="text-red-500 text-5xl mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-red-700 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-4">Only Super Admins can access this page. If you need to create a new user role, please contact a Super Admin.</p>
        <div className="p-4 bg-gray-50 rounded-lg mt-4 text-left">
          <p className="text-sm text-gray-500">
            <FaInfoCircle className="inline mr-2 text-blue-500" />
            User role creation is a secure operation that can only be performed by Super Admins to maintain system security.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <div className="bg-blue-100 p-3 rounded-full mr-4">
            <FaUserPlus className="text-blue-600 text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Create New User Role</h1>
            <p className="text-gray-600">Add new administrators or drivers to the system</p>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-md p-4 mb-6 flex items-start">
            <FaExclamationTriangle className="text-red-500 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-red-800">Error</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 rounded-md p-4 mb-6">
            <div className="flex">
              <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-green-800">Success!</h3>
                <p className="text-green-700 mt-1">{success}</p>
                <button 
                  onClick={() => setSuccess('')}
                  className="mt-2 text-sm text-green-600 hover:text-green-800 font-medium"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-blue-50 to-white border-b">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">User Information</h2>
            <p className="text-sm text-gray-600">
              Create a new administrator or driver account. All fields are required unless marked optional.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            {/* Security notice banner */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
              <div className="flex">
                <FaInfoCircle className="text-yellow-600 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-yellow-800">Security Notice</h3>
                  <p className="text-yellow-700 text-sm mt-1">
                    The user accounts you create here will have special privileges in the system. 
                    Ensure that you only create accounts for trusted individuals and use strong passwords.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-gray-700 font-medium mb-2">
                  <FaIdCard className="inline mr-2 text-blue-500" />
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="firstName"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  required
                  placeholder="Enter first name"
                />
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-gray-700 font-medium mb-2">
                  <FaIdCard className="inline mr-2 text-blue-500" />
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  required
                  placeholder="Enter last name"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                  <FaEnvelope className="inline mr-2 text-blue-500" />
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  required
                  placeholder="name@example.com"
                />
                <p className="mt-1 text-xs text-gray-500">
                  This email will be used for login and account recovery.
                </p>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                  <FaLock className="inline mr-2 text-blue-500" />
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 transition-all duration-200"
                    required
                    minLength={6}
                    placeholder="Enter password"
                  />
                  <button 
                    type="button"
                    onClick={toggleShowPassword}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                
                {/* Password strength indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getPasswordStrengthColor()} transition-all duration-300 ease-in-out`}
                        style={{ width: `${(passwordStrength / 4) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs mt-1 flex justify-between">
                      <span>Password Strength: <span className="font-medium">{getPasswordStrengthLabel()}</span></span>
                      {passwordStrength < 3 && (
                        <span className="text-gray-600">Try adding numbers, symbols & capital letters</span>
                      )}
                    </p>
                  </div>
                )}
              </div>
              
              <div>
                <label htmlFor="role" className="block text-gray-700 font-medium mb-2">
                  <FaUserShield className="inline mr-2 text-blue-500" />
                  Role <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition-all duration-200"
                    required
                  >
                    <option value="admin">Admin</option>
                    <option value="driver">Driver</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
                
                {/* Role description */}
                <div className="mt-2 relative">
                  <button
                    type="button"
                    onClick={() => setShowRoleInfo(!showRoleInfo)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center"
                  >
                    <FaInfoCircle className="mr-1" />
                    {showRoleInfo ? 'Hide role details' : 'What does this role do?'}
                  </button>
                  
                  {showRoleInfo && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-md text-sm text-blue-800 border border-blue-100">
                      {formData.role === 'admin' && (
                        <div className="flex items-start">
                          <FaUserShield className="mt-1 mr-2 text-blue-600" /> 
                          <p>{getRoleDescription('admin')}</p>
                        </div>
                      )}
                      {formData.role === 'driver' && (
                        <div className="flex items-start">
                          <FaTruck className="mt-1 mr-2 text-blue-600" /> 
                          <p>{getRoleDescription('driver')}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="company" className="block text-gray-700 font-medium mb-2">
                  <FaBuilding className="inline mr-2 text-blue-500" />
                  Company <span className="text-gray-400 text-sm font-normal">(Optional)</span>
                </label>
                <input
                  id="company"
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  placeholder="Enter company name"
                />
              </div>
            </div>
            
            {/* Privacy notice */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FaInfoCircle className="mr-2 text-gray-500" />
                Privacy Notice
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                By creating this account, you are giving this user access to certain parts of the OceanTracker system based on their role. 
                The user's information will be stored securely in our database. Ensure you have the user's consent before creating an account for them.
                For security purposes, all account creation activities are logged and monitored.
              </p>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200 flex items-center"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FaUserPlus className="mr-2" />
                    Create User
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
        
        {/* Additional help section */}
        <div className="mt-8 bg-white p-6 shadow-md rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FaInfoCircle className="mr-2 text-blue-500" />
            Understanding User Roles
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-center mb-2">
                <div className="p-2 bg-blue-100 rounded-full mr-2">
                  <FaUserShield className="text-blue-600" />
                </div>
                <h4 className="font-medium text-blue-800">Admin Role</h4>
              </div>
              <ul className="text-sm text-blue-800 space-y-1 pl-8 list-disc">
                <li>Manage shipments and tracking</li>
                <li>Access system dashboard</li>
                <li>View reports and analytics</li>
                <li>Assign drivers to shipments</li>
                <li>Update system settings</li>
              </ul>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="flex items-center mb-2">
                <div className="p-2 bg-green-100 rounded-full mr-2">
                  <FaTruck className="text-green-600" />
                </div>
                <h4 className="font-medium text-green-800">Driver Role</h4>
              </div>
              <ul className="text-sm text-green-800 space-y-1 pl-8 list-disc">
                <li>View assigned shipments</li>
                <li>Update shipment status</li>
                <li>Request pickups and handovers</li>
                <li>Access driver-specific dashboard</li>
                <li>Limited access to system features</li>
              </ul>
            </div>
          </div>
          
          <p className="mt-4 text-sm text-gray-600">
            <strong>Note:</strong> Only Super Admins can create these user roles. Choose the appropriate role based on the user's responsibilities.
          </p>
        </div>
      </div>
    </div>
  );
};
export default RoleCreation;