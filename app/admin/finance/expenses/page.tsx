'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';
import {
  CircleDollarSign, PlusCircle, Search, FileText, Tag, Clock, Loader2, Trash2, X, AlertCircle
} from 'lucide-react';
import { addDays, format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { getExpenses, createExpense, deleteExpense, ExpenseItem } from '@/lib/expenses-api';

const mockBudgets = {
  Feed: { budget: 5000 },
  Labor: { budget: 5500 },
  Equipment: { budget: 2000 },
  Utilities: { budget: 600 },
  Maintenance: { budget: 1000 },
  Medication: { budget: 500 },
};

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
  return <button className={`${baseStyle} ${variantStyles[variant]} ${className || ''}`} {...props}>{children}</button>;
};

const Progress = ({ value, color }: { value: number, color: string }) => (
  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
    <div className={`${color} h-2.5 rounded-full`} style={{ width: `${value}%` }}></div>
  </div>
);

export default function ExpensesPage() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all-expenses');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    category: 'Feed',
    description: '',
    amount: '',
    status: 'Paid',
  });

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await getExpenses();
      setExpenses(data);
      setError(null);
    } catch (err: any) {
      const msg = err.message || 'Failed to load expenses.';
      setError(msg);
      if (msg.toLowerCase().includes('log in') || msg.toLowerCase().includes('unauthorized')) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setSubmitting(true);

    try {
      await createExpense({
        ...formData,
        amount: parseFloat(formData.amount),
      });
      setIsModalOpen(false);
      setFormData({ date: format(new Date(), 'yyyy-MM-dd'), category: 'Feed', description: '', amount: '', status: 'Paid' });
      await loadExpenses();
    } catch (err: any) {
      const msg = err.message || 'Error submitting expense';
      setModalError(msg);
      if (msg.toLowerCase().includes('log in') || msg.toLowerCase().includes('unauthorized')) {
        setTimeout(() => router.push('/login'), 1500);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id: number) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    try {
      await deleteExpense(id);
      await loadExpenses();
    } catch (err: any) {
      alert(err.message || 'Error deleting expense');
    }
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) =>
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [expenses, search]);

  const kpis = useMemo(() => {
    const total = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
    const pending = expenses.filter(e => e.status?.toLowerCase() === 'pending').reduce((acc, curr) => acc + Number(curr.amount), 0);
    
    const catMap: Record<string, number> = {};
    expenses.forEach(e => {
      catMap[e.category] = (catMap[e.category] || 0) + Number(e.amount);
    });
    
    let maxCat = 'N/A';
    let maxVal = 0;
    Object.entries(catMap).forEach(([cat, val]) => {
      if (val > maxVal) {
        maxVal = val;
        maxCat = cat;
      }
    });

    return { total: `$${total.toFixed(2)}`, pending: `$${pending.toFixed(2)}`, largestCategory: maxCat };
  }, [expenses]);

  const categoryChartData = useMemo(() => {
    const data: Record<string, number> = {};
    expenses.forEach(e => {
      data[e.category] = (data[e.category] || 0) + Number(e.amount);
    });
    return Object.entries(data).map(([name, total]) => ({ name, total }));
  }, [expenses]);

  const categoryColors: Record<string, string> = {
    Feed: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    Medication: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    Equipment: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    Labor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
    Utilities: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    Maintenance: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
  };

  return (
    <main className="flex-1 p-4 sm:p-6 md:p-8 bg-gray-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Expenses</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">Log, track, and analyze all operational costs.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsModalOpen(true)} className="h-11 w-full px-4 gap-2">
            <PlusCircle className="h-5 w-5" />
            <span>Add New Expense</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <Card>
          <CardHeader><div className="flex items-center justify-between"><p className="text-sm font-medium text-gray-500">Total Expenses</p><CircleDollarSign className="w-5 h-5 text-gray-400"/></div></CardHeader>
          <CardContent><p className="text-3xl font-bold">{kpis.total}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><div className="flex items-center justify-between"><p className="text-sm font-medium text-gray-500">Largest Category</p><Tag className="w-5 h-5 text-gray-400"/></div></CardHeader>
          <CardContent><p className="text-3xl font-bold">{kpis.largestCategory}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><div className="flex items-center justify-between"><p className="text-sm font-medium text-gray-500">Pending Payments</p><Clock className="w-5 h-5 text-gray-400"/></div></CardHeader>
          <CardContent><p className="text-3xl font-bold">{kpis.pending}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><div className="flex items-center justify-between"><p className="text-sm font-medium text-gray-500">Total Records</p><FileText className="w-5 h-5 text-gray-400"/></div></CardHeader>
          <CardContent><p className="text-3xl font-bold">{expenses.length}</p></CardContent>
        </Card>
      </div>

      <div className="inline-flex h-10 items-center rounded-md bg-slate-100 dark:bg-slate-800 p-1 mb-6">
        <button className={`px-3 py-1.5 text-sm rounded-sm ${activeTab === 'all-expenses' ? 'bg-white dark:bg-slate-900 shadow-sm font-medium' : ''}`} onClick={() => setActiveTab('all-expenses')}>All Expenses</button>
        <button className={`px-3 py-1.5 text-sm rounded-sm ${activeTab === 'budget-tracking' ? 'bg-white dark:bg-slate-900 shadow-sm font-medium' : ''}`} onClick={() => setActiveTab('budget-tracking')}>Budget Tracking</button>
      </div>

      {activeTab === 'all-expenses' ? (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>Expense Records</CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search expenses..."
                  className="w-full bg-slate-100 dark:bg-slate-800 pl-10 pr-4 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center items-center p-12"><Loader2 className="animate-spin h-8 w-8 text-slate-500" /></div>
            ) : error ? (
              <div className="p-6 text-center text-red-500">{error}</div>
            ) : (
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
                    {filteredExpenses.map((exp) => (
                      <tr key={exp.expense_id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50">
                        <td className="px-6 py-4 text-gray-600 dark:text-slate-300">{exp.date}</td>
                        <td className="px-6 py-4"><Badge color={categoryColors[exp.category] || 'bg-gray-100 text-gray-800'}>{exp.category}</Badge></td>
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{exp.description}</td>
                        <td className="px-6 py-4 text-right font-medium">${Number(exp.amount).toFixed(2)}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`font-medium ${exp.status?.toLowerCase() === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>{exp.status}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Button variant="ghost" onClick={() => handleDeleteExpense(exp.expense_id)} className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader><CardTitle>Budget vs. Actual Spending</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(mockBudgets).map(([category, { budget }]) => {
              const actual = expenses.filter(e => e.category === category).reduce((acc, curr) => acc + Number(curr.amount), 0);
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
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader><CardTitle>Expenses by Category</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryChartData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" fontSize={12} />
                <YAxis type="category" dataKey="name" fontSize={12} />
                <Tooltip />
                <Bar dataKey="total" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg p-6 w-full max-w-md shadow-xl border border-gray-200 dark:border-slate-800 relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
            <h2 className="text-xl font-bold mb-4">Add New Expense</h2>
            
            {modalError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateExpense} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input type="date" required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 p-2 rounded-md text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 p-2 rounded-md text-sm">
                  {['Feed', 'Medication', 'Equipment', 'Labor', 'Utilities', 'Maintenance', 'Miscellaneous'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input type="text" required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 p-2 rounded-md text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount ($)</label>
                <input type="number" step="0.01" required value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 p-2 rounded-md text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Payment Status</label>
                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 p-2 rounded-md text-sm">
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                  Save Expense
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}