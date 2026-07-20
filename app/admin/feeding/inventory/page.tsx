'use client';

import React, { useState, useMemo, FormEvent } from 'react';
import { Package, DollarSign, AlertTriangle, PlusCircle, MoreHorizontal } from 'lucide-react';

// --- Reusable UI Components ---

const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 rounded-xl shadow-sm ${className}`}>{children}</div>
);

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="p-4 sm:p-6 border-b border-gray-200/80 dark:border-slate-700/50 flex justify-between items-center">{children}</div>
);

const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-50">{children}</h3>
);

const CardContent = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`p-0 sm:p-0 ${className}`}>{children}</div>
);

const Button = ({ children, variant = 'default', className, ...props }: { children: React.ReactNode, variant?: 'default' | 'outline' | 'ghost', className?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
    const baseStyle = "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
    const variantStyles = {
        default: "bg-slate-900 text-white hover:bg-slate-900/90 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90",
        outline: "border border-gray-300 dark:border-slate-700 bg-transparent hover:bg-gray-100/50 dark:hover:bg-slate-800/50",
        ghost: "hover:bg-gray-100/50 dark:hover:bg-slate-800/50",
    };
    return <button className={`${baseStyle} ${variantStyles[variant]} ${className}`} {...props}>{children}</button>;
};

const Badge = ({ children, color }: { children: React.ReactNode, color: string }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>{children}</span>
);

const KpiCard = ({ title, value, icon: Icon, color }: { title: string, value: string, icon: React.ElementType, color: string }) => (
  <Card>
    <div className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500 dark:text-slate-400">{title}</p>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-slate-100">{value}</p>
    </div>
  </Card>
);

// --- Mock Data & Types ---

type FeedStockRecord = {
  id: string;
  feedTypeName: string;
  quantityKg: number;
  reorderLevel: number;
  purchaseDate: string;
  totalCost: number;
  supplier: string;
};

const mockFeedStock: FeedStockRecord[] = [
  { id: 'FS-001', feedTypeName: 'Starter Mash (45%)', quantityKg: 450, reorderLevel: 200, purchaseDate: '2023-11-01', totalCost: 540, supplier: 'Feed Co.' },
  { id: 'FS-002', feedTypeName: 'Grower Pellet (35%)', quantityKg: 850, reorderLevel: 500, purchaseDate: '2023-11-01', totalCost: 807.50, supplier: 'Aqua Feeds' },
  { id: 'FS-003', feedTypeName: 'Finisher Pellet (28%)', quantityKg: 800, reorderLevel: 500, purchaseDate: '2023-10-20', totalCost: 600, supplier: 'Feed Co.' },
  { id: 'FS-004', feedTypeName: 'High-Protein Fry Feed', quantityKg: 45, reorderLevel: 50, purchaseDate: '2023-11-10', totalCost: 112.50, supplier: 'Aqua Feeds' },
];

const FeedInventoryPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { totalAvailableKg, totalAvailableValue, lowStockItemsCount } = useMemo(() => {
    const totalAvailableKg = mockFeedStock.reduce((sum, s) => sum + s.quantityKg, 0);
    const totalAvailableValue = mockFeedStock.reduce((sum, s) => sum + s.totalCost, 0);
    const lowStockItemsCount = mockFeedStock.filter(s => s.quantityKg <= s.reorderLevel).length;
    return { totalAvailableKg, totalAvailableValue, lowStockItemsCount };
  }, []);

  const kpiCards = [
    { title: "Total Feed Available", value: `${totalAvailableKg.toLocaleString()} kg`, icon: Package, color: "text-blue-600" },
    { title: "Value of Available Feed", value: `$${totalAvailableValue.toLocaleString()}`, icon: DollarSign, color: "text-green-600" },
    { title: "Items Low on Stock", value: `${lowStockItemsCount}`, icon: AlertTriangle, color: "text-amber-600" },
  ];

  const getStatusBadge = (quantity: number, reorderLevel: number) => {
    if (quantity <= 0) {
      return <Badge color="bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">Out of Stock</Badge>;
    }
    if (quantity <= reorderLevel) {
      return <Badge color="bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">Low Stock</Badge>;
    }
    return <Badge color="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">In Stock</Badge>;
  };

  return (
    <main className="flex-1 p-4 sm:p-6 md:p-8 bg-gray-50/50 dark:bg-slate-950">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-50">Feed Inventory</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">Track and manage your current feed stock levels and value.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Feed Stock
        </Button>
      </header>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {kpiCards.map((card) => (
          <KpiCard key={card.title} title={card.title} value={card.value} icon={card.icon} color={card.color} />
        ))}
      </section>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Current Stock</CardTitle>
          {/* Can add search/filter controls here */}
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600 dark:text-slate-300">
              <thead className="text-xs text-gray-700 dark:text-slate-400 uppercase bg-gray-100/80 dark:bg-slate-800/50">
                <tr>
                  <th scope="col" className="px-6 py-3">Feed Type</th>
                  <th scope="col" className="px-6 py-3 text-center">Status</th>
                  <th scope="col" className="px-6 py-3 text-right">Quantity (kg)</th>
                  <th scope="col" className="px-6 py-3 text-right">Total Cost</th>
                  <th scope="col" className="px-6 py-3">Supplier</th>
                  <th scope="col" className="px-6 py-3">Last Purchase</th>
                  <th scope="col" className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                {mockFeedStock.map((stock) => (
                  <tr key={stock.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-slate-100">{stock.feedTypeName}</td>
                    <td className="px-6 py-4 text-center">{getStatusBadge(stock.quantityKg, stock.reorderLevel)}</td>
                    <td className="px-6 py-4 text-right">{stock.quantityKg.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-medium">${stock.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4">{stock.supplier}</td>
                    <td className="px-6 py-4">{stock.purchaseDate}</td>
                    <td className="px-6 py-4 text-center">
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="font-semibold text-gray-900 dark:text-slate-100 bg-gray-100/80 dark:bg-slate-800/50">
                <tr>
                  <td colSpan={2} className="px-6 py-3 text-right">Totals:</td>
                  <td className="px-6 py-3 text-right">{totalAvailableKg.toLocaleString()} kg</td>
                  <td className="px-6 py-3 text-right">${totalAvailableValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* TODO: Add Dialog component for adding new feed stock */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setIsDialogOpen(false)}>
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h2 className="text-lg font-semibold">Add New Feed Stock</h2>
                <p className="text-sm text-gray-500 mb-4">This is a placeholder for the 'Add Stock' form.</p>
                <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
            </div>
        </div>
      )}
    </main>
  );
};

export default FeedInventoryPage;