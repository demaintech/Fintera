"use client";

import React, { useState, FormEvent } from 'react';
import { PlusCircle, Droplets, Thermometer, Fish, Calendar, MapPin, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface Pond {
  id: string;
  name: string;
  location: string;
  status: 'Active' | 'Inactive' | 'Maintenance';
  currentStock: {
    species: string;
    quantity: number;
  };
  lastHarvestDate: Date | null;
  waterTemp: number;
  phLevel: number;
}

const MOCK_PONDS: Pond[] = [
  { id: 'P001', name: 'Alpha-1', location: 'North Sector', status: 'Active', currentStock: { species: 'Tilapia', quantity: 5000 }, lastHarvestDate: new Date('2023-10-15'), waterTemp: 28.5, phLevel: 7.2 },
  { id: 'P002', name: 'Bravo-2', location: 'West Sector', status: 'Active', currentStock: { species: 'Catfish', quantity: 3500 }, lastHarvestDate: new Date('2023-09-20'), waterTemp: 26.0, phLevel: 6.8 },
  { id: 'P003', name: 'Charlie-1', location: 'North Sector', status: 'Maintenance', currentStock: { species: 'None', quantity: 0 }, lastHarvestDate: null, waterTemp: 25.0, phLevel: 7.0 },
  { id: 'P004', name: 'Delta-4', location: 'East Sector', status: 'Inactive', currentStock: { species: 'None', quantity: 0 }, lastHarvestDate: new Date('2023-05-11'), waterTemp: 22.0, phLevel: 7.1 },
  { id: 'P005', name: 'Echo-3', location: 'West Sector', status: 'Active', currentStock: { species: 'Shrimp', quantity: 15000 }, lastHarvestDate: new Date('2023-11-01'), waterTemp: 29.1, phLevel: 7.8 },
  { id: 'P006', name: 'Foxtrot-1', location: 'South Sector', status: 'Active', currentStock: { species: 'Tilapia', quantity: 4800 }, lastHarvestDate: new Date('2023-10-25'), waterTemp: 28.2, phLevel: 7.3 },
];

const statusColors: Record<Pond['status'], string> = {
  Active: 'bg-green-100 text-green-800 border-green-200',
  Inactive: 'bg-gray-100 text-gray-800 border-gray-200',
  Maintenance: 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

const PondsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive' | 'Maintenance'>('Active');
  const [error, setError] = useState('');

  const handleStatusChange = (value: 'Active' | 'Inactive' | 'Maintenance' | null) => {
    if (value !== null) {
      setStatus(value);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !location) {
      setError('Pond Name and Location are required.');
      return;
    }

    // In a real app, you would make an API call here.
    console.log('Creating new pond:', { name, location, status });

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // For now, we'll just log it and close the dialog.
    // You would typically refetch the ponds list here.
    setIsDialogOpen(false);
    // Reset form
    setName('');
    setLocation('');
    setStatus('Active');
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Ponds Management</h2>
          <p className="text-muted-foreground">
            View and manage all your aquaculture ponds.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button />}>
            <PlusCircle className="mr-2 h-4 w-4" /> Create Pond
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Pond</DialogTitle>
              <DialogDescription>
                Fill in the details below to add a new pond to the system.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" placeholder="e.g., Alpha-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="location" className="text-right">
                    Location
                  </Label>
                  <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} className="col-span-3" placeholder="e.g., South Sector" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Status
                  </Label>
                  <Select value={status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {error && <p className="col-span-4 text-sm text-red-600 text-center">{error}</p>}
              </div>
              <DialogFooter>
                <Button type="submit">Create Pond</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {MOCK_PONDS.map((pond) => (
          <Card key={pond.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{pond.name}</CardTitle>
                  <CardDescription className="flex items-center pt-1">
                    <MapPin className="w-3 h-3 mr-1.5" /> {pond.location}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={cn("border", statusColors[pond.status])}>
                    {pond.status}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" />}>
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-3 text-sm">
              <div className="flex items-center">
                <Fish className="w-4 h-4 mr-3 text-muted-foreground" />
                <span><strong>{pond.currentStock.quantity.toLocaleString()}</strong> {pond.currentStock.species}</span>
              </div>
              <div className="flex items-center">
                <Thermometer className="w-4 h-4 mr-3 text-muted-foreground" />
                <span>Water Temp: <strong>{pond.waterTemp}°C</strong></span>
              </div>
              <div className="flex items-center">
                <Droplets className="w-4 h-4 mr-3 text-muted-foreground" />
                <span>pH Level: <strong>{pond.phLevel}</strong></span>
              </div>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
              <Calendar className="w-3 h-3 mr-2" />
              Last Harvest: {pond.lastHarvestDate ? pond.lastHarvestDate.toLocaleDateString() : 'N/A'}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PondsPage;