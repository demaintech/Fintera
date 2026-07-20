import React from 'react';
import { Droplets, Fish, Thermometer, Activity, Calendar, MapPin, Edit, Trash2, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

// Mock data for all ponds. In a real app, you'd fetch this from a database.
const MOCK_PONDS_DATA = [
  { id: 'P001', name: 'Alpha-1', location: 'North Sector', status: 'Active', currentStock: { species: 'Tilapia', quantity: 5000 }, lastHarvestDate: new Date('2023-10-15'), waterTemp: 28.5, phLevel: 7.2, dimensions: '30m x 20m x 1.5m', volume: '900,000 L', recentActivity: [{ id: 1, type: 'Feeding', description: 'Fed 5kg of pellets.', timestamp: '3 hours ago' }] },
  { id: 'P002', name: 'Bravo-2', location: 'West Sector', status: 'Active', currentStock: { species: 'Catfish', quantity: 3500 }, lastHarvestDate: new Date('2023-09-20'), waterTemp: 26.0, phLevel: 6.8, dimensions: '25m x 20m x 1.8m', volume: '900,000 L', recentActivity: [{ id: 1, type: 'Water Test', description: 'pH level slightly low.', timestamp: 'Yesterday' }] },
  { id: 'P003', name: 'Charlie-1', location: 'North Sector', status: 'Maintenance', currentStock: { species: 'None', quantity: 0 }, lastHarvestDate: null, waterTemp: 25.0, phLevel: 7.0, dimensions: '20m x 15m x 1.5m', volume: '450,000 L', recentActivity: [{ id: 1, type: 'Maintenance', description: 'Draining for cleaning.', timestamp: '2 days ago' }] },
  { id: 'P004', name: 'Delta-4', location: 'East Sector', status: 'Inactive', currentStock: { species: 'None', quantity: 0 }, lastHarvestDate: new Date('2023-05-11'), waterTemp: 22.0, phLevel: 7.1, dimensions: '25m x 15m x 1.5m', volume: '562,500 L', recentActivity: [] },
  { id: 'P005', name: 'Echo-3', location: 'West Sector', status: 'Active', currentStock: { species: 'Shrimp', quantity: 15000 }, lastHarvestDate: new Date('2023-11-01'), waterTemp: 29.1, phLevel: 7.8, dimensions: '40m x 25m x 1.2m', volume: '1,200,000 L', recentActivity: [{ id: 1, type: 'Harvest', description: 'Partial harvest completed.', timestamp: 'Last week' }] },
  { id: 'P006', name: 'Foxtrot-1', location: 'South Sector', status: 'Active', currentStock: { species: 'Tilapia', quantity: 4800 }, lastHarvestDate: new Date('2023-10-25'), waterTemp: 28.2, phLevel: 7.3, dimensions: '30m x 20m x 1.5m', volume: '900,000 L', recentActivity: [{ id: 1, type: 'Feeding', description: 'Routine feeding.', timestamp: '4 hours ago' }] },
];

const statusColorMap: Record<string, string> = {
  Active: 'bg-green-100 text-green-800',
  Inactive: 'bg-gray-100 text-gray-800',
  Maintenance: 'bg-yellow-100 text-yellow-800',
};

const StatCard = ({ icon: Icon, label, value, unit }: { icon: React.ElementType, label: string, value: string | number, unit?: string }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
    <div className="p-3 rounded-full bg-sky-100 text-sky-600 mr-4">
      <Icon className="h-6 w-6" />
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xl font-bold text-gray-900">
        {value} {unit && <span className="text-base font-medium text-gray-500">{unit}</span>}
      </p>
    </div>
  </div>
);

const PondDetailPage = ({ params }: { params: { id: string } }) => {
  // Find the pond from the mock data using the id from the URL.
  const pond = MOCK_PONDS_DATA.find(p => p.id === params.id);

  if (!pond) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Pond Not Found</h1>
          <p className="text-gray-500 mt-2">The pond with ID "{params.id}" could not be found.</p>
          <Link href="/admin/ponds" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Back to Ponds List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-start gap-4">
            <div>
              <Link href="/admin/ponds" className="flex items-center text-sm text-gray-500 hover:text-gray-800 mb-2">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Ponds
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">{pond.name}</h1>
              <div className="flex items-center gap-4 mt-2 text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{pond.location}</span>
                </div>
                <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColorMap[pond.status]}`}>
                  {pond.status}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium">
                <Edit className="w-4 h-4" /> Edit
              </button>
              <button className="bg-red-50 border-red-200 border text-red-700 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2 text-sm font-medium">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        </header>

        {/* Key Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard icon={Fish} label="Current Stock" value={pond.currentStock.quantity.toLocaleString()} unit={pond.currentStock.species} />
          <StatCard icon={Thermometer} label="Temperature" value={pond.waterTemp} unit="°C" />
          <StatCard icon={Droplets} label="pH Level" value={pond.phLevel} />
          <StatCard icon={Calendar} label="Last Harvest" value={pond.lastHarvestDate ? pond.lastHarvestDate.toLocaleDateString() : 'N/A'} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pond Information */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Pond Information</h2>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between"><span>ID:</span> <span className="font-mono text-gray-600">{pond.id}</span></li>
              <li className="flex justify-between"><span>Dimensions:</span> <span className="font-medium">{pond.dimensions}</span></li>
              <li className="flex justify-between"><span>Est. Volume:</span> <span className="font-medium">{pond.volume}</span></li>
              <li className="flex justify-between"><span>Stock Species:</span> <span className="font-medium">{pond.currentStock.species}</span></li>
            </ul>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-900 p-6 border-b border-gray-200">Recent Activity</h2>
            {pond.recentActivity.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {pond.recentActivity.map(activity => (
                  <li key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-800">{activity.type}</p>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                      </div>
                      <p className="text-sm text-gray-500">{activity.timestamp}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <p>No recent activity recorded for this pond.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PondDetailPage;