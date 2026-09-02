"use client";

import React, { useState, FormEvent, useEffect, useCallback } from "react";
import { Scale, TrendingUp, Zap, PlusCircle, Activity, Award, Trash2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getGrowthRecords,
  createGrowthRecord,
  deleteGrowthRecord,
  type GrowthRecord,
} from "@/lib/growth-api";
import { getPonds, type Pond } from "@/lib/pond-api"; // Integrated Pond API Service

const GrowthPage = () => {
  const router = useRouter();
  const { token, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [growthRecords, setGrowthRecords] = useState<GrowthRecord[]>([]);
  const [ponds, setPonds] = useState<Pond[]>([]);
  const [isLoadingPonds, setIsLoadingPonds] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialFormState = {
    pondName: "",
    species: "",
    sampleDate: new Date().toISOString().split("T")[0],
    sampleCount: "",
    avgWeightGrams: "",
    totalFeedUsedKg: "",
  };

  const [formState, setFormState] = useState(initialFormState);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  const fetchData = useCallback(async () => {
    if (!token || !isAuthenticated) return;
    setLoading(true);
    setIsLoadingPonds(true);
    setError("");

    try {
      // Fetch growth records and user's real backend ponds concurrently
      const [records, pondsData] = await Promise.all([
        getGrowthRecords(token),
        getPonds(token),
      ]);

      setGrowthRecords(Array.isArray(records) ? records : []);
      setPonds(Array.isArray(pondsData) ? pondsData : []);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch growth sampling records or ponds.");
      setGrowthRecords([]);
      setPonds([]);
    } finally {
      setLoading(false);
      setIsLoadingPonds(false);
    }
  }, [token, isAuthenticated]);

  useEffect(() => {
    if (token && isAuthenticated) {
      fetchData();
    }
  }, [token, isAuthenticated, fetchData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormState((prev) => ({ ...prev, [id]: value }));
  };

  // Handle Pond selection and auto-fill species if present on chosen pond
  const handlePondSelect = (selectedPondName: string | null) => {
    if (!selectedPondName) return;

    const matchedPond = ponds.find((p) => p.name === selectedPondName);
    
    setFormState((prev) => ({
      ...prev,
      pondName: selectedPondName,
      species: matchedPond?.currentStock?.species !== "Unspecified" 
        ? matchedPond?.currentStock?.species || prev.species 
        : prev.species,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formState.pondName || !formState.species || !formState.sampleDate) {
      setFormError("Please fill out all required selection fields.");
      return;
    }

    const sampleCountNum = parseInt(formState.sampleCount, 10);
    const avgWeightNum = parseFloat(formState.avgWeightGrams);
    const feedUsedNum = parseFloat(formState.totalFeedUsedKg);

    if (isNaN(sampleCountNum) || isNaN(avgWeightNum) || isNaN(feedUsedNum)) {
      setFormError("Please enter valid numeric values for count, weight, and feed.");
      return;
    }

    if (sampleCountNum <= 0 || avgWeightNum <= 0 || feedUsedNum < 0) {
      setFormError("Please enter positive values for sampling measurements.");
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createGrowthRecord(
        {
          pondName: formState.pondName,
          species: formState.species,
          sampleDate: formState.sampleDate,
          sampleCount: sampleCountNum,
          avgWeightGrams: avgWeightNum,
          totalFeedUsedKg: feedUsedNum,
        },
        token
      );

      setGrowthRecords((prev) => [created, ...prev]);
      setIsDialogOpen(false);
      setFormState(initialFormState);
    } catch (err: any) {
      setFormError(err?.message || "Failed to save sampling record");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sampling record?")) return;
    try {
      await deleteGrowthRecord(id, token);
      setGrowthRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      alert(err?.message || "Failed to delete record");
    }
  };

  // Metric Aggregations
  const totalSamples = growthRecords.reduce((sum, r) => sum + (r.sampleCount || 0), 0);

  const avgWeight = growthRecords.length > 0
    ? (growthRecords.reduce((sum, r) => sum + (r.avgWeightGrams || 0), 0) / growthRecords.length).toFixed(1)
    : "0.0";

  const validFcrRecords = growthRecords.filter((r) => (r.fcr || r.feedConversionRate || 0) > 0);
  const avgFCRVal = validFcrRecords.length > 0
    ? validFcrRecords.reduce((sum, r) => sum + (r.fcr || r.feedConversionRate || 0), 0) / validFcrRecords.length
    : 0;

  const avgFCR = avgFCRVal > 0 ? avgFCRVal.toFixed(2) : "0.00";

  const feedEfficiencyPct = avgFCRVal > 0
    ? ((1 / avgFCRVal) * 100).toFixed(1)
    : "0.0";

  const kpiCards = [
    {
      title: "Avg Fish Weight",
      value: `${avgWeight} g`,
      description: "Across all sampled ponds",
      icon: Scale,
      color: "text-emerald-600",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "Feed Conversion Ratio (FCR)",
      value: avgFCR,
      description: "Lower is better (Target: < 1.3)",
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Feed Efficiency",
      value: `${feedEfficiencyPct}%`,
      description: "Biomass yield ratio per kg feed",
      icon: Zap,
      color: "text-amber-600",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "Total Fish Sampled",
      value: totalSamples.toLocaleString(),
      description: "Across sampling batches",
      icon: Award,
      color: "text-purple-600",
      bgColor: "bg-purple-500/10",
    },
  ];

  if (isAuthLoading) {
    return <div className="p-8 text-center text-slate-500">Authenticating user...</div>;
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-gray-50/50 dark:bg-slate-950 min-h-screen">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium text-primary bg-primary/10 rounded-full mb-2">
            <Activity className="w-3.5 h-3.5" /> Growth Monitoring & FCR
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-50">Growth & Sampling</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">
            Log weight samples to monitor growth rates and feed efficiency.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground h-11 px-4 py-2 rounded-lg shadow-sm hover:opacity-90 transition-all flex items-center justify-center gap-2">
              <PlusCircle className="w-4 h-4" />
              <span>Record New Sampling</span>
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-xl p-6">
            <DialogHeader>
              <DialogTitle>Record Growth Sampling</DialogTitle>
              <DialogDescription>
                Input fish sampling weights and feed usage to track FCR and growth performance.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="pondName" className="text-right">Pond</Label>
                  <Select onValueChange={handlePondSelect} value={formState.pondName}>
                    <SelectTrigger className="col-span-3 h-11">
                      <SelectValue placeholder={isLoadingPonds ? "Loading ponds..." : "Select a pond"} />
                    </SelectTrigger>
                    <SelectContent>
                      {ponds.length > 0 ? (
                        ponds.map((pond) => (
                          <SelectItem key={pond.id} value={pond.name}>
                            {pond.name} {pond.currentStock?.species ? `(${pond.currentStock.species})` : ''}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          No active ponds found
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="species" className="text-right">Species</Label>
                  <Input
                    id="species"
                    value={formState.species}
                    onChange={handleInputChange}
                    className="col-span-3 rounded-md h-11"
                    placeholder="e.g., African Catfish"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="sampleDate" className="text-right">Sample Date</Label>
                  <Input
                    id="sampleDate"
                    type="date"
                    value={formState.sampleDate}
                    onChange={handleInputChange}
                    className="col-span-3 rounded-md h-11"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="sampleCount" className="text-right">Sample Count</Label>
                  <Input
                    id="sampleCount"
                    type="number"
                    value={formState.sampleCount}
                    onChange={handleInputChange}
                    className="col-span-3 rounded-md h-11"
                    placeholder="e.g., 30"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="avgWeightGrams" className="text-right">Avg Weight (g)</Label>
                  <Input
                    id="avgWeightGrams"
                    type="number"
                    step="0.1"
                    value={formState.avgWeightGrams}
                    onChange={handleInputChange}
                    className="col-span-3 rounded-md h-11"
                    placeholder="e.g., 250.5"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="totalFeedUsedKg" className="text-right">Feed Used (kg)</Label>
                  <Input
                    id="totalFeedUsedKg"
                    type="number"
                    step="0.1"
                    value={formState.totalFeedUsedKg}
                    onChange={handleInputChange}
                    className="col-span-3 rounded-md h-11"
                    placeholder="e.g., 120"
                  />
                </div>
                {formError && <p className="col-span-4 text-sm text-red-600 text-center font-medium">{formError}</p>}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Sampling Record"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      {error && (
        <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/40 dark:border-red-900 flex items-center justify-between text-red-800 dark:text-red-300">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchData} className="border-red-300 text-red-800 hover:bg-red-100 dark:border-red-800 dark:text-red-200">
            Retry Connection
          </Button>
        </div>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 rounded-xl shadow-sm p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                  {card.title}
                </p>
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

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
            Sampling Logs & Performance
          </h2>
          <span className="text-xs text-muted-foreground">Updated live</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading growth records...</div>
        ) : growthRecords.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No growth sampling records logged yet. Add one using the button above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
              <thead className="bg-gray-50 dark:bg-slate-800/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pond</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Species</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Count</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Avg Wt (g)</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Feed (kg)</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">FCR</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recorded By</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-800">
                {growthRecords.map((record) => {
                  const currentFcr = record.fcr || record.feedConversionRate || 0;
                  return (
                    <tr key={record.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                        {record.sampleDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {record.pondName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                        {record.species}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400 text-center">
                        {record.sampleCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-100 font-semibold text-center">
                        {record.avgWeightGrams} g
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400 text-center">
                        {record.totalFeedUsedKg} kg
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-2.5 py-0.5 inline-flex text-xs font-semibold rounded-full ${
                          currentFcr > 0 && currentFcr <= 1.2
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : currentFcr <= 1.4
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                        }`}>
                          {currentFcr.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                        {record.recordedBy}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(record.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default GrowthPage;