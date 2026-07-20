'use client'

import React, { useState, FormEvent } from 'react'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'

const AddPondPage = () => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive' | 'Maintenance'>('Active');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !location) {
      setError('Pond Name and Location are required.');
      return;
    }

    setIsSubmitting(true);

    // Simulate an API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In a real app, you would handle the API response here.
    // For now, we'll just assume success.
    console.log('Submitted:', { name, location, status });

    setIsSubmitting(false);
    setIsSuccess(true);
  };

  const handleAddAnother = () => {
    setIsSuccess(false);
    setName('');
    setLocation('');
    setStatus('Active');
  };

  if (isSuccess) {
    return (
      <div className="flex items-center justify-center p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen">
        <div className="bg-white p-8 sm:p-10 rounded-xl shadow-lg text-center max-w-lg w-full transform transition-all duration-500 ease-in-out scale-100">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pond Added Successfully!</h2>
          <p className="text-gray-600 mb-6">The new pond "{name}" has been added to the system.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleAddAnother}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 w-full sm:w-auto"
            >
              Add Another Pond
            </button>
            <Link href="/admin/ponds" className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors w-full sm:w-auto">
              View All Ponds
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create a New Pond</h1>
          <p className="text-gray-600 mt-2">
            Fill in the details below to add a new pond to the system.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Pond Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition"
              placeholder="e.g., Main Koi Pond"
              required
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition"
              placeholder="e.g., Central Garden"
              required
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Initial Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive' | 'Maintenance')}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm rounded-md transition"
            >
              <option>Active</option>
              <option>Inactive</option>
              <option>Maintenance</option>
            </select>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end items-center gap-4 pt-4">
            <Link href="/admin/ponds" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? 'Adding...' : 'Add Pond'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddPondPage