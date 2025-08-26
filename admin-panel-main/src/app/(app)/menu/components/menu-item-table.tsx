
"use client";

import * as React from "react";
import type { MenuItem } from "@/types";
import NextImage from "next/image"; // Renamed to avoid conflict
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
import { MoreHorizontal, Edit3, Trash2, ImageOff, CheckCircle, XCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface MenuItemTableProps {
  menuItems: MenuItem[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export function MenuItemTable({ menuItems, onEdit, onDelete, isLoading }: MenuItemTableProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedItemId, setSelectedItemId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDeleteClick = (id: string) => {
    setSelectedItemId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedItemId) {
      setIsDeleting(true);
      await onDelete(selectedItemId);
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setSelectedItemId(null);
    }
  };

  if (isLoading && menuItems.length === 0) {
    return (
      <div className="rounded-md border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="w-[100px]">Fee</TableHead>
              <TableHead className="w-[100px] text-center">Available</TableHead>
              <TableHead className="w-[180px]">Created At</TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-12 w-12 rounded" /></TableCell>
                <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                <TableCell><Skeleton className="h-5 w-8 mx-auto" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-md" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead className="min-w-[200px]">Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="w-[100px]">Fee</TableHead>
              <TableHead className="w-[100px] text-center">Available</TableHead>
              <TableHead className="w-[180px]">Created At</TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {menuItems.map((item) => (
              <TableRow key={item.id} className="hover:bg-muted/50">
                <TableCell>
                  {item.image ? (
                    <NextImage
                      src={item.image}
                      alt={item.title}
                      width={48}
                      height={48}
                      className="rounded-md object-cover aspect-square"
                      data-ai-hint="food item"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center">
                      <ImageOff className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-xs text-muted-foreground truncate max-w-xs">{item.description}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{item.categoryName || "Uncategorized"}</Badge>
                </TableCell>
                <TableCell>{formatCurrency(item.fee)}</TableCell>
                <TableCell className="text-center">
                  {item.available ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                  )}
                </TableCell>
                <TableCell>{item.createdAt ? formatDate(item.createdAt, 'MMM d, yyyy') : 'N/A'}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(item.id)}>
                        <Edit3 className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteClick(item.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        itemName="menu item"
        isLoading={isDeleting}
      />
    </>
  );
}
