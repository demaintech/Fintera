"use client";

import React, { useEffect, useState, FormEvent } from 'react';
import { PlusCircle, Droplets, Thermometer, Fish, Calendar, MapPin, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { createPond, deletePond, getPonds, updatePond, type Pond, type PondStatus } from '@/lib/pond-api';
import { useAuth } from '@/lib/auth-context';

const statusColors: Record<PondStatus, string> = {
  Active: 'bg-green-100 text-green-800 border-green-200',
  Inactive: 'bg-gray-100 text-gray-800 border-gray-200',
  Maintenance: 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

const formatDate = (value?: string | null) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  return isNaN(date.getTime()) ? String(value) : date.toLocaleDateString();
};

const PondsPage = () => {
  const router = useRouter();
  const { token, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [ponds, setPonds] = useState<Pond[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createLocation, setCreateLocation] = useState('');
  const [createStatus, setCreateStatus] = useState<PondStatus>('Active');
  const [createPondType, setCreatePondType] = useState('');
  const [createPondCapacity, setCreatePondCapacity] = useState('');
  const [createSpeciesInPond, setCreateSpeciesInPond] = useState('');
  const [createPondStockQuantity, setCreatePondStockQuantity] = useState('');
  const [createLastHarvestDate, setCreateLastHarvestDate] = useState('');
  const [createWaterTemp, setCreateWaterTemp] = useState('');
  const [createPhLevel, setCreatePhLevel] = useState('7.0');
  const [createError, setCreateError] = useState('');

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPond, setSelectedPond] = useState<Pond | null>(null);
  const [editName, setEditName] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editStatus, setEditStatus] = useState<PondStatus>('Active');
  const [editError, setEditError] = useState('');

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isAuthLoading, router]);

  const loadPonds = async () => {
    if (!token) return;
    setFetchError('');
    setIsLoading(true);

    try {
      const fetched = await getPonds(token);
      setPonds(fetched);
    } catch (error) {
      setFetchError(error instanceof Error ? error.message : 'Failed to load ponds');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadPonds();
    }
  }, [token]);

  const resetCreateForm = () => {
    setCreateName('');
    setCreateLocation('');
    setCreateStatus('Active');
    setCreatePondType('');
    setCreatePondCapacity('');
    setCreateSpeciesInPond('');
    setCreatePondStockQuantity('');
    setCreateLastHarvestDate('');
    setCreateWaterTemp('');
    setCreatePhLevel('7.0');
    setCreateError('');
  };

  const resetEditForm = () => {
    setSelectedPond(null);
    setEditName('');
    setEditLocation('');
    setEditStatus('Active');
    setEditError('');
  };

  const handleCreateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setCreateError('');

    if (
      !createName ||
      !createLocation ||
      !createPondType ||
      !createPondCapacity ||
      !createSpeciesInPond ||
      !createPondStockQuantity ||
      !createLastHarvestDate ||
      !createWaterTemp
    ) {
      setCreateError('All pond fields are required.');
      return;
    }

    setIsActionLoading(true);
    try {
      const created = await createPond(
        {
          name: createName,
          location: createLocation,
          status: createStatus,
          pondType: createPondType,
          pondCapacity: Number(createPondCapacity),
          speciesInPond: createSpeciesInPond,
          pondStockQuantity: Number(createPondStockQuantity),
          lastHarvestDate: createLastHarvestDate,
          waterTemp: Number(createWaterTemp),
          phLevel: Number(createPhLevel),
        },
        token
      );
      setPonds((prev) => [created, ...prev]);
      setIsCreateDialogOpen(false);
      resetCreateForm();
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Failed to create pond');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedPond) return;

    if (!editName || !editLocation) {
      setEditError('Pond Name and Location are required.');
      return;
    }

    setIsActionLoading(true);
    try {
      const updated = await updatePond(
        selectedPond.id,
        {
          name: editName,
          location: editLocation,
          status: editStatus,
        },
        token
      );
      setPonds((prev) => prev.map((pond) => (pond.id === updated.id ? updated : pond)));
      setIsEditDialogOpen(false);
      resetEditForm();
    } catch (error) {
      setEditError(error instanceof Error ? error.message : 'Failed to update pond');
    } finally {
      setIsActionLoading(false);
    }
  };

  const openEditDialog = (pond: Pond) => {
    setSelectedPond(pond);
    setEditName(pond.name);
    setEditLocation(pond.location);
    setEditStatus(pond.status);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (pond: Pond) => {
    // Optimistically update local state immediately
    const previousPonds = [...ponds];
    setPonds((prev) => prev.filter((item) => item.id !== pond.id));

    try {
      await deletePond(pond.id, token);
    } catch (error) {
      // Rollback UI on failure and report error
      setPonds(previousPonds);
      setFetchError(error instanceof Error ? error.message : 'Failed to delete pond');
    }
  };

  const handleViewDetails = (pond: Pond) => {
    router.push(`/admin/ponds/${encodeURIComponent(pond.id)}`);
  };

  if (isAuthLoading) {
    return <div className="p-8 text-center text-slate-500">Authenticating user...</div>;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Ponds Management</h2>
          <p className="text-muted-foreground">View and manage your isolated aquaculture ponds.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/admin/ponds/new">
            <Button variant="secondary">Add Pond</Button>
          </Link>

          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={(open) => {
              setIsCreateDialogOpen(open);
              if (!open) resetCreateForm();
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Create Pond
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl p-6">
              <DialogHeader>
                <DialogTitle>Create New Pond</DialogTitle>
                <DialogDescription>
                  Fill in the details below to add a new pond to your account.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input id="name" value={createName} onChange={(e) => setCreateName(e.target.value)} className="col-span-3 rounded-sm h-10" placeholder="e.g., Alpha-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="location" className="text-right">Location</Label>
                    <Input id="location" value={createLocation} onChange={(e) => setCreateLocation(e.target.value)} className="col-span-3 rounded-sm h-10" placeholder="e.g., South Sector" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">Pond Type</Label>
                    <Input id="type" value={createPondType} onChange={(e) => setCreatePondType(e.target.value)} className="col-span-3 rounded-sm h-10" placeholder="e.g., Earthen" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="capacity" className="text-right">Capacity</Label>
                    <Input id="capacity" type="number" min="0" value={createPondCapacity} onChange={(e) => setCreatePondCapacity(e.target.value)} className="col-span-3 rounded-sm h-10" placeholder="e.g., 5000" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="species" className="text-right">Species</Label>
                    <Input id="species" value={createSpeciesInPond} onChange={(e) => setCreateSpeciesInPond(e.target.value)} className="col-span-3 rounded-sm h-10" placeholder="e.g., Tilapia" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="stockQuantity" className="text-right">Stock Quantity</Label>
                    <Input id="stockQuantity" type="number" min="0" value={createPondStockQuantity} onChange={(e) => setCreatePondStockQuantity(e.target.value)} className="col-span-3 rounded-sm h-10" placeholder="e.g., 1200" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="lastHarvestDate" className="text-right">Last Harvest</Label>
                    <Input id="lastHarvestDate" type="date" value={createLastHarvestDate} onChange={(e) => setCreateLastHarvestDate(e.target.value)} className="col-span-3 rounded-sm h-10" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="waterTemp" className="text-right">Water Temp (°C)</Label>
                    <Input id="waterTemp" type="number" step="0.1" min="0" value={createWaterTemp} onChange={(e) => setCreateWaterTemp(e.target.value)} className="col-span-3 rounded-sm h-10" placeholder="e.g., 28.5" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phLevel" className="text-right">pH Level</Label>
                    <Input id="phLevel" type="number" step="0.1" min="0" value={createPhLevel} onChange={(e) => setCreatePhLevel(e.target.value)} className="col-span-3 rounded-sm h-10" placeholder="e.g., 7.2" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right">Status</Label>
                    <Select value={createStatus} onValueChange={(value) => setCreateStatus(value as PondStatus)}>
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
                  {createError && <p className="col-span-4 text-sm text-red-600 text-center">{createError}</p>}
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isActionLoading}>
                    {isActionLoading ? 'Saving...' : 'Create Pond'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {fetchError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {fetchError}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
          Loading ponds...
        </div>
      ) : ponds.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
          No ponds found. Create one to get started.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ponds.map((pond) => (
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
                    <Badge className={cn('border', statusColors[pond.status])}>
                      {pond.status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(pond)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditDialog(pond)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(pond)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grow space-y-3 text-sm">
                <div className="flex items-center">
                  <Fish className="w-4 h-4 mr-3 text-muted-foreground" />
                  <span>
                    <strong>{pond.currentStock.quantity.toLocaleString()}</strong>{' '}
                    {pond.currentStock.species}
                  </span>
                </div>
                <div className="flex items-center">
                  <Thermometer className="w-4 h-4 mr-3 text-muted-foreground" />
                  <span>
                    Water Temp: <strong>{pond.waterTemp}°C</strong>
                  </span>
                </div>
                <div className="flex items-center">
                  <Droplets className="w-4 h-4 mr-3 text-muted-foreground" />
                  <span>
                    pH Level: <strong>{pond.phLevel}</strong>
                  </span>
                </div>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                <Calendar className="w-3 h-3 mr-2" />
                Last Harvest: {formatDate(pond.lastHarvestDate)}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) resetEditForm();
          setIsEditDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-xl p-6">
          <DialogHeader>
            <DialogTitle>Edit Pond</DialogTitle>
            <DialogDescription>Update the selected pond information.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">Name</Label>
                <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} className="col-span-3 rounded-sm h-10" placeholder="Pond name" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-location" className="text-right">Location</Label>
                <Input id="edit-location" value={editLocation} onChange={(e) => setEditLocation(e.target.value)} className="col-span-3 rounded-sm h-10" placeholder="Pond location" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-status" className="text-right">Status</Label>
                <Select value={editStatus} onValueChange={(value) => setEditStatus(value as PondStatus)}>
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
              {editError && <p className="col-span-4 text-sm text-red-600 text-center">{editError}</p>}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isActionLoading}>
                {isActionLoading ? 'Updating...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PondsPage;