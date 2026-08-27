'use client';

import React, { useState, useEffect, useMemo, FormEvent, useCallback } from 'react';
import { Package, DollarSign, AlertTriangle, PlusCircle, MoreHorizontal, Loader2 } from 'lucide-react';
import {
  getFeedInventory,
  createFeedInventory,
  FeedInventoryRecord,
} from '@/lib/feed-inventory-api';
// Import directly from your feeding logs service file
import { getFeedingLogs, FeedingLogItem } from '@/lib/feeding-logs-api';

// --- Reusable UI Components ---

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 rounded-xl shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="p-4 sm:p-6 border-b border-gray-200/80 dark:border-slate-700/50 flex justify-between items-center">
    {children}
  </div>
);

const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-50">{children}</h3>
);

const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-0 ${className}`}>{children}</div>
);

const Button = ({
  children,
  variant = 'default',
  className = '',
  ...props
}: {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const baseStyle =
    'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';
  const variantStyles = {
    default: 'bg-slate-900 text-white hover:bg-slate-900/90 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90',
    outline: 'border border-gray-300 dark:border-slate-700 bg-transparent hover:bg-gray-100/50 dark:hover:bg-slate-800/50',
    ghost: 'hover:bg-gray-100/50 dark:hover:bg-slate-800/50',
  };
  return (
    <button className={`${baseStyle} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Badge = ({ children, color }: { children: React.ReactNode; color: string }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>{children}</span>
);

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

// --- Main Page Component ---

export default function FeedInventoryPage() {
  const [feedInventoryList, setFeedInventoryList] = useState<FeedInventoryRecord[]>([]);
  const [feedingLogs, setFeedingLogs] = useState<FeedingLogItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    feed_name: '',
    feed_type: '',
    quantity: 0,
    av_weight_per_bag: 0,
    feed_cost_per_bag: 0,
    supplier: '',
    expiry_date: new Date().toISOString().split('T')[0],
    purchase_date: new Date().toISOString().split('T')[0],
    status: 'In Stock',
  });

  const calculatedTotalCost = useMemo(() => {
    const qty = Number(formData.quantity) || 0;
    const costPerBag = Number(formData.feed_cost_per_bag) || 0;
    return +(qty * costPerBag).toFixed(2);
  }, [formData.quantity, formData.feed_cost_per_bag]);

  // Fetch Inventory & Feeding Logs concurrently
  const fetchInventoryAndLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [inventoryRes, logsResponse] = await Promise.all([
        getFeedInventory(),
        getFeedingLogs().catch(() => ({ status: 'error', data: [] })),
      ]);

      setFeedInventoryList(Array.isArray(inventoryRes) ? inventoryRes : []);
      
      // Handle response structure from getFeedingLogs API
      const logsData = Array.isArray(logsResponse?.data) ? logsResponse.data : [];
      setFeedingLogs(logsData);
    } catch (err: any) {
      setError(err?.message || 'Error fetching inventory or feeding logs.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventoryAndLogs();
  }, [fetchInventoryAndLogs]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : Number(value)) : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        feed_name: formData.feed_name,
        feed_type: formData.feed_type,
        quantity: Number(formData.quantity),
        av_weight_per_bag: Number(formData.av_weight_per_bag),
        feed_cost_per_bag: Number(formData.feed_cost_per_bag),
        feed_total_cost: calculatedTotalCost,
        supplier: formData.supplier,
        purchase_date: formData.purchase_date,
        expiry_date: formData.expiry_date,
        status: formData.status,
      };

      const createdRecord = await createFeedInventory(payload);

      setFeedInventoryList((prev) => [createdRecord, ...prev]);
      setFormData({
        feed_name: '',
        feed_type: '',
        quantity: 0,
        av_weight_per_bag: 0,
        feed_cost_per_bag: 0,
        supplier: '',
        expiry_date: new Date().toISOString().split('T')[0],
        purchase_date: new Date().toISOString().split('T')[0],
        status: 'In Stock',
      });
      setIsDialogOpen(false);
    } catch (err: any) {
      setError(err?.message || 'Error creating feed record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Map inventory items and deduct usage found in feeding logs
  const inventoryWithDeductions = useMemo(() => {
    const safeInventory = Array.isArray(feedInventoryList) ? feedInventoryList : [];
    const safeLogs = Array.isArray(feedingLogs) ? feedingLogs : [];

    // Aggregate total usage (in KG) by normalized feed type name
    const usageByFeedType: Record<string, number> = {};

    safeLogs.forEach((log) => {
      const feedTypeKey = (log.feed_type || log.feed_type_name || '').trim().toLowerCase();
      if (!feedTypeKey) return;

      const qtyKg = Number(log.feed_quantity ?? log.quantity_kg ?? 0);
      usageByFeedType[feedTypeKey] = (usageByFeedType[feedTypeKey] || 0) + qtyKg;
    });

    return safeInventory.map((item) => {
      const feedNameKey = (item.feed_name || item.feed_type || '').trim().toLowerCase();
      const feedTypeKey = (item.feed_type || '').trim().toLowerCase();

      // Find deducted kg matching by feed name or feed type
      const totalDeductedKg = usageByFeedType[feedNameKey] || usageByFeedType[feedTypeKey] || 0;

      const initialBags = Number(item.quantity) || 0;
      const weightPerBag = Number(item.av_weight_per_bag) || 1;
      const costPerBag = Number(item.feed_cost_per_bag) || 0;

      const initialKg = initialBags * weightPerBag;
      const remainingKg = Math.max(0, initialKg - totalDeductedKg);
      const remainingBags = weightPerBag > 0 ? remainingKg / weightPerBag : 0;
      const deductedBags = weightPerBag > 0 ? totalDeductedKg / weightPerBag : 0;
      const remainingValue = remainingBags * costPerBag;

      return {
        ...item,
        initialBags,
        deductedKg: totalDeductedKg,
        deductedBags,
        remainingBags,
        remainingKg,
        remainingValue,
      };
    });
  }, [feedInventoryList, feedingLogs]);

  // Aggregate values for KPI summaries
  const { totalAvailableKg, totalAvailableValue, lowStockItemsCount, totalRemainingBags } = useMemo(() => {
    let totalAvailableKg = 0;
    let totalAvailableValue = 0;
    let lowStockItemsCount = 0;
    let totalRemainingBags = 0;

    inventoryWithDeductions.forEach((item) => {
      totalAvailableKg += item.remainingKg;
      totalAvailableValue += item.remainingValue;
      totalRemainingBags += item.remainingBags;

      if (item.remainingBags <= 5) {
        lowStockItemsCount++;
      }
    });

    return { totalAvailableKg, totalAvailableValue, lowStockItemsCount, totalRemainingBags };
  }, [inventoryWithDeductions]);

  const kpiCards = [
    { title: 'Total Feed Available', value: `${totalAvailableKg.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg`, icon: Package, color: 'text-blue-600' },
    { title: 'Value of Available Feed', value: `$${totalAvailableValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, color: 'text-green-600' },
    { title: 'Items Low on Stock', value: `${lowStockItemsCount}`, icon: AlertTriangle, color: 'text-amber-600' },
  ];

  const getStatusBadge = (remainingBags: number) => {
    if (remainingBags <= 0) {
      return <Badge color="bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">Out of Stock</Badge>;
    }
    if (remainingBags <= 5) {
      return <Badge color="bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">Low Stock</Badge>;
    }
    return <Badge color="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">In Stock</Badge>;
  };

  return (
    <main className="flex-1 p-4 sm:p-6 md:p-8 bg-gray-50/50 dark:bg-slate-950 min-h-screen">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-50">Feed Inventory</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">Live overview of stock levels, deducted feeding logs, and current asset valuation.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2 h-11 px-4">
          <PlusCircle className="w-4 h-4 mr-1" />
          Add Feed Stock
        </Button>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* KPI Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {kpiCards.map((card) => (
          <KpiCard key={card.title} title={card.title} value={card.value} icon={card.icon} color={card.color} />
        ))}
      </section>

      {/* Table Section */}
      <Card>
        <CardHeader>
          <CardTitle>Current Stock</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center p-12 text-slate-500 gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading inventory data...</span>
              </div>
            ) : inventoryWithDeductions.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                No feed inventory records found. Click "Add Feed Stock" to create one.
              </div>
            ) : (
              <table className="w-full text-sm text-left text-gray-600 dark:text-slate-300">
                <thead className="text-xs text-gray-700 dark:text-slate-400 uppercase bg-gray-100/80 dark:bg-slate-800/50">
                  <tr>
                    <th scope="col" className="px-6 py-3">Feed Name</th>
                    <th scope="col" className="px-6 py-3">Type</th>
                    <th scope="col" className="px-6 py-3 text-center">Status</th>
                    <th scope="col" className="px-6 py-3 text-right">Remaining Bags</th>
                    <th scope="col" className="px-6 py-3 text-right">Deducted Feed</th>
                    <th scope="col" className="px-6 py-3 text-right">Weight / Bag</th>
                    <th scope="col" className="px-6 py-3 text-right">Cost / Bag</th>
                    <th scope="col" className="px-6 py-3 text-right">Remaining Value</th>
                    <th scope="col" className="px-6 py-3">Supplier</th>
                    <th scope="col" className="px-6 py-3">Purchase Date</th>
                    <th scope="col" className="px-6 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                  {inventoryWithDeductions.map((stock, index) => (
                    <tr key={stock.id || index} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-slate-100">{stock.feed_name}</td>
                      <td className="px-6 py-4">{stock.feed_type}</td>
                      <td className="px-6 py-4 text-center">{getStatusBadge(stock.remainingBags)}</td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-slate-100">
                        {stock.remainingBags.toFixed(1)} <span className="text-xs text-gray-400 font-normal">/ {stock.initialBags} bags</span>
                      </td>
                      <td className="px-6 py-4 text-right text-amber-600 dark:text-amber-400">
                        -{stock.deductedKg.toFixed(1)} kg <span className="text-xs font-normal">({stock.deductedBags.toFixed(1)} bags)</span>
                      </td>
                      <td className="px-6 py-4 text-right">{stock.av_weight_per_bag} kg</td>
                      <td className="px-6 py-4 text-right">${Number(stock.feed_cost_per_bag || 0).toFixed(2)}</td>
                      <td className="px-6 py-4 text-right font-medium text-green-600 dark:text-green-400">
                        ${stock.remainingValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4">{stock.supplier}</td>
                      <td className="px-6 py-4">{stock.purchase_date}</td>
                      <td className="px-6 py-4 text-center">
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="font-semibold text-gray-900 dark:text-slate-100 bg-gray-100/80 dark:bg-slate-800/50">
                  <tr>
                    <td colSpan={3} className="px-6 py-3 text-right">Totals:</td>
                    <td className="px-6 py-3 text-right">{totalRemainingBags.toFixed(1)} bags</td>
                    <td></td>
                    <td className="px-6 py-3 text-right">{totalAvailableKg.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg</td>
                    <td></td>
                    <td className="px-6 py-3 text-right">${totalAvailableValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td colSpan={3}></td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Stock Dialog Modal */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsDialogOpen(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl p-6 w-full max-w-lg border border-gray-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-semibold mb-1 text-gray-900 dark:text-slate-100">Add New Feed Stock</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">Enter new feed stock to add to your inventory list.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Feed Name</label>
                  <input
                    type="text"
                    name="feed_name"
                    value={formData.feed_name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Starter Mash"
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Feed Type</label>
                  <input
                    type="text"
                    name="feed_type"
                    value={formData.feed_type}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Pellets (45%)"
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Quantity (Bags)</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Avg Weight/Bag (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="av_weight_per_bag"
                    value={formData.av_weight_per_bag}
                    onChange={handleInputChange}
                    required
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Cost / Bag ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="feed_cost_per_bag"
                    value={formData.feed_cost_per_bag}
                    onChange={handleInputChange}
                    required
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Supplier</label>
                  <input
                    type="text"
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleInputChange}
                    required
                    placeholder="Supplier Name"
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent text-sm"
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Purchase Date</label>
                  <input
                    type="date"
                    name="purchase_date"
                    value={formData.purchase_date}
                    onChange={handleInputChange}
                    required
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    name="expiry_date"
                    value={formData.expiry_date}
                    onChange={handleInputChange}
                    required
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Total Cost (Calculated)</label>
                <input
                  type="text"
                  value={`$${calculatedTotalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                  disabled
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-slate-800 bg-gray-100 dark:bg-slate-800 text-sm font-semibold"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-800">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="h-10 px-4">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="h-10 px-4">
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    'Save Feed Stock'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}