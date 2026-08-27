"use client";

import React, { useState, FormEvent, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Fish, Layers, Truck, Building, PlusCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
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
import {
  getStockRecords,
  createStockRecord,
  deleteStockRecord,
  type StockRecord,
  type StockStatus,
} from '@/lib/stock-api';
import { getPonds, type Pond } from '@/lib/pond-api';

const statusColorMap: Record<StockStatus, string> = {
  Completed: 'bg-green-100 text-green-800',
  Pending: 'bg-yellow-100 text-yellow-800',
  Cancelled: 'bg-red-100 text-red-800',
};

const DEFAULT_SUPPLIERS = ['Aqua Farms Inc.', 'Fish Breeders Co.', 'Happy Fish Ltd.', 'Rare Fish Imports'];

// Helper function to format today's date as YYYY-MM-DD
const getTodayDate = () => new Date().toISOString().split('T')[0];

const StockRecordsPage = () => {
  const router = useRouter();
  const { token, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [stockRecords, setStockRecords] = useState<StockRecord[]>([]);
  const [ponds, setPonds] = useState<Pond[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formState, setFormState] = useState({
    pondName: '',
    species: '',
    quantity: '',
    stockingDate: getTodayDate(),
    supplier: '',
    averageWeightKg: '',
  });

  // Guard protected routes
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isAuthLoading, router]);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');

    try {
      const [records, fetchedPonds] = await Promise.all([
        getStockRecords(token).catch(() => []),
        getPonds(token).catch(() => []),
      ]);
      setStockRecords(records);
      setPonds(fetchedPonds);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token, fetchData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormState((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: string, value: string | null) => {
    setFormState((prev) => ({ ...prev, [id]: value ?? '' }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (Object.values(formState).some((value) => !value)) {
      setError('Please fill out all fields.');
      return;
    }

    const quantityNum = Number(formState.quantity);
    const weightNum = Number(formState.averageWeightKg);

    if (Number.isNaN(quantityNum) || quantityNum <= 0) {
      setError('Quantity must be a positive number.');
      return;
    }

    if (Number.isNaN(weightNum) || weightNum <= 0) {
      setError('Average weight must be a positive number.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createStockRecord(
        {
          pondName: formState.pondName,
          species: formState.species,
          quantity: quantityNum,
          averageWeightKg: weightNum,
          stockingDate: formState.stockingDate,
          supplier: formState.supplier,
          status: 'Completed',
        },
        token
      );

      // Re-fetch all data to ensure updated inventory totals across backend
      await fetchData();

      setIsDialogOpen(false);
      setFormState({
        pondName: '',
        species: '',
        quantity: '',
        stockingDate: getTodayDate(),
        supplier: '',
        averageWeightKg: '',
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to save stock record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      await deleteStockRecord(id, token);
      await fetchData();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete record');
    }
  };

  // Dynamic KPI Calculations
  const completedRecords = stockRecords.filter((r) => r.status === 'Completed');
  const totalFishStocked = completedRecords.reduce((sum, record) => sum + record.quantity, 0);
  const speciesDiversity = new Set(stockRecords.map((r) => r.species)).size;
  const pendingStockings = stockRecords.filter((r) => r.status === 'Pending').length;

  const supplierCounts = stockRecords.reduce((acc, record) => {
    acc[record.supplier] = (acc[record.supplier] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topSupplier = Object.entries(supplierCounts).sort((a, b) => b[1] - a[1])[0] || ['N/A', 0];

  const availableSuppliers = Array.from(
    new Set([...DEFAULT_SUPPLIERS, ...stockRecords.map((r) => r.supplier)])
  ).filter(Boolean);

  const kpiCards = [
    {
      title: 'Total Fish Stocked',
      value: totalFishStocked.toLocaleString(),
      description: 'From completed stocking events',
      icon: Fish,
      color: 'text-cyan-600 dark:text-cyan-400',
      bgColor: 'bg-cyan-500/10',
    },
    {
      title: 'Species Diversity',
      value: speciesDiversity.toString(),
      description: 'Different species managed',
      icon: Layers,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Pending Stockings',
      value: pendingStockings.toString(),
      description: 'Awaiting completion',
      icon: Truck,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-500/10',
    },
    {
      title: 'Top Supplier',
      value: topSupplier[0],
      description: `${topSupplier[1]} stocking events`,
      icon: Building,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
  ];

  if (isAuthLoading) {
    return <div className="p-8 text-center text-slate-500">Authenticating user...</div>;
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-gray-50/50 dark:bg-slate-950 min-h-screen">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-50">Stocking Records</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">Monitor and manage all fish stocking activities.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground px-4 py-2 h-11 rounded-lg shadow-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
              <PlusCircle className="w-4 h-4" />
              <span>Add New Stock Record</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl p-6">
            <DialogHeader>
              <DialogTitle>Add New Stock Record</DialogTitle>
              <DialogDescription>Enter the details for the new stocking event.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="pondName" className="text-right">Pond</Label>
                  <Select
                    onValueChange={(val) => handleSelectChange('pondName', val)}
                    value={formState.pondName}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a pond" />
                    </SelectTrigger>
                    <SelectContent>
                      {ponds.length > 0 ? (
                        ponds.map((pond) => (
                          <SelectItem key={pond.id} value={pond.name}>
                            {pond.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="disabled" disabled>
                          No ponds available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="species" className="text-right">Species</Label>
                  <Input id="species" value={formState.species} onChange={handleInputChange} className="col-span-3 rounded-sm h-11" placeholder="e.g., Koi Carp" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="quantity" className="text-right">Quantity</Label>
                  <Input id="quantity" type="number" value={formState.quantity} onChange={handleInputChange} className="col-span-3 rounded-sm h-11" placeholder="e.g., 100" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="averageWeightKg" className="text-right">Avg. Weight (kg)</Label>
                  <Input id="averageWeightKg" type="number" step="0.01" value={formState.averageWeightKg} onChange={handleInputChange} className="col-span-3 rounded-sm h-11" placeholder="e.g., 0.5" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stockingDate" className="text-right">Stocking Date</Label>
                  <Input id="stockingDate" type="date" value={formState.stockingDate} onChange={handleInputChange} className="col-span-3 rounded-sm h-11" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="supplier" className="text-right">Supplier</Label>
                  <Select onValueChange={(val) => handleSelectChange('supplier', val)} value={formState.supplier}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSuppliers.map((supplier) => (
                        <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {error && <p className="col-span-4 text-sm text-red-600 text-center">{error}</p>}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Add Record'}</Button>
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
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400">{card.title}</p>
                <div className={`p-2 rounded-md ${card.bgColor}`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
              <div className="mt-2">
                <p className="text-3xl font-bold text-gray-900 dark:text-slate-100">{card.value}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">{card.description}</p>
              </div>
            </div>
          );
        })}
      </section>

      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading stock records...</div>
        ) : stockRecords.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No stock records found. Add one using the button above.</div>
        ) : (
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
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-800">
              {stockRecords.map((record) => (
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
                    <button onClick={() => handleDelete(record.id)} className="text-red-600 hover:text-red-900 dark:text-red-500 dark:hover:text-red-400">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StockRecordsPage;