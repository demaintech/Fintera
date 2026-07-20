'use client';

import React, { useState } from 'react';
import { FileDown, Printer, Calendar as CalendarIcon, TrendingUp, Zap, Target, Activity } from 'lucide-react';

// --- Reusable UI Components ---

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
        className="block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
        {...props}
    />
);

const StatCard = ({ title, value, icon: Icon, change, changeType }: { title: string, value: string, icon: React.ElementType, change?: string, changeType?: 'increase' | 'decrease' }) => (
    <Card>
        <CardContent className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400">{title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{value}</p>
                {change && (
                    <p className={`text-xs ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                        {change} vs. previous cycle
                    </p>
                )}
            </div>
            <div className="bg-slate-100 dark:bg-slate-800 rounded-full p-3">
                <Icon className="w-6 h-6 text-slate-700 dark:text-slate-300" />
            </div>
        </CardContent>
    </Card>
);

// --- Mock Data ---
const growthReportData = [
    { pond: 'Breeding Pond A', species: 'Catfish', period: 90, initialAvgWeight: 0.1, finalAvgWeight: 1.0, biomassGain: 405.0, feedConsumed: 650.0, adg: 10.0, fcr: 1.6, sgr: 2.56 },
    { pond: 'Lily Pad Pond', species: 'Tilapia', period: 120, initialAvgWeight: 0.05, finalAvgWeight: 0.6, biomassGain: 440.0, feedConsumed: 750.0, adg: 4.58, fcr: 1.7, sgr: 2.07 },
    { pond: 'Main Koi Pond', species: 'Koi Carp', period: 180, initialAvgWeight: 0.2, finalAvgWeight: 2.5, biomassGain: 345.0, feedConsumed: 690.0, adg: 12.78, fcr: 2.0, sgr: 1.41 },
    { pond: 'Breeding Pond B', species: 'Koi Carp', period: 180, initialAvgWeight: 0.2, finalAvgWeight: 1.8, biomassGain: 80.0, feedConsumed: 180.0, adg: 8.89, fcr: 2.25, sgr: 1.22 },
];

const GrowthReportPage = () => {
  const [reportGenerated, setReportGenerated] = useState(false);
  const [dateFrom, setDateFrom] = useState('2023-08-01');
  const [dateTo, setDateTo] = useState('2023-10-31');

  const totalBiomassGain = growthReportData.reduce((sum, item) => sum + item.biomassGain, 0);
  const avgFCR = growthReportData.reduce((sum, item) => sum + item.fcr, 0) / growthReportData.length;
  const avgADG = growthReportData.reduce((sum, item) => sum + item.adg, 0) / growthReportData.length;
  const avgSGR = growthReportData.reduce((sum, item) => sum + item.sgr, 0) / growthReportData.length;

  return (
    <main className="flex-1 p-4 sm:p-6 md:p-8 bg-gray-50/50 dark:bg-slate-950">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-50">Growth Reports</h1>
        <p className="text-gray-600 dark:text-slate-400 mt-1">Track and analyze fish growth performance over time.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Report Generation Form */}
        <div className="lg:col-span-4 xl:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Report Options</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); setReportGenerated(true); }} className="space-y-4">
                <div>
                  <Label htmlFor="date-from">From</Label>
                  <div className="relative">
                    <Input type="date" id="date-from" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                    <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 dark:text-slate-400" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="date-to">To</Label>
                   <div className="relative">
                    <Input type="date" id="date-to" value={dateTo} onChange={(e) => setDateTo(e.target.value)} min={dateFrom} />
                    <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 dark:text-slate-400" />
                  </div>
                </div>
                <Button type="submit" className="w-full h-10 mt-2">
                  Generate Report
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Report Preview */}
        <div className="lg:col-span-8 xl:col-span-9">
          {reportGenerated ? (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard title="Total Biomass Gain" value={`${totalBiomassGain.toFixed(1)} kg`} icon={TrendingUp} change="+45 kg" changeType="increase" />
                <StatCard title="Average FCR" value={avgFCR.toFixed(2)} icon={Target} change="-0.1" changeType="increase" />
                <StatCard title="Average ADG" value={`${avgADG.toFixed(2)} g/day`} icon={Zap} change="+0.5 g/day" changeType="increase" />
                <StatCard title="Average SGR" value={`${avgSGR.toFixed(2)} %/day`} icon={Activity} change="+0.2%" changeType="increase" />
              </div>

              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Growth Performance Summary</CardTitle>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                      {new Date(dateFrom).toLocaleDateString()} - {new Date(dateTo).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                      <Button variant="outline" className="h-9 px-3">
                        <Printer className="w-4 h-4 mr-2" />
                        Print
                      </Button>
                      <Button variant="default" className="h-9 px-3">
                        <FileDown className="w-4 h-4 mr-2" />
                        Export Report
                      </Button>
                    </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600 dark:text-slate-300">
                      <thead className="text-xs text-gray-700 dark:text-slate-400 uppercase bg-gray-100/80 dark:bg-slate-800/50">
                        <tr>
                          <th scope="col" className="px-4 py-3 rounded-l-lg">Pond</th>
                          <th scope="col" className="px-4 py-3">Species</th>
                          <th scope="col" className="px-4 py-3 text-right">Period (Days)</th>
                          <th scope="col" className="px-4 py-3 text-right">Biomass Gain (kg)</th>
                          <th scope="col" className="px-4 py-3 text-right">ADG (g/day)</th>
                          <th scope="col" className="px-4 py-3 text-right">FCR</th>
                          <th scope="col" className="px-4 py-3 text-right rounded-r-lg">SGR (%/day)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {growthReportData.map((row, i) => (
                          <tr key={`${row.pond}-${i}`} className="border-b dark:border-slate-800 hover:bg-gray-50/50 dark:hover:bg-slate-800/50">
                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-slate-100">{row.pond}</td>
                            <td className="px-4 py-3">{row.species}</td>
                            <td className="px-4 py-3 text-right">{row.period}</td>
                            <td className="px-4 py-3 text-right font-medium text-green-600">{`+${row.biomassGain.toFixed(1)}`}</td>
                            <td className="px-4 py-3 text-right">{row.adg.toFixed(2)}</td>
                            <td className="px-4 py-3 text-right">{row.fcr.toFixed(2)}</td>
                            <td className="px-4 py-3 text-right">{row.sgr.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
              <Card className="flex flex-col items-center justify-center h-[calc(100vh-12rem)] text-center">
                  <div className="p-6">
                  <p className="text-lg font-medium text-gray-700 dark:text-slate-300">Select a date range and generate a report.</p>
                  <p className="text-gray-500 dark:text-slate-400">Your growth performance summary will appear here.</p>
                </div>
              </Card>
          )}
        </div>
      </div>
    </main>
  );
};

export default GrowthReportPage;