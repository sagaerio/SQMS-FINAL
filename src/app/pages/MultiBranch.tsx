import { useState, useEffect } from 'react';
import { Building2, MapPin, Phone, Clock, Users, Navigation } from 'lucide-react';
import { branches as allBranches, businessTypes } from '../data/businessTypes';

interface Branch {
  id: number;
  name: string;
  address: string;
  phone: string;
  hours: string;
  currentQueue: number;
  avgWaitTime: string;
  services: string[];
  distance: string;
  status: 'open' | 'busy' | 'closed';
}

const branches: Branch[] = [
  {
    id: 1,
    name: 'New York - Manhattan',
    address: '350 Fifth Avenue, New York, NY 10118, USA',
    phone: '+1 (212) 736-3100',
    hours: '9:00 AM - 6:00 PM',
    currentQueue: 8,
    avgWaitTime: '15 min',
    services: ['Account Opening', 'Loan Services', 'Customer Support'],
    distance: '0.5 km',
    status: 'open'
  },
  {
    id: 2,
    name: 'Los Angeles - Downtown',
    address: '633 W 5th Street, Los Angeles, CA 90071, USA',
    phone: '+1 (213) 486-9910',
    hours: '9:00 AM - 6:00 PM',
    currentQueue: 15,
    avgWaitTime: '25 min',
    services: ['Account Opening', 'Document Verification', 'Card Services'],
    distance: '2.3 km',
    status: 'busy'
  },
  {
    id: 3,
    name: 'Chicago - Loop',
    address: '233 S Wacker Drive, Chicago, IL 60606, USA',
    phone: '+1 (312) 875-9447',
    hours: '9:00 AM - 6:00 PM',
    currentQueue: 3,
    avgWaitTime: '8 min',
    services: ['General Inquiry', 'Customer Support', 'Card Services'],
    distance: '3.1 km',
    status: 'open'
  },
  {
    id: 4,
    name: 'San Francisco - Financial District',
    address: '555 California Street, San Francisco, CA 94104, USA',
    phone: '+1 (415) 296-7000',
    hours: 'Closed',
    currentQueue: 0,
    avgWaitTime: 'N/A',
    services: ['Account Opening', 'Loan Services', 'Document Verification'],
    distance: '5.7 km',
    status: 'closed'
  },
  {
    id: 5,
    name: 'Miami - Brickell',
    address: '1221 Brickell Avenue, Miami, FL 33131, USA',
    phone: '+1 (305) 350-5100',
    hours: '9:00 AM - 6:00 PM',
    currentQueue: 5,
    avgWaitTime: '12 min',
    services: ['Customer Support', 'General Inquiry', 'Card Services'],
    distance: '4.2 km',
    status: 'open'
  },
  {
    id: 6,
    name: 'Boston - Back Bay',
    address: '800 Boylston Street, Boston, MA 02199, USA',
    phone: '+1 (617) 267-5300',
    hours: '9:00 AM - 6:00 PM',
    currentQueue: 12,
    avgWaitTime: '20 min',
    services: ['Account Opening', 'Loan Services', 'Document Verification', 'Customer Support'],
    distance: '1.8 km',
    status: 'busy'
  },
];

export function MultiBranch() {
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'busy' | 'closed'>('all');
  const [businessType, setBusinessType] = useState<string>('');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string>('');

  useEffect(() => {
    const selectedBusinessType = localStorage.getItem('sqms_business_type') || 'bank';
    setBusinessType(selectedBusinessType);

    // Filter and transform branches based on business type
    const filteredBranches = allBranches
      .filter(b => b.businessType === selectedBusinessType)
      .map((b, idx) => ({
        id: idx + 1,
        name: b.name,
        address: b.address,
        phone: b.phone,
        hours: b.hours,
        currentQueue: Math.floor(Math.random() * 15) + 2,
        avgWaitTime: `${Math.floor(Math.random() * 20) + 5} min`,
        services: ['Service 1', 'Service 2', 'Service 3'],
        distance: `${(idx * 1.5 + 0.5).toFixed(1)} km`,
        status: (idx === 3 ? 'closed' : (Math.random() > 0.7 ? 'busy' : 'open')) as 'open' | 'busy' | 'closed'
      }));

    setBranches(filteredBranches);
  }, []);

  const currentBusinessType = businessTypes.find(bt => bt.id === businessType);

  const filteredBranches = filterStatus === 'all'
    ? branches
    : branches.filter(b => b.status === filterStatus);

  const getStatusColor = (status: Branch['status']) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'closed':
        return 'bg-red-100 text-red-800 border-red-300';
    }
  };

  const getStatusDot = (status: Branch['status']) => {
    switch (status) {
      case 'open':
        return 'bg-green-500';
      case 'busy':
        return 'bg-yellow-500';
      case 'closed':
        return 'bg-red-500';
    }
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLocationEnabled(true);

        // Demo: Recalculate distances based on user location
        // Using simple distance approximation for demo purposes
        const updatedBranches = branches.map(branch => {
          // Demo coordinates for branches (using approximate NYC, LA, Chicago, etc.)
          const branchCoords: { [key: string]: { lat: number; lng: number } } = {
            'New York - Manhattan': { lat: 40.7484, lng: -73.9857 },
            'Los Angeles - Downtown': { lat: 34.0522, lng: -118.2437 },
            'Chicago - Loop': { lat: 41.8781, lng: -87.6298 },
            'San Francisco - Financial District': { lat: 37.7749, lng: -122.4194 },
            'Miami - Brickell': { lat: 25.7617, lng: -80.1918 },
            'Boston - Back Bay': { lat: 42.3501, lng: -71.0820 }
          };

          const branchLoc = branchCoords[branch.name] || { lat: 40.7484, lng: -73.9857 };
          const distance = calculateDistance(latitude, longitude, branchLoc.lat, branchLoc.lng);

          return { ...branch, distance: `${distance.toFixed(1)} km` };
        });

        // Sort by distance
        updatedBranches.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
        setBranches(updatedBranches);
      },
      (error) => {
        setLocationError('Unable to retrieve your location. Using default locations.');
        // Demo: Use a default location (e.g., Times Square, NYC)
        const defaultLat = 40.7580;
        const defaultLng = -73.9855;
        setUserLocation({ lat: defaultLat, lng: defaultLng });
        setLocationEnabled(true);

        // Still recalculate with default location for demo
        const updatedBranches = branches.map(branch => {
          const branchCoords: { [key: string]: { lat: number; lng: number } } = {
            'New York - Manhattan': { lat: 40.7484, lng: -73.9857 },
            'Los Angeles - Downtown': { lat: 34.0522, lng: -118.2437 },
            'Chicago - Loop': { lat: 41.8781, lng: -87.6298 },
            'San Francisco - Financial District': { lat: 37.7749, lng: -122.4194 },
            'Miami - Brickell': { lat: 25.7617, lng: -80.1918 },
            'Boston - Back Bay': { lat: 42.3501, lng: -71.0820 }
          };

          const branchLoc = branchCoords[branch.name] || { lat: 40.7484, lng: -73.9857 };
          const distance = calculateDistance(defaultLat, defaultLng, branchLoc.lat, branchLoc.lng);

          return { ...branch, distance: `${distance.toFixed(1)} km` };
        });

        updatedBranches.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
        setBranches(updatedBranches);
      }
    );
  };

  // Haversine formula to calculate distance between two coordinates
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRad = (value: number): number => {
    return (value * Math.PI) / 180;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Business Type Header */}
      {currentBusinessType && (
        <div className={`bg-gradient-to-r ${currentBusinessType.gradient} rounded-3xl p-6 mb-8 text-white shadow-xl`}>
          <div className="flex items-center gap-3">
            <div className="text-4xl">{currentBusinessType.icon}</div>
            <div>
              <h1 className="text-3xl mb-1">{currentBusinessType.name} Locations</h1>
              <p className="text-white/90">Select your nearest branch and view real-time queue status</p>
            </div>
          </div>
        </div>
      )}

      {/* Location Permission Banner */}
      {!locationEnabled && (
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl shadow-lg p-6 mb-6 text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <Navigation className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl mb-1">Find Your Nearest Branch</h3>
                <p className="text-white/90 text-sm">Enable location to see branches sorted by distance from you</p>
              </div>
            </div>
            <button
              onClick={requestLocation}
              className="px-6 py-3 bg-white text-teal-600 rounded-xl hover:bg-teal-50 transition-all font-medium"
            >
              Enable Location
            </button>
          </div>
          {locationError && (
            <div className="mt-3 p-3 bg-white/10 backdrop-blur-sm rounded-lg text-sm">
              {locationError}
            </div>
          )}
        </div>
      )}

      {/* Location Enabled Status */}
      {locationEnabled && userLocation && (
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-600 rounded-full p-2">
              <Navigation className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-green-800 font-medium">Location Enabled</p>
              <p className="text-sm text-green-600">
                Showing branches sorted by distance from your location ({userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)})
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-6 py-2 rounded-lg transition-all ${
              filterStatus === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Branches ({branches.length})
          </button>
          <button
            onClick={() => setFilterStatus('open')}
            className={`px-6 py-2 rounded-lg transition-all ${
              filterStatus === 'open'
                ? 'bg-green-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Open ({branches.filter(b => b.status === 'open').length})
          </button>
          <button
            onClick={() => setFilterStatus('busy')}
            className={`px-6 py-2 rounded-lg transition-all ${
              filterStatus === 'busy'
                ? 'bg-yellow-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Busy ({branches.filter(b => b.status === 'busy').length})
          </button>
          <button
            onClick={() => setFilterStatus('closed')}
            className={`px-6 py-2 rounded-lg transition-all ${
              filterStatus === 'closed'
                ? 'bg-red-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Closed ({branches.filter(b => b.status === 'closed').length})
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Branch List */}
        <div className="space-y-4">
          {filteredBranches.map((branch) => (
            <div
              key={branch.id}
              onClick={() => setSelectedBranch(branch.id)}
              className={`bg-white rounded-2xl shadow-lg p-6 cursor-pointer transition-all hover:shadow-xl ${
                selectedBranch === branch.id ? 'ring-2 ring-blue-600' : ''
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-3">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl text-slate-800 mb-1">{branch.name}</h3>
                    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border-2 text-sm ${getStatusColor(branch.status)}`}>
                      <div className={`w-2 h-2 rounded-full ${getStatusDot(branch.status)}`}></div>
                      {branch.status.charAt(0).toUpperCase() + branch.status.slice(1)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-start gap-2 text-slate-600">
                  <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{branch.address}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{branch.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{branch.hours}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Navigation className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{branch.distance} away</span>
                </div>
              </div>

              {/* Queue Info */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-50 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Users className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="text-2xl text-blue-600 mb-1">{branch.currentQueue}</div>
                  <div className="text-xs text-slate-600">In Queue</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Clock className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="text-2xl text-blue-600 mb-1">{branch.avgWaitTime}</div>
                  <div className="text-xs text-slate-600">Avg Wait</div>
                </div>
              </div>

              {/* Services */}
              <div className="mb-4">
                <div className="text-sm text-slate-600 mb-2">Available Services:</div>
                <div className="flex flex-wrap gap-2">
                  {branch.services.map((service, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              {branch.status !== 'closed' && (
                <div className="flex gap-2">
                  <button className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition-all">
                    Join Queue
                  </button>
                  <button className="px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-all">
                    Directions
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Map & Selected Branch Details */}
        <div className="lg:sticky lg:top-24 h-fit">
          {/* Map */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl text-slate-800 mb-4">Branch Locations</h2>
            <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center relative overflow-hidden">
              {/* Simple map visualization */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'linear-gradient(#2563EB 1px, transparent 1px), linear-gradient(90deg, #2563EB 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }}></div>
              </div>
              <div className="relative z-10 text-center">
                <MapPin className="w-16 h-16 text-blue-600 mx-auto mb-2" />
                <p className="text-slate-600">Interactive Map</p>
                <p className="text-sm text-slate-500">{filteredBranches.length} branches found</p>
              </div>
            </div>
          </div>

          {/* Selected Branch Summary */}
          {selectedBranch && (
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-xl mb-4">Selected Branch</h3>
              {(() => {
                const branch = branches.find(b => b.id === selectedBranch);
                return branch ? (
                  <>
                    <h4 className="text-2xl mb-2">{branch.name}</h4>
                    <p className="text-white/90 mb-4">{branch.address}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
                        <div className="text-2xl mb-1">{branch.currentQueue}</div>
                        <div className="text-sm text-white/80">People Waiting</div>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
                        <div className="text-2xl mb-1">{branch.avgWaitTime}</div>
                        <div className="text-sm text-white/80">Average Wait</div>
                      </div>
                    </div>
                  </>
                ) : null;
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}