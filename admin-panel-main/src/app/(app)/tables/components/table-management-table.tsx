
"use client";

import * as React from "react";
import type { Table as TableType } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Edit3, Trash2, CheckCircle, XCircle, Clock, Wrench, ImageOff } from "lucide-react"; // Added ImageOff
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/utils";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image"; // Added for photo display

interface TableManagementTableProps {
  tables: TableType[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}

// Status config remains useful for displaying status from GET /tables
const statusConfig: { [key: string]: { label: string; icon: React.ElementType; color: string } } = {
  available: { label: "Available", icon: CheckCircle, color: "text-green-600 dark:text-green-400" },
  occupied: { label: "Occupied", icon: XCircle, color: "text-red-600 dark:text-red-400" },
  reserved: { label: "Reserved", icon: Clock, color: "text-yellow-600 dark:text-yellow-400" },
  maintenance: { label: "Maintenance", icon: Wrench, color: "text-gray-500 dark:text-gray-400" },
};


export function TableManagementTable({ tables, onEdit, onDelete, isLoading }: TableManagementTableProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedTableId, setSelectedTableId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDeleteClick = (id: string) => {
    setSelectedTableId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedTableId) {
      setIsDeleting(true);
      await onDelete(selectedTableId);
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setSelectedTableId(null);
    }
  };

  if (isLoading && tables.length === 0) { // Changed condition to show skeleton only when loading AND no data
    return (
      <div className="rounded-md border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">Photo</TableHead>
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[100px]">Capacity</TableHead>
              <TableHead className="w-[150px]">Status</TableHead>
              <TableHead className="w-[180px]">Created At</TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-10 w-10 rounded-md" /></TableCell>
                <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                <TableCell><Skeleton className="h-5 w-10" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-md" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  // No items message handled by parent component (TablesPage)

  return (
    <>
      <div className="rounded-md border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">Photo</TableHead>
              <TableHead className="min-w-[150px]">Name</TableHead>
              <TableHead className="min-w-[200px]">Description</TableHead>
              <TableHead className="w-[100px] text-center">Capacity</TableHead>
              <TableHead className="w-[150px]">Status</TableHead>
              <TableHead className="w-[180px]">Created At</TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tables.map((table) => {
              const currentStatus = table.status ? statusConfig[table.status] : { label: "Unknown", icon: CheckCircle, color: "text-gray-400" };
              return (
                <TableRow key={table.id} className="hover:bg-muted/50">
                  <TableCell>
                    {table.photo ? (
                      <Image src={table.photo} alt={table.name} width={40} height={40} className="rounded-md object-cover aspect-square" data-ai-hint="table place" />
                    ) : (
                      <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                        <ImageOff className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{table.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate" title={table.description}>
                    {table.description || "-"}
                  </TableCell>
                  <TableCell className="text-center">{table.capacity}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`capitalize text-xs border-current ${currentStatus.color}`}>
                      <currentStatus.icon className={`mr-1.5 h-3 w-3 ${currentStatus.color}`} /> {/* Ensure icon color matches text */}
                      {currentStatus.label}
                    </Badge>
                  </TableCell>
                  <TableCell>{table.createdAt ? formatDate(table.createdAt, 'MMM d, yyyy') : 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(table.id)}>
                          <Edit3 className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteClick(table.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        itemName="table"
        isLoading={isDeleting}
      />
    </>
  );
}
