import React from 'react'
import { Droplets, Fish, Thermometer, Activity, Calendar, MapPin } from 'lucide-react'

// Mock data for a single pond. In a real app, you'd fetch this based on the `id` param.
const pondDetails = {
  id: 'PND001',
  name: 'Main Koi Pond',
  location: 'Central Garden',
  status: 'Active' as 'Active' | 'Inactive' | 'Maintenance',
  createdAt: '2023-01-15',
  dimensions: '25m x 15m x 2m',
  volume: '750,000 L',
  fishCount: 50,
  species: ['Koi Carp', 'Goldfish'],
  waterQuality: {
    temperature: '22°C',
    ph: 7.4,
    ammonia: '0.05 ppm',
    nitrite: '0.01 ppm',
    nitrate: '15 ppm',
    lastChecked: '2024-05-21 08:00 AM',
  },
  recentActivity: [
    { id: 1, type: 'Feeding', description: 'Fed 2kg of high-protein pellets.', timestamp: '2 hours ago' },
    { id: 2, type: 'Water Test', description: 'Completed routine water quality check.', timestamp: '6 hours ago' },
    { id: 3, type: 'Maintenance', description: 'Cleaned filtration system.', timestamp: '1 day ago' },
  ],
};

const statusColorMap = {
  Active: 'bg-green-100 text-green-800',
  Inactive: 'bg-gray-100 text-gray-800',
  Maintenance: 'bg-yellow-100 text-yellow-800',
};

const StatCard = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | number }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
    <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
      <Icon className="h-6 w-6" />
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

const PondDetailPage = ({ params }: { params: { id: string } }) => {
  // In a real app, you would use params.id to fetch the specific pond's data.
  const pond = pondDetails;

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <header className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{pond.name}</h1>
          <div className="flex items-center gap-4 mt-2 text-gray-600">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{pond.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Created: {pond.createdAt}</span>
            </div>
            <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColorMap[pond.status]}`}>
              {pond.status}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
            Generate Report
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition-colors">
            Edit Pond
          </button>
        </div>
      </header>

      {/* Key Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={Fish} label="Fish Count" value={pond.fishCount} />
        <StatCard icon={Thermometer} label="Temperature" value={pond.waterQuality.temperature} />
        <StatCard icon={Droplets} label="pH Level" value={pond.waterQuality.ph} />
        <StatCard icon={Activity} label="Ammonia (ppm)" value={pond.waterQuality.ammonia} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Water Quality Details */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Water Quality</h2>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between"><span>Temperature:</span> <span className="font-medium">{pond.waterQuality.temperature}</span></li>
            <li className="flex justify-between"><span>pH:</span> <span className="font-medium">{pond.waterQuality.ph}</span></li>
            <li className="flex justify-between"><span>Ammonia:</span> <span className="font-medium">{pond.waterQuality.ammonia}</span></li>
            <li className="flex justify-between"><span>Nitrite:</span> <span className="font-medium">{pond.waterQuality.nitrite}</span></li>
            <li className="flex justify-between"><span>Nitrate:</span> <span className="font-medium">{pond.waterQuality.nitrate}</span></li>
          </ul>
          <p className="text-xs text-gray-500 mt-4">Last checked: {pond.waterQuality.lastChecked}</p>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-900 p-6 border-b border-gray-200">Recent Activity</h2>
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
        </div>
      </div>
    </div>
  )
}

export default PondDetailPage;