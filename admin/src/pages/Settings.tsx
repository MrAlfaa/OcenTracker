import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCog, FaEnvelope, FaBell, FaMoneyBill, FaShippingFast, FaCheck, FaExclamationTriangle, FaSpinner, FaSave } from 'react-icons/fa';

// Setting interface
interface Setting {
  _id: string;
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  category: 'system' | 'email' | 'notification' | 'payment' | 'shipping';
  description: string;
  updatedAt: string;
}

// Group settings by category
type GroupedSettings = Record<string, Setting[]>;

const Settings = () => {
  const [activeTab, setActiveTab] = useState<string>('system');
  const [settings, setSettings] = useState<GroupedSettings>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editedSettings, setEditedSettings] = useState<Record<string, any>>({});
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  useEffect(() => {
    fetchSettings();
  }, []);
  
  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/settings`, {
        headers: {
          'x-auth-token': token
        }
      });
      
      setSettings(response.data);
    } catch (err: any) {
      console.error('Error fetching settings:', err);
      setError(err.response?.data?.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (key: string, value: any) => {
    setEditedSettings({
      ...editedSettings,
      [key]: value
    });
  };
  
  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      // Prepare settings for bulk update
      const settingsToUpdate = Object.entries(editedSettings).map(([key, value]) => ({
        key,
        value
      }));
      
      if (settingsToUpdate.length === 0) {
        setSuccess('No changes to save');
        setSaving(false);
        return;
      }
      
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/settings`, {
        settings: settingsToUpdate
      }, {
        headers: {
          'x-auth-token': token
        }
      });
      
      // Refresh settings from server
      await fetchSettings();
      
      // Clear edited settings
      setEditedSettings({});
      
      setSuccess('Settings saved successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setError(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };
  
  const renderSettingInput = (setting: Setting) => {
    // Get the current value - either from editedSettings or original setting
    const currentValue = editedSettings.hasOwnProperty(setting.key) 
      ? editedSettings[setting.key]
      : setting.value;
    
    switch (setting.type) {
      case 'boolean':
        return (
          <div className="flex items-center">
            <input
              id={setting.key}
              type="checkbox"
              checked={currentValue}
              onChange={(e) => handleInputChange(setting.key, e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor={setting.key} className="ml-2 block text-sm text-gray-900">
              {currentValue ? 'Enabled' : 'Disabled'}
            </label>
          </div>
        );
      case 'number':
        return (
          <input
            type="number"
            value={currentValue}
            onChange={(e) => handleInputChange(setting.key, parseFloat(e.target.value))}
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        );
      case 'array':
        return (
          <input
            type="text"
            value={Array.isArray(currentValue) ? currentValue.join(', ') : ''}
            onChange={(e) => handleInputChange(setting.key, e.target.value.split(',').map(item => item.trim()))}
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            placeholder="Comma-separated values"
          />
        );
      default: // string
        return (
          <input
            type="text"
            value={currentValue}
            onChange={(e) => handleInputChange(setting.key, e.target.value)}
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        );
    }
  };
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'system':
        return <FaCog />;
      case 'email':
        return <FaEnvelope />;
      case 'notification':
        return <FaBell />;
      case 'payment':
        return <FaMoneyBill />;
      case 'shipping':
        return <FaShippingFast />;
      default:
        return <FaCog />;
    }
  };
  
  const formatCategoryName = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1) + ' Settings';
  };
  
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-4">
        <h1 className="text-2xl font-semibold text-gray-900">System Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Configure system settings and preferences</p>
      </div>
      
      {loading ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <div className="flex justify-center items-center py-8">
            <FaSpinner className="animate-spin text-blue-500 mr-3" />
            <span>Loading settings...</span>
          </div>
        </div>
      ) : error ? (
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
      ) : (
        <>
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
        
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                {Object.keys(settings).map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveTab(category)}
                    className={`whitespace-nowrap py-4 px-6 font-medium text-sm border-b-2 flex items-center ${
                      activeTab === category
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="mr-2">{getCategoryIcon(category)}</span>
                    {formatCategoryName(category)}
                  </button>
                ))}
              </nav>
            </div>
            
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-6">
                {settings[activeTab]?.map((setting) => (
                  <div key={setting._id} className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start">
                    <label htmlFor={setting.key} className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                      {setting.key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      <p className="mt-1 text-xs text-gray-500">{setting.description}</p>
                    </label>
                    <div className="mt-1 sm:mt-0 sm:col-span-2">
                      {renderSettingInput(setting)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-10 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={saving || Object.keys(editedSettings).length === 0}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave className="-ml-1 mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Settings;