'use client';

import React, { useState, useMemo } from 'react';
import {
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';
import {
  ArrowDownRight, ArrowUpRight, Calendar as CalendarIcon, CircleDollarSign, MoreHorizontal, PlusCircle, Search, FileText, Tag, Building, AlertCircle, Clock
} from 'lucide-react';
import { addDays, format } from 'date-fns';
import { DateRange } from 'react-day-picker';

// --- Mock Data & Types (as requested) ---

type ExpenseCategory = 'Feed' | 'Medication' | 'Equipment' | 'Labor' | 'Utilities' | 'Maintenance' | 'Miscellaneous';
type PaymentStatus = 'Paid' | 'Pending';

interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  vendor: string;
  amount: number;
  pondAssociated?: string;
  paymentStatus: PaymentStatus;
  paymentMethod: 'Card' | 'Bank Transfer' | 'Cash';
}

const mockExpenses: Expense[] = [
  { id: 'EXP-001', date: '2023-10-28', category: 'Feed', description: 'High-protein grower pellets', vendor: 'AquaFeeds Supply', amount: 1250.00, pondAssociated: 'Pond A', paymentStatus: 'Paid', paymentMethod: 'Bank Transfer' },
  { id: 'EXP-002', date: '2023-10-25', category: 'Equipment', description: 'New aeration pump', vendor: 'FarmTech Solutions', amount: 750.50, pondAssociated: 'Pond C', paymentStatus: 'Paid', paymentMethod: 'Card' },
  { id: 'EXP-003', date: '2023-10-22', category: 'Labor', description: 'October Salaries', vendor: 'Internal Payroll', amount: 5500.00, paymentStatus: 'Paid', paymentMethod: 'Bank Transfer' },
  { id: 'EXP-004', date: '2023-10-20', category: 'Medication', description: 'Parasite treatment', vendor: 'PharmaFish Co.', amount: 320.00, pondAssociated: 'Pond B', paymentStatus: 'Pending', paymentMethod: 'Card' },
  { id: 'EXP-005', date: '2023-10-18', category: 'Utilities', description: 'Electricity Bill', vendor: 'City Power', amount: 450.75, paymentStatus: 'Paid', paymentMethod: 'Bank Transfer' },
  { id: 'EXP-006', date: '2023-10-15', category: 'Maintenance', description: 'Filter replacement parts', vendor: 'FarmTech Solutions', amount: 180.25, pondAssociated: 'Pond A', paymentStatus: 'Paid', paymentMethod: 'Card' },
  { id: 'EXP-007', date: '2023-09-28', category: 'Feed', description: 'Starter feed crumble', vendor: 'AquaFeeds Supply', amount: 980.00, pondAssociated: 'Pond D', paymentStatus: 'Paid', paymentMethod: 'Bank Transfer' },
];

const mockBudgets = {
    'Feed': { budget: 5000, actual: 4200 },
    'Labor': { budget: 5500, actual: 5500 },
    'Equipment': { budget: 2000, actual: 2150 }, // Over budget
    'Utilities': { budget: 600, actual: 450.75 },
    'Maintenance': { budget: 1000, actual: 780 },
    'Medication': { budget: 500, actual: 600 }, // Over budget
};

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

const Badge = ({ children, color }: { children: React.ReactNode, color: string }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>{children}</span>
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

const Tabs = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={className}>{children}</div>
);

const TabsList = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`inline-flex h-10 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800 p-1 text-slate-500 dark:text-slate-400 ${className}`}>{children}</div>
);

const TabsTrigger = ({ children, active, ...props }: { children: React.ReactNode, active?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${active ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-50 shadow-sm' : ''}`}
    {...props}
  >
    {children}
  </button>
);

const Progress = ({ value, color }: { value: number, color: string }) => (
    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
        <div className={`${color} h-2.5 rounded-full`} style={{ width: `${value}%` }}></div>
    </div>
);

// --- Sub-Components for Expenses Page ---

const ExpensesKpiCard = ({ title, value, change, icon: Icon, changeType }: { title: string, value: string, change?: string, icon: React.ElementType, changeType?: 'increase' | 'decrease' }) => (
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500 dark:text-slate-400">{title}</p>
        <Icon className="w-5 h-5 text-gray-400 dark:text-slate-500" />
      </div>
    </CardHeader>
    <CardContent>
      <p className="text-3xl font-bold text-gray-900 dark:text-slate-100">{value}</p>
      {change && changeType && (
        <div className="flex items-center gap-1 text-sm">
          {changeType === 'increase' ? <ArrowUpRight className="h-4 w-4 text-red-500" /> : <ArrowDownRight className="h-4 w-4 text-green-500" />}
          <span className={changeType === 'increase' ? 'text-red-600' : 'text-green-600'}>{change}</span>
          <span className="text-gray-500 dark:text-slate-400">vs last period</span>
        </div>
      )}
    </CardContent>
  </Card>
);

const ExpensesByCategoryChart = () => {
    const data = [
        { name: 'Feed', total: 2230 }, { name: 'Labor', total: 5500 },
        { name: 'Equipment', total: 750.50 }, { name: 'Utilities', total: 450.75 },
        { name: 'Maintenance', total: 180.25 }, { name: 'Medication', total: 320 },
    ];
    return (
        <Card>
            <CardHeader><CardTitle>Expenses by Category</CardTitle></CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip
                            cursor={{ fill: 'hsl(var(--accent))' }}
                            contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                        />
                        <Bar dataKey="total" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

const ExpenseTrendChart = () => {
  const data = [
    { name: 'Week 1', Expenses: 1180 }, { name: 'Week 2', Expenses: 630 },
    { name: 'Week 3', Expenses: 5950 }, { name: 'Week 4', Expenses: 1250 },
  ];
  return (
    <Card>
      <CardHeader><CardTitle>Expense Trend</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => `$${value / 1000}k`} />
            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
            <Line type="monotone" dataKey="Expenses" stroke="hsl(var(--primary))" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

const ExpensesTable = ({ expenses }: { expenses: Expense[] }) => {
  const categoryColors: Record<ExpenseCategory, string> = {
    Feed: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    Medication: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    Equipment: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    Labor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
    Utilities: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    Maintenance: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
    Miscellaneous: 'bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-slate-300',
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>Expense Records</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search expenses..."
              className="w-full bg-slate-100 dark:bg-slate-800 pl-10 pr-4 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-slate-800/50 text-xs text-gray-500 dark:text-slate-400 uppercase">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 text-gray-600 dark:text-slate-300">{exp.date}</td>
                  <td className="px-6 py-4"><Badge color={categoryColors[exp.category]}>{exp.category}</Badge></td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{exp.description}</td>
                  <td className="px-6 py-4 text-right font-medium">${exp.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`font-medium ${exp.paymentStatus === 'Paid' ? 'text-green-600' : 'text-yellow-600'}`}>{exp.paymentStatus}</span>
                  </td>
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
};

const BudgetTrackingTab = () => {
    return (
        <Card>
            <CardHeader><CardTitle>Budget vs. Actual Spending</CardTitle></CardHeader>
            <CardContent className="space-y-6">
                {Object.entries(mockBudgets).map(([category, { budget, actual }]) => {
                    const percentage = Math.min((actual / budget) * 100, 100);
                    const isOverBudget = actual > budget;
                    const progressColor = isOverBudget ? 'bg-red-500' : percentage > 85 ? 'bg-yellow-500' : 'bg-blue-600';

                    return (
                        <div key={category}>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{category}</span>
                                <span className="text-sm text-gray-500 dark:text-slate-400">
                                    ${actual.toLocaleString()} / <span className="font-medium">${budget.toLocaleString()}</span>
                                </span>
                            </div>
                            <Progress value={percentage} color={progressColor} />
                            {isOverBudget && (
                                <div className="mt-2 flex items-center gap-2 text-xs text-red-600">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>Over budget by ${(actual - budget).toLocaleString()}</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
};

const ExpensesPage = () => {
  const [activeTab, setActiveTab] = useState('all-expenses');
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  // Placeholder for calculations. Connect to API in a real app.
  const kpiData = {
    totalExpenses: "$8,431.50",
    periodChange: "+7.2%",
    largestCategory: "Labor",
    pendingPayments: "$320.00",
  };

  return (
    <main className="flex-1 p-4 sm:p-6 md:p-8 bg-gray-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Expenses</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">Log, track, and analyze all operational costs.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-10 gap-2">
            <CalendarIcon className="h-4 w-4" />
            <span>
              {date?.from ? (date.to ? `${format(date.from, "LLL dd")} - ${format(date.to, "LLL dd, y")}` : format(date.from, "LLL dd, y")) : "Pick a date"}
            </span>
          </Button>
          <Button className="h-10 gap-2">
            <PlusCircle className="h-5 w-5" />
            <span>Add New Expense</span>
          </Button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <ExpensesKpiCard title="Total Expenses (Period)" value={kpiData.totalExpenses} change={kpiData.periodChange} icon={CircleDollarSign} changeType="increase" />
        <ExpensesKpiCard title="Largest Category" value={kpiData.largestCategory} icon={Tag} />
        <ExpensesKpiCard title="Pending Payments" value={kpiData.pendingPayments} icon={Clock} />
        <ExpensesKpiCard title="Avg. Monthly Expense" value="$7,800" icon={FileText} />
      </div>

      {/* Tabs for different views */}
      <Tabs className="mb-6">
        <TabsList>
          <TabsTrigger active={activeTab === 'all-expenses'} onClick={() => setActiveTab('all-expenses')}>All Expenses</TabsTrigger>
          <TabsTrigger active={activeTab === 'budget-tracking'} onClick={() => setActiveTab('budget-tracking')}>Budget Tracking</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          {activeTab === 'all-expenses' && <ExpensesTable expenses={mockExpenses} />}
          {activeTab === 'budget-tracking' && <BudgetTrackingTab />}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <ExpensesByCategoryChart />
        <ExpenseTrendChart />
      </div>

      {/* 
        ADD NEW EXPENSE DIALOG/SHEET COMPONENT
        This would be a separate component using shadcn's Dialog or Sheet.
        It would contain a form with fields for:
        - Expense Category (Select)
        - Amount (Input type=number)
        - Date Incurred (Calendar)
        - Associated Pond (Select, optional)
        - Vendor/Supplier (Input)
        - Payment Method (Select)
        - Payment Status (Radio Group)
        - Receipt Upload (File Input placeholder)
        - Notes (Textarea)
        - A "Save Expense" button that triggers an API call and shows a toast notification.
      */}

    </main>
  );
};

export default ExpensesPage;