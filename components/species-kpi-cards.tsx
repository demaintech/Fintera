"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Fish, Layers, Package, Sigma } from "lucide-react";
import { Species } from "@/app/admin/stock/species/types";

interface SpeciesKpiCardsProps {
  speciesData: Species[];
}

export const SpeciesKpiCards = ({ speciesData }: SpeciesKpiCardsProps) => {
  const totalSpecies = speciesData.length;

  const mostStocked = speciesData.reduce(
    (max, species) => (species.totalStock > max.totalStock ? species : max),
    speciesData[0] || { commonName: 'N/A', totalStock: 0 }
  );

  const totalActiveStock = speciesData.reduce((sum, s) => sum + s.totalStock, 0);

  const speciesWithPonds = speciesData.filter(s => s.pondsCurrentlyUsing.length > 0).length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Species Tracked</CardTitle>
          <Layers className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSpecies}</div>
          <p className="text-xs text-muted-foreground">
            Unique species in the system
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Most Stocked Species</CardTitle>
          <Fish className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{mostStocked.commonName}</div>
          <p className="text-xs text-muted-foreground">
            with {mostStocked.totalStock.toLocaleString()} individuals
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Active Stock</CardTitle>
          <Sigma className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalActiveStock.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Across all species and ponds
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Species with Ponds</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{speciesWithPonds}</div>
          <p className="text-xs text-muted-foreground">
            Currently assigned to at least one pond
          </p>
        </CardContent>
      </Card>
    </div>
  );
};