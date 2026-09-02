'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  FileDown,
  Printer,
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown,
  Scale,
  Percent,
  RefreshCw,
  AlertCircle,
  Building2,
} from 'lucide-react';

// Import directly from your exact API modules
import { getSalesRecords, SaleRecord } from '@/lib/sales-api';
import { getExpenses, ExpenseItem } from '@/lib/expenses-api';
import { getInvoices, InvoiceRecord } from '@/lib/invoice-api';

// --- UI Components ---

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 rounded-xl shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="p-4 sm:p-6 border-b border-gray-200/80 dark:border-slate-700/50 flex justify-between items-start">
    {children}
  </div>
);

const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-50">{children}</h3>
);

const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-4 sm:p-6 ${className}`}>{children}</div>
);

const Button = ({
  children,
  variant = 'default',
  className = '',
  ...props
}: { children: React.ReactNode; variant?: 'default' | 'outline'; className?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const baseStyle =
    'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';
  const variantStyles = {
    default: 'bg-slate-900 text-white hover:bg-slate-900/90 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90',
    outline: 'border border-gray-300 dark:border-slate-700 bg-transparent hover:bg-gray-100/50 dark:hover:bg-slate-800/50',
  };
  return (
    <button className={`${baseStyle} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Label = ({ children, ...props }: { children: React.ReactNode } & React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5" {...props}>
    {children}
  </label>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className="block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-slate-900 sm:text-sm text-slate-900 dark:text-slate-100"
    {...props}
  />
);

const StatCard = ({
  title,
  value,
  icon: Icon,
  changeType,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  changeType?: 'increase' | 'decrease';
}) => (
  <Card>
    <CardContent className="flex items-center justify-between p-4">
      <div>
        <p className="text-xs font-medium text-gray-500 dark:text-slate-400">{title}</p>
        <p className="text-xl font-bold text-gray-900 dark:text-slate-100 mt-1">{value}</p>
      </div>
      <div className="bg-slate-100 dark:bg-slate-800 rounded-full p-2.5">
        <Icon
          className={`w-5 h-5 ${
            changeType === 'increase'
              ? 'text-green-600'
              : changeType === 'decrease'
              ? 'text-red-600'
              : 'text-slate-700 dark:text-slate-300'
          }`}
        />
      </div>
    </CardContent>
  </Card>
);

const formatCurrency = (amount: number) =>
  amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

export default function FinancialReportsPage() {
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [reportGenerated, setReportGenerated] = useState(false);

  // Retrieve token helper
  const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return (
      localStorage.getItem('token') ||
      localStorage.getItem('access_token') ||
      localStorage.getItem('auth_token')
    );
  };

  const loadFinancialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();

      // Parallel execution across API services
      const [salesData, invoicesData, expensesData] = await Promise.all([
        getSalesRecords(token).catch((e) => {
          console.error('Sales fetch error:', e);
          return [] as SaleRecord[];
        }),
        getInvoices(token).catch((e) => {
          console.error('Invoices fetch error:', e);
          return [] as InvoiceRecord[];
        }),
        getExpenses().catch((e) => {
          console.error('Expenses fetch error:', e);
          return [] as ExpenseItem[];
        }),
      ]);

      setSales(salesData);
      setInvoices(invoicesData);
      setExpenses(expensesData);
      setReportGenerated(true);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve combined financial data from services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinancialData();
  }, []);

  // Filter datasets based on selected date parameters
  const filteredSales = useMemo(() => {
    return sales.filter((item) => {
      if (!item.saleDate) return true;
      const d = new Date(item.saleDate).getTime();
      const from = dateFrom ? new Date(dateFrom).getTime() : -Infinity;
      const to = dateTo ? new Date(dateTo).getTime() : Infinity;
      return d >= from && d <= to;
    });
  }, [sales, dateFrom, dateTo]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((item) => {
      if (!item.date) return true;
      const d = new Date(item.date).getTime();
      const from = dateFrom ? new Date(dateFrom).getTime() : -Infinity;
      const to = dateTo ? new Date(dateTo).getTime() : Infinity;
      return d >= from && d <= to;
    });
  }, [invoices, dateFrom, dateTo]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      if (!item.date) return true;
      const d = new Date(item.date).getTime();
      const from = dateFrom ? new Date(dateFrom).getTime() : -Infinity;
      const to = dateTo ? new Date(dateTo).getTime() : Infinity;
      return d >= from && d <= to;
    });
  }, [expenses, dateFrom, dateTo]);

  // Aggregate Metrics Computation
  const metrics = useMemo(() => {
    const salesTotal = filteredSales.reduce((sum, s) => sum + (s.cost || 0), 0);
    const invoicesTotal = filteredInvoices.reduce((sum, i) => sum + (i.amount || 0), 0);
    const totalRevenue = salesTotal + invoicesTotal;
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return { salesTotal, invoicesTotal, totalRevenue, totalExpenses, netProfit, profitMargin };
  }, [filteredSales, filteredInvoices, filteredExpenses]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="flex-1 p-4 sm:p-6 md:p-8 bg-gray-50/50 dark:bg-slate-950 min-h-screen">
      {/* Page Header */}
      <header className="mb-6 print:hidden">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-50">Financial Reports & Statements</h1>
        <p className="text-gray-600 dark:text-slate-400 mt-1">
          Consolidated ledger combining aquaculture sales, invoices, and operational expenses.
        </p>
      </header>

      {/* CSS Rules for Document Generation & Printing */}
      <style jsx global>{`
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:border-none {
            border: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
        }
      `}</style>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Sidebar */}
        <div className="lg:col-span-4 xl:col-span-3 print:hidden">
          <Card>
            <CardHeader>
              <CardTitle>Filter Parameters</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  loadFinancialData();
                }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="date-from">From Date</Label>
                  <Input type="date" id="date-from" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="date-to">To Date</Label>
                  <Input type="date" id="date-to" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                </div>

                <Button type="submit" disabled={loading} className="w-full h-10 gap-2">
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CalendarIcon className="h-4 w-4" />}
                  <span>Generate Report</span>
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Document Display Section */}
        <div className="lg:col-span-8 xl:col-span-9">
          {error && (
            <Card className="mb-6 bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 print:hidden">
              <CardContent className="flex items-center gap-3 p-4">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </CardContent>
            </Card>
          )}

          {reportGenerated ? (
            <div className="space-y-6">
              {/* Executive Metrics Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 print:hidden">
                <StatCard title="Total Revenue" value={formatCurrency(metrics.totalRevenue)} icon={TrendingUp} changeType="increase" />
                <StatCard title="Total Expenses" value={formatCurrency(metrics.totalExpenses)} icon={TrendingDown} changeType="decrease" />
                <StatCard title="Net Profit" value={formatCurrency(metrics.netProfit)} icon={Scale} changeType={metrics.netProfit >= 0 ? 'increase' : 'decrease'} />
                <StatCard title="Profit Margin" value={`${metrics.profitMargin.toFixed(1)}%`} icon={Percent} changeType={metrics.profitMargin >= 0 ? 'increase' : 'decrease'} />
              </div>

              {/* Document Sheet */}
              <Card className="print:shadow-none print:border-none bg-white text-slate-900 border-gray-200">
                <CardContent className="p-8 space-y-8">
                  {/* Corporate Header */}
                  <div className="flex justify-between items-start border-b border-slate-200 pb-6">
                    <div>
                      <div className="flex items-center gap-2 text-slate-900 font-bold text-xl uppercase tracking-wider">
                        <Building2 className="w-6 h-6 text-slate-800" />
                        <span>Fintera Operations</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Aquaculture Management & Accounting Division • Automated System Report
                      </p>
                    </div>
                    <div className="text-right">
                      <h2 className="text-2xl font-bold uppercase tracking-wider text-slate-900">Financial Statement</h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Period: {dateFrom || 'Inception'} — {dateTo || 'Present'}
                      </p>
                    </div>
                  </div>

                  {/* Actions Header */}
                  <div className="flex justify-end gap-2 print:hidden">
                    <Button variant="outline" className="h-9 px-3 gap-2 text-xs" onClick={handlePrint}>
                      <Printer className="w-4 h-4" /> Print Document
                    </Button>
                    <Button variant="default" className="h-9 px-3 gap-2 text-xs" onClick={handlePrint}>
                      <FileDown className="w-4 h-4" /> Save PDF
                    </Button>
                  </div>

                  {/* Section 1: Direct Sales Ledger */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 border-b border-slate-100 pb-1">
                      1. Harvest & Direct Product Sales
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-slate-50 text-slate-700 border-y border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3">Date</th>
                            <th className="py-2.5 px-3">Customer</th>
                            <th className="py-2.5 px-3">Species</th>
                            <th className="py-2.5 px-3 text-right">Qty</th>
                            <th className="py-2.5 px-3 text-right">Weight (kg)</th>
                            <th className="py-2.5 px-3 text-right">Cost/Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {filteredSales.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-3 px-3 text-center text-slate-400">
                                No sales records logged for this period.
                              </td>
                            </tr>
                          ) : (
                            filteredSales.map((sale) => (
                              <tr key={sale.id}>
                                <td className="py-2 px-3 font-mono text-xs">{sale.saleDate}</td>
                                <td className="py-2 px-3 font-medium text-slate-900">{sale.customer}</td>
                                <td className="py-2 px-3">{sale.species}</td>
                                <td className="py-2 px-3 text-right font-mono">{sale.quantity}</td>
                                <td className="py-2 px-3 text-right font-mono">{sale.totalWeight}</td>
                                <td className="py-2 px-3 text-right font-mono">{formatCurrency(sale.cost)}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                        <tfoot className="border-t border-slate-200 font-semibold text-slate-900 bg-slate-50/50">
                          <tr>
                            <td colSpan={5} className="py-2 px-3 text-right text-xs uppercase">
                              Subtotal Direct Sales:
                            </td>
                            <td className="py-2 px-3 text-right font-mono">{formatCurrency(metrics.salesTotal)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* Section 2: Invoices */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 border-b border-slate-100 pb-1">
                      2. Issued Invoices & Billing
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-slate-50 text-slate-700 border-y border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3">Invoice ID</th>
                            <th className="py-2.5 px-3">Date</th>
                            <th className="py-2.5 px-3">Customer / Billed Entity</th>
                            <th className="py-2.5 px-3">Due Date</th>
                            <th className="py-2.5 px-3">Status</th>
                            <th className="py-2.5 px-3 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {filteredInvoices.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-3 px-3 text-center text-slate-400">
                                No invoice records logged for this period.
                              </td>
                            </tr>
                          ) : (
                            filteredInvoices.map((inv) => (
                              <tr key={inv.id}>
                                <td className="py-2 px-3 font-mono text-xs font-bold text-slate-900">
                                  INV-{inv.id}
                                </td>
                                <td className="py-2 px-3 font-mono text-xs">{inv.date}</td>
                                <td className="py-2 px-3 font-medium text-slate-900">{inv.customer}</td>
                                <td className="py-2 px-3 font-mono text-xs">{inv.dueDate}</td>
                                <td className="py-2 px-3">
                                  <span
                                    className={`inline-block px-2 py-0.5 text-[10px] uppercase font-bold rounded ${
                                      inv.status === 'Paid'
                                        ? 'bg-green-100 text-green-800'
                                        : inv.status === 'Overdue'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-amber-100 text-amber-800'
                                    }`}
                                  >
                                    {inv.status}
                                  </span>
                                </td>
                                <td className="py-2 px-3 text-right font-mono">{formatCurrency(inv.amount)}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                        <tfoot className="border-t border-slate-200 font-semibold text-slate-900 bg-slate-50/50">
                          <tr>
                            <td colSpan={5} className="py-2 px-3 text-right text-xs uppercase">
                              Subtotal Invoices:
                            </td>
                            <td className="py-2 px-3 text-right font-mono">{formatCurrency(metrics.invoicesTotal)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* Section 3: Operational Expenses */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 border-b border-slate-100 pb-1">
                      3. Operational Expenditures
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-slate-50 text-slate-700 border-y border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3">Date</th>
                            <th className="py-2.5 px-3">Description / Item</th>
                            <th className="py-2.5 px-3">Category</th>
                            <th className="py-2.5 px-3">Status</th>
                            <th className="py-2.5 px-3 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {filteredExpenses.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-3 px-3 text-center text-slate-400">
                                No expense logs found for this period.
                              </td>
                            </tr>
                          ) : (
                            filteredExpenses.map((exp) => (
                              <tr key={exp.expense_id}>
                                <td className="py-2 px-3 font-mono text-xs">{exp.date}</td>
                                <td className="py-2 px-3 font-medium text-slate-900">{exp.description}</td>
                                <td className="py-2 px-3">{exp.category}</td>
                                <td className="py-2 px-3 text-xs">{exp.status}</td>
                                <td className="py-2 px-3 text-right font-mono">{formatCurrency(exp.amount)}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                        <tfoot className="border-t border-slate-200 font-semibold text-slate-900 bg-slate-50/50">
                          <tr>
                            <td colSpan={4} className="py-2 px-3 text-right text-xs uppercase">
                              Subtotal Expenses:
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-red-700">
                              {formatCurrency(metrics.totalExpenses)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* Executive Summary */}
                  <div className="pt-4 border-t-2 border-slate-900">
                    <div className="flex justify-end">
                      <div className="w-full sm:w-80 space-y-2">
                        <div className="flex justify-between text-xs text-slate-600">
                          <span>Direct Sales Revenue:</span>
                          <span className="font-mono">{formatCurrency(metrics.salesTotal)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-600">
                          <span>Invoiced Revenue:</span>
                          <span className="font-mono">{formatCurrency(metrics.invoicesTotal)}</span>
                        </div>
                        <div className="flex justify-between text-xs font-semibold text-slate-800 pt-1 border-t border-slate-100">
                          <span>Gross Operating Revenue:</span>
                          <span className="font-mono">{formatCurrency(metrics.totalRevenue)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-600">
                          <span>Operating Expenses:</span>
                          <span className="font-mono text-red-600">({formatCurrency(metrics.totalExpenses)})</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-slate-300 text-sm font-bold text-slate-900">
                          <span>Net Profit / (Loss):</span>
                          <span className="font-mono">{formatCurrency(metrics.netProfit)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Document Footer */}
                  <div className="pt-12 grid grid-cols-2 gap-8 text-xs text-slate-500">
                    <div>
                      <p className="border-b border-slate-300 pb-1 font-medium text-slate-800">
                        Prepared By: Automated Ledger System
                      </p>
                      <p className="mt-1">Fintera Operations Audit Division</p>
                    </div>
                    <div className="text-right">
                      <p className="border-b border-slate-300 pb-1 font-medium text-slate-800">Generated Date</p>
                      <p className="mt-1">{new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="flex flex-col items-center justify-center h-64 text-center">
              <CardContent>
                <p className="text-lg font-medium text-gray-700 dark:text-slate-300">
                  Select parameters to render statement.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}