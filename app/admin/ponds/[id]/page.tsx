'use client';

import React, { useEffect, useState } from 'react';
import { Droplets, Fish, Thermometer, Calendar, MapPin, ChevronLeft, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getPond, type Pond } from '@/lib/pond-api';
import { useAuth } from '@/lib/auth-context';

const statusColorMap: Record<string, string> = {
  Active: 'bg-green-100 text-green-800',
  Inactive: 'bg-gray-100 text-gray-800',
  Maintenance: 'bg-yellow-100 text-yellow-800',
};

const StatCard = ({ icon: Icon, label, value, unit }: { icon: React.ElementType; label: string; value: string | number; unit?: string }) => (
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

const formatDate = (value?: string | null) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  return isNaN(date.getTime()) ? String(value) : date.toLocaleDateString();
};

const PondDetailPage = () => {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { token } = useAuth();

  const [pond, setPond] = useState<Pond | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    getPond(id, token)
      .then((result) => {
        if (!result) {
          setNotFound(true);
        } else {
          setPond(result);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false));
  }, [id, token]);

  if (isLoading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <p className="text-gray-500">Loading pond details...</p>
      </div>
    );
  }

  if (notFound || !pond) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Pond Not Found</h1>
          <p className="text-gray-500 mt-2">The pond with ID &quot;{id}&quot; could not be found.</p>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard icon={Fish} label="Current Stock" value={pond.currentStock.quantity.toLocaleString()} unit={pond.currentStock.species} />
          <StatCard icon={Thermometer} label="Temperature" value={pond.waterTemp} unit="°C" />
          <StatCard icon={Droplets} label="pH Level" value={pond.phLevel} />
          <StatCard icon={Calendar} label="Last Harvest" value={formatDate(pond.lastHarvestDate)} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Pond Information</h2>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between"><span>ID:</span> <span className="font-mono text-gray-600">{pond.id}</span></li>
              <li className="flex justify-between"><span>Location:</span> <span className="font-medium">{pond.location}</span></li>
              <li className="flex justify-between"><span>Status:</span> <span className="font-medium">{pond.status}</span></li>
              <li className="flex justify-between"><span>Species:</span> <span className="font-medium">{pond.currentStock.species}</span></li>
              <li className="flex justify-between"><span>Quantity:</span> <span className="font-medium">{pond.currentStock.quantity.toLocaleString()}</span></li>
            </ul>
          </div>

          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Water Quality</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Water Temperature</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{pond.waterTemp}°C</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">pH Level</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{pond.phLevel}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PondDetailPage;