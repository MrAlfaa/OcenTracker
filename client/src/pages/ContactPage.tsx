import React, { useState } from 'react';
import { 
  FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, 
  FaTwitter, FaFacebook, FaLinkedin, FaInstagram,
  FaPaperPlane, FaUser, FaCommentAlt, FaCheckCircle, 
  FaExclamationTriangle, FaInfo,FaQuestion, FaSpinner
} from 'react-icons/fa';

// Validation utility functions
const validateEmail = (email: string) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

const validatePhone = (phone: string) => {
  // Basic phone validation, requires at least 10 digits
  return phone.replace(/\D/g, '').length >= 10;
};

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
}

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeOffice, setActiveOffice] = useState<'headquarters' | 'asia' | 'europe'>('headquarters');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Clear error when field is being edited
    if (errors[name as keyof FormErrors]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
    
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Validate phone
    if (formData.phone.trim() && !validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    // Validate subject
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    // Validate message
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 20) {
      newErrors.message = 'Message should be at least 20 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset states
    setError(null);
    setSuccess(false);
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    // Show submitting state
    setSubmitting(true);
    
    try {
      // Simulate API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate success
      setSuccess(true);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (err) {
      // In a real application, you would handle the error from the API
      setError('Something went wrong. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white">
      {/* Hero section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Get in Touch
            </h1>
            <p className="mt-6 text-xl max-w-3xl mx-auto text-white font-medium bg-blue-700 bg-opacity-50 p-4 rounded-lg shadow-lg inline-block">
              Have questions about our services? Need help with tracking your shipment? Our team is here to help you.
            </p>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <svg className="absolute right-0 top-0 transform translate-x-1/2 -translate-y-1/4 lg:translate-x-1/4 xl:-translate-y-1/2" width="404" height="784" fill="none" viewBox="0 0 404 784">
            <defs>
              <pattern id="pattern-1" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <rect x="0" y="0" width="4" height="4" className="text-blue-500" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="404" height="784" fill="url(#pattern-1)" />
          </svg>
          <svg className="absolute left-0 bottom-0 transform -translate-x-1/2 translate-y-1/4 lg:-translate-x-1/4 xl:translate-y-1/2" width="404" height="784" fill="none" viewBox="0 0 404 784">
            <defs>
              <pattern id="pattern-2" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <rect x="0" y="0" width="4" height="4" className="text-blue-500" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="404" height="784" fill="url(#pattern-2)" />
          </svg>
        </div>
        
        {/* Wave shape divider */}
        <div className="absolute bottom-0 w-full">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
            <path fill="#ffffff" fillOpacity="1" d="M0,192L48,181.3C96,171,192,149,288,154.7C384,160,480,192,576,186.7C672,181,768,139,864,138.7C960,139,1056,181,1152,181.3C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </div>
      
      {/* Contact information section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">Contact Information</h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
              How to Reach Us
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
              We're always ready to hear from you. Choose the most convenient way to get in touch.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Phone */}
            <div className="bg-white rounded-lg shadow-xl overflow-hidden transform transition duration-500 hover:scale-105">
              <div className="p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaPhone className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 text-center mb-2">Call Us</h3>
                <p className="mt-2 text-gray-600 text-center">
                  Our support team is available during business hours.
                </p>
                <div className="mt-4 text-center">
                  <a href="tel:+15551234567" className="text-blue-600 font-medium text-lg hover:text-blue-800 transition duration-300">
                    +1 (555) 123-4567
                  </a>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="bg-white rounded-lg shadow-xl overflow-hidden transform transition duration-500 hover:scale-105">
              <div className="p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaEnvelope className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 text-center mb-2">Email Us</h3>
                <p className="mt-2 text-gray-600 text-center">
                  Send us an email and we'll get back to you within 24 hours.
                </p>
                <div className="mt-4 text-center">
                  <a href="mailto:info@oceantracker.com" className="text-green-600 font-medium text-lg hover:text-green-800 transition duration-300">
                    info@oceantracker.com
                  </a>
                </div>
              </div>
            </div>

            {/* Visit */}
            <div className="bg-white rounded-lg shadow-xl overflow-hidden transform transition duration-500 hover:scale-105">
              <div className="p-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaMapMarkerAlt className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 text-center mb-2">Visit Our Office</h3>
                <p className="mt-2 text-gray-600 text-center">
                  Come visit our headquarters in person.
                </p>
                <div className="mt-4 text-center">
                  <address className="not-italic text-purple-600 font-medium hover:text-purple-800 transition duration-300">
                    123 Shipping Lane<br />
                    Port City, Ocean State 12345
                  </address>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* World offices section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">Global Presence</h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
              Our Offices Worldwide
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
              With locations across the globe, we're always nearby to support your shipping needs.
            </p>
          </div>

          {/* Office tabs */}
          <div className="flex flex-wrap justify-center mb-8">
            <button
              onClick={() => setActiveOffice('headquarters')}
              className={`m-2 px-6 py-3 rounded-full text-sm font-medium ${
                activeOffice === 'headquarters'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } transition duration-300`}
            >
              Global Headquarters
            </button>
            <button
              onClick={() => setActiveOffice('asia')}
              className={`m-2 px-6 py-3 rounded-full text-sm font-medium ${
                activeOffice === 'asia'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } transition duration-300`}
            >
              Asia Pacific
            </button>
            <button
              onClick={() => setActiveOffice('europe')}
              className={`m-2 px-6 py-3 rounded-full text-sm font-medium ${
                activeOffice === 'europe'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } transition duration-300`}
            >
              European Office
            </button>
          </div>

          {/* Office details */}
          <div className="bg-white shadow-xl rounded-lg overflow-hidden">
            {activeOffice === 'headquarters' && (
              <div className="md:grid md:grid-cols-2">
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Global Headquarters
                  </h3>
                  <div className="space-y-4 text-gray-700">
                    <div className="flex items-start">
                      <FaMapMarkerAlt className="mt-1 mr-3 text-blue-600 flex-shrink-0" />
                      <p>
                        123 Shipping Lane<br />
                        Port City, Ocean State 12345<br />
                        United States
                      </p>
                    </div>
                    <div className="flex items-center">
                      <FaPhone className="mr-3 text-blue-600 flex-shrink-0" />
                      <p>+1 (555) 123-4567</p>
                    </div>
                    <div className="flex items-center">
                      <FaEnvelope className="mr-3 text-blue-600 flex-shrink-0" />
                      <p>headquarters@oceantracker.com</p>
                    </div>
                    <div className="flex items-start">
                      <FaClock className="mt-1 mr-3 text-blue-600 flex-shrink-0" />
                      <div>
                        <p>Monday - Friday: 9:00 AM - 6:00 PM EST</p>
                        <p>Saturday: 10:00 AM - 2:00 PM EST</p>
                        <p>Sunday: Closed</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="h-64 md:h-auto">
                  {/* Google Maps iframe for New York City */}
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.15830869428!2d-74.11976397304906!3d40.69766374874431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2sus!4v1674309525084!5m2!1sen!2sus" 
                    className="w-full h-full border-0"
                    style={{ minHeight: "300px" }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="US Headquarters Location"
                  ></iframe>
                </div>
              </div>
            )}

            {activeOffice === 'asia' && (
              <div className="md:grid md:grid-cols-2">
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Asia Pacific Office
                  </h3>
                  <div className="space-y-4 text-gray-700">
                    <div className="flex items-start">
                      <FaMapMarkerAlt className="mt-1 mr-3 text-blue-600 flex-shrink-0" />
                      <p>
                        888 Harbor Road<br />
                        Singapore, 099888<br />
                        Singapore
                      </p>
                    </div>
                    <div className="flex items-center">
                      <FaPhone className="mr-3 text-blue-600 flex-shrink-0" />
                      <p>+65 6123 4567</p>
                    </div>
                    <div className="flex items-center">
                      <FaEnvelope className="mr-3 text-blue-600 flex-shrink-0" />
                      <p>asia@oceantracker.com</p>
                    </div>
                    <div className="flex items-start">
                      <FaClock className="mt-1 mr-3 text-blue-600 flex-shrink-0" />
                      <div>
                        <p>Monday - Friday: 9:00 AM - 6:00 PM SGT</p>
                        <p>Saturday: 10:00 AM - 2:00 PM SGT</p>
                        <p>Sunday: Closed</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="h-64 md:h-auto">
                  {/* Google Maps iframe for Singapore */}
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d255281.19036281522!2d103.70416557377856!3d1.3139699816113892!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da11238a8b9375%3A0x887869cf52abf5c4!2sSingapore!5e0!3m2!1sen!2ssg!4v1674309709661!5m2!1sen!2ssg" 
                    className="w-full h-full border-0"
                    style={{ minHeight: "300px" }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Singapore Office Location"
                  ></iframe>
                </div>
              </div>
            )}

            {activeOffice === 'europe' && (
              <div className="md:grid md:grid-cols-2">
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    European Office
                  </h3>
                  <div className="space-y-4 text-gray-700">
                    <div className="flex items-start">
                      <FaMapMarkerAlt className="mt-1 mr-3 text-blue-600 flex-shrink-0" />
                      <p>
                        42 Port Avenue<br />
                        Rotterdam, 3001 AB<br />
                        Netherlands
                      </p>
                    </div>
                    <div className="flex items-center">
                      <FaPhone className="mr-3 text-blue-600 flex-shrink-0" />
                      <p>+31 10 123 4567</p>
                    </div>
                    <div className="flex items-center">
                      <FaEnvelope className="mr-3 text-blue-600 flex-shrink-0" />
                      <p>europe@oceantracker.com</p>
                    </div>
                    <div className="flex items-start">
                      <FaClock className="mt-1 mr-3 text-blue-600 flex-shrink-0" />
                      <div>
                        <p>Monday - Friday: 9:00 AM - 6:00 PM CET</p>
                        <p>Saturday: 10:00 AM - 2:00 PM CET</p>
                        <p>Sunday: Closed</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="h-64 md:h-auto">
                  {/* Google Maps iframe for Rotterdam */}
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d78950.32524078912!2d4.4140328246211965!3d51.92358529533407!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c5b7605f54c47d%3A0x5229bbac955e4b85!2sRotterdam%2C%20Netherlands!5e0!3m2!1sen!2sus!4v1674309838709!5m2!1sen!2sus" 
                    className="w-full h-full border-0"
                    style={{ minHeight: "300px" }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Rotterdam Office Location"
                  ></iframe>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Contact form section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-xl overflow-hidden">
            <div className="px-6 py-12 max-w-7xl mx-auto sm:px-10 lg:px-16 lg:py-16">
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div className="md:pr-8 md:border-r md:border-blue-400">
                  <div className="text-white">
                    <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                      Send Us a Message
                    </h2>
                    <p className="mt-3 text-lg">
                      Need information about our services or have a specific question? Fill out the form and we'll get back to you as soon as possible.
                    </p>
                    
                    <dl className="mt-8 space-y-6">
                      <dt className="sr-only">Response time</dt>
                      <dd className="flex text-base">
                        <FaInfo className="flex-shrink-0 h-6 w-6 text-blue-200" />
                        <span className="ml-3">
                          Typically, we respond to inquiries within 24 hours during business days.
                        </span>
                      </dd>
                      
                      <dt className="sr-only">Customer support</dt>
                      <dd className="flex text-base">
                        <FaCheckCircle className="flex-shrink-0 h-6 w-6 text-blue-200" />
                        <span className="ml-3">
                          For urgent matters, please call our customer support line directly.
                        </span>
                      </dd>
                    </dl>
                    
                    <div className="mt-8">
                      <h3 className="text-lg font-medium text-blue-100">Follow Us</h3>
                      <div className="flex space-x-6 mt-4">
                        <a href="#" className="text-blue-200 hover:text-white transition duration-300">
                          <span className="sr-only">Twitter</span>
                          <FaTwitter className="h-6 w-6" />
                        </a>
                        <a href="#" className="text-blue-200 hover:text-white transition duration-300">
                          <span className="sr-only">Facebook</span>
                          <FaFacebook className="h-6 w-6" />
                        </a>
                        <a href="#" className="text-blue-200 hover:text-white transition duration-300">
                          <span className="sr-only">LinkedIn</span>
                          <FaLinkedin className="h-6 w-6" />
                        </a>
                        <a href="#" className="text-blue-200 hover:text-white transition duration-300">
                          <span className="sr-only">Instagram</span>
                          <FaInstagram className="h-6 w-6" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-12 sm:mt-16 md:mt-0">
                  {success ? (
                    <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                      <FaCheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                      <h3 className="text-2xl font-medium text-gray-900 mb-2">Thank You!</h3>
                      <p className="text-gray-600">
                        Your message has been sent successfully. We'll get back to you as soon as possible.
                      </p>
                      <button
                        onClick={() => setSuccess(false)}
                        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300"
                      >
                        Send Another Message
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
                      {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
                          <div className="flex">
                            <FaExclamationTriangle className="h-5 w-5 text-red-500 mr-3" />
                            <span>{error}</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
                        {/* Name field */}
                        <div className={`sm:col-span-2 ${errors.name ? 'has-error' : ''}`}>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FaUser className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              id="name"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              className={`py-3 pl-10 block w-full focus:ring-blue-500 focus:border-blue-500 rounded-md ${
                                errors.name ? 'border-red-300' : 'border-gray-300'
                              }`}
                              placeholder="John Doe"
                            />
                          </div>
                          {errors.name && (
                            <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                          )}
                        </div>
                        
                        {/* Email field */}
                        <div className={errors.email ? 'has-error' : ''}>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email <span className="text-red-500">*</span>
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FaEnvelope className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="email"
                              id="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              className={`py-3 pl-10 block w-full focus:ring-blue-500 focus:border-blue-500 rounded-md ${
                                errors.email ? 'border-red-300' : 'border-gray-300'
                              }`}
                              placeholder="your@email.com"
                            />
                          </div>
                          {errors.email && (
                            <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                          )}
                        </div>
                        
                        {/* Phone field */}
                        <div className={errors.phone ? 'has-error' : ''}>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                            Phone Number
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FaPhone className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="tel"
                              id="phone"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              className={`py-3 pl-10 block w-full focus:ring-blue-500 focus:border-blue-500 rounded-md ${
                                errors.phone ? 'border-red-300' : 'border-gray-300'
                              }`}
                              placeholder="+1 (555) 123-4567"
                            />
                          </div>
                          {errors.phone && (
                            <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
                          )}
                        </div>
                        
                        {/* Subject field */}
                        <div className="sm:col-span-2">
                          <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                            Subject <span className="text-red-500">*</span>
                          </label>
                          <div className="mt-1">
                            <select
                              id="subject"
                              name="subject"
                              value={formData.subject}
                              onChange={handleChange}
                              className={`py-3 block w-full focus:ring-blue-500 focus:border-blue-500 rounded-md ${
                                errors.subject ? 'border-red-300' : 'border-gray-300'
                              }`}
                            >
                              <option value="">Please select a subject</option>
                              <option value="General Inquiry">General Inquiry</option>
                              <option value="Shipment Tracking">Shipment Tracking</option>
                              <option value="Account Issues">Account Issues</option>
                              <option value="Service Request">Service Request</option>
                              <option value="Feedback">Feedback</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                          {errors.subject && (
                            <p className="mt-2 text-sm text-red-600">{errors.subject}</p>
                          )}
                        </div>
                        
                        {/* Message field */}
                        <div className="sm:col-span-2">
                          <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                            Message <span className="text-red-500">*</span>
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute top-3 left-3 flex items-center pointer-events-none">
                              <FaCommentAlt className="h-5 w-5 text-gray-400" />
                            </div>
                            <textarea
                              id="message"
                              name="message"
                              rows={4}
                              value={formData.message}
                              onChange={handleChange}
                              className={`py-3 pl-10 block w-full focus:ring-blue-500 focus:border-blue-500 rounded-md ${
                                errors.message ? 'border-red-300' : 'border-gray-300'
                              }`}
                              placeholder="Please describe how we can help you..."
                            ></textarea>
                          </div>
                          {errors.message && (
                            <p className="mt-2 text-sm text-red-600">{errors.message}</p>
                          )}
                        </div>
                        
                        {/* Form actions */}
                        <div className="sm:col-span-2">
                          <div className="flex justify-end">
                            <button
                              type="submit"
                              disabled={submitting}
                              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition duration-300"
                            >
                              {submitting ? (
                                <>
                                  <FaSpinner className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                  Sending...
                                </>
                              ) : (
                                <>
                                  <FaPaperPlane className="-ml-1 mr-2 h-5 w-5" />
                                  Send Message
                                </>
                              )}
                            </button>
                          </div>
                          <p className="mt-3 text-sm text-gray-500">
                            By submitting this form, you agree to our <a href="#" className="text-blue-600 hover:text-blue-800">Privacy Policy</a>.
                          </p>
                        </div>
                      </div>
                    </form>
                  )}
                </div>
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
              Quick answers to common questions about contacting our support team.
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
                  <span className="text-lg font-medium text-gray-800">What is the best way to contact customer support?</span>
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
                  For the fastest response, please use our contact form above or call our support line directly. 
                  For non-urgent matters, you can also email us at support@oceantracker.com, and we'll respond within 24 hours during business days.
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
                  <span className="text-lg font-medium text-gray-800">What information do I need when contacting about a shipment?</span>
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
                  Please have your tracking number ready when contacting us about a specific shipment. 
                  Additional helpful information includes your account email, shipping origin and destination, 
                  and the date when the shipment was created or last updated.
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
                  <span className="text-lg font-medium text-gray-800">How quickly will I get a response?</span>
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
                  Phone calls are answered immediately during business hours. Email and form submissions typically 
                  receive a response within 24 hours on business days. For urgent matters after hours, 
                  premium account holders have access to our emergency support line.
                </p>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="mt-12 text-center">
            <h3 className="text-xl font-medium text-gray-900 mb-6">Quick Links</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/tracking" className="inline-flex items-center px-5 py-2 border border-blue-600 text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 transition duration-300">
                Track Shipment
              </a>
              <a href="/services" className="inline-flex items-center px-5 py-2 border border-blue-600 text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 transition duration-300">
                Our Services
              </a>
              <a href="/about" className="inline-flex items-center px-5 py-2 border border-blue-600 text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 transition duration-300">
                About Us
              </a>
              <a href="/register" className="inline-flex items-center px-5 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition duration-300">
                Create Account
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;