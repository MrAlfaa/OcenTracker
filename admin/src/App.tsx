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
import './App.css'

// API URL constant
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Create a ProtectedRoute component
const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const token = localStorage.getItem('token')
  if (!token) {
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

  useEffect(() => {
    const checkSuperAdmin = async () => {
      try {
        // Fixed API URL reference
        const response = await axios.get(`${API_URL}/api/auth/check-super-admin`)
        console.log('Super admin check response:', response.data)
        setSuperAdminExists(response.data.exists)
        
        // Check if user is authenticated
        const token = localStorage.getItem('token')
        setAuthenticated(!!token)
        
        setLoading(false)
      } catch (error) {
        console.error('Error checking super admin:', error)
        setLoading(false)
      }
    }

    checkSuperAdmin()
  }, [])

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
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
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
          </ProtectedRoute>
        } />
        
        <Route path="/users" element={
          <ProtectedRoute>
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
          </ProtectedRoute>
        } />
        
        <Route path="/shipments" element={
          <ProtectedRoute>
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
          </ProtectedRoute>
        } />
        
        <Route path="/settings" element={
          <ProtectedRoute>
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
          </ProtectedRoute>
        } />
        
        {/* Catch all route - redirect to login or admin initializer based on whether super admin exists */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App