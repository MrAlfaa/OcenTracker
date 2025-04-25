import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Shipments from './pages/Shipments'
import Settings from './pages/Settings'
import Login from './pages/Login'
import './App.css'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          isMobileOpen={isMobileMenuOpen}
          toggleSidebar={toggleSidebar}
          closeMobileMenu={() => setIsMobileMenuOpen(false)}
        />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            toggleSidebar={toggleSidebar} 
            toggleMobileMenu={toggleMobileMenu}
            sidebarOpen={sidebarOpen}
          />
          
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/users" element={<Users />} />
              <Route path="/shipments" element={<Shipments />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  )
}

export default App