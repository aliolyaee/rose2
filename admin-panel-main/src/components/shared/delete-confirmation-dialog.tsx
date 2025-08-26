
"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: () => void;
  itemName?: string; // e.g., "user", "table", "reservation"
  isLoading?: boolean;
}

export function DeleteConfirmationDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  itemName = "مورد", // item
  isLoading = false,
}: DeleteConfirmationDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>آیا کاملاً مطمئن هستید؟</AlertDialogTitle>
          <AlertDialogDescription>
            این عملیات قابل بازگشت نیست. این کار به طور دائمی {itemName} انتخاب شده را حذف کرده و اطلاعات آن را از سرورهای ما پاک می‌کند.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>انصراف</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isLoading} className="bg-destructive hover:bg-destructive/90">
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <Trash2 className="ml-2 h-4 w-4" /> /* mr-2 becomes ml-2 */
            )}
            {isLoading ? "در حال حذف..." : "حذف"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
