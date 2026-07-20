'use client';

import React, { useState, useMemo } from 'react';
import { Utensils, Weight, CircleDollarSign, Calendar as CalendarIcon, Fish, Search } from 'lucide-react';

// --- Reusable UI Components ---

const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 rounded-xl shadow-sm ${className}`}>{children}</div>
);

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="p-4 sm:p-6 border-b border-gray-200/80 dark:border-slate-700/50 flex justify-between items-center">{children}</div>
);

const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-50">{children}</h3>
);

const CardContent = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`p-0 sm:p-0 ${className}`}>{children}</div>
);

const Label = ({ children, ...props }: { children: React.ReactNode } & React.LabelHTMLAttributes<HTMLLabelElement>) => (
    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5" {...props}>{children}</label>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
        className="block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
        {...props}
    />
);

const KpiCard = ({ title, value, icon: Icon, color }: { title: string, value: string, icon: React.ElementType, color: string }) => (
  <Card>
    <div className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500 dark:text-slate-400">{title}</p>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-slate-100">{value}</p>
    </div>
  </Card>
);

// --- Mock Data & Types ---

type FeedingLog = {
  id: string;
  date: string;
  pondName: string;
  feedTypeName: string;
  quantityKg: number;
  cost: number;
  loggedBy: string;
};

const mockFeedingLogs: FeedingLog[] = [
  { id: 'FL-001', date: '2023-11-15', pondName: 'Breeding Pond A', feedTypeName: 'Grower Pellet (35%)', quantityKg: 15, cost: 14.25, loggedBy: 'Demain' },
  { id: 'FL-002', date: '2023-11-15', pondName: 'Lily Pad Pond', feedTypeName: 'Starter Mash (45%)', quantityKg: 8, cost: 9.60, loggedBy: 'Jane Doe' },
  { id: 'FL-003', date: '2023-11-14', pondName: 'Main Koi Pond', feedTypeName: 'Finisher Pellet (28%)', quantityKg: 20, cost: 15.00, loggedBy: 'Demain' },
  { id: 'FL-004', date: '2023-11-14', pondName: 'Breeding Pond A', feedTypeName: 'Grower Pellet (35%)', quantityKg: 15, cost: 14.25, loggedBy: 'Demain' },
  { id: 'FL-005', date: '2023-11-13', pondName: 'Quarantine Tank', feedTypeName: 'High-Protein Fry Feed', quantityKg: 0.5, cost: 1.25, loggedBy: 'Jane Doe' },
  { id: 'FL-006', date: '2023-11-13', pondName: 'Lily Pad Pond', feedTypeName: 'Starter Mash (45%)', quantityKg: 7.5, cost: 9.00, loggedBy: 'Jane Doe' },
];

const formatCurrency = (amount: number) => amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

const FeedingLogsPage = () => {
  const [dateFrom, setDateFrom] = useState('2023-11-01');
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);

  const { totalFeedUsed, totalCostOfFeedUsed, mostConsumedFeed } = useMemo(() => {
    const filteredLogs = mockFeedingLogs.filter(log => log.date >= dateFrom && log.date <= dateTo);
    
    const totalFeedUsed = filteredLogs.reduce((sum, log) => sum + log.quantityKg, 0);
    const totalCostOfFeedUsed = filteredLogs.reduce((sum, log) => sum + log.cost, 0);

    const feedConsumption: { [key: string]: number } = {};
    filteredLogs.forEach(log => {
      feedConsumption[log.feedTypeName] = (feedConsumption[log.feedTypeName] || 0) + log.quantityKg;
    });

    const mostConsumedFeed = Object.keys(feedConsumption).length > 0
      ? Object.entries(feedConsumption).reduce((a, b) => a[1] > b[1] ? a : b)[0]
      : 'N/A';

    return { totalFeedUsed, totalCostOfFeedUsed, mostConsumedFeed };
  }, [dateFrom, dateTo]);

  const kpiCards = [
    { title: "Total Feed Used (Period)", value: `${totalFeedUsed.toFixed(1)} kg`, icon: Weight, color: "text-blue-600" },
    { title: "Value of Feed Used", value: formatCurrency(totalCostOfFeedUsed), icon: CircleDollarSign, color: "text-green-600" },
    { title: "Most Consumed Feed", value: mostConsumedFeed, icon: Fish, color: "text-purple-600" },
    { title: "Avg. Daily Feed Cost", value: formatCurrency(totalCostOfFeedUsed / 30), icon: Utensils, color: "text-amber-600" },
  ];

  return (
    <main className="flex-1 p-4 sm:p-6 md:p-8 bg-gray-50/50 dark:bg-slate-950">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-50">Feeding Logs</h1>
        <p className="text-gray-600 dark:text-slate-400 mt-1">Review historical feeding data and consumption metrics.</p>
      </header>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiCards.map((card) => (
          <KpiCard key={card.title} title={card.title} value={card.value} icon={card.icon} color={card.color} />
        ))}
      </section>

      {/* Log Table */}
      <Card>
        <CardHeader>
          <CardTitle>Log History</CardTitle>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search by pond or feed..." className="pl-10 h-9" />
            </div>
            <div className="flex items-center gap-2">
              <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="h-9" />
              <span className="text-gray-500">to</span>
              <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} min={dateFrom} className="h-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600 dark:text-slate-300">
              <thead className="text-xs text-gray-700 dark:text-slate-400 uppercase bg-gray-100/80 dark:bg-slate-800/50">
                <tr>
                  <th scope="col" className="px-6 py-3">Date</th>
                  <th scope="col" className="px-6 py-3">Pond</th>
                  <th scope="col" className="px-6 py-3">Feed Type</th>
                  <th scope="col" className="px-6 py-3 text-right">Quantity (kg)</th>
                  <th scope="col" className="px-6 py-3 text-right">Estimated Cost</th>
                  <th scope="col" className="px-6 py-3">Logged By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                {mockFeedingLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-4">{log.date}</td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-slate-100">{log.pondName}</td>
                    <td className="px-6 py-4">{log.feedTypeName}</td>
                    <td className="px-6 py-4 text-right">{log.quantityKg.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right font-medium">{formatCurrency(log.cost)}</td>
                    <td className="px-6 py-4">{log.loggedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default FeedingLogsPage;