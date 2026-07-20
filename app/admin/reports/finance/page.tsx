'use client';

import React, { useState } from 'react';
import { FileDown, Printer, Calendar as CalendarIcon, TrendingUp, TrendingDown, Scale, Percent } from 'lucide-react';

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
                        {change} from last period
                    </p>
                )}
            </div>
            <div className="bg-slate-100 dark:bg-slate-800 rounded-full p-3">
                <Icon className={`w-6 h-6 ${changeType === 'increase' ? 'text-green-600' : changeType === 'decrease' ? 'text-red-600' : 'text-slate-700 dark:text-slate-300'}`} />
            </div>
        </CardContent>
    </Card>
);

// --- Mock Data ---
const revenueData = [
    { date: '2023-10-05', source: 'Harvest Sale - Koi Carp', category: 'Fish Sales', amount: 4500.00 },
    { date: '2023-10-12', source: 'Harvest Sale - Tilapia', category: 'Fish Sales', amount: 2200.50 },
    { date: '2023-10-19', source: 'Equipment Rental', category: 'Other', amount: 350.00 },
    { date: '2023-10-25', source: 'Harvest Sale - Catfish', category: 'Fish Sales', amount: 3100.00 },
];

const expensesData = [
    { date: '2023-10-02', item: 'High-Protein Fish Feed (500kg)', category: 'Feed', amount: 1250.00 },
    { date: '2023-10-07', item: 'Electricity Bill', category: 'Utilities', amount: 450.75 },
    { date: '2023-10-15', item: 'Water Pump Maintenance', category: 'Repairs', amount: 220.00 },
    { date: '2023-10-20', item: 'Staff Salaries', category: 'Labor', amount: 2500.00 },
    { date: '2023-10-28', item: 'Water Treatment Chemicals', category: 'Supplies', amount: 180.50 },
];

const formatCurrency = (amount: number) => amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

const FinancialReportsPage = () => {
  const [reportGenerated, setReportGenerated] = useState(false);
  const [dateFrom, setDateFrom] = useState('2023-10-01');
  const [dateTo, setDateTo] = useState('2023-10-31');

  const totalRevenue = revenueData.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expensesData.reduce((sum, item) => sum + item.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  return (
    <main className="flex-1 p-4 sm:p-6 md:p-8 bg-gray-50/50 dark:bg-slate-950">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-50">Financial Reports</h1>
        <p className="text-gray-600 dark:text-slate-400 mt-1">Analyze revenue, expenses, and profitability for your farm.</p>
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
                <StatCard title="Total Revenue" value={formatCurrency(totalRevenue)} icon={TrendingUp} change="+12.5%" changeType="increase" />
                <StatCard title="Total Expenses" value={formatCurrency(totalExpenses)} icon={TrendingDown} change="+8.2%" changeType="decrease" />
                <StatCard title="Net Profit" value={formatCurrency(netProfit)} icon={Scale} change="+15.8%" changeType="increase" />
                <StatCard title="Profit Margin" value={`${profitMargin.toFixed(1)}%`} icon={Percent} change="+2.1%" changeType="increase" />
              </div>

              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Financial Summary</CardTitle>
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
                <CardContent className="space-y-8">
                  {/* Revenue Table */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-800 dark:text-slate-200 mb-3">Revenue</h4>
                    <div className="overflow-x-auto border dark:border-slate-700 rounded-lg">
                      <table className="w-full text-sm text-left text-gray-600 dark:text-slate-300">
                        <thead className="text-xs text-gray-700 dark:text-slate-400 uppercase bg-gray-100/80 dark:bg-slate-800/50">
                          <tr>
                            <th scope="col" className="px-4 py-3">Date</th>
                            <th scope="col" className="px-4 py-3">Source/Item</th>
                            <th scope="col" className="px-4 py-3">Category</th>
                            <th scope="col" className="px-4 py-3 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {revenueData.map((row, i) => (
                            <tr key={`rev-${i}`} className="border-b dark:border-slate-800 hover:bg-gray-50/50 dark:hover:bg-slate-800/50">
                              <td className="px-4 py-3">{row.date}</td>
                              <td className="px-4 py-3 font-medium text-gray-900 dark:text-slate-100">{row.source}</td>
                              <td className="px-4 py-3">{row.category}</td>
                              <td className="px-4 py-3 text-right">{formatCurrency(row.amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="font-semibold text-gray-900 dark:text-slate-100 bg-gray-100/80 dark:bg-slate-800/50">
                          <tr>
                            <td colSpan={3} className="px-4 py-3 text-right">Total Revenue:</td>
                            <td className="px-4 py-3 text-right">{formatCurrency(totalRevenue)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* Expenses Table */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-800 dark:text-slate-200 mb-3">Expenses</h4>
                    <div className="overflow-x-auto border dark:border-slate-700 rounded-lg">
                      <table className="w-full text-sm text-left text-gray-600 dark:text-slate-300">
                        <thead className="text-xs text-gray-700 dark:text-slate-400 uppercase bg-gray-100/80 dark:bg-slate-800/50">
                          <tr>
                            <th scope="col" className="px-4 py-3">Date</th>
                            <th scope="col" className="px-4 py-3">Item/Service</th>
                            <th scope="col" className="px-4 py-3">Category</th>
                            <th scope="col" className="px-4 py-3 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {expensesData.map((row, i) => (
                            <tr key={`exp-${i}`} className="border-b dark:border-slate-800 hover:bg-gray-50/50 dark:hover:bg-slate-800/50">
                              <td className="px-4 py-3">{row.date}</td>
                              <td className="px-4 py-3 font-medium text-gray-900 dark:text-slate-100">{row.item}</td>
                              <td className="px-4 py-3">{row.category}</td>
                              <td className="px-4 py-3 text-right">{formatCurrency(row.amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="font-semibold text-gray-900 dark:text-slate-100 bg-gray-100/80 dark:bg-slate-800/50">
                          <tr>
                            <td colSpan={3} className="px-4 py-3 text-right">Total Expenses:</td>
                            <td className="px-4 py-3 text-right">{formatCurrency(totalExpenses)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
              <Card className="flex flex-col items-center justify-center h-[calc(100vh-12rem)] text-center">
                  <div className="p-6">
                  <p className="text-lg font-medium text-gray-700 dark:text-slate-300">Select a date range and generate a report.</p>
                  <p className="text-gray-500 dark:text-slate-400">Your financial summary will appear here.</p>
                </div>
              </Card>
          )}
        </div>
      </div>
    </main>
  );
};

export default FinancialReportsPage;