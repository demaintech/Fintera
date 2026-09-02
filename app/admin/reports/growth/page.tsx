'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { FileDown, Printer, Calendar as CalendarIcon, Fish, Weight, RefreshCw, AlertCircle } from 'lucide-react';
import { getGrowthRecords, GrowthRecord } from '@/lib/growth-api';

// --- Reusable UI Elements ---

const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 rounded-xl shadow-sm ${className}`}>{children}</div>
);

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="p-4 sm:p-6 border-b border-gray-200/80 dark:border-slate-700/50 flex justify-between items-start">{children}</div>
);

const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-50">{children}</h3>
);

const CardContent = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`p-4 sm:p-6 ${className}`}>{children}</div>
);

const Button = ({ children, variant = 'default', className, ...props }: { children: React.ReactNode, variant?: 'default' | 'outline', className?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const baseStyle = "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
  const variantStyles = {
    default: "bg-slate-900 text-white hover:bg-slate-900/90 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90",
    outline: "border border-gray-300 dark:border-slate-700 bg-transparent hover:bg-gray-100/50 dark:hover:bg-slate-800/50",
  };
  return <button className={`${baseStyle} ${variantStyles[variant]} ${className}`} {...props}>{children}</button>;
};

const Label = ({ children, ...props }: { children: React.ReactNode } & React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5" {...props}>{children}</label>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className="block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-slate-900 sm:text-sm text-slate-900 dark:text-slate-100"
    {...props}
  />
);

const StatCard = ({ title, value, icon: Icon }: { title: string, value: string, icon: React.ElementType }) => (
  <Card>
    <CardContent className="flex items-center justify-between p-4">
      <div>
        <p className="text-xs font-medium text-gray-500 dark:text-slate-400">{title}</p>
        <p className="text-xl font-bold text-gray-900 dark:text-slate-100 mt-1">{value}</p>
      </div>
      <div className="bg-slate-100 dark:bg-slate-800 rounded-full p-2.5">
        <Icon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
      </div>
    </CardContent>
  </Card>
);

export default function GrowthReportsPage() {
  const [records, setRecords] = useState<GrowthRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [reportGenerated, setReportGenerated] = useState(false);

  // Fetch live growth data from backend
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const data = await getGrowthRecords(token);
      setRecords(data);
      setReportGenerated(true);
    } catch (err: any) {
      setError(err.message || 'Failed to load growth records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter records by date range
  const filteredRecords = useMemo(() => {
    return records.filter((item) => {
      if (!item.sampleDate) return true;
      const itemDate = new Date(item.sampleDate).getTime();
      const from = dateFrom ? new Date(dateFrom).getTime() : -Infinity;
      const to = dateTo ? new Date(dateTo).getTime() : Infinity;
      return itemDate >= from && itemDate <= to;
    });
  }, [records, dateFrom, dateTo]);

  // Metric aggregates calculation
  const metrics = useMemo(() => {
    const totalSamples = filteredRecords.reduce((acc, r) => acc + r.sampleCount, 0);
    const totalFeedKg = filteredRecords.reduce((acc, r) => acc + r.totalFeedUsedKg, 0);
    const totalBiomassKg = filteredRecords.reduce((acc, r) => acc + (r.sampleCount * r.avgWeightGrams) / 1000, 0);
    const avgFcr = filteredRecords.length
      ? filteredRecords.reduce((acc, r) => acc + r.fcr, 0) / filteredRecords.length
      : 0;

    return { totalSamples, totalFeedKg, totalBiomassKg, avgFcr };
  }, [filteredRecords]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <main className="flex-1 p-4 sm:p-6 md:p-8 bg-gray-50/50 dark:bg-slate-950 min-h-screen">
      {/* Page Header */}
      <header className="mb-6 print:hidden">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-50">Growth Reports & Statement</h1>
        <p className="text-gray-600 dark:text-slate-400 mt-1">Filter live sampling logs, review operational trends, and export print-ready statements.</p>
      </header>

      {/* Global CSS for seamless print view */}
      <style jsx global>{`
        @media print {
          body {
            background: #fff !important;
            color: #000 !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Sidebar */}
        <div className="lg:col-span-4 xl:col-span-3 print:hidden">
          <Card>
            <CardHeader>
              <CardTitle>Filter Parameters</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); setReportGenerated(true); }} className="space-y-4">
                <div>
                  <Label htmlFor="date-from">From Date</Label>
                  <Input
                    type="date"
                    id="date-from"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="date-to">To Date</Label>
                  <Input
                    type="date"
                    id="date-to"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full h-10 gap-2">
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CalendarIcon className="h-4 w-4" />}
                  <span>Generate Report</span>
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Growth Statement View */}
        <div className="lg:col-span-8 xl:col-span-9">
          {error && (
            <Card className="mb-6 bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 print:hidden">
              <CardContent className="flex items-center gap-3 p-4">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
                <p className="text-sm">{error}</p>
              </CardContent>
            </Card>
          )}

          {reportGenerated ? (
            <div className="space-y-6">
              {/* Operational Stat Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 print:hidden">
                <StatCard title="Total Biomass" value={`${metrics.totalBiomassKg.toFixed(1)} kg`} icon={Weight} />
                <StatCard title="Total Feed Used" value={`${metrics.totalFeedKg.toFixed(1)} kg`} icon={Fish} />
                <StatCard title="Total Sample Count" value={metrics.totalSamples.toLocaleString()} icon={Fish} />
                <StatCard title="Average FCR" value={metrics.avgFcr.toFixed(2)} icon={Weight} />
              </div>

              {/* Clean Statement Document Preview */}
              <Card className="print:shadow-none bg-white text-slate-900 border-gray-200">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
                    <div>
                      <h2 className="text-2xl font-bold uppercase tracking-wider text-slate-900">Growth Performance Statement</h2>
                      <p className="text-sm text-slate-500 mt-1">
                        Statement Period: {dateFrom ? dateFrom : 'Beginning'} to {dateTo ? dateTo : 'Present'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 print:hidden">
                      <Button variant="outline" className="h-9 px-3 gap-2" onClick={handlePrint}>
                        <Printer className="w-4 h-4" />
                        Print
                      </Button>
                      <Button variant="default" className="h-9 px-3 gap-2" onClick={handleExportPDF}>
                        <FileDown className="w-4 h-4" />
                        Export PDF
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-700">
                      <thead className="text-xs text-slate-800 uppercase bg-slate-100 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3">Sample Date</th>
                          <th className="px-4 py-3">Pond Name</th>
                          <th className="px-4 py-3">Species</th>
                          <th className="px-4 py-3 text-right">Sample Qty</th>
                          <th className="px-4 py-3 text-right">Avg Weight (g)</th>
                          <th className="px-4 py-3 text-right">Feed Used (kg)</th>
                          <th className="px-4 py-3 text-right">FCR</th>
                          <th className="px-4 py-3">Recorded By</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {filteredRecords.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                              No growth records match the designated date filter.
                            </td>
                          </tr>
                        ) : (
                          filteredRecords.map((row) => (
                            <tr key={row.id} className="hover:bg-slate-50">
                              <td className="px-4 py-3 font-medium text-slate-900">{row.sampleDate || '-'}</td>
                              <td className="px-4 py-3">{row.pondName}</td>
                              <td className="px-4 py-3">{row.species}</td>
                              <td className="px-4 py-3 text-right">{row.sampleCount.toLocaleString()}</td>
                              <td className="px-4 py-3 text-right">{row.avgWeightGrams.toFixed(1)}</td>
                              <td className="px-4 py-3 text-right">{row.totalFeedUsedKg.toFixed(1)}</td>
                              <td className="px-4 py-3 text-right font-semibold">{row.fcr.toFixed(2)}</td>
                              <td className="px-4 py-3 text-slate-500">{row.recordedBy}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                      <tfoot className="font-semibold text-slate-900 bg-slate-100 border-t border-slate-200">
                        <tr>
                          <td colSpan={3} className="px-4 py-3 text-right">Grand Total / Averages:</td>
                          <td className="px-4 py-3 text-right">{metrics.totalSamples.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right">-</td>
                          <td className="px-4 py-3 text-right">{metrics.totalFeedKg.toFixed(1)} kg</td>
                          <td className="px-4 py-3 text-right">{metrics.avgFcr.toFixed(2)}</td>
                          <td className="px-4 py-3"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Document Footer */}
                  <div className="mt-12 pt-6 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
                    <p>Fintera Aquaculture Operations System</p>
                    <p>Generated: {new Date().toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="flex flex-col items-center justify-center h-64 text-center">
              <div className="p-6">
                <p className="text-lg font-medium text-gray-700 dark:text-slate-300">Select date parameters and click Generate Report.</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}