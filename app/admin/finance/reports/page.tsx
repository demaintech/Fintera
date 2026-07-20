'use client';

import React, { useState } from 'react';
import {
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell
} from 'recharts';
import {
  ArrowDownRight, ArrowUpRight, Calendar as CalendarIcon, CircleDollarSign, MoreHorizontal, PlusCircle, Search, FileText, Percent, TrendingUp, Download, ChevronsUpDown, Layers
} from 'lucide-react';
import { addDays, format } from 'date-fns';
import { DateRange } from 'react-day-picker';

// --- Mock Data & Types (as requested) ---

interface ProfitLossStatementData {
  revenue: { label: string; amount: number }[];
  totalRevenue: number;
  expenses: { label: string; amount: number }[];
  totalExpenses: number;
  grossProfit: number;
  netProfit: number;
}

interface PondProfitability {
  id: string;
  name: string;
  revenue: number;
  cost: number;
  netProfit: number;
  profitMargin: number;
  roi: number;
}

interface GeneratedReport {
    id: string;
    name: string;
    type: string;
    dateRange: string;
    generatedDate: string;
    format: 'PDF' | 'CSV' | 'Excel';
}

const mockPLStatement: ProfitLossStatementData = {
  revenue: [
    { label: 'Tilapia Sales', amount: 45000 },
    { label: 'Catfish Sales', amount: 62000 },
    { label: 'Other Species Sales', amount: 15000 },
  ],
  totalRevenue: 122000,
  expenses: [
    { label: 'Feed Costs', amount: 35000 },
    { label: 'Labor & Salaries', amount: 25000 },
    { label: 'Utilities', amount: 8000 },
    { label: 'Maintenance', amount: 5000 },
    { label: 'Medication & Treatments', amount: 3500 },
    { label: 'Miscellaneous', amount: 2000 },
  ],
  totalExpenses: 78500,
  grossProfit: 122000 - 35000, // Revenue - COGS (assuming feed is COGS)
  netProfit: 122000 - 78500,
};

const mockPondProfitability: PondProfitability[] = [
    { id: 'p1', name: 'Pond A (Tilapia)', revenue: 45000, cost: 21000, netProfit: 24000, profitMargin: 53.3, roi: 114.3 },
    { id: 'p2', name: 'Pond B (Catfish)', revenue: 38000, cost: 19000, netProfit: 19000, profitMargin: 50.0, roi: 100.0 },
    { id: 'p3', name: 'Pond C (Catfish)', revenue: 24000, cost: 14000, netProfit: 10000, profitMargin: 41.7, roi: 71.4 },
    { id: 'p4', name: 'Pond D (Mixed)', revenue: 15000, cost: 14500, netProfit: 500, profitMargin: 3.3, roi: 3.4 },
];

const mockGeneratedReports: GeneratedReport[] = [
    { id: 'rep1', name: 'Q3 2023 P&L Statement', type: 'Profit & Loss', dateRange: 'Jul 1 - Sep 30, 2023', generatedDate: '2023-10-05', format: 'PDF' },
    { id: 'rep2', name: 'October Cash Flow', type: 'Cash Flow', dateRange: 'Oct 1 - Oct 31, 2023', generatedDate: '2023-11-01', format: 'CSV' },
];

// --- Reusable Components (simulating shadcn/ui for clarity) ---

const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200/80 dark:border-slate-800 ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="p-4 sm:p-6 border-b border-gray-200/80 dark:border-slate-800">{children}</div>
);

const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-200">{children}</h3>
);

const CardContent = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`p-4 sm:p-6 ${className}`}>{children}</div>
);

const Button = ({ children, variant = 'default', className, ...props }: { children: React.ReactNode, variant?: 'default' | 'outline' | 'ghost', className?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
    const baseStyle = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
    const variantStyles = {
        default: "bg-slate-900 text-white hover:bg-slate-900/90 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90",
        outline: "border border-gray-300 dark:border-slate-700 bg-transparent hover:bg-gray-100 dark:hover:bg-slate-800",
        ghost: "hover:bg-gray-100 dark:hover:bg-slate-800",
    };
    return <button className={`${baseStyle} ${variantStyles[variant]} ${className}`} {...props}>{children}</button>;
};

// --- Sub-Components for Financial Reports Page ---

const FinancialKpiCard = ({ title, value, change, icon: Icon, changeType }: { title: string, value: string, change: string, icon: React.ElementType, changeType: 'increase' | 'decrease' }) => (
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500 dark:text-slate-400">{title}</p>
        <Icon className="w-5 h-5 text-gray-400 dark:text-slate-500" />
      </div>
    </CardHeader>
    <CardContent>
      <p className="text-3xl font-bold text-gray-900 dark:text-slate-100">{value}</p>
      <div className="flex items-center gap-1 text-sm">
        {changeType === 'increase' ? <ArrowUpRight className="h-4 w-4 text-green-500" /> : <ArrowDownRight className="h-4 w-4 text-red-500" />}
        <span className={changeType === 'increase' ? 'text-green-600' : 'text-red-600'}>{change}</span>
        <span className="text-gray-500 dark:text-slate-400">vs last period</span>
      </div>
    </CardContent>
  </Card>
);

const ProfitLossStatement = ({ data }: { data: ProfitLossStatementData }) => (
    <Card>
        <CardHeader><CardTitle>Profit & Loss Statement</CardTitle></CardHeader>
        <CardContent>
            <div className="space-y-4">
                <div>
                    <h4 className="font-semibold text-gray-800 dark:text-slate-200 mb-2">Revenue</h4>
                    <div className="space-y-1 pl-4">
                        {data.revenue.map(item => (
                            <div key={item.label} className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-slate-400">{item.label}</span>
                                <span>${item.amount.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between font-semibold border-t mt-2 pt-2">
                        <span>Total Revenue</span>
                        <span>${data.totalRevenue.toLocaleString()}</span>
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold text-gray-800 dark:text-slate-200 mb-2">Operating Expenses</h4>
                    <div className="space-y-1 pl-4">
                        {data.expenses.map(item => (
                            <div key={item.label} className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-slate-400">{item.label}</span>
                                <span>(${item.amount.toLocaleString()})</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between font-semibold border-t mt-2 pt-2">
                        <span>Total Expenses</span>
                        <span>(${data.totalExpenses.toLocaleString()})</span>
                    </div>
                </div>

                <div className="border-t-2 pt-4 space-y-2">
                    <div className="flex justify-between font-bold text-lg">
                        <span>Net Profit</span>
                        <span className={data.netProfit > 0 ? 'text-green-600' : 'text-red-600'}>
                            ${data.netProfit.toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
);

const RevenueExpenseTrendChart = () => {
    const data = [
        { name: 'Jul', Revenue: 40000, Expenses: 24000, Profit: 16000 },
        { name: 'Aug', Revenue: 30000, Expenses: 19000, Profit: 11000 },
        { name: 'Sep', Revenue: 52000, Expenses: 35000, Profit: 17000 },
        { name: 'Oct', Revenue: 48000, Expenses: 31000, Profit: 17000 },
    ];
    return (
        <Card>
            <CardHeader><CardTitle>Revenue vs. Expenses</CardTitle></CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `$${v/1000}k`} />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                        <Legend />
                        <Line type="monotone" dataKey="Revenue" stroke="#22c55e" />
                        <Line type="monotone" dataKey="Expenses" stroke="#ef4444" />
                        <Line type="monotone" dataKey="Profit" stroke="#3b82f6" strokeDasharray="5 5" />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

const PondProfitabilityChart = () => {
    return (
        <Card>
            <CardHeader><CardTitle>Profitability by Pond</CardTitle></CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={mockPondProfitability}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                        <Legend />
                        <Bar dataKey="revenue" name="Revenue" stackId="a" fill="#82ca9d" />
                        <Bar dataKey="cost" name="Cost" stackId="a" fill="#ef4444" />
                        <Bar dataKey="netProfit" name="Net Profit" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

const PondProfitabilityTable = () => (
    <Card>
        <CardHeader><CardTitle>Pond-Level Profitability</CardTitle></CardHeader>
        <CardContent className="p-0">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-slate-800/50 text-xs text-gray-500 dark:text-slate-400 uppercase">
                        <tr>
                            <th className="px-6 py-3">Pond</th>
                            <th className="px-6 py-3 text-right">Revenue</th>
                            <th className="px-6 py-3 text-right">Cost</th>
                            <th className="px-6 py-3 text-right">Net Profit</th>
                            <th className="px-6 py-3 text-right">Profit Margin</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                        {mockPondProfitability.map((pond) => (
                            <tr key={pond.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{pond.name}</td>
                                <td className="px-6 py-4 text-right text-green-600">${pond.revenue.toLocaleString()}</td>
                                <td className="px-6 py-4 text-right text-red-600">(${pond.cost.toLocaleString()})</td>
                                <td className={`px-6 py-4 text-right font-bold ${pond.netProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    ${pond.netProfit.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-right">{pond.profitMargin.toFixed(1)}%</td>
                                <td className="px-6 py-4 text-center">
                                    <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </CardContent>
    </Card>
);

const GeneratedReportsHistory = () => (
    <Card>
        <CardHeader><CardTitle>Generated Reports History</CardTitle></CardHeader>
        <CardContent className="p-0">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-slate-800/50 text-xs text-gray-500 dark:text-slate-400 uppercase">
                        <tr>
                            <th className="px-6 py-3">Report Name</th>
                            <th className="px-6 py-3">Type</th>
                            <th className="px-6 py-3">Date Range</th>
                            <th className="px-6 py-3">Generated</th>
                            <th className="px-6 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                        {mockGeneratedReports.map((report) => (
                            <tr key={report.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{report.name}</td>
                                <td className="px-6 py-4 text-gray-600 dark:text-slate-300">{report.type}</td>
                                <td className="px-6 py-4 text-gray-500 dark:text-slate-400">{report.dateRange}</td>
                                <td className="px-6 py-4 text-gray-500 dark:text-slate-400">{report.generatedDate}</td>
                                <td className="px-6 py-4 text-center">
                                    <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </CardContent>
    </Card>
);

const FinancialReportsPage = () => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(2023, 9, 1),
    to: new Date(2023, 9, 31),
  });

  // Placeholder for calculations. Connect to API in a real app.
  const kpiData = {
    totalRevenue: "$122,000",
    totalExpenses: "$78,500",
    netProfit: "$43,500",
    profitMargin: "35.7%",
  };

  return (
    <main className="flex-1 p-4 sm:p-6 md:p-8 bg-gray-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Financial Reports</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">Generate and analyze key financial statements.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-10 gap-2">
            <CalendarIcon className="h-4 w-4" />
            <span>
              {date?.from ? (date.to ? `${format(date.from, "LLL dd")} - ${format(date.to, "LLL dd, y")}` : format(date.from, "LLL dd, y")) : "Pick a date"}
            </span>
          </Button>
          <Button className="h-10 gap-2">
            <Download className="h-5 w-5" />
            <span>Generate Report</span>
          </Button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <FinancialKpiCard title="Total Revenue" value={kpiData.totalRevenue} change="+12.1%" icon={CircleDollarSign} changeType="increase" />
        <FinancialKpiCard title="Total Expenses" value={kpiData.totalExpenses} change="+8.5%" icon={CircleDollarSign} changeType="increase" />
        <FinancialKpiCard title="Net Profit" value={kpiData.netProfit} change="+18.3%" icon={TrendingUp} changeType="increase" />
        <FinancialKpiCard title="Profit Margin" value={kpiData.profitMargin} change="+2.5%" icon={Percent} changeType="increase" />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: P&L and Charts */}
        <div className="lg:col-span-2 space-y-6">
            <ProfitLossStatement data={mockPLStatement} />
            <RevenueExpenseTrendChart />
            <PondProfitabilityChart />
        </div>

        {/* Right Column: Pond Profitability Table */}
        <div className="lg:col-span-1 space-y-6">
            <PondProfitabilityTable />
        </div>
      </div>

      {/* Saved Reports History */}
      <div className="mt-8">
        <GeneratedReportsHistory />
      </div>

      {/* 
        GENERATE REPORT DIALOG/SHEET COMPONENT
        This would be a separate component using shadcn's Dialog or Sheet.
        It would contain a form with fields for:
        - Report Type (Select: P&L, Cash Flow, etc.)
        - Format (Select: PDF, CSV, Excel)
        - Sections to include (Checkboxes)
        - A "Generate & Download" button that triggers an API call for report creation.
      */}

    </main>
  );
};

export default FinancialReportsPage;