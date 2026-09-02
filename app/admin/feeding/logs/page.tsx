'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Utensils, Weight, CircleDollarSign, Fish, Search, PlusCircle, X } from 'lucide-react';
import {
  getFeedingLogs,
  createFeedingLog,
  FeedingLogItem,
} from '@/lib/feeding-logs-api';
import {
  getFeedInventory,
  FeedInventoryRecord,
} from '@/lib/feed-inventory-api';
import { getPonds, Pond } from '@/lib/pond-api'; // Imported pond API module

// --- Reusable UI Components ---

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 rounded-xl shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="p-4 sm:p-6 border-b border-gray-200/80 dark:border-slate-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    {children}
  </div>
);

const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-50">{children}</h3>
);

const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-0 ${className}`}>{children}</div>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className="block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 sm:text-sm text-slate-900 dark:text-slate-100 disabled:bg-gray-100 dark:disabled:bg-slate-800/50"
    {...props}
  />
);

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    className="block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 sm:text-sm text-slate-900 dark:text-slate-100"
    {...props}
  />
);

const Label = ({ children, ...props }: { children: React.ReactNode } & React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1" {...props}>
    {children}
  </label>
);

const Button = ({
  children,
  variant = 'default',
  className = '',
  ...props
}: {
  children: React.ReactNode;
  variant?: 'default' | 'outline';
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const baseStyle =
    'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  const variantStyles = {
    default:
      'bg-slate-900 text-white hover:bg-slate-900/90 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90',
    outline:
      'border border-gray-300 dark:border-slate-700 bg-transparent hover:bg-gray-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100',
  };
  return (
    <button className={`${baseStyle} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const KpiCard = ({ title, value, icon: Icon, color }: { title: string; value: string; icon: React.ElementType; color: string }) => (
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

// --- Helper Functions ---

const formatCurrency = (amount: number) =>
  amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

export default function FeedingLogsPage() {
  const [feedingLogs, setFeedingLogs] = useState<FeedingLogItem[]>([]);
  const [inventoryList, setInventoryList] = useState<FeedInventoryRecord[]>([]);
  const [pondsList, setPondsList] = useState<Pond[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    pond_name: '',
    species: '',
    feed_type_name: '',
    quantity_kg: '',
    cost: '',
    notes: '',
  });

  // --- Fetch Logs, Inventory, & Ponds ---
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [logsRes, invList, pondRes] = await Promise.all([
        getFeedingLogs().catch(() => ({ status: 'success', data: [] })),
        getFeedInventory().catch(() => []),
        getPonds(null).catch(() => []),
      ]);

      setFeedingLogs(logsRes.data || []);
      setInventoryList(invList || []);
      setPondsList(pondRes || []);
    } catch (err: any) {
      setError(err.message || 'Error loading page data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- Dynamic Form Handlers ---

  const handlePondChange = (selectedPondName: string) => {
    const selectedPond = pondsList.find(
      (pond) => pond.name === selectedPondName
    );

    setFormData((prev) => ({
      ...prev,
      pond_name: selectedPondName,
      // Auto-populate species if configured on selected pond object
      species: selectedPond?.currentStock?.species || prev.species,
    }));
  };

  const handleFeedTypeChange = (selectedFeedName: string) => {
    const selectedItem = inventoryList.find(
      (item) => (item.feed_name || item.feed_type) === selectedFeedName
    );

    let calculatedCost = formData.cost;
    if (selectedItem && formData.quantity_kg) {
      const qtyKg = parseFloat(formData.quantity_kg) || 0;
      const weightPerBag = selectedItem.av_weight_per_bag || 1;
      const costPerBag = selectedItem.feed_cost_per_bag || 0;
      if (weightPerBag > 0 && costPerBag > 0) {
        calculatedCost = ((qtyKg / weightPerBag) * costPerBag).toFixed(2);
      }
    }

    setFormData((prev) => ({
      ...prev,
      feed_type_name: selectedFeedName,
      cost: calculatedCost,
    }));
  };

  const handleQuantityChange = (qtyVal: string) => {
    const qtyKg = parseFloat(qtyVal) || 0;
    const selectedItem = inventoryList.find(
      (item) => (item.feed_name || item.feed_type) === formData.feed_type_name
    );

    let calculatedCost = formData.cost;
    if (selectedItem && selectedItem.av_weight_per_bag && selectedItem.feed_cost_per_bag) {
      calculatedCost = ((qtyKg / selectedItem.av_weight_per_bag) * selectedItem.feed_cost_per_bag).toFixed(2);
    }

    setFormData((prev) => ({
      ...prev,
      quantity_kg: qtyVal,
      cost: calculatedCost,
    }));
  };

  // --- Submit Feeding Log ---
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.pond_name) {
      setFormError('Please select a pond.');
      return;
    }

    if (!formData.feed_type_name) {
      setFormError('Please select a feed type.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createFeedingLog({
        feeding_date: formData.date,
        pond_name: formData.pond_name,
        species: formData.species,
        feed_type: formData.feed_type_name,
        feed_quantity: parseFloat(formData.quantity_kg),
        feed_cost: parseFloat(formData.cost) || 0,
        notes: formData.notes || undefined,
      });

      await loadData();
      setIsModalOpen(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        pond_name: '',
        species: '',
        feed_type_name: '',
        quantity_kg: '',
        cost: '',
        notes: '',
      });
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit feeding log.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Filtered Logs & Metrics ---
  const filteredLogs = useMemo(() => {
    return feedingLogs.filter((log) => {
      const logDate = log.feeding_date || log.date || '';
      const pond = (log.pond_name || '').toLowerCase();
      const feed = (log.feed_type || log.feed_type_name || '').toLowerCase();
      const species = (log.species || '').toLowerCase();
      const query = searchQuery.toLowerCase();

      const matchesDateFrom = dateFrom ? logDate >= dateFrom : true;
      const matchesDateTo = dateTo ? logDate <= dateTo : true;
      const matchesSearch = pond.includes(query) || feed.includes(query) || species.includes(query);

      return matchesDateFrom && matchesDateTo && matchesSearch;
    });
  }, [feedingLogs, dateFrom, dateTo, searchQuery]);

  const { totalFeedUsed, totalCostOfFeedUsed, mostConsumedFeed } = useMemo(() => {
    const totalFeedUsed = filteredLogs.reduce(
      (sum, log) => sum + (log.feed_quantity ?? log.quantity_kg ?? 0),
      0
    );
    const totalCostOfFeedUsed = filteredLogs.reduce(
      (sum, log) => sum + (log.feed_cost ?? log.cost ?? 0),
      0
    );

    const feedConsumption: { [key: string]: number } = {};
    filteredLogs.forEach((log) => {
      const feedName = log.feed_type || log.feed_type_name || 'Unknown Feed';
      const qty = log.feed_quantity ?? log.quantity_kg ?? 0;
      feedConsumption[feedName] = (feedConsumption[feedName] || 0) + qty;
    });

    const mostConsumedFeed =
      Object.keys(feedConsumption).length > 0
        ? Object.entries(feedConsumption).reduce((a, b) => (a[1] > b[1] ? a : b))[0]
        : 'N/A';

    return { totalFeedUsed, totalCostOfFeedUsed, mostConsumedFeed };
  }, [filteredLogs]);

  const kpiCards = [
    { title: 'Total Feed Used', value: `${totalFeedUsed.toFixed(1)} kg`, icon: Weight, color: 'text-blue-600' },
    { title: 'Value of Feed Used', value: formatCurrency(totalCostOfFeedUsed), icon: CircleDollarSign, color: 'text-green-600' },
    { title: 'Most Consumed Feed', value: mostConsumedFeed, icon: Fish, color: 'text-purple-600' },
    { title: 'Avg. Daily Feed Cost', value: formatCurrency(totalCostOfFeedUsed / 30), icon: Utensils, color: 'text-amber-600' },
  ];

  return (
    <main className="flex-1 p-4 sm:p-6 md:p-8 bg-gray-50/50 dark:bg-slate-950 min-h-screen">
      {/* Page Title Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-50">Feeding Logs</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">Review historical feeding data and monitor consumption rates.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="h-11 px-4 gap-2">
          <PlusCircle className="h-5 w-5" />
          <span>Record Feeding Log</span>
        </Button>
      </header>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiCards.map((card) => (
          <KpiCard key={card.title} title={card.title} value={card.value} icon={card.icon} color={card.color} />
        ))}
      </section>

      {/* Main Table Card */}
      <Card>
        <CardHeader>
          <CardTitle>Log History</CardTitle>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search pond, species, feed..."
                className="pl-10 h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-9" />
              <span className="text-gray-500 text-sm">to</span>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} min={dateFrom} className="h-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600 dark:text-slate-300">
              <thead className="text-xs text-gray-700 dark:text-slate-400 uppercase bg-gray-100/80 dark:bg-slate-800/50">
                <tr>
                  <th scope="col" className="px-6 py-3">Date</th>
                  <th scope="col" className="px-6 py-3">Pond Name</th>
                  <th scope="col" className="px-6 py-3">Species</th>
                  <th scope="col" className="px-6 py-3">Feed Type</th>
                  <th scope="col" className="px-6 py-3 text-right">Quantity (kg)</th>
                  <th scope="col" className="px-6 py-3 text-right">Cost</th>
                  <th scope="col" className="px-6 py-3">Recorded By</th>
                  <th scope="col" className="px-6 py-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      Loading feeding logs...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-red-500">
                      {error}
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      No matching feeding logs found.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log, index) => (
                    <tr key={log.id || index} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50">
                      <td className="px-6 py-4">{log.feeding_date || log.date || '-'}</td>
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-slate-100">
                        {log.pond_name || '-'}
                      </td>
                      <td className="px-6 py-4">{log.species || 'N/A'}</td>
                      <td className="px-6 py-4">{log.feed_type || log.feed_type_name || '-'}</td>
                      <td className="px-6 py-4 text-right">
                        {(log.feed_quantity ?? log.quantity_kg ?? 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right font-medium">
                        {formatCurrency(log.feed_cost ?? log.cost ?? 0)}
                      </td>
                      <td className="px-6 py-4">{log.recorded_by || 'System'}</td>
                      <td className="px-6 py-4 max-w-xs truncate text-gray-500">{log.notes || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* --- Modal Component --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-200 dark:border-slate-800 w-full max-w-lg overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-800">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-50">Record New Feeding Log</h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setFormError(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="pond_name">Pond Name</Label>
                  {pondsList.length > 0 ? (
                    <Select
                      id="pond_name"
                      required
                      value={formData.pond_name}
                      onChange={(e) => handlePondChange(e.target.value)}
                    >
                      <option value="">Select pond...</option>
                      {pondsList.map((pond) => {
                        const name = pond.name || 'Unnamed Pond';
                        return (
                          <option key={pond.id || name} value={name}>
                            {name} {pond.status ? `(${pond.status})` : ''}
                          </option>
                        );
                      })}
                    </Select>
                  ) : (
                    <Input
                      id="pond_name"
                      type="text"
                      placeholder="e.g. Main Pond"
                      required
                      value={formData.pond_name}
                      onChange={(e) => setFormData({ ...formData, pond_name: e.target.value })}
                    />
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="species">Species</Label>
                <Input
                  id="species"
                  type="text"
                  placeholder="e.g. Catfish / Tilapia"
                  required
                  value={formData.species}
                  onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="feed_type_name">Feed Type (from Inventory)</Label>
                {inventoryList.length > 0 ? (
                  <Select
                    id="feed_type_name"
                    required
                    value={formData.feed_type_name}
                    onChange={(e) => handleFeedTypeChange(e.target.value)}
                  >
                    <option value="">Select feed type from inventory...</option>
                    {inventoryList.map((item) => {
                      const name = item.feed_name || item.feed_type || 'Unnamed Feed';
                      const bags = item.quantity || 0;
                      const weightPerBag = item.av_weight_per_bag || 1;
                      const availableKg = (bags * weightPerBag).toFixed(1);
                      return (
                        <option key={item.id || name} value={name}>
                          {name} ({availableKg} kg in stock)
                        </option>
                      );
                    })}
                  </Select>
                ) : (
                  <Input
                    id="feed_type_name"
                    type="text"
                    placeholder="e.g. Grower"
                    required
                    value={formData.feed_type_name}
                    onChange={(e) => setFormData({ ...formData, feed_type_name: e.target.value })}
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity_kg">Quantity (kg)</Label>
                  <Input
                    id="quantity_kg"
                    type="number"
                    step="0.1"
                    placeholder="50.0"
                    required
                    value={formData.quantity_kg}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="cost">Estimated Cost ($)</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    placeholder="150.00"
                    required
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  type="text"
                  placeholder="e.g. Evening feeding round"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-800 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsModalOpen(false);
                    setFormError(null);
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Log'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}