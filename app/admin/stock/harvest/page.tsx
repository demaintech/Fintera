"use client";

import React, { useState, FormEvent } from 'react';
import { Anchor, Scale, Fish, ListChecks, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type HarvestRecord = {
  id: string;
  pondName: string;
  species: string;
  quantity: number;
  averageWeightKg: number;
  totalWeightKg: number;
  harvestDate: string;
  method: 'Netting' | 'Draining' | 'Trapping';
  recordedBy: string;
};

const mockHarvestRecords: HarvestRecord[] = [
  { id: 'HARV-001', pondName: 'Alpha-1', species: 'Tilapia', quantity: 1200, averageWeightKg: 0.8, totalWeightKg: 960, harvestDate: '2023-10-15', method: 'Netting', recordedBy: 'Alex Ray' },
  { id: 'HARV-002', pondName: 'Bravo-2', species: 'Catfish', quantity: 800, averageWeightKg: 1.2, totalWeightKg: 960, harvestDate: '2023-09-20', method: 'Draining', recordedBy: 'Mia Wong' },
  { id: 'HARV-003', pondName: 'Echo-3', species: 'Shrimp', quantity: 5000, averageWeightKg: 0.02, totalWeightKg: 100, harvestDate: '2023-11-01', method: 'Trapping', recordedBy: 'Alex Ray' },
  { id: 'HARV-004', pondName: 'Foxtrot-1', species: 'Tilapia', quantity: 1150, averageWeightKg: 0.85, totalWeightKg: 977.5, harvestDate: '2023-10-25', method: 'Netting', recordedBy: 'Leo Kim' },
];

const HarvestPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formState, setFormState] = useState({
    pondName: '',
    species: '',
    quantity: '',
    averageWeightKg: '',
    harvestDate: '',
    method: 'Netting' as HarvestRecord['method'],
    recordedBy: '',
  });
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormState(prevState => ({ ...prevState, [id]: value }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setFormState(prevState => ({ ...prevState, [id]: value as HarvestRecord['method'] }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (Object.values(formState).some(value => !value)) {
      setError('Please fill out all fields.');
      return;
    }
    console.log('New Harvest Record:', formState);
    // API call to save the data would go here.
    setIsDialogOpen(false);
  };

  // --- KPI Calculations ---
  const totalHarvestWeight = mockHarvestRecords.reduce((sum, r) => sum + r.totalWeightKg, 0);
  const totalHarvestCount = mockHarvestRecords.reduce((sum, r) => sum + r.quantity, 0);
  const averageHarvestWeight = totalHarvestWeight / mockHarvestRecords.length || 0;
  const totalRecords = mockHarvestRecords.length;

  const kpiCards = [
    { title: "Total Harvested Weight", value: `${totalHarvestWeight.toLocaleString()} kg`, icon: Anchor, color: "text-blue-600", bgColor: "bg-blue-500/10" },
    { title: "Total Harvested Fish", value: totalHarvestCount.toLocaleString(), icon: Fish, color: "text-green-600", bgColor: "bg-green-500/10" },
    { title: "Avg. Harvest Weight", value: `${averageHarvestWeight.toFixed(2)} kg`, icon: Scale, color: "text-amber-600", bgColor: "bg-amber-500/10" },
    { title: "Total Harvest Events", value: totalRecords.toString(), icon: ListChecks, color: "text-purple-600", bgColor: "bg-purple-500/10" },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-gray-50/50 dark:bg-slate-950 min-h-screen">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-50">Harvest Records</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">Track and manage all harvest activities.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="w-4 h-4 mr-2" />
              Add New Harvest Record
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Harvest Record</DialogTitle>
              <DialogDescription>Enter the details for the new harvest event.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="pondName" className="text-right">Pond</Label><Input id="pondName" value={formState.pondName} onChange={handleInputChange} className="col-span-3" placeholder="e.g., Alpha-1" /></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="species" className="text-right">Species</Label><Input id="species" value={formState.species} onChange={handleInputChange} className="col-span-3" placeholder="e.g., Tilapia" /></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="quantity" className="text-right">Quantity</Label><Input id="quantity" type="number" value={formState.quantity} onChange={handleInputChange} className="col-span-3" placeholder="e.g., 1200" /></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="averageWeightKg" className="text-right">Avg. Weight (kg)</Label><Input id="averageWeightKg" type="number" step="0.01" value={formState.averageWeightKg} onChange={handleInputChange} className="col-span-3" placeholder="e.g., 0.8" /></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="harvestDate" className="text-right">Harvest Date</Label><Input id="harvestDate" type="date" value={formState.harvestDate} onChange={handleInputChange} className="col-span-3" /></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="method" className="text-right">Method</Label><Select onValueChange={(value) => handleSelectChange('method', value)} defaultValue={formState.method}><SelectTrigger className="col-span-3"><SelectValue placeholder="Select a method" /></SelectTrigger><SelectContent><SelectItem value="Netting">Netting</SelectItem><SelectItem value="Draining">Draining</SelectItem><SelectItem value="Trapping">Trapping</SelectItem></SelectContent></Select></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="recordedBy" className="text-right">Recorded By</Label><Input id="recordedBy" value={formState.recordedBy} onChange={handleInputChange} className="col-span-3" placeholder="e.g., Alex Ray" /></div>
                {error && <p className="col-span-4 text-sm text-red-600 text-center">{error}</p>}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Save Record</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 rounded-xl shadow-sm p-5">
              <div className="flex items-center justify-between"><p className="text-sm font-medium text-gray-500 dark:text-slate-400">{card.title}</p><div className={`p-2 rounded-md ${card.bgColor}`}><Icon className={`w-5 h-5 ${card.color}`} /></div></div>
              <div className="mt-2"><p className={`text-3xl font-bold text-gray-900 dark:text-slate-100`}>{card.value}</p></div>
            </div>
          );
        })}
      </section>

      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
          <thead className="bg-gray-50 dark:bg-slate-800/50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Record ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pond</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Species</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Weight (kg)</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recorded By</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-800">
            {mockHarvestRecords.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{record.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{record.harvestDate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300">{record.pondName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{record.species}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400 text-center">{record.quantity.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400 text-center">{record.totalWeightKg.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{record.method}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{record.recordedBy}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-indigo-600 hover:text-indigo-900">Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HarvestPage;