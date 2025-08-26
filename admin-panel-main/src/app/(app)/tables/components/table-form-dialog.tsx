
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Added for description
import type { Table } from "@/types";

interface TableFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: Omit<Table, 'id' | 'createdAt' | 'status'> | (Table & { id: string })) => Promise<void>;
  table?: Table | null;
}

// Schema matches API: name, description, capacity, photo. Status is not part of POST/PATCH.
const formSchema = z.object({
  name: z.string().min(1, { message: "Table name cannot be empty." }),
  description: z.string().optional(),
  capacity: z.coerce.number().min(1, { message: "Capacity must be at least 1." }),
  photo: z.string().url({ message: "Please enter a valid image URL." }).optional().or(z.literal('')),
});

type TableFormValues = z.infer<typeof formSchema>;

export function TableFormDialog({ isOpen, onOpenChange, onSubmit, table }: TableFormDialogProps) {
  const isEditing = !!table;

  const form = useForm<TableFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      capacity: 1,
      photo: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      if (table) {
        form.reset({
          name: table.name,
          description: table.description || "",
          capacity: table.capacity,
          photo: table.photo || "",
        });
      } else {
        form.reset({
          name: "",
          description: "",
          capacity: 1,
          photo: "",
        });
      }
    }
  }, [table, form, isOpen]);

  const handleFormSubmit = async (values: TableFormValues) => {
    setIsSubmitting(true);
    const submissionData: any = { ...values };
    if (isEditing && table) {
      submissionData.id = table.id;
      // API doesn't take createdAt or status in PATCH body.
      // submissionData.createdAt = table.createdAt; 
    }
    await onSubmit(submissionData);
    // Parent (TablesPage) will handle closing dialog and resetting state on successful submission
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && !isSubmitting) { // only reset if not submitting
        form.reset({ name: "", description: "", capacity: 1, photo: "" });
      }
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Table" : "Add New Table"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the table's details." : "Fill in the details for the new table."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Table Name / Identifier</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Table 5, Bar Seat 2" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Near window, cozy corner" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" placeholder="e.g., 4" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="photo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Photo URL (Optional)</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://example.com/table.jpg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Status field removed as it's not part of POST/PATCH API for tables */}
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                {isSubmitting ? (isEditing ? "Saving..." : "Adding...") : (isEditing ? "Save Changes" : "Add Table")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
