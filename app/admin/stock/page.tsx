"use client";

import React, { useState, FormEvent } from 'react';
import Link from 'next/link';
import { Fish, Layers, Truck, Building, PlusCircle } from 'lucide-react';
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

type StockRecord = {
  id: string;
  pondName: string;
  species: string;
  quantity: number;
  stockingDate: string;
  supplier: string;
  averageWeightKg: number;
  status: 'Completed' | 'Pending' | 'Cancelled';
};

// Mock data for demonstration. In a real application, you would fetch this from your database.
const mockStockRecords: StockRecord[] = [
  { id: 'STK-001', pondName: 'Main Koi Pond', species: 'Koi Carp', quantity: 100, stockingDate: '2023-06-10', supplier: 'Aqua Farms Inc.', averageWeightKg: 0.5, status: 'Completed' },
  { id: 'STK-002', pondName: 'Lily Pad Pond', species: 'Tilapia', quantity: 500, stockingDate: '2023-07-15', supplier: 'Fish Breeders Co.', averageWeightKg: 0.2, status: 'Completed' },
  { id: 'STK-003', pondName: 'Breeding Pond A', species: 'Catfish', quantity: 300, stockingDate: '2023-08-01', supplier: 'Aqua Farms Inc.', averageWeightKg: 0.3, status: 'Pending' },
  { id: 'STK-004', pondName: 'Main Koi Pond', species: 'Goldfish', quantity: 200, stockingDate: '2023-08-05', supplier: 'Happy Fish Ltd.', averageWeightKg: 0.1, status: 'Completed' },
  { id: 'STK-005', pondName: 'Quarantine Tank', species: 'Koi Carp', quantity: 10, stockingDate: '2023-08-12', supplier: 'Rare Fish Imports', averageWeightKg: 1.2, status: 'Cancelled' },
];

const statusColorMap = {
  Completed: 'bg-green-100 text-green-800',
  Pending: 'bg-yellow-100 text-yellow-800',
  Cancelled: 'bg-red-100 text-red-800',
};

const StockRecordsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formState, setFormState] = useState({
    pondName: '',
    species: '',
    quantity: '',
    stockingDate: '',
    supplier: '',
    averageWeightKg: '',
  });
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormState(prevState => ({ ...prevState, [id]: value }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setFormState(prevState => ({ ...prevState, [id]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (Object.values(formState).some(value => !value)) {
      setError('Please fill out all fields.');
      return;
    }
    console.log('New Stock Record:', formState);
    // Here you would typically make an API call to save the data.
    // After success, you would refetch the records and close the dialog.
    setIsDialogOpen(false);
  };

  // --- KPI Calculations ---
  const completedRecords = mockStockRecords.filter(r => r.status === 'Completed');
  const totalFishStocked = completedRecords.reduce((sum, record) => sum + record.quantity, 0);
  const speciesDiversity = new Set(mockStockRecords.map(r => r.species)).size;
  const pendingStockings = mockStockRecords.filter(r => r.status === 'Pending').length;

  const supplierCounts = mockStockRecords.reduce((acc, record) => {
    acc[record.supplier] = (acc[record.supplier] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topSupplier = Object.entries(supplierCounts).sort((a, b) => b[1] - a[1])[0] || ['N/A', 0];

  const kpiCards = [
    {
      title: "Total Fish Stocked",
      value: totalFishStocked.toLocaleString(),
      description: "From completed stocking events",
      icon: Fish,
      color: "text-cyan-600 dark:text-cyan-400",
      bgColor: "bg-cyan-500/10"
    },
    {
      title: "Species Diversity",
      value: speciesDiversity.toString(),
      description: "Different species managed",
      icon: Layers,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-500/10"
    },
    {
      title: "Pending Stockings",
      value: pendingStockings.toString(),
      description: "Awaiting completion",
      icon: Truck,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-500/10"
    },
    {
      title: "Top Supplier",
      value: topSupplier[0],
      description: `${topSupplier[1]} stocking events`,
      icon: Building,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-500/10"
    }
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-gray-50/50 dark:bg-slate-950 min-h-screen">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-50">Stocking Records</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">Monitor and manage all fish stocking activities.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
              <PlusCircle className="w-4 h-4" />
              <span>Add New Stock Record</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Stock Record</DialogTitle>
              <DialogDescription>
                Enter the details for the new stocking event.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="pondName" className="text-right">Pond</Label>
                  <Input id="pondName" value={formState.pondName} onChange={handleInputChange} className="col-span-3" placeholder="e.g., Main Koi Pond" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="species" className="text-right">Species</Label>
                  <Input id="species" value={formState.species} onChange={handleInputChange} className="col-span-3" placeholder="e.g., Koi Carp" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="quantity" className="text-right">Quantity</Label>
                  <Input id="quantity" type="number" value={formState.quantity} onChange={handleInputChange} className="col-span-3" placeholder="e.g., 100" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="averageWeightKg" className="text-right">Avg. Weight (kg)</Label>
                  <Input id="averageWeightKg" type="number" step="0.01" value={formState.averageWeightKg} onChange={handleInputChange} className="col-span-3" placeholder="e.g., 0.5" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stockingDate" className="text-right">Stocking Date</Label>
                  <Input id="stockingDate" type="date" value={formState.stockingDate} onChange={handleInputChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="supplier" className="text-right">Supplier</Label>
                  <Select onValueChange={(value) => handleSelectChange('supplier', value)}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...new Set(mockStockRecords.map(r => r.supplier))].map(supplier => (
                        <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {error && <p className="col-span-4 text-sm text-red-600 text-center">{error}</p>}
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Add Record</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      {/* KPI Cards Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 rounded-xl shadow-sm p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400">{card.title}</p>
                <div className={`p-2 rounded-md ${card.bgColor}`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
              <div className="mt-2">
                <p className={`text-3xl font-bold text-gray-900 dark:text-slate-100`}>{card.value}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">{card.description}</p>
              </div>
            </div>
          );
        })}
      </section>

      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
          <thead className="bg-gray-50 dark:bg-slate-800/50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Record ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pond</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Species</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Weight (kg)</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stocking Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-800">
            {mockStockRecords.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{record.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300">{record.pondName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{record.species}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400 text-center">{record.quantity.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400 text-center">{record.averageWeightKg}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{record.stockingDate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{record.supplier}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColorMap[record.status]} dark:bg-opacity-20`}>
                    {record.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link href={`/admin/stock/${record.id}`} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4">
                    Details
                  </Link>
                  <button className="text-red-600 hover:text-red-900 dark:text-red-500 dark:hover:text-red-400">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default StockRecordsPage