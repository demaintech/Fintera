'use client';

import React, { useState, useMemo } from 'react';
import {
  ArrowDownRight, ArrowUpRight, Calendar as CalendarIcon, CircleDollarSign, MoreHorizontal, PlusCircle, Search, FileText, Clock, CheckCircle, XCircle, Send
} from 'lucide-react';
import { addDays, format } from 'date-fns';
import { DateRange } from 'react-day-picker';

// --- Mock Data & Types (as requested) ---

type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled';

interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Invoice {
  id: string;
  customer: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  status: InvoiceStatus;
  lineItems: InvoiceLineItem[];
}

const mockInvoices: Invoice[] = [
  { id: 'INV-001', customer: 'Aqua Farms Inc.', issueDate: '2023-10-25', dueDate: '2023-11-24', amount: 825.00, status: 'Paid', lineItems: [{ id: '1', description: 'Tilapia', quantity: 150, unitPrice: 5.5, total: 825 }] },
  { id: 'INV-002', customer: 'Fresh Catch Co.', issueDate: '2023-10-22', dueDate: '2023-11-21', amount: 1200.00, status: 'Sent', lineItems: [{ id: '1', description: 'Catfish', quantity: 200, unitPrice: 6, total: 1200 }] },
  { id: 'INV-003', customer: 'Ocean Delights', issueDate: '2023-10-28', dueDate: '2023-11-27', amount: 1000.00, status: 'Sent', lineItems: [{ id: '1', description: 'Koi Carp', quantity: 20, unitPrice: 50, total: 1000 }] },
  { id: 'INV-004', customer: 'Gourmet Grill', issueDate: '2023-09-15', dueDate: '2023-10-15', amount: 287.50, status: 'Overdue', lineItems: [{ id: '1', description: 'Tilapia', quantity: 50, unitPrice: 5.75, total: 287.50 }] },
  { id: 'INV-005', customer: 'Aqua Farms Inc.', issueDate: '2023-10-29', dueDate: '2023-11-28', amount: 750.00, status: 'Draft', lineItems: [{ id: '1', description: 'Goldfish', quantity: 500, unitPrice: 1.5, total: 750 }] },
  { id: 'INV-006', customer: 'Fresh Catch Co.', issueDate: '2023-08-01', dueDate: '2023-08-31', amount: 1500.00, status: 'Paid', lineItems: [{ id: '1', description: 'Catfish', quantity: 250, unitPrice: 6, total: 1500 }] },
  { id: 'INV-007', customer: 'Pet Paradise', issueDate: '2023-10-30', dueDate: '2023-11-02', amount: 450.00, status: 'Sent', lineItems: [{ id: '1', description: 'Exotic Guppies', quantity: 100, unitPrice: 4.5, total: 450 }] },
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

const Badge = ({ children, variant }: { children: React.ReactNode, variant: InvoiceStatus }) => {
  const colors: Record<InvoiceStatus, string> = {
    Paid: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    Sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    Overdue: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    Draft: 'bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-slate-300',
    Cancelled: 'bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-slate-500 line-through',
  };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[variant]}`}>{children}</span>;
};

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

// --- Sub-Components for Invoices Page ---

const InvoicesKpiCard = ({ title, value, change, icon: Icon, changeType }: { title: string, value: string, change: string, icon: React.ElementType, changeType: 'increase' | 'decrease' }) => (
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

const OverdueRemindersBanner = () => {
    const overdueInvoices = mockInvoices.filter(inv => inv.status === 'Overdue' || inv.dueDate === '2023-11-02');
    if (overdueInvoices.length === 0) return null;

    return (
        <Card className="mb-6 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800/50">
            <CardContent className="p-4">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 pt-1">
                        <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                        <p className="font-semibold text-yellow-800 dark:text-yellow-200">Payment Reminders</p>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">You have {overdueInvoices.length} invoices that are overdue or due soon.</p>
                        <div className="mt-2 space-y-1">
                            {overdueInvoices.map(inv => (
                                <div key={inv.id} className="flex justify-between items-center text-sm">
                                    <p className="text-yellow-700 dark:text-yellow-300">
                                        <span className="font-medium">{inv.id}</span> for {inv.customer} is {inv.status.toLowerCase()}.
                                    </p>
                                    <Button variant="ghost" className="h-auto p-1 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-100 dark:hover:bg-yellow-800/50">Send Reminder</Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const InvoicesTable = ({ invoices }: { invoices: Invoice[] }) => {
  // In a real app, you'd fetch this data and manage state for sorting, filtering, pagination
  if (invoices.length === 0) {
    return (
        <Card>
            <CardContent>
                <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed rounded-lg">
                    <FileText className="w-12 h-12 text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-700 dark:text-slate-300">No Invoices Found</p>
                    <p className="text-gray-500 dark:text-slate-400">There are no invoices matching the current filters.</p>
                </div>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>Invoice List</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by invoice # or customer..."
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
                <th className="px-6 py-3">Invoice #</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Issue Date</th>
                <th className="px-6 py-3">Due Date</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{invoice.id}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-slate-300">{invoice.customer}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-slate-400">{invoice.issueDate}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-slate-400">{invoice.dueDate}</td>
                  <td className="px-6 py-4 text-right font-medium">${invoice.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-center">
                    <Badge variant={invoice.status}>{invoice.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Button variant="ghost" className="h-8 w-8 p-0">
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

const InvoicesPage = () => {
  const [activeTab, setActiveTab] = useState<InvoiceStatus | 'All'>('All');
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  // Placeholder for calculations. Connect to API in a real app.
  const kpiData = {
    totalInvoiced: "$5,012.50",
    totalPaid: "$2,325.00",
    outstanding: "$2,687.50",
    overdue: "$287.50",
    invoiceCount: 7,
  };

  const filteredInvoices = useMemo(() => {
    if (activeTab === 'All') return mockInvoices;
    return mockInvoices.filter(invoice => invoice.status === activeTab);
  }, [activeTab]);

  const getTabCount = (status: InvoiceStatus | 'All') => {
    if (status === 'All') return mockInvoices.length;
    return mockInvoices.filter(inv => inv.status === status).length;
  };

  const tabList: (InvoiceStatus | 'All')[] = ['All', 'Sent', 'Paid', 'Overdue', 'Draft'];

  return (
    <main className="flex-1 p-4 sm:p-6 md:p-8 bg-gray-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">Manage and track all customer invoices.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-11 w-full px-2  gap-2">
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
            <span>Create New Invoice</span>
          </Button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 mb-6">
        <InvoicesKpiCard title="Total Invoiced" value={kpiData.totalInvoiced} change="+15.2%" icon={CircleDollarSign} changeType="increase" />
        <InvoicesKpiCard title="Total Paid" value={kpiData.totalPaid} change="+25.0%" icon={CheckCircle} changeType="increase" />
        <InvoicesKpiCard title="Outstanding" value={kpiData.outstanding} change="+8.1%" icon={Clock} changeType="increase" />
        <InvoicesKpiCard title="Overdue" value={kpiData.overdue} change="-10.5%" icon={XCircle} changeType="decrease" />
        <InvoicesKpiCard title="Total Invoices" value={kpiData.invoiceCount.toString()} change="+5" icon={FileText} changeType="increase" />
      </div>

      {/* Overdue Reminders */}
      <OverdueRemindersBanner />

      {/* Tabs for different views */}
      <Tabs className="mb-6">
        <TabsList className="overflow-x-auto whitespace-nowrap h-auto justify-start">
          {tabList.map(tab => (
            <TabsTrigger key={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)}>
              {tab}
              <span className="ml-2 bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-slate-300 text-xs font-semibold px-2 py-0.5 rounded-full">
                {getTabCount(tab)}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Tab Content */}
      <InvoicesTable invoices={filteredInvoices} />

      {/* 
        CREATE NEW INVOICE DIALOG/SHEET COMPONENT
        This would be a separate component, likely using shadcn's Dialog or Sheet.
        It would contain a form with fields for:
        - Customer (Select/Combobox)
        - Invoice Date, Due Date (Calendars)
        - Line Items (dynamic table with add/remove)
        - Discount, Tax/VAT (Inputs)
        - Grand Total (auto-calculated)
        - Payment Terms, Notes (Select, Textarea)
        - Status (Select: Draft, Sent)
        - A "Save Invoice" button that triggers an API call and shows a toast notification.
      */}

      {/* 
        INVOICE PREVIEW DIALOG/ROUTE
        This would be triggered from the 'View' action in the table's dropdown menu.
        It would be a clean, print-friendly component styled like a real invoice document.
        - Header: Your Farm Logo, Name, Address
        - Bill To: Customer Name, Address
        - Details: Invoice #, Issue Date, Due Date
        - Body: Itemized table of line items
        - Footer: Subtotal, Discount, Tax, Grand Total, Notes, Payment Terms
        - Actions: Print, Download PDF, Send Email
      */}

    </main>
  );
};

export default InvoicesPage;