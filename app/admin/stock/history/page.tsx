'use client';

import React, { useState, useMemo } from 'react';

// A simple icon component for demonstration purposes.
// In a real app, you'd likely use an icon library like react-icons or lucide-react.
const Icon = ({ path, className }: { path: string; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || 'w-6 h-6'}>
    <path fillRule="evenodd" d={path} clipRule="evenodd" />
  </svg>
);

const StatCard = ({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
    <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

type StockHistoryItem = {
  id: string;
  date: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  stockedBy: string;
};

const dummyHistory: StockHistoryItem[] = [
  { id: 'SH001', date: '2023-10-27', itemName: 'UltraBook X1', quantity: 15, unitPrice: 1400, stockedBy: 'Admin' },
  { id: 'SH002', date: '2023-10-26', itemName: 'Wireless Ergonomic Mouse', quantity: 50, unitPrice: 85, stockedBy: 'John Doe' },
  { id: 'SH003', date: '2023-10-26', itemName: 'Mechanical Keyboard', quantity: 30, unitPrice: 120, stockedBy: 'Admin' },
  { id: 'SH004', date: '2023-10-25', itemName: '27" 4K Monitor', quantity: 10, unitPrice: 450, stockedBy: 'Jane Smith' },
  { id: 'SH005', date: '2023-10-24', itemName: 'USB-C Docking Station', quantity: 25, unitPrice: 150, stockedBy: 'Admin' },
  { id: 'SH006', date: '2023-10-23', itemName: 'Webcam 1080p', quantity: 40, unitPrice: 60, stockedBy: 'John Doe' },
];

const StockHistoryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = useMemo(() => {
    return dummyHistory.filter(item =>
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.stockedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const totalItemsStocked = useMemo(() => dummyHistory.reduce((sum, item) => sum + item.quantity, 0), []);
  const totalStockValue = useMemo(() => dummyHistory.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0), []);

  return (
    <main className="flex-1 p-6 md:p-8 bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Stocking History</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Items Stocked"
          value={totalItemsStocked.toLocaleString()}
          icon={<Icon path="M3.375 4.5C2.339 4.5 1.5 5.34 1.5 6.375V17.625C1.5 18.66 2.34 19.5 3.375 19.5H20.625C21.66 19.5 22.5 18.66 22.5 17.625V6.375C22.5 5.339 21.66 4.5 20.625 4.5H3.375Z" />}
        />
        <StatCard
          title="Total Stock Value"
          value={`$${totalStockValue.toLocaleString()}`}
          icon={<Icon path="M12 6v12m-3-2.818l.879.879A3 3 0 0012 20.25a3 3 0 002.121-.879l.879-.879M12 6l-3.75 3.75m3.75-3.75L15.75 9.75" />}
        />
        <StatCard
          title="Entries This Month"
          value="12" // This would be calculated dynamically
          icon={<Icon path="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18" />}
        />
        <StatCard
          title="Last Stocked Date"
          value={dummyHistory[0]?.date || 'N/A'}
          icon={<Icon path="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />}
        />
      </div>

      {/* History Table */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">History Log</h2>
          <input
            type="text"
            placeholder="Search by item, user, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-sm font-semibold text-gray-600">Entry ID</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Date</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Item Name</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Quantity</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Total Value</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Stocked By</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-gray-700">{item.id}</td>
                  <td className="p-3 text-gray-700">{item.date}</td>
                  <td className="p-3 font-medium text-gray-800">{item.itemName}</td>
                  <td className="p-3 text-gray-700">{item.quantity}</td>
                  <td className="p-3 text-gray-700">${(item.quantity * item.unitPrice).toLocaleString()}</td>
                  <td className="p-3 text-gray-700">{item.stockedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredHistory.length === 0 && (
            <p className="text-center text-gray-500 py-8">No history found for "{searchTerm}".</p>
          )}
        </div>
      </div>
    </main>
  );
};

export default StockHistoryPage;