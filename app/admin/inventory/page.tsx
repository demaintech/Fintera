'use client';

import React, { useState, useMemo } from 'react';
import {
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';
import {
  ArrowDownRight, ArrowUpRight, Calendar as CalendarIcon, CircleDollarSign, MoreHorizontal, PlusCircle, Search, Package, Boxes, AlertTriangle, Truck, Users, ShoppingCart, Archive
} from 'lucide-react';
import { addDays, format, differenceInDays } from 'date-fns';

// --- Mock Data & Types (as requested) ---

type ItemCategory = 'Feed' | 'Equipment' | 'Chemicals' | 'Medication' | 'Packaging' | 'Other';
type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

interface InventoryItem {
  id: string;
  name: string;
  category: ItemCategory;
  sku: string;
  quantity: number;
  unit: 'kg' | 'bags' | 'liters' | 'pieces';
  reorderLevel: number;
  unitCost: number;
  supplier: string;
  location: string;
  expiryDate?: string;
}

const mockInventory: InventoryItem[] = [
  // Feed
  { id: 'ITM-001', name: 'Grower Pellets (35% Protein)', category: 'Feed', sku: 'FD-GP-35', quantity: 250, unit: 'kg', reorderLevel: 100, unitCost: 1.20, supplier: 'AquaFeeds Supply', location: 'Warehouse A', expiryDate: '2024-08-15' },
  { id: 'ITM-002', name: 'Fry Powder', category: 'Feed', sku: 'FD-FP-01', quantity: 20, unit: 'kg', reorderLevel: 25, unitCost: 5.50, supplier: 'AquaFeeds Supply', location: 'Hatchery', expiryDate: '2023-11-30' }, // Expiring soon
  { id: 'ITM-003', name: 'Finisher Feed', category: 'Feed', sku: 'FD-FF-40', quantity: 500, unit: 'kg', reorderLevel: 200, unitCost: 1.10, supplier: 'Global Feeds', location: 'Warehouse B' },

  // Equipment
  { id: 'ITM-004', name: 'Aeration Pump 2HP', category: 'Equipment', sku: 'EQ-AP-2HP', quantity: 5, unit: 'pieces', reorderLevel: 2, unitCost: 450.00, supplier: 'FarmTech Solutions', location: 'Workshop' },
  { id: 'ITM-005', name: 'pH Meter', category: 'Equipment', sku: 'EQ-PHM-01', quantity: 1, unit: 'pieces', reorderLevel: 2, unitCost: 120.00, supplier: 'Lab Supplies Inc.', location: 'Lab' }, // Low stock

  // Chemicals
  { id: 'ITM-006', name: 'Pond Disinfectant', category: 'Chemicals', sku: 'CH-PD-01', quantity: 15, unit: 'liters', reorderLevel: 10, unitCost: 25.00, supplier: 'ChemSafe', location: 'Chemical Store', expiryDate: '2023-10-20' }, // Expired
  { id: 'ITM-007', name: 'Algaecide', category: 'Chemicals', sku: 'CH-ALG-05', quantity: 30, unit: 'liters', reorderLevel: 15, unitCost: 18.50, supplier: 'ChemSafe', location: 'Chemical Store', expiryDate: '2024-05-01' },
];

interface Supplier {
    id: string;
    name: string;
    contactPerson: string;
    email: string;
    itemsSupplied: ItemCategory[];
    lastOrderDate: string;
}

const mockSuppliers: Supplier[] = [
    { id: 'SUP-01', name: 'AquaFeeds Supply', contactPerson: 'John Doe', email: 'john@aquafeeds.com', itemsSupplied: ['Feed'], lastOrderDate: '2023-10-15' },
    { id: 'SUP-02', name: 'FarmTech Solutions', contactPerson: 'Jane Smith', email: 'jane@farmtech.com', itemsSupplied: ['Equipment', 'Packaging'], lastOrderDate: '2023-09-28' },
    { id: 'SUP-03', name: 'ChemSafe', contactPerson: 'Peter Jones', email: 'sales@chemsafe.com', itemsSupplied: ['Chemicals', 'Medication'], lastOrderDate: '2023-10-02' },
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

// --- Sub-Components for Inventory Page ---

const InventoryKpiCard = ({ title, value, icon: Icon, color }: { title: string, value: string | number, icon: React.ElementType, color: string }) => (
  <Card>
    <CardContent>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500 dark:text-slate-400">{title}</p>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-slate-100">{value}</p>
    </CardContent>
  </Card>
);

const LowStockAlerts = () => {
    const lowStockItems = mockInventory.filter(item => item.quantity <= item.reorderLevel);
    if (lowStockItems.length === 0) return null;

    return (
        <Card className="mb-6 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/50">
            <CardContent className="p-4">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 pt-1"><AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" /></div>
                    <div>
                        <p className="font-semibold text-amber-800 dark:text-amber-200">Low Stock Alerts</p>
                        <p className="text-sm text-amber-700 dark:text-amber-300">The following items are at or below their reorder level.</p>
                        <div className="mt-2 space-y-1">
                            {lowStockItems.map(item => (
                                <div key={item.id} className="flex justify-between items-center text-sm">
                                    <p className="text-amber-700 dark:text-amber-300">
                                        <span className="font-medium">{item.name}</span> ({item.quantity} {item.unit} left)
                                    </p>
                                    <Button variant="ghost" className="h-auto p-1 text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-800/50">Reorder</Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const InventoryTable = ({ items }: { items: InventoryItem[] }) => {
  const getExpiryBadgeColor = (expiryDate?: string) => {
    if (!expiryDate) return '';
    const daysUntilExpiry = differenceInDays(new Date(expiryDate), new Date());
    if (daysUntilExpiry < 0) return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
    if (daysUntilExpiry <= 7) return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
    if (daysUntilExpiry <= 30) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300';
    return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>Item List</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search items..." className="w-full bg-slate-100 dark:bg-slate-800 pl-10 pr-4 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-slate-800/50 text-xs text-gray-500 dark:text-slate-400 uppercase">
              <tr>
                <th className="px-6 py-3">Item Name</th>
                <th className="px-6 py-3">SKU</th>
                <th className="px-6 py-3 text-right">Quantity</th>
                <th className="px-6 py-3 text-right">Reorder Lvl</th>
                <th className="px-6 py-3">Expiry Date</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.name}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-slate-400">{item.sku}</td>
                  <td className="px-6 py-4 text-right">{item.quantity} {item.unit}</td>
                  <td className="px-6 py-4 text-right">{item.reorderLevel} {item.unit}</td>
                  <td className="px-6 py-4">
                    {item.expiryDate ? <Badge color={getExpiryBadgeColor(item.expiryDate)}>{format(new Date(item.expiryDate), 'MMM dd, yyyy')}</Badge> : <span className="text-gray-400">-</span>}
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

const SuppliersTable = ({ suppliers }: { suppliers: Supplier[] }) => (
    <Card>
      <CardHeader><CardTitle>Supplier List</CardTitle></CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-slate-800/50 text-xs text-gray-500 dark:text-slate-400 uppercase">
              <tr>
                <th className="px-6 py-3">Supplier Name</th>
                <th className="px-6 py-3">Contact</th>
                <th className="px-6 py-3">Categories</th>
                <th className="px-6 py-3">Last Order</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
              {suppliers.map((sup) => (
                <tr key={sup.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{sup.name}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-slate-400">{sup.contactPerson}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-slate-400">{sup.itemsSupplied.join(', ')}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-slate-400">{sup.lastOrderDate}</td>
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

const InventoryPage = () => {
  const [activeTab, setActiveTab] = useState<ItemCategory | 'Suppliers'>('Feed');

  // Placeholder for calculations. Connect to API in a real app.
  const kpiData = {
    totalValue: "$15,432.50",
    totalItems: 821,
    lowStockCount: 2,
    expiringSoonCount: 2,
  };

  const filteredItems = useMemo(() => {
    return mockInventory.filter(item => item.category === activeTab);
  }, [activeTab]);

  const tabList: (ItemCategory | 'Suppliers')[] = ['Feed', 'Equipment', 'Chemicals', 'Suppliers'];

  return (
    <main className="flex-1 p-4 sm:p-6 md:p-8 bg-gray-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Inventory & Supplies</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">Monitor and manage all your farm's stock.</p>
        </div>
        <Button className="h-10 gap-2">
          <PlusCircle className="h-5 w-5" />
          <span>Add New Item</span>
        </Button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <InventoryKpiCard title="Total Inventory Value" value={kpiData.totalValue} icon={CircleDollarSign} color="text-green-600" />
        <InventoryKpiCard title="Items in Stock" value={kpiData.totalItems} icon={Package} color="text-blue-600" />
        <InventoryKpiCard title="Low Stock Items" value={kpiData.lowStockCount} icon={AlertTriangle} color="text-amber-600" />
        <InventoryKpiCard title="Items Expiring Soon" value={kpiData.expiringSoonCount} icon={CalendarIcon} color="text-red-600" />
      </div>

      {/* Low Stock Alerts */}
      <LowStockAlerts />

      {/* Tabs for different views */}
      <Tabs className="mb-6">
        <TabsList>
          {tabList.map(tab => (
            <TabsTrigger key={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)}>
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Tab Content */}
      {activeTab === 'Feed' && <InventoryTable items={filteredItems} />}
      {activeTab === 'Equipment' && <InventoryTable items={filteredItems} />}
      {activeTab === 'Chemicals' && <InventoryTable items={filteredItems} />}
      {activeTab === 'Suppliers' && <SuppliersTable suppliers={mockSuppliers} />}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card>
            <CardHeader><CardTitle>Inventory Value by Category</CardTitle></CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                        { name: 'Feed', value: 8500 },
                        { name: 'Equipment', value: 2370 },
                        { name: 'Chemicals', value: 925 },
                    ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `$${v/1000}k`} />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle>Stock Movement History</CardTitle></CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center h-[300px] text-center border-2 border-dashed rounded-lg">
                    <p className="text-lg font-medium text-gray-700 dark:text-slate-300">Stock Movement Log Coming Soon</p>
                    <p className="text-gray-500 dark:text-slate-400">This section will show a history of all stock adjustments.</p>
                </div>
            </CardContent>
        </Card>
      </div>

      {/* 
        ADD NEW ITEM DIALOG/SHEET COMPONENT
        This would be a separate component using shadcn's Dialog or Sheet.
        It would contain a form with all the fields specified in the prompt.
      */}

      {/* 
        RESTOCK DIALOG COMPONENT
        This would be triggered from the 'Reorder' button in the Low Stock Alerts banner.
        It would contain a simple form to log a new stock arrival.
      */}

    </main>
  );
};

export default InventoryPage;