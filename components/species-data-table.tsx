"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { MoreHorizontal, PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Species } from "../types";
import { Badge } from "@/components/ui/badge";

interface SpeciesDataTableProps {
  data: Species[];
  onEdit: (species: Species) => void;
  onDelete: (speciesId: string) => void;
  onViewPonds: (species: Species) => void;
}

export const SpeciesDataTable = ({ data, onEdit, onDelete, onViewPonds }: SpeciesDataTableProps) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const columns: ColumnDef<Species>[] = [
    {
      accessorKey: "commonName",
      header: "Species",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: row.original.color }} />
          <div className="font-medium">{row.getValue("commonName")}</div>
        </div>
      ),
    },
    {
      accessorKey: "scientificName",
      header: "Scientific Name",
      cell: ({ row }) => <div className="italic text-muted-foreground">{row.getValue("scientificName")}</div>,
    },
    {
      accessorKey: "totalStock",
      header: () => <div className="text-right">Total Stock</div>,
      cell: ({ row }) => <div className="text-right font-medium">{row.original.totalStock.toLocaleString()}</div>,
    },
    {
      accessorKey: "pondsCurrentlyUsing",
      header: "Ponds",
      cell: ({ row }) => (
        <Badge variant="secondary" className="cursor-pointer" onClick={() => onViewPonds(row.original)}>
          {row.original.pondsCurrentlyUsing.length} Ponds
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const species = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onViewPonds(species)}>View Ponds</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(species)}>Edit</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={() => onDelete(species.id)}>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: { sorting, columnFilters },
  });

  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by species name..."
          value={(table.getColumn("commonName")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("commonName")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Pagination would go here */}
    </div>
  );
};