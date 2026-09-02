'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';
import {
  Calendar as CalendarIcon, CircleDollarSign, PlusCircle, Search, Package, AlertTriangle, Trash2, Edit3, RefreshCw, X
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

// --- Types ---

type ItemCategory = 'Feed' | 'Equipment' | 'Chemicals' | 'Medication' | 'Packaging' | 'Other';

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

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  itemsSupplied: ItemCategory[];
  lastOrderDate: string;
}

// --- Empty Seed Data ---

const INITIAL_INVENTORY: InventoryItem[] = [];
const INITIAL_SUPPLIERS: Supplier[] = [];

// --- LocalStorage Helpers ---

const STORAGE_KEYS = {
  INVENTORY: 'aqua_inventory_items_v1',
  SUPPLIERS: 'aqua_inventory_suppliers_v1',
};

const getStoredData = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage`, err);
    return fallback;
  }
};

const setStoredData = <T,>(key: string, data: T) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error writing ${key} to localStorage`, err);
  }
};

// --- Reusable UI Elements ---

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
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

const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-4 sm:p-6 ${className}`}>{children}</div>
);

const Badge = ({ children, color }: { children: React.ReactNode; color: string }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>{children}</span>
);

const Button = ({ children, variant = 'default', className = '', ...props }: { children: React.ReactNode; variant?: 'default' | 'outline' | 'ghost' | 'danger'; className?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const baseStyle = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const variantStyles = {
    default: "bg-slate-900 text-white hover:bg-slate-900/90 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90",
    outline: "border border-gray-300 dark:border-slate-700 bg-transparent hover:bg-gray-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200",
    ghost: "hover:bg-gray-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200",
    danger: "bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700",
  };
  return <button className={`${baseStyle} ${variantStyles[variant]} ${className}`} {...props}>{children}</button>;
};

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className="block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 sm:text-sm text-slate-900 dark:text-slate-100"
    {...props}
  />
);

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    className="block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 sm:text-sm text-slate-900 dark:text-slate-100"
    {...props}
  />
);

const Label = ({ children, ...props }: { children: React.ReactNode } & React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1" {...props}>
    {children}
  </label>
);

// --- Main Page Component ---

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [activeTab, setActiveTab] = useState<ItemCategory | 'Suppliers'>('Feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [isClient, setIsClient] = useState(false);

  // Modals state
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [restockItem, setRestockItem] = useState<InventoryItem | null>(null);
  const [restockQty, setRestockQty] = useState('');

  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);

  // Initial Load from LocalStorage
  useEffect(() => {
    setIsClient(true);
    setInventory(getStoredData(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY));
    setSuppliers(getStoredData(STORAGE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS));
  }, []);

  // Sync back to LocalStorage
  const updateInventoryState = (newItems: InventoryItem[]) => {
    setInventory(newItems);
    setStoredData(STORAGE_KEYS.INVENTORY, newItems);
  };

  const updateSuppliersState = (newSuppliers: Supplier[]) => {
    setSuppliers(newSuppliers);
    setStoredData(STORAGE_KEYS.SUPPLIERS, newSuppliers);
  };

  // --- CRUD Handlers ---

  const handleSaveItem = (itemData: Partial<InventoryItem>) => {
    if (editingItem) {
      const updated = inventory.map((item) =>
        item.id === editingItem.id ? ({ ...item, ...itemData } as InventoryItem) : item
      );
      updateInventoryState(updated);
    } else {
      const newItem: InventoryItem = {
        id: `ITM-${Date.now().toString().slice(-4)}`,
        name: itemData.name || 'Unnamed Item',
        category: itemData.category || 'Other',
        sku: itemData.sku || `SKU-${Math.floor(Math.random() * 8999 + 1000)}`,
        quantity: Number(itemData.quantity) || 0,
        unit: itemData.unit || 'kg',
        reorderLevel: Number(itemData.reorderLevel) || 10,
        unitCost: Number(itemData.unitCost) || 0,
        supplier: itemData.supplier || 'Unassigned',
        location: itemData.location || 'Main Store',
        expiryDate: itemData.expiryDate || undefined,
      };
      updateInventoryState([newItem, ...inventory]);
    }
    setIsItemModalOpen(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Are you sure you want to delete this inventory item?')) {
      const filtered = inventory.filter((item) => item.id !== id);
      updateInventoryState(filtered);
    }
  };

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockItem || !restockQty) return;

    const addedQty = parseFloat(restockQty);
    if (isNaN(addedQty) || addedQty <= 0) return;

    const updated = inventory.map((item) =>
      item.id === restockItem.id ? { ...item, quantity: item.quantity + addedQty } : item
    );

    updateInventoryState(updated);
    setIsRestockModalOpen(false);
    setRestockItem(null);
    setRestockQty('');
  };

  const handleSaveSupplier = (supplierData: Partial<Supplier>) => {
    const newSupplier: Supplier = {
      id: `SUP-${Date.now().toString().slice(-3)}`,
      name: supplierData.name || 'Unnamed Supplier',
      contactPerson: supplierData.contactPerson || 'N/A',
      email: supplierData.email || 'N/A',
      itemsSupplied: supplierData.itemsSupplied || ['Feed'],
      lastOrderDate: new Date().toISOString().split('T')[0],
    };

    updateSuppliersState([newSupplier, ...suppliers]);
    setIsSupplierModalOpen(false);
  };

  const handleDeleteSupplier = (id: string) => {
    if (confirm('Are you sure you want to delete this supplier?')) {
      const filtered = suppliers.filter((sup) => sup.id !== id);
      updateSuppliersState(filtered);
    }
  };

  // --- Metrics Computation ---

  const lowStockItems = useMemo(() => {
    return inventory.filter((item) => item.quantity <= item.reorderLevel);
  }, [inventory]);

  const expiringSoonCount = useMemo(() => {
    return inventory.filter((item) => {
      if (!item.expiryDate) return false;
      const days = differenceInDays(new Date(item.expiryDate), new Date());
      return days <= 30;
    }).length;
  }, [inventory]);

  const totalValue = useMemo(() => {
    return inventory.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
  }, [inventory]);

  const filteredItems = useMemo(() => {
    return inventory.filter((item) => {
      const matchesCategory = item.category === activeTab;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [inventory, activeTab, searchQuery]);

  const categoryChartData = useMemo(() => {
    const totals: Record<string, number> = {};
    inventory.forEach((item) => {
      const val = item.quantity * item.unitCost;
      totals[item.category] = (totals[item.category] || 0) + val;
    });
    return Object.entries(totals).map(([name, value]) => ({ name, value }));
  }, [inventory]);

  const tabList: (ItemCategory | 'Suppliers')[] = ['Feed', 'Equipment', 'Chemicals', 'Medication', 'Packaging', 'Suppliers'];

  const getExpiryBadgeColor = (expiryDate?: string) => {
    if (!expiryDate) return '';
    const daysUntilExpiry = differenceInDays(new Date(expiryDate), new Date());
    if (daysUntilExpiry < 0) return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
    if (daysUntilExpiry <= 7) return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
    if (daysUntilExpiry <= 30) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300';
    return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
  };

  if (!isClient) return null;

  return (
    <main className="flex-1 p-4 sm:p-6 md:p-8 bg-gray-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Inventory & Supplies</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">Monitor and manage all your farm's stock directly in-browser.</p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'Suppliers' ? (
            <Button className="h-10 gap-2" onClick={() => setIsSupplierModalOpen(true)}>
              <PlusCircle className="h-5 w-5" />
              <span>Add Supplier</span>
            </Button>
          ) : (
            <Button
              className="h-10 gap-2 px-4"
              onClick={() => {
                setEditingItem(null);
                setIsItemModalOpen(true);
              }}
            >
              <PlusCircle className="h-5 w-5" />
              <span>Add New Item</span>
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Total Stock Value</p>
              <CircleDollarSign className="w-5 h-5 text-green-600" />
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-slate-100">
              ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Total Items Tracked</p>
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-slate-100">{inventory.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Low Stock Items</p>
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-slate-100">{lowStockItems.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Expiring Soon (30d)</p>
              <CalendarIcon className="w-5 h-5 text-red-600" />
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-slate-100">{expiringSoonCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <Card className="mb-6 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 pt-1">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="w-full">
                <p className="font-semibold text-amber-800 dark:text-amber-200">Low Stock Alerts</p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  The following items are at or below their defined reorder level:
                </p>
                <div className="mt-2 space-y-1">
                  {lowStockItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm py-1 border-b border-amber-200/50 dark:border-amber-800/30 last:border-0">
                      <p className="text-amber-900 dark:text-amber-200">
                        <span className="font-medium">{item.name}</span> ({item.quantity} {item.unit} remaining, Reorder Level: {item.reorderLevel})
                      </p>
                      <Button
                        variant="ghost"
                        className="h-7 px-2 text-xs text-amber-900 dark:text-amber-100 hover:bg-amber-200 dark:hover:bg-amber-800/50 gap-1"
                        onClick={() => {
                          setRestockItem(item);
                          setIsRestockModalOpen(true);
                        }}
                      >
                        <RefreshCw className="h-3 w-3" /> Reorder
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-md mb-6 w-fit max-w-full">
        {tabList.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-3 py-1.5 text-sm font-medium rounded-sm transition-all ${
              activeTab === tab
                ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-50 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      {activeTab === 'Suppliers' ? (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>Supplier List</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-slate-800/50 text-xs text-gray-500 dark:text-slate-400 uppercase">
                  <tr>
                    <th className="px-6 py-3">Supplier Name</th>
                    <th className="px-6 py-3">Contact Person</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Supplied Categories</th>
                    <th className="px-6 py-3">Last Order</th>
                    <th className="px-6 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                  {suppliers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        No suppliers recorded. Click "Add Supplier" to add one.
                      </td>
                    </tr>
                  ) : (
                    suppliers.map((sup) => (
                      <tr key={sup.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50">
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{sup.name}</td>
                        <td className="px-6 py-4 text-gray-500 dark:text-slate-400">{sup.contactPerson}</td>
                        <td className="px-6 py-4 text-gray-500 dark:text-slate-400">{sup.email}</td>
                        <td className="px-6 py-4 text-gray-500 dark:text-slate-400">{sup.itemsSupplied.join(', ')}</td>
                        <td className="px-6 py-4 text-gray-500 dark:text-slate-400">{sup.lastOrderDate}</td>
                        <td className="px-6 py-4 text-center">
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 dark:hover:bg-red-950/30"
                            onClick={() => handleDeleteSupplier(sup.id)}
                          >
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
      ) : (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>{activeTab} Stock List</CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab.toLowerCase()}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800 pl-10 pr-4 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                />
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
                    <th className="px-6 py-3 text-right">In Stock</th>
                    <th className="px-6 py-3 text-right">Reorder Lvl</th>
                    <th className="px-6 py-3 text-right">Unit Cost</th>
                    <th className="px-6 py-3">Location</th>
                    <th className="px-6 py-3">Expiry Date</th>
                    <th className="px-6 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                        No items found in this category. Click "Add New Item" to add one.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50">
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.name}</td>
                        <td className="px-6 py-4 text-gray-500 dark:text-slate-400">{item.sku}</td>
                        <td className="px-6 py-4 text-right font-medium">
                          <span className={item.quantity <= item.reorderLevel ? 'text-amber-600 dark:text-amber-400 font-bold' : ''}>
                            {item.quantity} {item.unit}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-gray-500 dark:text-slate-400">
                          {item.reorderLevel} {item.unit}
                        </td>
                        <td className="px-6 py-4 text-right">${item.unitCost.toFixed(2)}</td>
                        <td className="px-6 py-4 text-gray-500 dark:text-slate-400">{item.location}</td>
                        <td className="px-6 py-4">
                          {item.expiryDate ? (
                            <Badge color={getExpiryBadgeColor(item.expiryDate)}>
                              {format(new Date(item.expiryDate), 'MMM dd, yyyy')}
                            </Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              title="Restock"
                              onClick={() => {
                                setRestockItem(item);
                                setIsRestockModalOpen(true);
                              }}
                            >
                              <RefreshCw className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              title="Edit"
                              onClick={() => {
                                setEditingItem(item);
                                setIsItemModalOpen(true);
                              }}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              title="Delete"
                              onClick={() => handleDeleteItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Inventory Value by Category ($)</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryChartData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">
                No inventory data available for charts.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-slate-800" />
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                  <YAxis stroke="#888888" fontSize={12} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgb(15 23 42)', borderColor: 'rgb(51 65 85)', color: '#fff' }}
                    formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Value']}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stock Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500 dark:text-slate-400">Total Registered Suppliers</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{suppliers.length}</p>
                </div>
                <Button variant="outline" className="text-xs h-8" onClick={() => setActiveTab('Suppliers')}>View All</Button>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500 dark:text-slate-400">Out of Stock Items</p>
                  <p className="text-xl font-bold text-red-600">
                    {inventory.filter((i) => i.quantity === 0).length}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500 dark:text-slate-400">Active Storage Locations</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {Array.from(new Set(inventory.map((i) => i.location))).length}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- ADD / EDIT ITEM MODAL --- */}
      {isItemModalOpen && (
        <ItemModal
          isOpen={isItemModalOpen}
          editingItem={editingItem}
          suppliers={suppliers}
          onClose={() => setIsItemModalOpen(false)}
          onSave={handleSaveItem}
        />
      )}

      {/* --- RESTOCK MODAL --- */}
      {isRestockModalOpen && restockItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-200 dark:border-slate-800 w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-800">
              <h2 className="text-xl font-semibold">Restock {restockItem.name}</h2>
              <button onClick={() => setIsRestockModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleRestockSubmit} className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">
                  Current quantity: <span className="font-bold text-slate-900 dark:text-slate-100">{restockItem.quantity} {restockItem.unit}</span>
                </p>
                <Label htmlFor="restockQty">Quantity to Add ({restockItem.unit})</Label>
                <Input
                  id="restockQty"
                  type="number"
                  step="0.1"
                  required
                  placeholder="e.g. 100"
                  value={restockQty}
                  onChange={(e) => setRestockQty(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-800">
                <Button type="button" variant="outline" onClick={() => setIsRestockModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Confirm Restock</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD SUPPLIER MODAL --- */}
      {isSupplierModalOpen && (
        <SupplierModal
          isOpen={isSupplierModalOpen}
          onClose={() => setIsSupplierModalOpen(false)}
          onSave={handleSaveSupplier}
        />
      )}
    </main>
  );
}

// --- Item Form Modal Component ---

function ItemModal({
  editingItem,
  suppliers,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  editingItem: InventoryItem | null;
  suppliers: Supplier[];
  onClose: () => void;
  onSave: (data: Partial<InventoryItem>) => void;
}) {
  const [formData, setFormData] = useState<Partial<InventoryItem>>(
    editingItem || {
      name: '',
      category: 'Feed',
      sku: '',
      quantity: 0,
      unit: 'kg',
      reorderLevel: 10,
      unitCost: 0,
      supplier: suppliers[0]?.name || 'Unassigned',
      location: 'Warehouse A',
      expiryDate: '',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-200 dark:border-slate-800 w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-800">
          <h2 className="text-xl font-semibold">{editingItem ? 'Edit Item' : 'Add New Inventory Item'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <Label htmlFor="name">Item Name</Label>
            <Input
              id="name"
              required
              placeholder="e.g. Starter Feed Grade A"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as ItemCategory })}
              >
                <option value="Feed">Feed</option>
                <option value="Equipment">Equipment</option>
                <option value="Chemicals">Chemicals</option>
                <option value="Medication">Medication</option>
                <option value="Packaging">Packaging</option>
                <option value="Other">Other</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="sku">SKU / Code</Label>
              <Input
                id="sku"
                required
                placeholder="e.g. FD-ST-01"
                value={formData.sku || ''}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                step="0.1"
                required
                value={formData.quantity ?? 0}
                onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="unit">Unit</Label>
              <Select
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value as any })}
              >
                <option value="kg">kg</option>
                <option value="bags">bags</option>
                <option value="liters">liters</option>
                <option value="pieces">pieces</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="reorderLevel">Reorder Lvl</Label>
              <Input
                id="reorderLevel"
                type="number"
                required
                value={formData.reorderLevel ?? 0}
                onChange={(e) => setFormData({ ...formData, reorderLevel: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="unitCost">Unit Cost ($)</Label>
              <Input
                id="unitCost"
                type="number"
                step="0.01"
                required
                value={formData.unitCost ?? 0}
                onChange={(e) => setFormData({ ...formData, unitCost: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="supplier">Supplier</Label>
              <Select
                id="supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              >
                {suppliers.length > 0 ? (
                  suppliers.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))
                ) : (
                  <option value="Unassigned">Unassigned</option>
                )}
                <option value="Other / Local">Other / Local</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Storage Location</Label>
              <Input
                id="location"
                placeholder="e.g. Warehouse A"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate || ''}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Item</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Supplier Form Modal Component ---

function SupplierModal({
  onClose,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Supplier>) => void;
}) {
  const [formData, setFormData] = useState<Partial<Supplier>>({
    name: '',
    contactPerson: '',
    email: '',
    itemsSupplied: ['Feed'],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-200 dark:border-slate-800 w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-800">
          <h2 className="text-xl font-semibold">Add New Supplier</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="supName">Supplier / Company Name</Label>
            <Input
              id="supName"
              required
              placeholder="e.g. Apex Agri Co."
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="contactPerson">Contact Person</Label>
            <Input
              id="contactPerson"
              placeholder="e.g. Michael Scott"
              value={formData.contactPerson || ''}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="e.g. sales@apexagri.com"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Supplier</Button>
          </div>
        </form>
      </div>
    </div>
  );
}