"use client";

import React, { useState, FormEvent, useEffect, useCallback } from 'react';
import { AlertTriangle, TrendingDown, Fish, ShieldAlert, PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
  getMortalityRecords,
  createMortalityRecord,
  type MortalityRecord,
  type MortalityCause,
} from '@/lib/mortality-api';
import { getStockRecords, type StockRecord } from '@/lib/stock-api';

const causeColorMap: Record<MortalityCause, string> = {
  Disease: 'bg-red-100 text-red-800',
  'Low Oxygen': 'bg-blue-100 text-blue-800',
  'Handling Stress': 'bg-yellow-100 text-yellow-800',
  Predation: 'bg-purple-100 text-purple-800',
  Unknown: 'bg-gray-100 text-gray-800',
};

const POND_OPTIONS = ['Pond Alpha', 'Pond Beta', 'Pond Gamma', 'Main Koi Pond', 'Alpha-1'];

const MortalityPage = () => {
  const router = useRouter();
  const { token, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [mortalityRecords, setMortalityRecords] = useState<MortalityRecord[]>([]);
  const [stockRecords, setStockRecords] = useState<StockRecord[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formState, setFormState] = useState({
    pondName: '',
    species: '',
    quantity: '',
    dateRecorded: new Date().toISOString().split('T')[0],
    cause: 'Unknown' as MortalityCause,
    recordedBy: '',
  });

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isAuthLoading, router]);

  const fetchRecords = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');

    try {
      const [mortalities, stocks] = await Promise.all([
        getMortalityRecords(token),
        getStockRecords(token),
      ]);
      setMortalityRecords(mortalities);
      setStockRecords(stocks);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch mortality or stock records');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchRecords();
    }
  }, [token, fetchRecords]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormState((prev) => ({ ...prev, [id]: value }));
  };

  const handleCauseSelect = (value: string) => {
    setFormState((prev) => ({ ...prev, cause: value as MortalityCause }));
  };

  const handlePondSelect = (value: string) => {
    setFormState((prev) => ({ ...prev, pondName: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (Object.values(formState).some((value) => !value)) {
      setError('Please fill out all fields.');
      return;
    }

    const quantityNum = Number(formState.quantity);
    if (Number.isNaN(quantityNum) || quantityNum <= 0) {
      setError('Quantity must be a valid positive number.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createMortalityRecord(
        {
          pondName: formState.pondName,
          species: formState.species,
          quantity: quantityNum,
          dateRecorded: formState.dateRecorded,
          cause: formState.cause,
          recordedBy: formState.recordedBy,
        },
        token
      );

      // Re-fetch all data to ensure stock deduction and rates update in real time
      await fetchRecords();

      setIsDialogOpen(false);
      setFormState({
        pondName: '',
        species: '',
        quantity: '',
        dateRecorded: new Date().toISOString().split('T')[0],
        cause: 'Unknown',
        recordedBy: '',
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to save mortality record');
    } finally {
      setIsSubmitting(false);
    }
  };

  // KPI Dynamic Calculations
  const totalMortality = mortalityRecords.reduce((sum, record) => sum + record.quantity, 0);
  const totalFishStock = stockRecords.reduce((sum, stock) => sum + stock.quantity, 0);
  const totalInitialPopulation = totalFishStock + totalMortality;
  const overallMortalityRate =
    totalInitialPopulation > 0 ? (totalMortality / totalInitialPopulation) * 100 : 0;

  const mortalityByCause = mortalityRecords.reduce((acc, record) => {
    acc[record.cause] = (acc[record.cause] || 0) + record.quantity;
    return acc;
  }, {} as Record<MortalityCause, number>);

  const sortedCauses = Object.entries(mortalityByCause).sort((a, b) => b[1] - a[1]);
  const topCause = sortedCauses.length > 0 ? sortedCauses[0] : ['N/A', 0];

  const kpiCards = [
    {
      title: 'Total Mortality (All Time)',
      value: totalMortality.toLocaleString(),
      description: 'Total recorded deaths',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-500/10',
    },
    {
      title: 'Overall Mortality Rate',
      value: overallMortalityRate > 0 ? `${overallMortalityRate.toFixed(2)}%` : '0.00%',
      description: 'Based on total population',
      icon: TrendingDown,
      color: 'text-amber-600',
      bgColor: 'bg-amber-500/10',
    },
    {
      title: 'Remaining Fish Stock',
      value: totalFishStock.toLocaleString(),
      description: 'Healthy active population',
      icon: Fish,
      color: 'text-green-600',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Primary Cause',
      value: topCause[0],
      description: `${topCause[1]} recorded cases`,
      icon: ShieldAlert,
      color: 'text-blue-600',
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-50">Mortality Records</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">Track and manage all fish mortality events.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button className="bg-blue-600 text-white h-11 px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2" />}>
            <PlusCircle className="w-4 h-4" />
            <span>Record New Mortality</span>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl p-6">
            <DialogHeader>
              <DialogTitle>Record New Mortality</DialogTitle>
              <DialogDescription>Fill in the details for the new mortality event.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="pondName" className="text-right">Pond</Label>
                  <Select onValueChange={handlePondSelect} value={formState.pondName}>
                    <SelectTrigger className="col-span-3 h-11">
                      <SelectValue placeholder="Select a pond" />
                    </SelectTrigger>
                    <SelectContent>
                      {POND_OPTIONS.map((pond) => (
                        <SelectItem key={pond} value={pond}>{pond}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="species" className="text-right">Species</Label>
                  <Input id="species" value={formState.species} onChange={handleInputChange} className="col-span-3 rounded-sm h-11" placeholder="e.g., Koi Carp" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="quantity" className="text-right">Quantity</Label>
                  <Input id="quantity" type="number" value={formState.quantity} onChange={handleInputChange} className="col-span-3 rounded-sm h-11" placeholder="e.g., 5" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="dateRecorded" className="text-right">Date</Label>
                  <Input id="dateRecorded" type="date" value={formState.dateRecorded} onChange={handleInputChange} className="col-span-3 rounded-sm h-11" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cause" className="text-right">Cause</Label>
                  <Select onValueChange={handleCauseSelect} value={formState.cause}>
                    <SelectTrigger className="col-span-3 h-11">
                      <SelectValue placeholder="Select a cause" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(causeColorMap).map((cause) => (
                        <SelectItem key={cause} value={cause}>{cause}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="recordedBy" className="text-right">Recorded By</Label>
                  <Input id="recordedBy" value={formState.recordedBy} onChange={handleInputChange} className="col-span-3 rounded-sm h-11" placeholder="e.g., John Doe" />
                </div>
                {error && <p className="col-span-4 text-sm text-red-600 text-center">{error}</p>}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Record'}</Button>
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
          <div className="p-8 text-center text-slate-500">Loading mortality records...</div>
        ) : mortalityRecords.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No mortality records found. Add one using the button above.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
            <thead className="bg-gray-50 dark:bg-slate-800/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Record ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pond</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Species</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Suspected Cause</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recorded By</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-800">
              {mortalityRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{record.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{record.dateRecorded}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300">{record.pondName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{record.species}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400 text-center">{record.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${causeColorMap[record.cause] || 'bg-gray-100 text-gray-800'} dark:bg-opacity-20`}>
                      {record.cause}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{record.recordedBy}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">Details</button>
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

export default MortalityPage;