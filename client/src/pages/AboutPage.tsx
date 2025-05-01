import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaShip, FaAnchor, FaMapMarkedAlt, FaBox, FaUsers, 
  FaCogs, FaHistory, FaChartLine, FaPhone, FaEnvelope, 
  FaQuestion, FaGlobe, FaUserTie, FaCheck, FaArrowRight
} from 'react-icons/fa';

const AboutPage: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="absolute opacity-10 right-0 top-0 w-1/2 h-full">
          <svg className="w-full h-full" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="#FFFFFF" d="M42.7,-57.2C55.9,-51.8,67.9,-40.6,75.1,-26.2C82.3,-11.7,84.8,6,79.4,20.5C74,35,60.8,46.4,46.6,52.6C32.3,58.8,16.1,59.9,0.3,59.5C-15.6,59.1,-31.2,57.3,-43.4,49.7C-55.5,42.1,-64.2,28.8,-70.5,12.7C-76.7,-3.5,-80.6,-22.5,-73.4,-35.1C-66.2,-47.8,-48,-54.1,-32.5,-58.3C-17,-62.5,-4.2,-64.6,8.4,-65.3C21,-66,42,-62.6,42.7,-57.2Z" transform="translate(100 100)" />
          </svg>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl mb-6">
                Revolutionizing Ocean Shipping Tracking
              </h1>
              <p className="mt-6 text-xl max-w-3xl">
                OceanTracker provides real-time visibility and tracking for your ocean freight shipments, simplifying global logistics through technology.
              </p>
              <div className="mt-10 flex space-x-4">
                <Link
                  to="/tracking"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-blue-700 bg-white hover:bg-blue-50 transition duration-300"
                >
                  Start Tracking
                  <FaArrowRight className="ml-2" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-blue-700 transition duration-300"
                >
                  Contact Us
                </Link>
              </div>
            </div>
            <div className="mt-12 lg:mt-0 flex justify-center">
              <div className="relative w-full max-w-lg">
                <FaShip className="text-9xl text-white opacity-80" />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 w-full h-16 bg-white transform -skew-y-3 translate-y-8"></div>
      </div>

      {/* Our Mission */}
      <section className="py-16 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">Our Mission</h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
              Transparency in Every Shipment
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
              We're dedicated to bringing clarity, efficiency, and reliability to ocean freight management.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-500 hover:scale-105">
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-md mb-4">
                  <FaGlobe className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Global Reach</h3>
                <p className="mt-2 text-base text-gray-500">
                  Our platform connects shippers and carriers worldwide, providing seamless tracking across oceans and continents.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-500 hover:scale-105">
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-md mb-4">
                  <FaChartLine className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Data-Driven Insights</h3>
                <p className="mt-2 text-base text-gray-500">
                  Advanced analytics and reporting help optimize shipping routes, reduce costs, and improve delivery times.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-500 hover:scale-105">
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-md mb-4">
                  <FaCogs className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Cutting-Edge Technology</h3>
                <p className="mt-2 text-base text-gray-500">
                  Built on modern technology stack, our platform delivers real-time updates and integrates with existing logistics systems.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">How It Works</h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
              Simple, Powerful Tracking
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
              Our streamlined process makes tracking ocean shipments easier than ever before.
            </p>
          </div>

          <div className="relative">
            {/* Connection line */}
            <div className="hidden md:block absolute h-1 w-4/5 bg-blue-200 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0"></div>
            
            <div className="grid grid-cols-1 gap-10 md:grid-cols-4 relative z-10">
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-white border-2 border-blue-500 rounded-full mb-4">
                  <FaBox className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Register Shipment</h3>
                <p className="text-sm text-gray-500">
                  Create an account and register your shipment details in our system.
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-white border-2 border-blue-500 rounded-full mb-4">
                  <FaAnchor className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ship Your Goods</h3>
                <p className="text-sm text-gray-500">
                  Your cargo is loaded onto vessels and begins its journey across the ocean.
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-white border-2 border-blue-500 rounded-full mb-4">
                  <FaMapMarkedAlt className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Track in Real-Time</h3>
                <p className="text-sm text-gray-500">
                  Monitor your shipment's location, status updates, and estimated arrival times.
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-white border-2 border-blue-500 rounded-full mb-4">
                  <FaCheck className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Delivery & Confirmation</h3>
                <p className="text-sm text-gray-500">
                  Receive notifications upon delivery and confirm receipt of your shipment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">Our Team</h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
              The People Behind OceanTracker
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
              Our diverse team of shipping experts and technology innovators are dedicated to transforming the logistics industry.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg overflow-hidden shadow-lg transform transition duration-500 hover:shadow-2xl">
              <div className="relative h-64 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <div className="absolute w-32 h-32 bg-white rounded-full flex items-center justify-center">
                  <FaUserTie className="h-20 w-20 text-blue-600" />
                </div>
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-gray-900">Jason Chen</h3>
                <p className="text-blue-600 mb-4">Chief Executive Officer</p>
                <p className="text-gray-500 text-sm">
                  With over 15 years in international shipping, Jason brings valuable industry insights to lead our company forward.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg overflow-hidden shadow-lg transform transition duration-500 hover:shadow-2xl">
              <div className="relative h-64 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <div className="absolute w-32 h-32 bg-white rounded-full flex items-center justify-center">
                  <FaUserTie className="h-20 w-20 text-green-600" />
                </div>
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-gray-900">Maria Rodriguez</h3>
                <p className="text-green-600 mb-4">Chief Technology Officer</p>
                <p className="text-gray-500 text-sm">
                  Maria combines her expertise in logistics and software engineering to create innovative tracking solutions.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg overflow-hidden shadow-lg transform transition duration-500 hover:shadow-2xl">
              <div className="relative h-64 bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                <div className="absolute w-32 h-32 bg-white rounded-full flex items-center justify-center">
                  <FaUserTie className="h-20 w-20 text-purple-600" />
                </div>
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-gray-900">David Williams</h3>
                <p className="text-purple-600 mb-4">Head of Operations</p>
                <p className="text-gray-500 text-sm">
                  David's background in global supply chain management ensures our platform meets real-world operational needs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">FAQ</h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
              Frequently Asked Questions
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
              Find answers to common questions about our ocean freight tracking system.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {/* Question 1 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <button 
                className="w-full px-6 py-5 flex justify-between items-center text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:bg-blue-50 transition-all duration-200"
                onClick={(e) => {
                  const parent = e.currentTarget.parentElement;
                  const content = parent?.querySelector('.faq-content');
                  if (content) {
                    content.classList.toggle('hidden');
                    e.currentTarget.querySelector('.faq-plus')?.classList.toggle('hidden');
                    e.currentTarget.querySelector('.faq-minus')?.classList.toggle('hidden');
                  }
                }}
              >
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <FaQuestion className="text-blue-600" />
                  </div>
                  <span className="text-lg font-medium text-gray-800">How accurate is your tracking system?</span>
                </div>
                <div className="flex-shrink-0">
                  <svg className="faq-plus w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  <svg className="faq-minus hidden w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path>
                  </svg>
                </div>
              </button>
              <div className="faq-content hidden px-6 py-5 border-t border-gray-200 bg-gradient-to-r from-blue-50 to-white">
                <p className="text-gray-700">
                  Our tracking system provides real-time updates with accuracy typically within 2-4 hours. 
                  The precision depends on the carriers and ports we work with, but we maintain high standards
                  through our network of global partners and advanced technology integrations.
                </p>
              </div>
            </div>

            {/* Question 2 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <button 
                className="w-full px-6 py-5 flex justify-between items-center text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:bg-blue-50 transition-all duration-200"
                onClick={(e) => {
                  const parent = e.currentTarget.parentElement;
                  const content = parent?.querySelector('.faq-content');
                  if (content) {
                    content.classList.toggle('hidden');
                    e.currentTarget.querySelector('.faq-plus')?.classList.toggle('hidden');
                    e.currentTarget.querySelector('.faq-minus')?.classList.toggle('hidden');
                  }
                }}
              >
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <FaQuestion className="text-blue-600" />
                  </div>
                  <span className="text-lg font-medium text-gray-800">What types of shipments can I track?</span>
                </div>
                <div className="flex-shrink-0">
                  <svg className="faq-plus w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  <svg className="faq-minus hidden w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path>
                  </svg>
                </div>
              </button>
              <div className="faq-content hidden px-6 py-5 border-t border-gray-200 bg-gradient-to-r from-blue-50 to-white">
                <p className="text-gray-700">
                  OceanTracker supports full container loads (FCL), less than container loads (LCL), 
                  break bulk, and roll-on/roll-off (RoRo) shipments. Our system is designed to track 
                  any ocean freight regardless of size or container type.
                </p>
              </div>
            </div>

            {/* Question 3 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <button 
                className="w-full px-6 py-5 flex justify-between items-center text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:bg-blue-50 transition-all duration-200"
                onClick={(e) => {
                  const parent = e.currentTarget.parentElement;
                  const content = parent?.querySelector('.faq-content');
                  if (content) {
                    content.classList.toggle('hidden');
                    e.currentTarget.querySelector('.faq-plus')?.classList.toggle('hidden');
                    e.currentTarget.querySelector('.faq-minus')?.classList.toggle('hidden');
                  }
                }}
              >
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <FaQuestion className="text-blue-600" />
                  </div>
                  <span className="text-lg font-medium text-gray-800">Is my shipment data secure?</span>
                </div>
                <div className="flex-shrink-0">
                  <svg className="faq-plus w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  <svg className="faq-minus hidden w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path>
                  </svg>
                </div>
              </button>
              <div className="faq-content hidden px-6 py-5 border-t border-gray-200 bg-gradient-to-r from-blue-50 to-white">
                <p className="text-gray-700">
                  Absolutely. We employ bank-level encryption and security measures to protect your data. 
                  Our platform is compliant with industry standards for data protection, and we never share 
                  your information with unauthorized third parties.
                </p>
              </div>
            </div>

            {/* Question 4 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <button 
                className="w-full px-6 py-5 flex justify-between items-center text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:bg-blue-50 transition-all duration-200"
                onClick={(e) => {
                  const parent = e.currentTarget.parentElement;
                  const content = parent?.querySelector('.faq-content');
                  if (content) {
                    content.classList.toggle('hidden');
                    e.currentTarget.querySelector('.faq-plus')?.classList.toggle('hidden');
                    e.currentTarget.querySelector('.faq-minus')?.classList.toggle('hidden');
                  }
                }}
              >
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <FaQuestion className="text-blue-600" />
                  </div>
                  <span className="text-lg font-medium text-gray-800">Do I need to create an account to track a shipment?</span>
                </div>
                <div className="flex-shrink-0">
                  <svg className="faq-plus w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  <svg className="faq-minus hidden w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path>
                  </svg>
                </div>
              </button>
              <div className="faq-content hidden px-6 py-5 border-t border-gray-200 bg-gradient-to-r from-blue-50 to-white">
                <p className="text-gray-700">
                  Basic tracking is available without an account using your tracking number. However, 
                  creating a free account unlocks advanced features such as notifications, detailed 
                  history, and document management.
                </p>
              </div>
            </div>

            {/* More FAQs - Additional questions */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <button 
                className="w-full px-6 py-5 flex justify-between items-center text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:bg-blue-50 transition-all duration-200"
                onClick={(e) => {
                  const parent = e.currentTarget.parentElement;
                  const content = parent?.querySelector('.faq-content');
                  if (content) {
                    content.classList.toggle('hidden');
                    e.currentTarget.querySelector('.faq-plus')?.classList.toggle('hidden');
                    e.currentTarget.querySelector('.faq-minus')?.classList.toggle('hidden');
                  }
                }}
              >
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <FaQuestion className="text-blue-600" />
                  </div>
                  <span className="text-lg font-medium text-gray-800">How do I get support if I have issues?</span>
                </div>
                <div className="flex-shrink-0">
                  <svg className="faq-plus w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  <svg className="faq-minus hidden w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path>
                  </svg>
                </div>
              </button>
              <div className="faq-content hidden px-6 py-5 border-t border-gray-200 bg-gradient-to-r from-blue-50 to-white">
                <p className="text-gray-700">
                  We offer 24/7 customer support via email and live chat. Premium account holders also have 
                  access to dedicated phone support. Our support team typically responds to all inquiries 
                  within 2 hours during business hours.
                </p>
              </div>
            </div>
          </div>

          {/* CTA to ask more questions */}
          <div className="mt-10 text-center">
            <p className="text-gray-600">
              Don't see your question here? Contact our support team for assistance.
            </p>
            <Link
              to="/contact"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Ask a Question <FaArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Ready to get started with OceanTracker?
          </h2>
          <p className="mt-4 text-lg leading-6 max-w-2xl mx-auto">
            Join thousands of satisfied customers who've revolutionized their shipping logistics with our platform.
          </p>
          <div className="mt-8 flex justify-center space-x-4">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 transition duration-300"
            >
              Sign Up Free
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-5 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-blue-800 transition duration-300"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Footer info */}
      <section className="py-12 bg-gray-800 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Contact Information</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <FaPhone className="mr-3 text-blue-400" />
                  <span>+1 (555) 123-4567</span>
                </li>
                <li className="flex items-center">
                  <FaEnvelope className="mr-3 text-blue-400" />
                  <span>info@oceantracker.com</span>
                </li>
                <li className="flex items-start">
                  <FaMapMarkedAlt className="mr-3 text-blue-400 mt-1" />
                  <span>123 Shipping Lane, Port City<br />Ocean State, 12345<br />United States</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Business Hours</h3>
              <table className="w-full text-left">
                <tbody>
                  <tr>
                    <td className="py-1 pr-4 font-medium">Monday - Friday:</td>
                    <td>9:00 AM - 6:00 PM (EST)</td>
                  </tr>
                  <tr>
                    <td className="py-1 pr-4 font-medium">Saturday:</td>
                    <td>10:00 AM - 4:00 PM (EST)</td>
                  </tr>
                  <tr>
                    <td className="py-1 pr-4 font-medium">Sunday:</td>
                    <td>Closed</td>
                  </tr>
                </tbody>
              </table>
              <p className="mt-4">24/7 Shipment tracking always available through our online platform.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;