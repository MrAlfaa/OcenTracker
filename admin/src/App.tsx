import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import axios from 'axios'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Shipments from './pages/Shipments'
import Settings from './pages/Settings'
import Login from './pages/Login'
import AdminInitializer from './pages/AdminInitializer'
import RoleCreation from './pages/RoleCreation'
import Drivers from './pages/Drivers'
import Reports from './pages/Reports'
import './App.css'

// API URL constant
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Create a role-based protected route component
const RoleProtectedRoute = ({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactElement,
  allowedRoles: string[]
}) => {
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Get user role from token
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]))
        setUserRole(decoded.role)
      } catch (error) {
        console.error('Error decoding token:', error)
      }
    }
    setLoading(false)
  }, [])
  
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }
  
  // Check if no token
  if (!userRole) {
    return <Navigate to="/login" replace />
  }
  
  // Check if user has permission to access this route
  if (!allowedRoles.includes(userRole)) {
    // Redirect drivers to the drivers page
    if (userRole === 'driver') {
      return <Navigate to="/drivers" replace />
    }
    // Redirect others to login
    return <Navigate to="/login" replace />
  }
  
  return children
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [superAdminExists, setSuperAdminExists] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)

  // Check if super admin exists when the app loads
  useEffect(() => {
    const checkSuperAdmin = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/auth/check-super-admin`)
        console.log('Super admin check response:', response.data)
        setSuperAdminExists(response.data.exists)
        setLoading(false)
      } catch (error) {
        console.error('Error checking super admin:', error)
        setLoading(false)
      }
    }

    checkSuperAdmin()
    
    // Clear any existing token when the app loads
    localStorage.removeItem('token')
    setAuthenticated(false)
  }, [])

  // This function will be passed to the Login component
  const handleLoginSuccess = () => {
    setAuthenticated(true)
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }
  
  // If no super admin exists, redirect to admin initializer
  if (!superAdminExists) {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<AdminInitializer />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    )
  }

  // Otherwise, show normal application with login
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        
        <Route path="/" element={
          <RoleProtectedRoute allowedRoles={['admin', 'superAdmin']}>
            <div className="flex h-screen bg-gray-100">
              <Sidebar 
                isOpen={sidebarOpen} 
                isMobileOpen={isMobileMenuOpen}
                toggleSidebar={toggleSidebar}
                closeMobileMenu={() => setIsMobileMenuOpen(false)}
              />
              <div className="flex-1 flex flex-col overflow-hidden">
                <Header 
                  toggleSidebar={toggleSidebar} 
                  toggleMobileMenu={toggleMobileMenu}
                  sidebarOpen={sidebarOpen}
                />
                
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4">
                  <Dashboard />
                </main>
              </div>
            </div>
          </RoleProtectedRoute>
        } />
        
        <Route path="/users" element={
          <RoleProtectedRoute allowedRoles={['admin', 'superAdmin']}>
            <div className="flex h-screen bg-gray-100">
              <Sidebar 
                isOpen={sidebarOpen} 
                isMobileOpen={isMobileMenuOpen}
                toggleSidebar={toggleSidebar}
                closeMobileMenu={() => setIsMobileMenuOpen(false)}
              />
              <div className="flex-1 flex flex-col overflow-hidden">
                <Header 
                  toggleSidebar={toggleSidebar} 
                  toggleMobileMenu={toggleMobileMenu}
                  sidebarOpen={sidebarOpen}
                />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4">
                  <Users />
                </main>
              </div>
            </div>
          </RoleProtectedRoute>
        } />
        
        <Route path="/shipments" element={
          <RoleProtectedRoute allowedRoles={['admin', 'superAdmin']}>
            <div className="flex h-screen bg-gray-100">
              <Sidebar 
                isOpen={sidebarOpen} 
                isMobileOpen={isMobileMenuOpen}
                toggleSidebar={toggleSidebar}
                closeMobileMenu={() => setIsMobileMenuOpen(false)}
              />
              <div className="flex-1 flex flex-col overflow-hidden">
                <Header 
                  toggleSidebar={toggleSidebar} 
                  toggleMobileMenu={toggleMobileMenu}
                  sidebarOpen={sidebarOpen}
                />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4">
                  <Shipments />
                </main>
              </div>
            </div>
          </RoleProtectedRoute>
        } />
        
        <Route path="/settings" element={
          <RoleProtectedRoute allowedRoles={['admin', 'superAdmin']}>
            <div className="flex h-screen bg-gray-100">
              <Sidebar 
                isOpen={sidebarOpen} 
                isMobileOpen={isMobileMenuOpen}
                toggleSidebar={toggleSidebar}
                closeMobileMenu={() => setIsMobileMenuOpen(false)}
              />
              <div className="flex-1 flex flex-col overflow-hidden">
                <Header 
                  toggleSidebar={toggleSidebar} 
                  toggleMobileMenu={toggleMobileMenu}
                  sidebarOpen={sidebarOpen}
                />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4">
                  <Settings />
                </main>
              </div>
            </div>
          </RoleProtectedRoute>
        } />
        
        <Route path="/role-creation" element={
          <RoleProtectedRoute allowedRoles={['superAdmin']}>
            <div className="flex h-screen bg-gray-100">
              <Sidebar 
                isOpen={sidebarOpen} 
                isMobileOpen={isMobileMenuOpen}
                toggleSidebar={toggleSidebar}
                closeMobileMenu={() => setIsMobileMenuOpen(false)}
              />
              <div className="flex-1 flex flex-col overflow-hidden">
                <Header 
                  toggleSidebar={toggleSidebar} 
                  toggleMobileMenu={toggleMobileMenu}
                  sidebarOpen={sidebarOpen}
                />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4">
                  <RoleCreation />
                </main>
              </div>
            </div>
          </RoleProtectedRoute>
        } />
        
        <Route path="/drivers" element={
          <RoleProtectedRoute allowedRoles={['admin', 'superAdmin', 'driver']}>
            <div className="flex h-screen bg-gray-100">
              <Sidebar 
                isOpen={sidebarOpen} 
                isMobileOpen={isMobileMenuOpen}
                toggleSidebar={toggleSidebar}
                closeMobileMenu={() => setIsMobileMenuOpen(false)}
              />
              <div className="flex-1 flex flex-col overflow-hidden">
                <Header 
                  toggleSidebar={toggleSidebar} 
                  toggleMobileMenu={toggleMobileMenu}
                  sidebarOpen={sidebarOpen}
                />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4">
                  <Drivers />
                </main>
              </div>
            </div>
          </RoleProtectedRoute>
        } />
        <Route path="/reports" element={
          <RoleProtectedRoute allowedRoles={['admin', 'superAdmin']}>
            <div className="flex h-screen bg-gray-100">
              <Sidebar 
                isOpen={sidebarOpen} 
                isMobileOpen={isMobileMenuOpen}
                toggleSidebar={toggleSidebar}
                closeMobileMenu={() => setIsMobileMenuOpen(false)}
              />
              <div className="flex-1 flex flex-col overflow-hidden">
                <Header 
                  toggleSidebar={toggleSidebar} 
                  toggleMobileMenu={toggleMobileMenu}
                  sidebarOpen={sidebarOpen}
                />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4">
                  <Reports />
                </main>
              </div>
            </div>
          </RoleProtectedRoute>
        } />
        
        {/* Catch all route - redirect to login or admin initializer based on whether super admin exists */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App
