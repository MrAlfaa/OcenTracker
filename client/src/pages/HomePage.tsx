import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="flex flex-col">
      {/* Hero Banner Section */}
      <section className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
        <div className="absolute inset-0 opacity-20 bg-[url('/images/ocean-cargo.jpg')] bg-cover bg-center"></div>
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="md:w-2/3">
            <h1 className="text-5xl font-bold mb-4">Global Cargo Tracking Solutions</h1>
            <p className="text-xl mb-8">
              Track your ocean shipments in real-time with precision and reliability. 
              Get instant updates and comprehensive insights about your cargo's journey.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/tracking" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md font-medium transition-colors">
                Track Shipment
              </Link>
              <Link to="/services" className="bg-transparent border-2 border-white hover:bg-white hover:text-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors">
                Our Services
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Tracking Section */}
      <section className="bg-white py-12 shadow-md">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-semibold text-blue-700 mb-4">Quick Shipment Tracking</h2>
            <div className="flex flex-col md:flex-row gap-2">
              <input 
                type="text" 
                placeholder="Enter tracking number" 
                className="flex-grow px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                type="button"
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
                aria-label="Track shipment"
              >
                Track Now
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">Enter your shipment ID to get real-time status updates</p>
          </div>
        </div>
      </section>
      
      {/* Key Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
        <div className="text-center mb-12">
  <h2 className="text-3xl font-bold mb-4 text-blue-700">Advanced Maritime Tracking Solutions</h2>
  <p className="text-gray-700 max-w-3xl mx-auto font-medium">Our comprehensive platform offers cutting-edge features designed specifically for marine logistics and ocean cargo tracking.</p>
</div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Real-time Tracking */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="bg-blue-600 h-2"></div>
              <div className="p-6">
                <div className="bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-blue-600 mb-3 text-center">Global Vessel Tracking</h3>
                <p className="text-gray-600 text-center">Monitor your shipments across all major shipping routes with precise GPS location data updated every 15 minutes.</p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Real-time vessel position updates
                  </li>
                  <li className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Global coverage on all shipping lanes
                  </li>
                  <li className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Satellite AIS tracking technology
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Data Visualization */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="bg-indigo-600 h-2"></div>
              <div className="p-6">
                <div className="bg-indigo-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-indigo-600 mb-3 text-center">Advanced Data Visualization</h3>
                <p className="text-gray-600 text-center">Comprehensive dashboards and interactive maps to visualize your shipments and analyze logistics performance.</p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Interactive global shipping maps
                  </li>
                  <li className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Performance analytics dashboards
                  </li>
                  <li className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Customizable reporting tools
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Marine Monitoring */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="bg-teal-600 h-2"></div>
              <div className="p-6">
                <div className="bg-teal-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-teal-600 mb-3 text-center">Marine Life Monitoring</h3>
                <p className="text-gray-600 text-center">Integrated systems to track marine life activity and ensure your shipping routes minimize environmental impact.</p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Whale migration path alerts
                  </li>
                  <li className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Protected marine area mapping
                  </li>
                  <li className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Environmental impact assessments
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Weather Integration */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="bg-cyan-600 h-2"></div>
              <div className="p-6">
                <div className="bg-cyan-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-cyan-600 mb-3 text-center">Advanced Weather Integration</h3>
                <p className="text-gray-600 text-center">Real-time weather data and forecasts to anticipate delays and optimize routes for safer and more efficient shipping.</p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Storm tracking and alerts
                  </li>
                  <li className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Sea condition forecasts
                  </li>
                  <li className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Route optimization based on weather
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-10">
            <Link to="/features" className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800">
              Learn more about our features
              <svg className="w-5 h-5 ml-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Live Data Preview Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
        <div className="text-center mb-12">
  <h2 className="text-3xl font-bold mb-4 text-blue-700">Live Shipment Tracking</h2>
  <p className="text-gray-700 max-w-3xl mx-auto font-medium">
    Experience real-time visibility of global shipping data with our interactive tracking system. 
    Monitor vessels, track shipments, and analyze maritime activities across all major shipping routes.
  </p>
</div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Map Preview */}
            <div className="lg:col-span-2 rounded-lg overflow-hidden shadow-lg">
              <div className="relative bg-blue-50 h-96">
                {/* This would be replaced with an actual interactive map component */}
                <div className="absolute inset-0 bg-[url('/images/world-map.png')] bg-cover bg-center opacity-70"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-900/10"></div>
                
                {/* Sample tracking points */}
                <div className="absolute h-3 w-3 bg-red-500 rounded-full animate-ping" style={{ top: '35%', left: '20%' }}></div>
                <div className="absolute h-2 w-2 bg-red-500 rounded-full" style={{ top: '35%', left: '20%' }}></div>
                
                <div className="absolute h-3 w-3 bg-green-500 rounded-full animate-ping" style={{ top: '42%', left: '60%' }}></div>
                <div className="absolute h-2 w-2 bg-green-500 rounded-full" style={{ top: '42%', left: '60%' }}></div>
                
                <div className="absolute h-3 w-3 bg-yellow-500 rounded-full animate-ping" style={{ top: '28%', left: '45%' }}></div>
                <div className="absolute h-2 w-2 bg-yellow-500 rounded-full" style={{ top: '28%', left: '45%' }}></div>
                
                <div className="absolute h-3 w-3 bg-blue-500 rounded-full animate-ping" style={{ top: '45%', left: '80%' }}></div>
                <div className="absolute h-2 w-2 bg-blue-500 rounded-full" style={{ top: '45%', left: '80%' }}></div>
                
                {/* Sample route lines */}
                <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
                  <path d="M80,140 C150,120 250,160 320,170" stroke="#3b82f6" strokeWidth="2" fill="none" strokeDasharray="5,5" />
                  <path d="M200,110 C250,130 300,120 350,105" stroke="#10b981" strokeWidth="2" fill="none" strokeDasharray="5,5" />
                </svg>
                
                {/* Controls overlay */}
                <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-2 rounded shadow-md">
                  <div className="flex space-x-2">
                    <button 
                      type="button" 
                      className="p-1 hover:bg-blue-100 rounded"
                      aria-label="Zoom in"
                      title="Zoom in"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button 
                      type="button" 
                      className="p-1 hover:bg-blue-100 rounded"
                      aria-label="Zoom out"
                      title="Zoom out"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button 
                      type="button" 
                      className="p-1 hover:bg-blue-100 rounded"
                      aria-label="Draw route"
                      title="Draw route"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Legend */}
                <div className="absolute bottom-3 left-3 bg-white/80 backdrop-blur-sm p-2 rounded shadow-md text-sm">
                  <div className="flex items-center mb-1">
                    <span className="h-2 w-2 bg-red-500 rounded-full mr-2"></span>
                    <span className="text-gray-700">In Transit</span>
                  </div>
                  <div className="flex items-center mb-1">
                    <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                    <span className="text-gray-700">Delivered</span>
                  </div>
                  <div className="flex items-center mb-1">
                    <span className="h-2 w-2 bg-yellow-500 rounded-full mr-2"></span>
                    <span className="text-gray-700">Delayed</span>
                  </div>
                  <div className="flex items-center">
                    <span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>
                    <span className="text-gray-700">Loading</span>
                  </div>
                </div>
                
                {/* Demo banner */}
                <div className="absolute top-5 left-0 bg-blue-600 text-white px-4 py-1 rounded-r-md font-medium">
                  Live Demo
                </div>
              </div>
              
              <div className="bg-white p-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Last updated: 2 minutes ago</span>
                  <Link to="/dashboard" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View Full Map
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Stats & Metrics */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-800">Global Tracking Metrics</h3>
                  <p className="text-sm text-gray-500">Real-time statistics from our tracking network</p>
                </div>
                
                <div className="p-6 flex-grow">
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-600 font-medium">Active Vessels</span>
                        <span className="text-blue-600 font-semibold">2,487</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">78% of tracked fleet currently active</p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-600 font-medium">Ports Monitored</span>
                        <span className="text-indigo-600 font-semibold">342</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Coverage in 92% of major global ports</p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-600 font-medium">Shipments Tracked</span>
                        <span className="text-teal-600 font-semibold">12,843</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-teal-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">65% increase in tracked shipments this quarter</p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-600 font-medium">Weather Alerts</span>
                        <span className="text-orange-600 font-semibold">37</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-orange-600 h-2 rounded-full" style={{ width: '12%' }}></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Active alerts affecting 12% of routes</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 bg-gray-50 rounded-b-lg">
                  <Link 
                    to="/dashboard" 
                    className="block w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-center rounded-md transition-colors font-medium"
                    role="button"
                    aria-label="Access full dashboard"
                  >
                    Access Full Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Services Section */}
      <section className="bg-gray-50 py-16">
  <div className="container mx-auto px-4">
    <h2 className="text-3xl font-bold text-center mb-12 text-blue-700">Our Services</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-blue-600 mb-3">Ocean Freight</h3>
              <p className="text-gray-600 mb-4">Reliable and cost-effective ocean freight solutions for your global shipping needs.</p>
              <Link to="/services" className="text-blue-600 font-medium hover:text-blue-800">Learn more →</Link>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-blue-600 mb-3">Real-time Tracking</h3>
              <p className="text-gray-600 mb-4">Stay updated with real-time information about your shipment's location and status.</p>
              <Link to="/services" className="text-blue-600 font-medium hover:text-blue-800">Learn more →</Link>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-blue-600 mb-3">Customs Clearance</h3>
              <p className="text-gray-600 mb-4">Expert assistance with customs documentation and regulatory compliance.</p>
              <Link to="/services" className="text-blue-600 font-medium hover:text-blue-800">Learn more →</Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="bg-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">5000+</div>
              <div className="text-xl">Shipments Tracked</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">150+</div>
              <div className="text-xl">Countries Covered</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-xl">Customer Satisfaction</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-xl">Support Available</div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-blue-50 rounded-lg p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold text-blue-700 mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {isAuthenticated 
                ? `Welcome back, ${user?.firstName}! Continue tracking your global shipments with OceanTracker.`
                : 'Join thousands of businesses that trust OceanTracker for their global shipping needs.'}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md font-medium transition-colors"
                    role="button"
                    aria-label="Go to dashboard"
                  >
                    Go to Dashboard
                  </Link>
                  <Link 
                    to="/tracking" 
                    className="bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-md font-medium transition-colors"
                    role="button"
                    aria-label="Track shipment"
                  >
                    Track Shipment
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to="/register" 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md font-medium transition-colors"
                    role="button"
                    aria-label="Create free account"
                  >
                    Create Free Account
                  </Link>
                  <Link 
                    to="/contact" 
                    className="bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-md font-medium transition-colors"
                    role="button"
                    aria-label="Contact sales team"
                  >
                    Contact Sales
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
