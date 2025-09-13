// src/app/(app)/restaurants/components/restaurant-table.tsx
"use client";

import * as React from "react";
import type { Restaurant } from "@/types";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit3, Trash2, Building } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/utils";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface RestaurantTableProps {
    restaurants: Restaurant[];
    onEdit: (id: string) => void;
    onDelete: (id: string) => Promise<void>;
    isLoading?: boolean;
}

export function RestaurantTable({ restaurants, onEdit, onDelete, isLoading }: RestaurantTableProps) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
    const [selectedRestaurantId, setSelectedRestaurantId] = React.useState<string | null>(null);
    const [isDeleting, setIsDeleting] = React.useState(false);

    const handleDeleteClick = (id: string) => {
        setSelectedRestaurantId(id);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (selectedRestaurantId) {
            setIsDeleting(true);
            await onDelete(selectedRestaurantId);
            setIsDeleting(false);
            setIsDeleteDialogOpen(false);
            setSelectedRestaurantId(null);
        }
    };

    if (isLoading && restaurants.length === 0) {
        return (
            <div className="rounded-md border shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="min-w-[200px]">نام رستوران</TableHead>
                            <TableHead className="min-w-[300px]">توضیحات</TableHead>
                            <TableHead className="w-[100px] text-center">تعداد میزها</TableHead>
                            <TableHead className="w-[180px]">تاریخ ایجاد</TableHead>
                            <TableHead className="w-[80px] text-right">عملیات</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(5)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-10 mx-auto" /></TableCell>
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
                            <TableHead className="min-w-[200px]">نام رستوران</TableHead>
                            <TableHead className="min-w-[300px]">توضیحات</TableHead>
                            <TableHead className="w-[100px] text-center">تعداد میزها</TableHead>
                            <TableHead className="w-[180px]">تاریخ ایجاد</TableHead>
                            <TableHead className="w-[80px] text-right">عملیات</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {restaurants.map((restaurant) => (
                            <TableRow key={restaurant.id} className="hover:bg-muted/50">
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Building className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">{restaurant.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground max-w-xs truncate" title={restaurant.description}>
                                    {restaurant.description || "-"}
                                </TableCell>
                                <TableCell className="text-center">
                                    {restaurant.tableIds.length}
                                </TableCell>
                                <TableCell>{restaurant.createdAt ? formatDate(restaurant.createdAt, 'MMM d, yyyy') : 'N/A'}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">باز کردن منو</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => onEdit(restaurant.id)}>
                                                <Edit3 className="mr-2 h-4 w-4" />
                                                ویرایش
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDeleteClick(restaurant.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                حذف
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
                itemName="رستوران"
                isLoading={isDeleting}
            />
        </>
    );
}