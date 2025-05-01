import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaLocationArrow, FaMapMarkedAlt, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

// Add these type declarations at the top of the file, before your component
declare global {
  interface Window {
    google: any;
  }
}

// Branch coordinates mapping (these would normally come from a backend API)
const BRANCH_COORDINATES: {[key: string]: {lat: number, lng: number}} = {
  'Colombo': { lat: 6.9271, lng: 79.8612 },
  'Kandy': { lat: 7.2906, lng: 80.6337 },
  'Galle': { lat: 6.0535, lng: 80.2210 },
  'Jaffna': { lat: 9.6615, lng: 80.0255 },
  'Batticaloa': { lat: 7.7173, lng: 81.7009 },
  'Negombo': { lat: 7.2081, lng: 79.8384 },
  'Matara': { lat: 5.9549, lng: 80.5550 },
  'Anuradhapura': { lat: 8.3114, lng: 80.4037 },
  'Ratnapura': { lat: 6.7056, lng: 80.3847 },
  'Trincomalee': { lat: 8.5667, lng: 81.2333 }
};

const MapViewPage: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [shipment, setShipment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [userLocationLoading, setUserLocationLoading] = useState(true);
  const [userLocationError, setUserLocationError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Extract the tracking number from URL parameters
  const queryParams = new URLSearchParams(location.search);
  const trackingNumber = queryParams.get('tracking');

  useEffect(() => {
    if (!trackingNumber) {
      setError('Tracking number is missing');
      setLoading(false);
      return;
    }

    // Fetch shipment details
    const fetchShipment = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/shipments/track/${trackingNumber}`);

        if (!response.ok) {
          throw new Error('Failed to fetch shipment');
        }

        const data = await response.json();
        setShipment(data);
      } catch (err) {
        console.error('Error fetching shipment:', err);
        setError('Error fetching shipment details');
      } finally {
        setLoading(false);
      }
    };

    fetchShipment();
  }, [trackingNumber]);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setUserLocationLoading(false);
        },
        (error) => {
          console.error('Error getting user location:', error);
          setUserLocationError('Unable to get your current location. Please enable location services in your browser.');
          setUserLocationLoading(false);
        }
      );
    } else {
      setUserLocationError('Geolocation is not supported by your browser');
      setUserLocationLoading(false);
    }
  }, []);

  // Load Google Maps script
  useEffect(() => {
    if (!shipment || !userLocation) return;

    // Check if API key exists in .env
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setError('Google Maps API key is missing');
      return;
    }

    // Load Google Maps script if not already loaded
    if (!document.getElementById('google-maps-script') && !window.google?.maps) {
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,directions`;
      script.async = true;
      script.defer = true;
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    } else {
      setMapLoaded(true);
    }
  }, [shipment, userLocation]);

  // Initialize map and directions once everything is loaded
  useEffect(() => {
    if (!mapLoaded || !shipment || !userLocation) return;

    // Get destination coordinates from the branch
    const branchName = shipment.destination;
    const destinationCoords = BRANCH_COORDINATES[branchName];

    if (!destinationCoords) {
      setError(`Location coordinates not found for branch: ${branchName}`);
      return;
    }

    // Initialize Google Maps
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    const map = new window.google.maps.Map(mapElement, {
      center: destinationCoords,
      zoom: 10
    });

    // Set markers for user location and destination
    new window.google.maps.Marker({
      position: userLocation,
      map,
      title: 'Your Location',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#4285F4',
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: '#FFF'
      }
    });

    new window.google.maps.Marker({
      position: destinationCoords,
      map,
      title: shipment.destination,
      animation: window.google.maps.Animation.DROP
    });

    // Create directions service and renderer
    const directionsService = new window.google.maps.DirectionsService();
    const directionsRenderer = new window.google.maps.DirectionsRenderer({
      map,
      polylineOptions: {
        strokeColor: '#4285F4',
        strokeWeight: 5
      }
    });

    // Get directions
    directionsService.route(
      {
        origin: userLocation,
        destination: destinationCoords,
        travelMode: window.google.maps.TravelMode.DRIVING
      },
      (response: any, status: string) => {
        if (status === 'OK') {
          directionsRenderer.setDirections(response);
          
          // Display distance and duration
          const route = response.routes[0];
          const leg = route.legs[0];
          
          const infoDiv = document.getElementById('route-info');
          if (infoDiv) {
            infoDiv.innerHTML = `
              <div class="p-6 bg-white rounded-lg shadow-md border border-blue-200">
                <div class="font-bold text-xl mb-4 text-blue-700 border-b border-blue-100 pb-2">Route Information</div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="bg-blue-50 p-4 rounded-lg">
                    <div class="text-blue-600 font-medium mb-1">Distance</div>
                    <div class="font-bold text-gray-800 text-lg">${leg.distance.text}</div>
                  </div>
                  <div class="bg-blue-50 p-4 rounded-lg">
                    <div class="text-blue-600 font-medium mb-1">Duration</div>
                    <div class="font-bold text-gray-800 text-lg">${leg.duration.text}</div>
                  </div>
                </div>
                <div class="mt-6 space-y-4">
                  <div class="bg-gray-50 p-4 rounded-lg">
                    <div class="text-blue-600 font-medium mb-1">Start Address</div>
                    <div class="font-medium text-gray-800">${leg.start_address}</div>
                  </div>
                  <div class="bg-gray-50 p-4 rounded-lg">
                    <div class="text-blue-600 font-medium mb-1">End Address</div>
                    <div class="font-medium text-gray-800">${leg.end_address}</div>
                  </div>
                </div>
              </div>
            `;
          }
        } else {
          console.error('Directions request failed:', status);
          setError('Failed to load directions. Please try again later.');
        }
      }
    );

  }, [mapLoaded, shipment, userLocation]);

  const goBack = () => {
    navigate('/shipments');
  };

  if (loading || userLocationLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <FaSpinner className="animate-spin text-blue-600 text-4xl mb-4" />
        <h1 className="text-2xl font-bold text-gray-800">Loading map view...</h1>
        <p className="text-gray-600 mt-2">Please wait while we prepare your shipment's map view.</p>
      </div>
    );
  }

  if (error || userLocationError) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full">
          <div className="flex items-center justify-center mb-6">
            <FaExclamationTriangle className="text-red-500 text-4xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-4">Unable to Load Map</h1>
          <p className="text-gray-600 text-center mb-6">
            {error || userLocationError}
          </p>
          <div className="flex justify-center">
            <button
              onClick={goBack}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <FaArrowLeft className="mr-2" />
              Back to Shipments
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full">
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-4">Shipment Not Found</h1>
          <p className="text-gray-600 text-center mb-6">
            We couldn't find a shipment with the provided tracking number.
          </p>
          <div className="flex justify-center">
            <button
              onClick={goBack}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <FaArrowLeft className="mr-2" />
              Back to Shipments
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={goBack}
                  className="mr-4 p-2 rounded-full hover:bg-blue-700 transition-colors"
                >
                  <FaArrowLeft />
                </button>
                <div>
                  <h1 className="text-xl font-bold flex items-center">
                    <FaMapMarkedAlt className="mr-2" />
                    Shipment Map View
                  </h1>
                  <p className="text-sm opacity-90">
                    Tracking: {shipment.trackingNumber}
                  </p>
                </div>
              </div>
              <div>
                <span className="px-3 py-1 bg-blue-800 rounded-full text-sm">
                  {shipment.status}
                </span>
              </div>
            </div>
          </div>

          {/* Shipment summary */}
          <div className="p-6 bg-gradient-to-r from-blue-100 to-blue-50 border-b border-blue-200 shadow-sm">
            <h3 className="text-lg font-bold text-blue-800 mb-3">Shipment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                <p className="text-blue-600 text-sm font-medium">Origin</p>
                <p className="font-bold text-gray-800 text-lg">{shipment.origin}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                <p className="text-blue-600 text-sm font-medium">Destination</p>
                <p className="font-bold text-gray-800 text-lg">{shipment.destination}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                <p className="text-blue-600 text-sm font-medium">Estimated Delivery</p>
                <p className="font-bold text-gray-800 text-lg">
                  {new Date(shipment.estimatedDelivery).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Map container */}
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Directions to {shipment.destination} Branch
              </h2>
              <p className="text-blue-600 font-medium">
                Showing route from your current location to the destination branch.
              </p>
            </div>

            {/* Route information will be populated by JavaScript */}
            <div id="route-info" className="mb-6"></div>

            {/* The map */}
            <div id="map" className="w-full h-96 rounded-lg shadow-lg border border-gray-200"></div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-gray-700 flex items-center">
                <FaLocationArrow className="text-blue-600 mr-2" />
                <span className="font-medium">Your current location is automatically detected to show the most accurate route.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapViewPage;