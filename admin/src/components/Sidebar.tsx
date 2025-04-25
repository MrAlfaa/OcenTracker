import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface SidebarProps {
  isOpen: boolean;
  isMobileOpen: boolean;
  toggleSidebar: () => void;
  closeMobileMenu: () => void;
}

const Sidebar = ({ isOpen, isMobileOpen, toggleSidebar, closeMobileMenu }: SidebarProps) => {
  const location = useLocation();
  const [userRole, setUserRole] = useState<string>('');
  const [userInfo, setUserInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: ''
  });
  
  useEffect(() => {
    // Get user role from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setUserRole(decoded.role);
        
        // Also set user info
        setUserInfo({
          firstName: decoded.firstName || 'Admin',
          lastName: decoded.lastName || 'User',
          email: decoded.email || 'admin@oceantracker.com',
          role: decoded.role || 'admin'
        });
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);
  
  // Navigation items with role-based visibility
  const navItems = [
    { name: 'Dashboard', path: '/', icon: 'home', roles: ['admin', 'superAdmin'] },
    { name: 'Users', path: '/users', icon: 'users', roles: ['admin', 'superAdmin'] },
    { name: 'Shipments', path: '/shipments', icon: 'truck', roles: ['admin', 'superAdmin'] },
    { name: 'Role Creation', path: '/role-creation', icon: 'user-plus', roles: ['superAdmin'] },
    { name: 'Drivers', path: '/drivers', icon: 'truck-driver', roles: ['admin', 'superAdmin', 'driver'] },
    { name: 'Reports', path: '/reports', icon: 'chart-bar', roles: ['admin', 'superAdmin'] },
    { name: 'Settings', path: '/settings', icon: 'cog', roles: ['admin', 'superAdmin'] },
  ];

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(userRole)
  );

  // Function to render the appropriate icon
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'home':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
          </svg>
        );
      case 'users':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
          </svg>
        );
      case 'truck':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"></path>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path>
          </svg>
        );
      case 'user-plus':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
          </svg>
        );
      case 'truck-driver':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"></path>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path>
          </svg>
        );
      case 'chart-bar':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
        );
      case 'cog':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div 
        className={`bg-blue-800 text-white h-screen transition-all duration-300 ease-in-out ${
          isOpen ? 'w-64' : 'w-20'
        } hidden md:block`}
      >
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
              <svg className="w-6 h-6 text-blue-600" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 50C20 40 30 60 40 50C50 40 60 60 70 50C80 40 90 60 95 55" stroke="currentColor" strokeWidth="8" strokeLinecap="round"/>
                <path d="M10 70C20 60 30 80 40 70C50 60 60 80 70 70C80 60 90 80 95 75" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeOpacity="0.6"/>
              </svg>
            </div>
            {isOpen && <h1 className="text-xl font-bold">OceanTracker</h1>}
          </div>
          <button 
            onClick={toggleSidebar} 
            className="text-white focus:outline-none"
            aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              )}
            </svg>
          </button>
        </div>

        <nav className="mt-8">
          <div className="px-4 mb-4">
            {isOpen ? (
              <h2 className="text-xs uppercase tracking-wider text-blue-200">Main Menu</h2>
            ) : (
              <div className="h-4"></div>
            )}
          </div>
          <ul>
            {filteredNavItems.map((item) => (
              <li key={item.name} className="mb-2">
                <Link
                  to={item.path}
                  className={`flex items-center py-3 px-4 transition-colors duration-200 ${
                    location.pathname === item.path
                      ? 'bg-blue-700 text-white'
                      : 'text-blue-200 hover:bg-blue-700 hover:text-white'
                  } ${!isOpen ? 'justify-center' : ''}`}
                >
                  <span className="inline-flex">{renderIcon(item.icon)}</span>
                  {isOpen && <span className="ml-3">{item.name}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={`absolute bottom-0 w-full p-4 ${isOpen ? 'text-left' : 'text-center'}`}>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {userInfo.firstName.charAt(0)}
              </span>
            </div>
            {isOpen && (
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{userInfo.firstName} {userInfo.lastName}</p>
                <p className="text-xs text-blue-200">{userInfo.email}</p>
                <p className="text-xs text-blue-200 capitalize">Role: {userInfo.role}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 z-40 md:hidden ${isMobileOpen ? 'block' : 'hidden'}`}>
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75" 
          onClick={closeMobileMenu}
          aria-hidden="true"
        ></div>
        
        {/* Sidebar */}
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-blue-800 text-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={closeMobileMenu}
            >
              <span className="sr-only">Close sidebar</span>
              <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-4 flex items-center">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
              <svg className="w-6 h-6 text-blue-600" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 50C20 40 30 60 40 50C50 40 60 60 70 50C80 40 90 60 95 55" stroke="currentColor" strokeWidth="8" strokeLinecap="round"/>
                <path d="M10 70C20 60 30 80 40 70C50 60 60 80 70 70C80 60 90 80 95 75" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeOpacity="0.6"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold">OceanTracker</h1>
          </div>

          <nav className="mt-8">
            <div className="px-4 mb-4">
              <h2 className="text-xs uppercase tracking-wider text-blue-200">Main Menu</h2>
            </div>
            <ul>
              {filteredNavItems.map((item) => (
                <li key={item.name} className="mb-2">
                  <Link
                    to={item.path}
                    className={`flex items-center py-3 px-4 transition-colors duration-200 ${
                      location.pathname === item.path
                        ? 'bg-blue-700 text-white'
                        : 'text-blue-200 hover:bg-blue-700 hover:text-white'
                    }`}
                    onClick={closeMobileMenu}
                  >
                    <span className="inline-flex">{renderIcon(item.icon)}</span>
                    <span className="ml-3">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="absolute bottom-0 w-full p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {userInfo.firstName.charAt(0)}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{userInfo.firstName} {userInfo.lastName}</p>
                <p className="text-xs text-blue-200">{userInfo.email}</p>
                <p className="text-xs text-blue-200 capitalize">Role: {userInfo.role}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-shrink-0 w-14" aria-hidden="true">
          {/* Force sidebar to shrink to fit close icon */}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
