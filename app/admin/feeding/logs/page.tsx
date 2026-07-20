"use client";

import React, { useState, FormEvent, useMemo } from 'react';
import { Package, PackageCheck, DollarSign, History, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogDescription, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MOCK_FEED_TYPES } from '@/components/types';

type FeedStockRecord = {
  id: string;
  feedTypeId: string;
  feedTypeName: string;
  quantityKg: number;
  purchaseDate: string;
  costPerKg: number;
  totalCost: number;
  supplier: string;
};

type FeedUsageLog = {
  id: string;
  logDate: string;
  pondName: string;
  feedTypeName: string;
  quantityKg: number;
  cost: number;
  fedBy: string;
};

const mockFeedStock: FeedStockRecord[] = [
  { id: 'FS-001', feedTypeId: 'feed-01', feedTypeName: 'Starter Mash (45%)', quantityKg: 500, purchaseDate: '2023-11-01', costPerKg: 1.20, totalCost: 600, supplier: 'Feed Co.' },
  { id: 'FS-002', feedTypeId: 'feed-02', feedTypeName: 'Grower Pellet (35%)', quantityKg: 1000, purchaseDate: '2023-11-01', costPerKg: 0.95, totalCost: 950, supplier: 'Aqua Feeds' },
  { id: 'FS-003', feedTypeId: 'feed-03', feedTypeName: 'Finisher Pellet (28%)', quantityKg: 800, purchaseDate: '2023-10-20', costPerKg: 0.75, totalCost: 600, supplier: 'Feed Co.' },
];

const mockFeedUsageLogs: FeedUsageLog[] = [
  { id: 'LOG-001', logDate: '2023-11-15', pondName: 'Pond A1', feedTypeName: 'Grower Pellet (35%)', quantityKg: 10.5, cost: 9.98, fedBy: 'John D.' },
  { id: 'LOG-002', logDate: '2023-11-15', pondName: 'Nursery Pond N1', feedTypeName: 'High-Protein Fry Feed', quantityKg: 1.5, cost: 3.75, fedBy: 'Jane S.' },
  { id: 'LOG-003', logDate: '2023-11-14', pondName: 'Pond A1', feedTypeName: 'Grower Pellet (35%)', quantityKg: 10.5, cost: 9.98, fedBy: 'John D.' },
  { id: 'LOG-004', logDate: '2023-11-14', pondName: 'Pond B1 (Broodstock)', feedTypeName: 'Starter Mash (45%)', quantityKg: 3, cost: 3.60, fedBy: 'Mike R.' },
];

const FeedingLogsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formState, setFormState] = useState({ feedTypeId: '', quantityKg: '', totalCost: '', purchaseDate: '', supplier: '' });
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (Object.values(formState).some(v => !v)) {
      setError('Please fill all fields.');
      return;
    }
    console.log('New Feed Stock:', formState);
    // API call to save new stock would go here
    setIsDialogOpen(false);
  };

  const { totalAvailableKg, totalAvailableValue, totalUsedKg, totalUsedValue } = useMemo(() => {
    const totalAvailableKg = mockFeedStock.reduce((sum, s) => sum + s.quantityKg, 0);
    const totalAvailableValue = mockFeedStock.reduce((sum, s) => sum + s.totalCost, 0);
    const totalUsedKg = mockFeedUsageLogs.reduce((sum, log) => sum + log.quantityKg, 0);
    const totalUsedValue = mockFeedUsageLogs.reduce((sum, log) => sum + log.cost, 0);
    return { totalAvailableKg, totalAvailableValue, totalUsedKg, totalUsedValue };
  }, []);

  const kpiCards = [
    { title: "Total Feed Available", value: `${totalAvailableKg.toLocaleString()} kg`, icon: Package, color: "text-blue-600" },
    { title: "Value of Available Feed", value: `$${totalAvailableValue.toLocaleString()}`, icon: DollarSign, color: "text-green-600" },
    { title: "Total Feed Used (All Time)", value: `${totalUsedKg.toLocaleString()} kg`, icon: PackageCheck, color: "text-amber-600" },
    { title: "Cost of Used Feed (All Time)", value: `$${totalUsedValue.toLocaleString()}`, icon: History, color: "text-red-600" },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-gray-50/50 min-h-screen">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Feed Inventory & Logs</h1>
          <p className="text-gray-600 mt-1">Track feed stock, costs, and consumption history.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Feed Stock
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Add New Feed Stock</DialogTitle><DialogDescription>Record a new purchase of feed.</DialogDescription></DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="feedTypeId" className="text-right">
                    Feed Type
                  </Label>
                  <Select onValueChange={(v: string) => setFormState((s) => ({ ...s, feedTypeId: v }))}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select feed" />
                    </SelectTrigger>
                    <SelectContent>{MOCK_FEED_TYPES.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="quantityKg" className="text-right">Quantity (kg)</Label><Input id="quantityKg" type="number" value={formState.quantityKg} onChange={(e) => setFormState(s => ({ ...s, quantityKg: e.target.value }))} className="col-span-3" /></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="totalCost" className="text-right">Total Cost ($)</Label><Input id="totalCost" type="number" value={formState.totalCost} onChange={(e) => setFormState(s => ({ ...s, totalCost: e.target.value }))} className="col-span-3" /></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="purchaseDate" className="text-right">Purchase Date</Label><Input id="purchaseDate" type="date" value={formState.purchaseDate} onChange={(e) => setFormState(s => ({ ...s, purchaseDate: e.target.value }))} className="col-span-3" /></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="supplier" className="text-right">Supplier</Label><Input id="supplier" value={formState.supplier} onChange={(e) => setFormState(s => ({ ...s, supplier: e.target.value }))} className="col-span-3" /></div>
                {error && <p className="col-span-4 text-sm text-red-600 text-center">{error}</p>}
              </div>
              <DialogFooter><Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button><Button type="submit">Add Stock</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white border rounded-xl shadow-sm p-5">
              <div className="flex items-center justify-between"><p className="text-sm font-medium text-gray-500">{card.title}</p><Icon className={`w-5 h-5 ${card.color}`} /></div>
              <p className="mt-2 text-3xl font-bold text-gray-900">{card.value}</p>
            </div>
          );
        })}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Current Inventory</h2>
          <ul className="space-y-4">
            {mockFeedStock.map(stock => (
              <li key={stock.id} className="border-b pb-3 last:border-b-0">
                <p className="font-semibold">{stock.feedTypeName}</p>
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>{stock.quantityKg.toLocaleString()} kg</span>
                  <span className="font-medium">${stock.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-x-auto">
          <h2 className="text-xl font-bold text-gray-900 p-6 border-b">Feed Usage Logs</h2>
          <table className="min-w-full divide-y">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pond</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feed Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fed By</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y">
              {mockFeedUsageLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.logDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{log.pondName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.feedTypeName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.quantityKg} kg</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${log.cost.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.fedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FeedingLogsPage;