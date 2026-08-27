"use client";

import React, { useState, FormEvent, useEffect, useCallback } from 'react';
import { Anchor, Scale, Fish, ListChecks, PlusCircle } from 'lucide-react';
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
  getHarvestRecords,
  createHarvestRecord,
  type HarvestRecord,
  type HarvestMethod,
} from '@/lib/harvest-api';

const POND_OPTIONS = ['Pond Alpha', 'Pond Beta', 'Pond Gamma', 'Main Koi Pond', 'Alpha-1'];

const HarvestPage = () => {
  const router = useRouter();
  const { token, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [harvestRecords, setHarvestRecords] = useState<HarvestRecord[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formState, setFormState] = useState({
    pondName: '',
    species: '',
    quantity: '',
    averageWeightKg: '',
    harvestDate: new Date().toISOString().split('T')[0],
    method: 'Netting' as HarvestMethod,
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
      const records = await getHarvestRecords(token);
      setHarvestRecords(records);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch harvest records');
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

  const handleMethodSelect = (value: string | null) => {
    if (value) {
      setFormState((prev) => ({ ...prev, method: value as HarvestMethod }));
    }
  };

  const handlePondSelect = (value: string) => {
    setFormState((prev) => ({ ...prev, pondName: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const { pondName, species, quantity, averageWeightKg, harvestDate, recordedBy } = formState;
    if (!pondName || !species || !quantity || !averageWeightKg || !harvestDate || !recordedBy) {
      setError('Please fill out all fields.');
      return;
    }

    const quantityNum = Number(formState.quantity);
    const avgWeightNum = Number(formState.averageWeightKg);

    if (Number.isNaN(quantityNum) || quantityNum <= 0) {
      setError('Quantity must be a positive number.');
      return;
    }

    if (Number.isNaN(avgWeightNum) || avgWeightNum <= 0) {
      setError('Average weight must be a positive number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const createdRecord = await createHarvestRecord(
        {
          pondName: formState.pondName,
          species: formState.species,
          quantity: quantityNum,
          averageWeightKg: avgWeightNum,
          totalWeightKg: +(quantityNum * avgWeightNum).toFixed(3),
          harvestDate: formState.harvestDate,
          method: formState.method,
          recordedBy: formState.recordedBy,
        },
        token
      );

      setHarvestRecords((prev) => [createdRecord, ...prev]);
      setIsDialogOpen(false);
      setFormState({
        pondName: '',
        species: '',
        quantity: '',
        averageWeightKg: '',
        harvestDate: new Date().toISOString().split('T')[0],
        method: 'Netting',
        recordedBy: '',
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to save record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalHarvestWeight = harvestRecords.reduce((sum, r) => sum + (Number(r.totalWeightKg) || 0), 0);
  const totalHarvestCount = harvestRecords.reduce((sum, r) => sum + (Number(r.quantity) || 0), 0);
  const averageHarvestWeight = totalHarvestCount > 0 ? totalHarvestWeight / totalHarvestCount : 0;
  const totalRecords = harvestRecords.length;

  const kpiCards = [
    { title: "Total Harvested Weight", value: `${totalHarvestWeight.toLocaleString()} kg`, icon: Anchor, color: "text-blue-600", bgColor: "bg-blue-500/10" },
    { title: "Total Harvested Fish", value: totalHarvestCount.toLocaleString(), icon: Fish, color: "text-green-600", bgColor: "bg-green-500/10" },
    { title: "Avg. Harvest Weight", value: `${averageHarvestWeight.toFixed(2)} kg`, icon: Scale, color: "text-amber-600", bgColor: "bg-amber-500/10" },
    { title: "Total Harvest Events", value: totalRecords.toString(), icon: ListChecks, color: "text-purple-600", bgColor: "bg-purple-500/10" },
  ];

  if (isAuthLoading) {
    return <div className="p-8 text-center text-slate-500">Authenticating user...</div>;
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-gray-50/50 dark:bg-slate-950 min-h-screen">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-50">Harvest Records</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">Track and manage all harvest activities.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 text-white h-11 px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
              <PlusCircle className="w-4 h-4 mr-2" />
              Add New Harvest Record
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl p-6">
            <DialogHeader>
              <DialogTitle>Add New Harvest Record</DialogTitle>
              <DialogDescription>Enter the details for the new harvest event.</DialogDescription>
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
                  <Input id="species" value={formState.species} onChange={handleInputChange} className="col-span-3 rounded-sm h-11" placeholder="e.g., Tilapia" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="quantity" className="text-right">Quantity</Label>
                  <Input id="quantity" type="number" value={formState.quantity} onChange={handleInputChange} className="col-span-3 rounded-sm h-11" placeholder="e.g., 1200" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="averageWeightKg" className="text-right">Avg. Weight (kg)</Label>
                  <Input id="averageWeightKg" type="number" step="0.01" value={formState.averageWeightKg} onChange={handleInputChange} className="col-span-3 rounded-sm h-11" placeholder="e.g., 0.8" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="harvestDate" className="text-right">Harvest Date</Label>
                  <Input id="harvestDate" type="date" value={formState.harvestDate} onChange={handleInputChange} className="col-span-3 rounded-sm h-11" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="method" className="text-right">Method</Label>
                  <Select onValueChange={handleMethodSelect} value={formState.method}>
                    <SelectTrigger className="col-span-3 h-11">
                      <SelectValue placeholder="Select a method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Netting">Netting</SelectItem>
                      <SelectItem value="Draining">Draining</SelectItem>
                      <SelectItem value="Trapping">Trapping</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="recordedBy" className="text-right">Recorded By</Label>
                  <Input id="recordedBy" value={formState.recordedBy} onChange={handleInputChange} className="col-span-3 rounded-sm h-11" placeholder="e.g., Alex Ray" />
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

      {error && !isDialogOpen && (
        <div className="mb-4 p-3 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-800">
          {error}
        </div>
      )}

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
              </div>
            </div>
          );
        })}
      </section>

      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading harvest records...</div>
        ) : harvestRecords.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No harvest records available. Add one using the button above.</div>
        ) : (
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
              {harvestRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{record.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{record.harvestDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300">{record.pondName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{record.species}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400 text-center">{record.quantity.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400 text-center">{Number(record.totalWeightKg).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{record.method}</td>
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

export default HarvestPage;