
"use client";

import * as React from "react";
import type { User } from "@/types";
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
import { MoreHorizontal, Edit3, Trash2, ShieldCheck, UserCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/utils";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface UserTableProps {
  users: User[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export function UserTable({ users, onEdit, onDelete, isLoading }: UserTableProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedUserId, setSelectedUserId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDeleteClick = (id: string) => {
    setSelectedUserId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedUserId) {
      setIsDeleting(true);
      try {
        await onDelete(selectedUserId);
      } finally {
        setIsDeleting(false);
        setIsDeleteDialogOpen(false);
        setSelectedUserId(null);
      }
    }
  };

  if (isLoading) { // Show skeleton when isLoading is true
    return (
      <div className="rounded-md border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Name</TableHead>
              <TableHead>Username (Email)</TableHead>
              <TableHead className="w-[100px]">Role</TableHead>
              <TableHead className="w-[180px]">Created At</TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => ( // Assuming ITEMS_PER_PAGE is 5 for skeleton
              <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-md" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (users.length === 0 && !isLoading) { // Handled by parent component
    return null;
  }


  return (
    <>
      <div className="rounded-md border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Full Name</TableHead>
              <TableHead>Username (Email)</TableHead>
              <TableHead className="w-[100px]">Role</TableHead>
              <TableHead className="w-[180px]">Created At</TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{user.fullName}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>
                  <Badge variant={user.role === "admin" ? "default" : "secondary"} className="capitalize">
                    {user.role === "admin" ? <ShieldCheck className="mr-1 h-3 w-3" /> : <UserCircle className="mr-1 h-3 w-3" />}
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>{user.createdAt ? formatDate(user.createdAt, 'MMM d, yyyy') : 'N/A'}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(user.id)}>
                        <Edit3 className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteClick(user.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
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
        itemName="user"
        isLoading={isDeleting}
      />
    </>
  );
}
