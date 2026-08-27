'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell
} from 'recharts';
import {
  ArrowDownRight, ArrowUpRight, Calendar as CalendarIcon, CircleDollarSign, MoreHorizontal, Package, PlusCircle, Search, ShoppingCart, Users, Loader2, Trash2, X
} from 'lucide-react';
import { addDays, format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { getSalesRecords, createSaleRecord, deleteSaleRecord, SaleRecord } from '@/lib/sales-api';

type PaymentStatus = 'Paid' | 'Pending' | 'Partial' | 'Overdue';

// --- Reusable UI Elements ---
const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
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

const CardContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-4 sm:p-6 ${className}`}>{children}</div>
);

const Badge = ({ children, variant }: { children: React.ReactNode; variant: PaymentStatus }) => {
  const colors = {
    Paid: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    Partial: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    Overdue: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[variant] || colors.Paid}`}>{children}</span>;
};

const Button = ({ children, variant = 'default', className, ...props }: { children: React.ReactNode; variant?: 'default' | 'outline' | 'danger'; className?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const baseStyle = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none";
  const variantStyles = {
    default: "bg-slate-900 text-white hover:bg-slate-900/90 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90",
    outline: "border border-gray-300 dark:border-slate-700 bg-transparent hover:bg-gray-100 dark:hover:bg-slate-800",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };
  return <button className={`${baseStyle} ${variantStyles[variant]} ${className}`} {...props}>{children}</button>;
};

const SalesKpiCard = ({ title, value, change, icon: Icon, changeType }: { title: string; value: string; change: string; icon: React.ElementType; changeType: 'increase' | 'decrease' }) => (
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500 dark:text-slate-400">{title}</p>
        <Icon className="w-5 h-5 text-gray-400 dark:text-slate-500" />
      </div>
    </CardHeader>
    <CardContent>
      <p className="text-3xl font-bold text-gray-900 dark:text-slate-100">{value}</p>
      <div className="flex items-center gap-1 text-sm mt-2">
        {changeType === 'increase' ? <ArrowUpRight className="h-4 w-4 text-green-500" /> : <ArrowDownRight className="h-4 w-4 text-red-500" />}
        <span className={changeType === 'increase' ? 'text-green-600' : 'text-red-600'}>{change}</span>
        <span className="text-gray-500 dark:text-slate-400">vs last month</span>
      </div>
    </CardContent>
  </Card>
);

export default function FinancePage() {
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all-sales');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Sale Form State
  const [formData, setFormData] = useState({
    customer: '',
    species: '',
    quantity: '',
    total_weight: '',
    cost: '',
    profit: '',
    status: 'Paid',
    date: new Date().toISOString().split('T')[0],
  });

  const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchSales = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSalesRecords(getToken());
      setSales(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load sales data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleDelete = async (salesId: number) => {
    if (!confirm('Are you sure you want to delete this sale record?')) return;
    try {
      await deleteSaleRecord(salesId, getToken());
      setSales((prev) => prev.filter((s) => s.salesId !== salesId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete sale.');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const newSale = await createSaleRecord(
        {
          customer: formData.customer,
          species: formData.species,
          quantity: Number(formData.quantity),
          total_weight: Number(formData.total_weight),
          cost: Number(formData.cost),
          profit: Number(formData.profit),
          status: formData.status,
          date: formData.date,
        },
        getToken()
      );
      setSales((prev) => [newSale, ...prev]);
      setIsModalOpen(false);
      setFormData({ customer: '', species: '', quantity: '', total_weight: '', cost: '', profit: '', status: 'Paid', date: new Date().toISOString().split('T')[0] });
    } catch (err: any) {
      alert(err.message || 'Failed to create sale record.');
    } finally {
      setSubmitting(false);
    }
  };

  // Dynamic Metrics & Aggregations
  const filteredSales = useMemo(() => {
    return sales.filter((s) =>
      s.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.species.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.includes(searchQuery)
    );
  }, [sales, searchQuery]);

  const kpis = useMemo(() => {
    const totalRev = sales.reduce((acc, curr) => acc + curr.cost + curr.profit, 0);
    const totalWeight = sales.reduce((acc, curr) => acc + curr.totalWeight, 0);
    const outstanding = sales
      .filter((s) => s.paymentStatus === 'Pending' || s.paymentStatus === 'Overdue')
      .reduce((acc, curr) => acc + curr.cost + curr.profit, 0);
    const avgSale = sales.length > 0 ? totalRev / sales.length : 0;

    return {
      totalRevenue: `$${totalRev.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      totalQuantity: `${totalWeight.toLocaleString()} kg`,
      transactions: sales.length,
      outstanding: `$${outstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      avgSale: `$${avgSale.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    };
  }, [sales]);

  const speciesChartData = useMemo(() => {
    const map: Record<string, number> = {};
    sales.forEach((s) => {
      map[s.species] = (map[s.species] || 0) + (s.cost + s.profit);
    });
    return Object.keys(map).map((k) => ({ name: k, sales: map[k] }));
  }, [sales]);

  const customerChartData = useMemo(() => {
    const map: Record<string, number> = {};
    sales.forEach((s) => {
      map[s.customer] = (map[s.customer] || 0) + (s.cost + s.profit);
    });
    return Object.keys(map).map((k) => ({ name: k, value: map[k] }));
  }, [sales]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <main className="flex-1 p-4 sm:p-6 md:p-8 bg-gray-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Sales & Records</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">Track, manage, and analyze your farm's sales performance.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsModalOpen(true)} className="h-11 px-4 gap-2">
            <PlusCircle className="h-5 w-5" />
            <span>Add New Sale</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 mb-6">
        <SalesKpiCard title="Total Revenue" value={kpis.totalRevenue} change="+12.5%" icon={CircleDollarSign} changeType="increase" />
        <SalesKpiCard title="Total Harvest Volume" value={kpis.totalQuantity} change="+8.1%" icon={Package} changeType="increase" />
        <SalesKpiCard title="Transactions" value={kpis.transactions.toString()} change="+20%" icon={ShoppingCart} changeType="increase" />
        <SalesKpiCard title="Outstanding" value={kpis.outstanding} change="-5.2%" icon={CircleDollarSign} changeType="decrease" />
        <SalesKpiCard title="Average Sale" value={kpis.avgSale} change="+2.1%" icon={Users} changeType="increase" />
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-slate-800 mb-6">
        {['all-sales', 'analytics', 'outstanding'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-4 font-medium text-sm capitalize transition-colors border-b-2 ${
              activeTab === tab
                ? 'border-slate-900 dark:border-slate-50 text-slate-900 dark:text-slate-50 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400'
            }`}
          >
            {tab.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Dynamic Content Views */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      ) : error ? (
        <Card className="p-6 text-center text-red-600">
          <p>{error}</p>
          <Button onClick={fetchSales} variant="outline" className="mt-4">Retry</Button>
        </Card>
      ) : (
        <>
          {activeTab === 'all-sales' && (
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <CardTitle>Sales History</CardTitle>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search sales..."
                      className="w-full bg-slate-100 dark:bg-slate-800 pl-10 pr-4 py-2 rounded-md text-sm focus:outline-none"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-slate-800/50 text-xs text-gray-500 dark:text-slate-400 uppercase">
                      <tr>
                        <th className="px-6 py-3">ID</th>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">Customer</th>
                        <th className="px-6 py-3">Species</th>
                        <th className="px-6 py-3">Weight (kg)</th>
                        <th className="px-6 py-3 text-right">Revenue</th>
                        <th className="px-6 py-3 text-center">Status</th>
                        <th className="px-6 py-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                      {filteredSales.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center py-8 text-gray-500">No sale records found.</td>
                        </tr>
                      ) : (
                        filteredSales.map((sale) => (
                          <tr key={sale.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50">
                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">#{sale.salesId}</td>
                            <td className="px-6 py-4 text-gray-500 dark:text-slate-400">{sale.saleDate}</td>
                            <td className="px-6 py-4">{sale.customer}</td>
                            <td className="px-6 py-4">{sale.species}</td>
                            <td className="px-6 py-4">{sale.totalWeight}</td>
                            <td className="px-6 py-4 text-right font-medium">${(sale.cost + sale.profit).toFixed(2)}</td>
                            <td className="px-6 py-4 text-center">
                              <Badge variant={sale.paymentStatus}>{sale.paymentStatus}</Badge>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <Button onClick={() => handleDelete(sale.salesId)} variant="outline" className="h-8 w-8 p-0 text-red-500 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader><CardTitle>Revenue by Species</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={speciesChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="sales" fill="#0088FE" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader><CardTitle>Revenue by Customer</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie data={customerChartData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                          {customerChartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'outstanding' && (
            <Card>
              <CardHeader><CardTitle>Pending & Overdue Invoices</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-slate-800/50 text-xs uppercase">
                      <tr>
                        <th className="px-6 py-3">Customer</th>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3 text-right">Amount Due</th>
                        <th className="px-6 py-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                      {sales.filter((s) => s.paymentStatus === 'Pending' || s.paymentStatus === 'Overdue').map((s) => (
                        <tr key={s.id}>
                          <td className="px-6 py-4 font-medium">{s.customer}</td>
                          <td className="px-6 py-4">{s.saleDate}</td>
                          <td className="px-6 py-4 text-right font-medium">${(s.cost + s.profit).toFixed(2)}</td>
                          <td className="px-6 py-4 text-center"><Badge variant={s.paymentStatus}>{s.paymentStatus}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* New Sale Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg w-full max-w-md p-6 relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold mb-4">Record New Sale</h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Customer</label>
                <input required type="text" value={formData.customer} onChange={(e) => setFormData({ ...formData, customer: e.target.value })} className="w-full p-2 border rounded-md dark:bg-slate-800 border-gray-300 dark:border-slate-700" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Species</label>
                  <input required type="text" value={formData.species} onChange={(e) => setFormData({ ...formData, species: e.target.value })} className="w-full p-2 border rounded-md dark:bg-slate-800 border-gray-300 dark:border-slate-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input required type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full p-2 border rounded-md dark:bg-slate-800 border-gray-300 dark:border-slate-700" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity (Units)</label>
                  <input required type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} className="w-full p-2 border rounded-md dark:bg-slate-800 border-gray-300 dark:border-slate-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Weight (kg)</label>
                  <input required type="number" step="0.1" value={formData.total_weight} onChange={(e) => setFormData({ ...formData, total_weight: e.target.value })} className="w-full p-2 border rounded-md dark:bg-slate-800 border-gray-300 dark:border-slate-700" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Cost ($)</label>
                  <input required type="number" step="0.01" value={formData.cost} onChange={(e) => setFormData({ ...formData, cost: e.target.value })} className="w-full p-2 border rounded-md dark:bg-slate-800 border-gray-300 dark:border-slate-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Profit ($)</label>
                  <input required type="number" step="0.01" value={formData.profit} onChange={(e) => setFormData({ ...formData, profit: e.target.value })} className="w-full p-2 border rounded-md dark:bg-slate-800 border-gray-300 dark:border-slate-700" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Payment Status</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full p-2 border rounded-md dark:bg-slate-800 border-gray-300 dark:border-slate-700">
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Partial">Partial</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save Record'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}