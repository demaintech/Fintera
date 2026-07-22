'use client';

import React, { useState, useMemo } from 'react';
import {
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell
} from 'recharts';
import {
  ArrowDownRight, ArrowUpRight, Calendar as CalendarIcon, CircleDollarSign, MoreHorizontal, Package, PlusCircle, Search, ShoppingCart, Users
} from 'lucide-react';
import { addDays, format } from 'date-fns';
import { DateRange } from 'react-day-picker';

// --- Mock Data & Types (as requested) ---

type PaymentStatus = 'Paid' | 'Pending' | 'Partial' | 'Overdue';

interface Sale {
  id: string;
  customer: string;
  species: string;
  quantity: number; // in kg
  unitPrice: number;
  totalAmount: number;
  pondSource: string;
  paymentMethod: 'Bank Transfer' | 'Cash' | 'Card';
  paymentStatus: PaymentStatus;
  saleDate: string;
  notes?: string;
}

const mockSales: Sale[] = [
  { id: 'INV-2023001', customer: 'Aqua Farms Inc.', species: 'Tilapia', quantity: 150, unitPrice: 5.5, totalAmount: 825, pondSource: 'Pond A', paymentMethod: 'Bank Transfer', paymentStatus: 'Paid', saleDate: '2023-10-25' },
  { id: 'INV-2023002', customer: 'Fresh Catch Co.', species: 'Catfish', quantity: 200, unitPrice: 6.0, totalAmount: 1200, pondSource: 'Pond B', paymentMethod: 'Card', paymentStatus: 'Paid', saleDate: '2023-10-22' },
  { id: 'INV-2023003', customer: 'Ocean Delights', species: 'Koi Carp', quantity: 20, unitPrice: 50, totalAmount: 1000, pondSource: 'Pond C', paymentMethod: 'Bank Transfer', paymentStatus: 'Pending', saleDate: '2023-10-28' },
  { id: 'INV-2023004', customer: 'Aqua Farms Inc.', species: 'Catfish', quantity: 180, unitPrice: 6.0, totalAmount: 1080, pondSource: 'Pond B', paymentMethod: 'Bank Transfer', paymentStatus: 'Paid', saleDate: '2023-10-15' },
  { id: 'INV-2023005', customer: 'Gourmet Grill', species: 'Tilapia', quantity: 50, unitPrice: 5.75, totalAmount: 287.5, pondSource: 'Pond A', paymentMethod: 'Cash', paymentStatus: 'Partial', saleDate: '2023-10-29' },
  { id: 'INV-2023006', customer: 'Fresh Catch Co.', species: 'Goldfish', quantity: 500, unitPrice: 1.5, totalAmount: 750, pondSource: 'Pond D', paymentMethod: 'Card', paymentStatus: 'Overdue', saleDate: '2023-09-10' },
];

// --- Reusable Components (simulating shadcn/ui for clarity) ---
// In a real project, you would import these from your actual component library.

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

const Badge = ({ children, variant }: { children: React.ReactNode, variant: PaymentStatus }) => {
  const colors = {
    Paid: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    Partial: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    Overdue: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[variant]}`}>{children}</span>;
};

const Button = ({ children, variant = 'default', className, ...props }: { children: React.ReactNode, variant?: 'default' | 'outline', className?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
    const baseStyle = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
    const variantStyles = {
        default: "bg-slate-900 text-white hover:bg-slate-900/90 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90",
        outline: "border border-gray-300 dark:border-slate-700 bg-transparent hover:bg-gray-100 dark:hover:bg-slate-800",
    };
    return <button className={`${baseStyle} ${variantStyles[variant]} ${className}`} {...props}>{children}</button>;
};

const Tabs = ({ children, className, value, ...props }: { children: React.ReactNode, className?: string, value?: string } & React.HTMLAttributes<HTMLDivElement>) => (
  <div className={className} data-value={value} {...props}>{children}</div>
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

const TabsContent = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`mt-4 ${className}`}>{children}</div>
);

// --- Sub-Components for Sales Page ---

const SalesKpiCard = ({ title, value, change, icon: Icon, changeType }: { title: string, value: string, change: string, icon: React.ElementType, changeType: 'increase' | 'decrease' }) => (
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
        <span className="text-gray-500 dark:text-slate-400">from last month</span>
      </div>
    </CardContent>
  </Card>
);

const SalesTrendChart = () => {
  const data = [
    { name: 'Week 1', Sales: 2400 }, { name: 'Week 2', Sales: 1398 },
    { name: 'Week 3', Sales: 9800 }, { name: 'Week 4', Sales: 3908 },
    { name: 'Week 5', Sales: 4800 }, { name: 'Week 6', Sales: 3800 },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => `$${value / 1000}k`} />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Legend />
            <Line type="monotone" dataKey="Sales" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

const SalesByProductChart = () => {
    const data = [
        { name: 'Tilapia', sales: 4000 }, { name: 'Catfish', sales: 3000 },
        { name: 'Koi Carp', sales: 2000 }, { name: 'Goldfish', sales: 2780 },
    ];
    return (
        <Card>
            <CardHeader><CardTitle>Sales by Species</CardTitle></CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                            labelStyle={{ color: 'hsl(var(--foreground))' }}
                        />
                        <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

const RevenueByCustomerChart = () => {
    const data = [
        { name: 'Aqua Farms Inc.', value: 400 }, { name: 'Fresh Catch Co.', value: 300 },
        { name: 'Ocean Delights', value: 300 }, { name: 'Gourmet Grill', value: 200 },
    ];
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
    return (
        <Card>
            <CardHeader><CardTitle>Revenue by Customer</CardTitle></CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={data} cx="50%" cy="50%" labelLine={false} outerRadius={100} dataKey="value" label>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                            labelStyle={{ color: 'hsl(var(--foreground))' }}
                        />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

const SalesRecordsTable = () => {
  // In a real app, you'd fetch this data and manage state for sorting, filtering, pagination
  const sales = mockSales;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>All Sales</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search sales..."
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
                <th className="px-6 py-3">Invoice ID</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Species</th>
                <th className="px-6 py-3 text-right">Total</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
              {sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{sale.id}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-slate-400">{sale.saleDate}</td>
                  <td className="px-6 py-4">{sale.customer}</td>
                  <td className="px-6 py-4">{sale.species}</td>
                  <td className="px-6 py-4 text-right font-medium">${sale.totalAmount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-center">
                    <Badge variant={sale.paymentStatus}>{sale.paymentStatus}</Badge>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Button variant="outline" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
      {/* Add Pagination Controls here */}
    </Card>
  );
};

const FinancePage = () => {
  const [activeTab, setActiveTab] = useState('all-sales');
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  // Placeholder for calculations. Connect to API in a real app.
  const kpiData = {
    totalRevenue: "$4,442.50",
    totalQuantity: "600 kg",
    transactions: 6,
    outstanding: "$1,937.50",
    avgSale: "$740.42"
  };

  return (
    <main className="flex-1 p-4 sm:p-6 md:p-8 bg-gray-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Sales & Records</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">Track, manage, and analyze your farm's sales performance.</p>
        </div>
        <div className="md:flex items-center gap-2">
          <Button variant="outline" className="h-11 w-full px-4 gap-2">
            <CalendarIcon className="h-4 w-4" />
            <span>
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date</span>
              )}
            </span>
          </Button>
          <Button className="h-11 w-full px-2 gap-2">
            <PlusCircle className="h-5 w-5" />
            <span>Add New Sale</span>
          </Button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 mb-6">
        <SalesKpiCard title="Total Revenue" value={kpiData.totalRevenue} change="+12.5%" icon={CircleDollarSign} changeType="increase" />
        <SalesKpiCard title="Total Quantity Sold" value={kpiData.totalQuantity} change="+8.1%" icon={Package} changeType="increase" />
        <SalesKpiCard title="Transactions" value={kpiData.transactions.toString()} change="+20%" icon={ShoppingCart} changeType="increase" />
        <SalesKpiCard title="Outstanding Payments" value={kpiData.outstanding} change="-5.2%" icon={CircleDollarSign} changeType="decrease" />
        <SalesKpiCard title="Average Sale Value" value={kpiData.avgSale} change="+2.1%" icon={Users} changeType="increase" />
      </div>

      {/* Tabs for different views */}
      <Tabs value={activeTab} className="mb-6">
        <TabsList>
          <TabsTrigger active={activeTab === 'all-sales'} onClick={() => setActiveTab('all-sales')}>All Sales</TabsTrigger>
          <TabsTrigger active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')}>Analytics Dashboard</TabsTrigger>
          <TabsTrigger active={activeTab === 'customers'} onClick={() => setActiveTab('customers')}>Customer Records</TabsTrigger>
          <TabsTrigger active={activeTab === 'outstanding'} onClick={() => setActiveTab('outstanding')}>Outstanding Payments</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Tab Content */}
      {activeTab === 'all-sales' && (
        <SalesRecordsTable />
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
            <SalesTrendChart />
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                    <SalesByProductChart />
                </div>
                <div className="lg:col-span-2">
                    <RevenueByCustomerChart />
                </div>
            </div>
        </div>
      )}

      {activeTab === 'customers' && (
        <Card>
          <CardHeader><CardTitle>Customer Records</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed rounded-lg">
              <p className="text-lg font-medium text-gray-700 dark:text-slate-300">Customer Records Coming Soon</p>
              <p className="text-gray-500 dark:text-slate-400">This section will list all customers and their purchase history.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'outstanding' && (
        <Card>
          <CardHeader><CardTitle>Outstanding Payments</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed rounded-lg">
              <p className="text-lg font-medium text-gray-700 dark:text-slate-300">Outstanding Payments Panel Coming Soon</p>
              <p className="text-gray-500 dark:text-slate-400">A dedicated view for managing overdue and pending payments.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 
        ADD NEW SALE DIALOG/SHEET COMPONENT
        This would be a separate component, likely using shadcn's Dialog or Sheet.
        It would contain a form with fields:
        - Customer Name (Select/Combobox)
        - Species/Product (Select)
        - Quantity (Input type=number)
        - Unit Price (Input type=number)
        - Total Amount (Readonly, auto-calculated)
        - Pond/Batch Source (Select)
        - Payment Method (Select: Bank Transfer, Cash, Card)
        - Payment Status (Radio Group: Paid, Partial, Pending)
        - Date of Sale (Calendar)
        - Notes (Textarea)
        - A "Save Sale" button that triggers an API call and shows a toast notification.
      */}

    </main>
  );
};

export default FinancePage;