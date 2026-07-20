'use client'

import React, { useState } from 'react'
import { FileDown, Printer, Calendar as CalendarIcon, Fish, Weight, CircleDollarSign, BarChart3 } from 'lucide-react';

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

const Select = ({ children, ...props }: { children: React.ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <select
        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
        {...props}
    >
        {children}
    </select>
);

const StatCard = ({ title, value, icon: Icon, change, changeType }: { title: string, value: string, icon: React.ElementType, change?: string, changeType?: 'increase' | 'decrease' }) => (
    <Card>
        <CardContent className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400">{title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{value}</p>
                {change && (
                    <p className={`text-xs ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                        {change} from last period
                    </p>
                )}
            </div>
            <div className="bg-slate-100 dark:bg-slate-800 rounded-full p-3">
                <Icon className="w-6 h-6 text-slate-700 dark:text-slate-300" />
            </div>
        </CardContent>
    </Card>
);

// Mock Data for Stock Inventory Report
const stockInventoryData = [
    { pond: 'Main Koi Pond', species: 'Koi Carp', quantity: 150, averageWeight: 2.5, totalWeight: 375.0, averageValue: 25.00, totalValue: 9375.00, lastUpdated: '2023-11-01' },
    { pond: 'Lily Pad Pond', species: 'Tilapia', quantity: 800, averageWeight: 0.6, totalWeight: 480.0, averageValue: 5.50, totalValue: 2640.00, lastUpdated: '2023-11-02' },
    { pond: 'Breeding Pond A', species: 'Catfish', quantity: 450, averageWeight: 1.0, totalWeight: 450.0, averageValue: 7.00, totalValue: 3150.00, lastUpdated: '2023-10-28' },
    { pond: 'Quarantine Tank', species: 'Goldfish', quantity: 300, averageWeight: 0.15, totalWeight: 45.0, averageValue: 2.00, totalValue: 90.00, lastUpdated: '2023-11-03' },
    { pond: 'Breeding Pond B', species: 'Koi Carp', quantity: 50, averageWeight: 1.8, totalWeight: 90.0, averageValue: 25.00, totalValue: 2250.00, lastUpdated: '2023-10-29' },
];

const ReportsPage = () => {
  const [reportGenerated, setReportGenerated] = useState(false);
  const [reportType, setReportType] = useState('stock-inventory');
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]); // Default to today

  return (
    <main className="flex-1 p-4 sm:p-6 md:p-8 bg-gray-50/50 dark:bg-slate-950">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-50">Reports & Analytics</h1>
        <p className="text-gray-600 dark:text-slate-400 mt-1">Generate, view, and export detailed reports for your farm operations.</p>
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
                  <Label htmlFor="report-type">Report Type</Label>
                  <Select id="report-type" value={reportType} onChange={(e) => setReportType(e.target.value)}>
                    <option value="stock-inventory">Stock Inventory</option>
                    <option value="harvest-summary">Harvest Summary</option>
                    <option value="feed-consumption">Feed Consumption</option>
                    <option value="water-quality">Water Quality Log</option>
                    <option value="financial-statement">Financial Statement</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date-to">As of Date</Label>
                   <div className="relative">
                    <Input 
                      type="date" 
                      id="date-to" 
                      value={dateTo} 
                      onChange={(e) => setDateTo(e.target.value)} 
                    />
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
                <StatCard title="Total Stock Value" value="$15,505" icon={CircleDollarSign} change="+5.2%" changeType="increase" />
                <StatCard title="Total Biomass" value="1,440 kg" icon={Weight} change="+80 kg" changeType="increase" />
                <StatCard title="Total Fish Count" value="1,750" icon={Fish} change="+120" changeType="increase" />
                <StatCard title="Avg. Value/kg" value="$10.77" icon={BarChart3} change="-1.5%" changeType="decrease" />
              </div>

              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Stock Inventory Report</CardTitle>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">As of {new Date(dateTo).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
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
                          <th scope="col" className="px-4 py-3 text-right">Quantity</th>
                          <th scope="col" className="px-4 py-3 text-right">Avg. Weight (kg)</th>
                          <th scope="col" className="px-4 py-3 text-right">Total Weight (kg)</th>
                          <th scope="col" className="px-4 py-3 text-right">Total Value ($)</th>
                          <th scope="col" className="px-4 py-3 rounded-r-lg">Last Updated</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stockInventoryData.map((row, index) => (
                          <tr key={`${row.pond}-${index}`} className="border-b dark:border-slate-800 hover:bg-gray-50/50 dark:hover:bg-slate-800/50">
                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-slate-100">{row.pond}</td>
                            <td className="px-4 py-3">{row.species}</td>
                            <td className="px-4 py-3 text-right">{row.quantity.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right">{row.averageWeight.toFixed(2)}</td>
                            <td className="px-4 py-3 text-right">{row.totalWeight.toFixed(1)}</td>
                            <td className="px-4 py-3 text-right font-semibold text-gray-800 dark:text-slate-200">{row.totalValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                            <td className="px-4 py-3">{row.lastUpdated}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="font-semibold text-gray-900 dark:text-slate-100 bg-gray-100/80 dark:bg-slate-800/50">
                          <tr>
                              <td colSpan={2} className="px-4 py-3 text-right rounded-l-lg">Grand Total:</td>
                              <td className="px-4 py-3 text-right">
                                  {stockInventoryData.reduce((acc, row) => acc + row.quantity, 0).toLocaleString()}
                              </td>
                              <td className="px-4 py-3 text-right">-</td>
                              <td className="px-4 py-3 text-right">
                                  {stockInventoryData.reduce((acc, row) => acc + row.totalWeight, 0).toFixed(1)} kg
                              </td>
                              <td className="px-4 py-3 text-right">
                                  {stockInventoryData.reduce((acc, row) => acc + row.totalValue, 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                              </td>
                              <td className="rounded-r-lg"></td>
                          </tr>
                      </tfoot>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
              <Card className="flex flex-col items-center justify-center h-[calc(100vh-12rem)] text-center">
                  <div className="p-6">
                  <p className="text-lg font-medium text-gray-700">Select your options and generate a report.</p>
                  <p className="text-gray-500">Your report preview will appear here.</p>
                </div>
              </Card>
          )}
        </div>
      </div>
    </main>
  )
}

export default ReportsPage;

