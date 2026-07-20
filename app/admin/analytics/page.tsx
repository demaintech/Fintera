'use client';

import React from 'react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Fish, Thermometer, Droplets, Scale, Package, LineChart as LineChartIcon, AlertTriangle, Calendar } from 'lucide-react';

// Mock Data for Charts
const populationData = [
  { month: 'Jan', population: 4000 }, { month: 'Feb', population: 4500 },
  { month: 'Mar', population: 5200 }, { month: 'Apr', population: 5800 },
  { month: 'May', population: 6500 }, { month: 'Jun', population: 7100 },
];

const waterQualityData = [
  { date: '10-21', pH: 7.2, temp: 26, ammonia: 0.1 }, { date: '10-22', pH: 7.1, temp: 26.5, ammonia: 0.12 },
  { date: '10-23', pH: 7.3, temp: 26.2, ammonia: 0.09 }, { date: '10-24', pH: 7.2, temp: 27, ammonia: 0.1 },
  { date: '10-25', pH: 7.4, temp: 26.8, ammonia: 0.08 }, { date: '10-26', pH: 7.3, temp: 26.5, ammonia: 0.11 },
];

const harvestData = [
  { species: 'Tilapia', value: 450 }, { species: 'Catfish', value: 300 },
  { species: 'Koi', value: 150 }, { species: 'Goldfish', value: 100 },
];

const feedData = [
    { name: 'Pond A', consumption: 400, fcr: 1.5 }, { name: 'Pond B', consumption: 300, fcr: 1.4 },
    { name: 'Pond C', consumption: 500, fcr: 1.6 }, { name: 'Pond D', consumption: 278, fcr: 1.3 },
];

// --- Reusable Components (similar to shadcn/ui) ---

const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-200/80 ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="p-4 sm:p-6 border-b border-gray-200/80">{children}</div>
);

const CardTitle = ({ children, icon: Icon }: { children: React.ReactNode, icon?: React.ElementType }) => (
  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
    {Icon && <Icon className="w-5 h-5 text-gray-500" />}
    {children}
  </h3>
);

const CardContent = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`p-4 sm:p-6 ${className}`}>{children}</div>
);

const StatCard = ({ title, value, change, icon: Icon, color }: { title: string, value: string, change: string, icon: React.ElementType, color: string }) => (
  <Card>
    <CardContent>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className={`p-2 rounded-full ${color} bg-opacity-10`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      <p className={`mt-1 text-sm ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{change}</p>
    </CardContent>
  </Card>
);

const AnalyticsPage = () => {
  return (
    <main className="flex-1 p-4 sm:p-6 md:p-8 bg-gray-50/50">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600 mt-1">Key insights into your farm's performance.</p>
        </div>
        <button className="mt-4 sm:mt-0 flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
          <Calendar className="w-4 h-4" />
          <span>Last 30 Days</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <StatCard title="Total Fish Population" value="7,120" change="+5.2% from last month" icon={Fish} color="text-blue-600" />
        <StatCard title="Avg. Water Quality" value="92%" change="-1.5% from last month" icon={Droplets} color="text-teal-600" />
        <StatCard title="Monthly Harvest (kg)" value="450" change="+10.1% from last month" icon={Scale} color="text-green-600" />
        <StatCard title="Feed Inventory" value="1.2 Tons" change="Low Stock Alert" icon={AlertTriangle} color="text-orange-600" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle icon={LineChartIcon}>Population Growth Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={populationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="population" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle icon={Thermometer}>Weekly Water Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={waterQualityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="pH" name="pH" stroke="#8884d8" strokeWidth={2} />
                <Line type="monotone" dataKey="temp" name="Temp (°C)" stroke="#82ca9d" strokeWidth={2} />
                <Line type="monotone" dataKey="ammonia" name="Ammonia" stroke="#ffc658" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle icon={Scale}>Harvest by Species (kg)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={harvestData} dataKey="value" nameKey="species" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle icon={Package}>Feed Consumption & FCR by Pond</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={feedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="consumption" name="Consumption (kg)" fill="#3b82f6" />
                <Bar yAxisId="right" dataKey="fcr" name="Feed Conversion Ratio" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default AnalyticsPage;