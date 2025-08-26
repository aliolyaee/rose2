
"use client";

import * as React from "react";
import type { Reservation } from "@/types";
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
import { MoreHorizontal, Edit3, Trash2, CheckCircle, AlertCircle, XCircle, Hourglass } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate as formatDateUtil } from "@/lib/utils"; // Renamed to avoid conflict
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from 'date-fns';


interface ReservationTableProps {
  reservations: Reservation[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}

const statusConfig: { [key: string]: { label: string; icon: React.ElementType; color: string } } = {
  confirmed: { label: "Confirmed", icon: CheckCircle, color: "text-green-600 dark:text-green-400" },
  pending: { label: "Pending", icon: Hourglass, color: "text-yellow-600 dark:text-yellow-400" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "text-red-600 dark:text-red-400" },
  completed: { label: "Completed", icon: CheckCircle, color: "text-blue-600 dark:text-blue-400" },
  // Add other statuses if your API returns them
};

export function ReservationTable({ reservations, onEdit, onDelete, isLoading }: ReservationTableProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedReservationId, setSelectedReservationId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDeleteClick = (id: string) => {
    setSelectedReservationId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedReservationId) {
      setIsDeleting(true);
      await onDelete(selectedReservationId);
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setSelectedReservationId(null);
    }
  };

  const formatReservationDateTime = (dateStr: string, hourStr: string): string => {
    try {
      // Combine date and hour to form a full ISO-like string for parsing
      const dateTime = parseISO(`${dateStr}T${hourStr}:00`);
      return format(dateTime, 'MMM d, yyyy h:mm a');
    } catch (error) {
      // Fallback for existing 'dateTime' field if present (e.g. from client-side generation)
      if (dateStr && dateStr.includes('T')) { // Check if dateStr itself is a dateTime string
        try {
          return formatDateUtil(dateStr, 'MMM d, yyyy h:mm a');
        } catch (e) { /* ignore */ }
      }
      return "Invalid Date";
    }
  };

  if (isLoading && reservations.length === 0) {
    return (
      <div className="rounded-md border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[180px]">Customer Info / Phone</TableHead>
              <TableHead className="min-w-[180px]">Date & Time</TableHead>
              <TableHead>Table</TableHead>
              <TableHead className="w-[80px] text-center">Guests</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                <TableCell><Skeleton className="h-5 w-8 mx-auto" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
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
              <TableHead className="min-w-[180px]">Customer Info / Phone</TableHead>
              <TableHead className="min-w-[180px]">Date & Time</TableHead>
              <TableHead>Table</TableHead>
              <TableHead className="w-[80px] text-center">Guests</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservations.map((reservation) => {
              const currentStatusKey = reservation.status || "pending";
              const currentStatus = statusConfig[currentStatusKey.toLowerCase()] || { label: reservation.status || "N/A", icon: AlertCircle, color: "text-gray-500" };
              return (
                <TableRow key={reservation.id} className="hover:bg-muted/50">
                  <TableCell>
                    {/* API has description (which might contain name) and phone */}
                    <div className="font-medium">{reservation.phone}</div>
                    <div className="text-xs text-muted-foreground max-w-xs truncate" title={reservation.description}>
                      {reservation.description || reservation.customerName || "-"}
                    </div>
                  </TableCell>
                  <TableCell>{formatReservationDateTime(reservation.date, reservation.hour)}</TableCell>
                  <TableCell>{reservation.tableName || reservation.tableId}</TableCell>
                  <TableCell className="text-center">{reservation.people}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`capitalize border-current ${currentStatus.color}`}>
                      <currentStatus.icon className={`mr-1.5 h-3 w-3 ${currentStatus.color}`} />
                      {currentStatus.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(reservation.id)}>
                          <Edit3 className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteClick(reservation.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
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
        itemName="reservation"
        isLoading={isDeleting}
      />
    </>
  );
}
