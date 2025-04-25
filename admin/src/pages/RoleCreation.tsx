import { useState, useEffect } from 'react';
import axios from 'axios';

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

  if (userRole !== 'superAdmin') {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="text-red-500 font-medium">Access Denied: Only Super Admins can access this page</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Create New User Role</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
          <p>{success}</p>
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-gray-700 mb-2">First Name</label>
              <input
                id="firstName"
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="Enter first name"
                title="Enter your first name"
              />
            </div>
            
            <div>
              <label htmlFor="lastName" className="block text-gray-700 mb-2">Last Name</label>
              <input
                id="lastName"
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="Enter last name"
                title="Enter your last name"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-gray-700 mb-2">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="Enter email address"
                title="Enter your email address"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-gray-700 mb-2">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength={6}
                placeholder="Enter password"
                title="Enter your password (minimum 6 characters)"
              />
            </div>
            
            <div>
              <label htmlFor="role" className="block text-gray-700 mb-2">Role</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                title="Select user role"
              >
                <option value="admin">Admin</option>
                <option value="driver">Driver</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="company" className="block text-gray-700 mb-2">Company (Optional)</label>
              <input
                id="company"
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter company name"
                title="Enter company name (optional)"
              />
            </div>
          </div>
          
          <div className="mt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default RoleCreation;