import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  FaCog, FaEnvelope, FaBell, FaMoneyBill, FaShippingFast, FaCheck, 
  FaExclamationTriangle, FaSpinner, FaSave, FaQuestionCircle, 
  FaSearch, FaHistory,FaEdit, FaSyncAlt, FaGlobe, FaCalculator,
  FaCloudUploadAlt, FaToggleOn, FaEye, FaLock
} from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';

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
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredSettings, setFilteredSettings] = useState<GroupedSettings>({});
  const [showRecentChanges, setShowRecentChanges] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [settingToConfirm, setSettingToConfirm] = useState<string | null>(null);
  const [recentChanges, setRecentChanges] = useState<{key: string, oldValue: any, newValue: any}[]>([]);
  
  const tabsRef = useRef<HTMLDivElement>(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  // Category icons and colors
  const categoryInfo = {
    system: { icon: <FaCog />, color: 'blue', title: 'System Settings', description: 'Configure core system behavior and appearance' },
    email: { icon: <FaEnvelope />, color: 'green', title: 'Email Settings', description: 'Configure email notifications and templates' },
    notification: { icon: <FaBell />, color: 'yellow', title: 'Notification Settings', description: 'Configure user notifications and alerts' },
    payment: { icon: <FaMoneyBill />, color: 'purple', title: 'Payment Settings', description: 'Configure payment methods and processing' },
    shipping: { icon: <FaShippingFast />, color: 'red', title: 'Shipping Settings', description: 'Configure shipping rates and delivery options' }
  };
  
  // Sensitive settings that require confirmation
  const sensitiveSettings = ['maintenance_mode', 'site_name', 'payment_gateways'];
  
  useEffect(() => {
    fetchSettings();
  }, []);
  
  useEffect(() => {
    // Filter settings based on search term
    if (!searchTerm) {
      setFilteredSettings(settings);
      return;
    }
    
    const filtered: GroupedSettings = {};
    Object.entries(settings).forEach(([category, categorySettings]) => {
      const matchedSettings = categorySettings.filter(setting => 
        setting.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        setting.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        JSON.stringify(setting.value).toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      if (matchedSettings.length > 0) {
        filtered[category] = matchedSettings;
      }
    });
    
    setFilteredSettings(filtered);
  }, [searchTerm, settings]);
  
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
      setFilteredSettings(response.data);
    } catch (err: any) {
      console.error('Error fetching settings:', err);
      setError(err.response?.data?.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (key: string, value: any, confirmRequired: boolean = false) => {
    if (confirmRequired) {
      setSettingToConfirm(key);
      setShowConfirmation(true);
      return;
    }
    
    updateSetting(key, value);
  };
  
  const updateSetting = (key: string, value: any) => {
    // Track changes for the recent changes list
    const oldValue = settings[activeTab]?.find(s => s.key === key)?.value;
    if (JSON.stringify(oldValue) !== JSON.stringify(value)) {
      setRecentChanges(prev => [
        { key, oldValue, newValue: value },
        ...prev.slice(0, 9) // Keep only 10 most recent changes
      ]);
    }
    
    setEditedSettings({
      ...editedSettings,
      [key]: value
    });
  };
  
  const confirmSettingChange = () => {
    if (!settingToConfirm) return;
    
    // Find the setting and extract its current value in the editing state
    const settingValue = editedSettings[settingToConfirm] !== undefined
      ? editedSettings[settingToConfirm]
      : settings[activeTab]?.find(s => s.key === settingToConfirm)?.value;

    updateSetting(settingToConfirm, settingValue);
    setShowConfirmation(false);
    setSettingToConfirm(null);
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
  
  const scrollToTab = (tabId: string) => {
    if (tabsRef.current) {
      const tab = tabsRef.current.querySelector(`[data-tab="${tabId}"]`);
      if (tab) {
        tabsRef.current.scrollLeft = tab.getBoundingClientRect().left - tabsRef.current.getBoundingClientRect().left + tabsRef.current.scrollLeft - 20;
      }
    }
    setActiveTab(tabId);
  };
  
  const renderSettingInput = (setting: Setting) => {
    // Get the current value - either from editedSettings or original setting
    const currentValue = editedSettings.hasOwnProperty(setting.key) 
      ? editedSettings[setting.key]
      : setting.value;
    
    const confirmRequired = sensitiveSettings.includes(setting.key);
    
    switch (setting.type) {
      case 'boolean':
        return (
          <div className="flex items-center">
            <button
              onClick={() => handleInputChange(setting.key, !currentValue, confirmRequired)}
              className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${categoryInfo[setting.category].color}-500 ${
                currentValue ? `bg-${categoryInfo[setting.category].color}-600` : 'bg-gray-200'
              }`}
              aria-pressed="false"
              aria-labelledby={`${setting.key}-label`}
            >
              <span className="sr-only">Toggle {setting.key}</span>
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                  currentValue ? 'translate-x-5' : 'translate-x-0'
                }`}
              ></span>
            </button>
            <span className="ml-3 text-sm text-gray-700">
              {currentValue ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        );
      case 'number':
        return (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaCalculator className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="number"
              value={currentValue}
              onChange={(e) => handleInputChange(setting.key, parseFloat(e.target.value), confirmRequired)}
              className="pl-10 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        );
      case 'array':
        return (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaGlobe className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={Array.isArray(currentValue) ? currentValue.join(', ') : ''}
              onChange={(e) => handleInputChange(
                setting.key, 
                e.target.value.split(',').map(item => item.trim()),
                confirmRequired
              )}
              className="pl-10 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Comma-separated values"
            />
          </div>
        );
      default: // string
        // Special handling for specific settings
        if (setting.key === 'site_name') {
          return (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaGlobe className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={currentValue}
                onChange={(e) => handleInputChange(setting.key, e.target.value, confirmRequired)}
                className="pl-10 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
              <div className="mt-1 p-2 bg-gray-50 rounded border border-gray-200">
                <span className="text-xs text-gray-500">Preview: </span>
                <span className="text-blue-700 font-bold">{currentValue}</span>
              </div>
            </div>
          );
        }
        
        // Email type fields
        if (setting.key.includes('email')) {
          return (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="email"
                value={currentValue}
                onChange={(e) => handleInputChange(setting.key, e.target.value, confirmRequired)}
                className="pl-10 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          );
        }
        
        // Default string input
        return (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaEdit className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={currentValue}
              onChange={(e) => handleInputChange(setting.key, e.target.value, confirmRequired)}
              className="pl-10 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        );
    }
  };
  
  const getSettingIcon = (setting: Setting) => {
    // Choose icon based on setting key
    if (setting.key.includes('email')) return <FaEnvelope className="text-green-500" />;
    if (setting.key.includes('notification')) return <FaBell className="text-yellow-500" />;
    if (setting.key.includes('payment')) return <FaMoneyBill className="text-purple-500" />;
    if (setting.key.includes('shipping')) return <FaShippingFast className="text-red-500" />;
    if (setting.key.includes('mode')) return <FaToggleOn className="text-blue-500" />;
    if (setting.type === 'boolean') return <FaToggleOn className="text-blue-500" />;
    
    // Default icon based on category
    return categoryInfo[setting.category].icon;
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">System Settings</h1>
          <p className="mt-1 text-sm text-gray-500">Configure system settings and preferences</p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <button
            onClick={() => setShowRecentChanges(!showRecentChanges)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FaHistory className="mr-2 -ml-0.5 h-4 w-4" />
            {showRecentChanges ? 'Hide Changes' : 'Recent Changes'}
          </button>
          
          <button
            onClick={fetchSettings}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FaSyncAlt className="mr-2 -ml-0.5 h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>
      
      {showRecentChanges && recentChanges.length > 0 && (
        <div className="mb-6 bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <FaHistory className="mr-2 text-blue-500" />
              Recent Changes
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              These changes will take effect when you save settings
            </p>
          </div>
          <div className="px-4 py-5 sm:p-6 max-h-64 overflow-y-auto">
            <ul className="divide-y divide-gray-200">
              {recentChanges.map((change, index) => (
                <li key={index} className="py-3">
                  <div className="flex items-start">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {change.key.replace(/_/g, ' ')}
                      </p>
                      <div className="flex mt-1">
                        <div className="bg-red-50 text-red-700 px-2 py-1 text-xs rounded mr-2 line-through">
                          {typeof change.oldValue === 'object' 
                            ? JSON.stringify(change.oldValue) 
                            : String(change.oldValue)}
                        </div>
                        <span className="text-gray-500 mx-1">→</span>
                        <div className="bg-green-50 text-green-700 px-2 py-1 text-xs rounded">
                          {typeof change.newValue === 'object' 
                            ? JSON.stringify(change.newValue) 
                            : String(change.newValue)}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {/* Search Bar */}
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaSearch className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="search"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Search settings..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {loading ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <div className="flex justify-center items-center py-16">
            <FaSpinner className="animate-spin text-blue-500 h-8 w-8 mr-3" />
            <span className="text-gray-600 text-lg">Loading settings...</span>
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
              <button 
                onClick={fetchSettings}
                className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      ) : Object.keys(filteredSettings).length === 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <div className="text-center py-16">
            <FaSearch className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No settings found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm 
                ? `No settings match "${searchTerm}"` 
                : "No settings available. Contact your administrator."}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Clear Search
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaCheck className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Success!</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>{success}</p>
                  </div>
                </div>
                <div className="ml-auto pl-3">
                  <div className="-mx-1.5 -my-1.5">
                    <button
                      onClick={() => setSuccess(null)}
                      className="inline-flex bg-green-50 rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <span className="sr-only">Dismiss</span>
                      <svg 
                        className="h-5 w-5" 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path 
                          fillRule="evenodd" 
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            {/* Category Tabs */}
            <div className="border-b border-gray-200 bg-gray-50">
              <div 
                ref={tabsRef}
                className="flex overflow-x-auto py-2 px-2 hide-scrollbar"
              >
                {Object.keys(filteredSettings).map((category) => {
                  const { icon, color, title } = categoryInfo[category as keyof typeof categoryInfo];
                  return (
                    <button
                      key={category}
                      data-tab={category}
                      onClick={() => scrollToTab(category)}
                      className={`flex items-center px-4 py-3 mr-2 rounded-lg transition-all duration-200 ${
                        activeTab === category
                          ? `bg-${color}-50 border-${color}-500 text-${color}-700 shadow-sm`
                          : 'bg-white border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      } text-sm font-medium border focus:outline-none focus:ring-2 focus:ring-${color}-500`}
                    >
                      <span className="mr-2">{icon}</span>
                      {title}
                      <span className="ml-2 bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 text-xs">
                        {filteredSettings[category].length}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Settings Content */}
            <div>
              {Object.keys(filteredSettings).map((category) => (
                <div 
                  key={category}
                  className={activeTab === category ? 'block' : 'hidden'}
                >
                  <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-gray-50 to-white">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                      {categoryInfo[category as keyof typeof categoryInfo].icon}
                      <span className="ml-2">
                        {categoryInfo[category as keyof typeof categoryInfo].title}
                      </span>
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      {categoryInfo[category as keyof typeof categoryInfo].description}
                    </p>
                  </div>

                  <div className="px-4 py-5 sm:p-6 space-y-8">
                    {filteredSettings[category].map((setting) => (
                      <div key={setting._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow duration-200">
                        <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start">
                          <div className="mb-4 sm:mb-0">
                            <div className="flex items-center">
                              <div className={`p-2 rounded-lg bg-${categoryInfo[setting.category].color}-50 mr-3`}>
                                {getSettingIcon(setting)}
                              </div>
                              <label 
                                id={`${setting.key}-label`}
                                htmlFor={setting.key} 
                                className="block text-sm font-medium text-gray-700"
                                data-tooltip-id={`tooltip-${setting.key}`}
                                data-tooltip-content={setting.description}
                              >
                                {setting.key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                {sensitiveSettings.includes(setting.key) && (
                                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    <FaLock className="mr-1 h-3 w-3" />
                                    Sensitive
                                  </span>
                                )}
                              </label>
                              <Tooltip id={`tooltip-${setting.key}`} />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">{setting.description}</p>
                            <p className="mt-1 text-xs text-gray-400">Last updated: {new Date(setting.updatedAt).toLocaleDateString()}</p>
                          </div>
                          <div className="sm:col-span-2">
                            {renderSettingInput(setting)}
                            {editedSettings[setting.key] !== undefined && (
                              <div className="mt-2 text-xs text-blue-500 flex items-center">
                                <FaEdit className="mr-1" /> Value changed, don't forget to save
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Save Settings Button */}
            <div className="px-4 py-5 sm:p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {Object.keys(editedSettings).length === 0 
                    ? 'No changes to save' 
                    : `${Object.keys(editedSettings).length} setting(s) modified`}
                </span>
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={saving || Object.keys(editedSettings).length === 0}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
      
      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">​</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <FaExclamationTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Confirm Setting Change
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        This is a sensitive setting and changing it could affect system functionality. Are you sure you want to proceed?
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={confirmSettingChange}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmation(false);
                    setSettingToConfirm(null);
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Add a stylesheet for tooltip and custom scrollbar */}
      <style>
  {`
    .hide-scrollbar::-webkit-scrollbar {
      height: 0.5rem;
    }
    
    .hide-scrollbar::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 0.25rem;
    }
    
    .hide-scrollbar::-webkit-scrollbar-thumb {
      background: #d1d5db;
      border-radius: 0.25rem;
    }
    
    .hide-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #9ca3af;
    }
  `}
</style>

    </div>
  );
};

export default Settings;