'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ArrowDownRight, ArrowUpRight, Calendar as CalendarIcon, CircleDollarSign,
  PlusCircle, Search, FileText, Clock, CheckCircle, XCircle, Loader2, X, Trash2
} from 'lucide-react';
import { addDays, format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { getInvoices, createInvoice, deleteInvoice, InvoiceRecord, InvoiceStatus } from '@/lib/invoice-api';

const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200/80 dark:border-slate-800 ${className || ''}`}>
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
  <div className={`p-4 sm:p-6 ${className || ''}`}>{children}</div>
);

const Badge = ({ children, variant }: { children: React.ReactNode, variant: InvoiceStatus }) => {
  const colors: Record<string, string> = {
    Paid: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    Sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    Overdue: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    Draft: 'bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-slate-300',
    Cancelled: 'bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-slate-500 line-through',
  };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[variant] || colors.Draft}`}>{children}</span>;
};

const Button = ({ children, variant = 'default', className, ...props }: { children: React.ReactNode, variant?: 'default' | 'outline' | 'ghost', className?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const baseStyle = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
  const variantStyles = {
    default: "bg-slate-900 text-white hover:bg-slate-900/90 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90",
    outline: "border border-gray-300 dark:border-slate-700 bg-transparent hover:bg-gray-100 dark:hover:bg-slate-800",
    ghost: "hover:bg-gray-100 dark:hover:bg-slate-800",
  };
  return <button className={`${baseStyle} ${variantStyles[variant]} ${className || ''}`} {...props}>{children}</button>;
};

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

const OverdueRemindersBanner = ({ invoices }: { invoices: InvoiceRecord[] }) => {
  const overdueInvoices = invoices.filter(inv => inv.status === 'Overdue');
  if (overdueInvoices.length === 0) return null;

  return (
    <Card className="mb-6 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800/50">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-1" />
          <div>
            <p className="font-semibold text-yellow-800 dark:text-yellow-200">Payment Reminders</p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">You have {overdueInvoices.length} overdue invoices.</p>
            <div className="mt-2 space-y-1">
              {overdueInvoices.map(inv => (
                <div key={`reminder-${inv.id}`} className="flex justify-between items-center text-sm">
                  <p className="text-yellow-700 dark:text-yellow-300">
                    <span className="font-medium">INV-{inv.id}</span> for {inv.customer} is overdue.
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

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<InvoiceStatus | 'All'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [date] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [formData, setFormData] = useState({
    customer: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    due_date: format(addDays(new Date(), 14), 'yyyy-MM-dd'),
    amount: '',
    status: 'Draft' as InvoiceStatus,
  });

  useEffect(() => {
    const storedToken = localStorage.getItem('token') || localStorage.getItem('auth_token') || localStorage.getItem('access_token');
    setToken(storedToken);
    setIsAuthLoading(false);
  }, []);

  const fetchInvoices = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getInvoices(token);
      setInvoices(data);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to load invoices.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!isAuthLoading && token) {
      fetchInvoices();
    } else if (!isAuthLoading && !token) {
      setLoading(false);
    }
  }, [isAuthLoading, token, fetchInvoices]);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError('Authentication session expired. Please log in.');
      return;
    }

    if (!formData.customer.trim() || !formData.amount || Number(formData.amount) <= 0) {
      setError('Customer name and a valid amount are required.');
      return;
    }

    try {
      setError(null);
      await createInvoice({
        customer: formData.customer.trim(),
        date: formData.date,
        due_date: formData.due_date,
        amount: Number(formData.amount),
        status: formData.status,
      }, token);

      setIsModalOpen(false);
      setFormData({
        customer: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        due_date: format(addDays(new Date(), 14), 'yyyy-MM-dd'),
        amount: '',
        status: 'Draft',
      });
      await fetchInvoices();
    } catch (err: any) {
      setError(err?.message || 'Failed to create invoice.');
    }
  };

  const handleDeleteInvoice = async (invoiceId: number) => {
    if (!token) {
      setError('Authentication session expired. Please log in.');
      return;
    }

    if (!confirm(`Are you sure you want to delete invoice INV-${invoiceId}?`)) return;

    try {
      setDeletingId(invoiceId);
      await deleteInvoice(invoiceId, token);
      setInvoices((prev) => prev.filter((inv) => inv.id !== invoiceId));
    } catch (err: any) {
      setError(err?.message || 'Failed to delete invoice.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesTab = activeTab === 'All' || inv.status === activeTab;
      const matchesSearch = inv.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.id.toString().includes(searchTerm);
      return matchesTab && matchesSearch;
    });
  }, [invoices, activeTab, searchTerm]);

  const kpis = useMemo(() => {
    const totalInvoiced = invoices.reduce((acc, inv) => acc + inv.amount, 0);
    const totalPaid = invoices.filter(i => i.status === 'Paid').reduce((acc, inv) => acc + inv.amount, 0);
    const overdue = invoices.filter(i => i.status === 'Overdue').reduce((acc, inv) => acc + inv.amount, 0);
    const outstanding = totalInvoiced - totalPaid;

    return {
      totalInvoiced: `$${totalInvoiced.toFixed(2)}`,
      totalPaid: `$${totalPaid.toFixed(2)}`,
      outstanding: `$${outstanding.toFixed(2)}`,
      overdue: `$${overdue.toFixed(2)}`,
      count: invoices.length,
    };
  }, [invoices]);

  const tabList: (InvoiceStatus | 'All')[] = ['All', 'Sent', 'Paid', 'Overdue', 'Draft'];

  if (isAuthLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <main className="flex-1 p-4 sm:p-6 md:p-8 bg-gray-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">Manage and track all customer invoices.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-11 px-3 gap-2">
            <CalendarIcon className="h-4 w-4" />
            <span>
              {date?.from ? (
                date.to ? `${format(date.from, 'LLL dd, y')} - ${format(date.to, 'LLL dd, y')}` : format(date.from, 'LLL dd, y')
              ) : 'Pick a date'}
            </span>
          </Button>
          <Button onClick={() => setIsModalOpen(true)} className="h-11 px-4 gap-2">
            <PlusCircle className="h-5 w-5" />
            <span>Create New Invoice</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 mb-6">
        <InvoicesKpiCard title="Total Invoiced" value={kpis.totalInvoiced} change="+15.2%" icon={CircleDollarSign} changeType="increase" />
        <InvoicesKpiCard title="Total Paid" value={kpis.totalPaid} change="+25.0%" icon={CheckCircle} changeType="increase" />
        <InvoicesKpiCard title="Outstanding" value={kpis.outstanding} change="+8.1%" icon={Clock} changeType="increase" />
        <InvoicesKpiCard title="Overdue" value={kpis.overdue} change="-10.5%" icon={XCircle} changeType="decrease" />
        <InvoicesKpiCard title="Total Invoices" value={kpis.count.toString()} change="+5" icon={FileText} changeType="increase" />
      </div>

      <OverdueRemindersBanner invoices={invoices} />

      {error && (
        <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-700/50 dark:bg-red-950/30 dark:text-red-200">
          {error}
        </div>
      )}

      <div className="inline-flex h-10 items-center rounded-md bg-slate-100 dark:bg-slate-800 p-1 text-slate-500 mb-6 overflow-x-auto">
        {tabList.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-sm transition-all ${
              activeTab === tab ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-50 shadow-sm' : ''
            }`}
          >
            {tab}
            <span className="ml-2 bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-slate-300 text-xs px-2 py-0.5 rounded-full">
              {tab === 'All' ? invoices.length : invoices.filter(i => i.status === tab).length}
            </span>
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Invoice List</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by invoice # or customer..."
                className="w-full bg-slate-100 dark:bg-slate-800 pl-10 pr-4 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <FileText className="w-12 h-12 text-gray-400 mb-2" />
              <p className="text-lg font-medium">No Invoices Found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-slate-800/50 text-xs text-gray-500 uppercase">
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
                  {filteredInvoices.map((inv) => (
                    <tr key={`inv-row-${inv.id}`} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50">
                      <td className="px-6 py-4 font-medium">INV-{inv.id}</td>
                      <td className="px-6 py-4">{inv.customer}</td>
                      <td className="px-6 py-4">{inv.date}</td>
                      <td className="px-6 py-4">{inv.dueDate}</td>
                      <td className="px-6 py-4 text-right font-medium">${Number(inv.amount).toFixed(2)}</td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant={inv.status}>{inv.status}</Badge>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Button
                          variant="ghost"
                          disabled={deletingId === inv.id}
                          className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                          onClick={() => handleDeleteInvoice(inv.id)}
                          aria-label={`Delete invoice ${inv.id}`}
                        >
                          {deletingId === inv.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-slate-50">Add New Invoice</h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-slate-800 dark:hover:text-slate-200" aria-label="Close invoice form">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">Customer</label>
                <input
                  type="text"
                  value={formData.customer}
                  onChange={(e) => setFormData((prev) => ({ ...prev, customer: e.target.value }))}
                  placeholder="e.g. Aqua Harvest Ltd."
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">Issue Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">Due Date</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData((prev) => ({ ...prev, due_date: e.target.value }))}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">Amount</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as InvoiceStatus }))}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50"
                >
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit">Save Invoice</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}