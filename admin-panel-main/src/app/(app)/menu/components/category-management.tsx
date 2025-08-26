
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import type { Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea"; // Removed as description is not in API
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { MoreHorizontal, Edit3, Trash2, PlusCircle, Tag, Image as ImageIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import NextImage from "next/image";


interface CategoryManagementProps {
  categories: Category[];
  onAddCategory: (categoryPayload: any) => Promise<void>;
  onUpdateCategory: (categoryPayload: any) => Promise<void>;
  onDeleteCategory: (categoryId: string) => Promise<void>;
  isLoading?: boolean; // Added isLoading prop
}

// Schema based on API fields: name, icon (optional URL)
const categoryFormSchema = z.object({
  name: z.string().min(2, { message: "Category name must be at least 2 characters." }),
  icon: z.string().url({ message: "Please enter a valid URL for the icon." }).optional().or(z.literal('')),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export function CategoryManagement({
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  isLoading = false, // Default isLoading to false
}: CategoryManagementProps) {
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDeleting, setIsDeletingState] = React.useState(false);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: "", icon: "" },
  });

  React.useEffect(() => {
    if (isFormOpen) { // Reset form only when dialog opens
      if (editingCategory) {
        form.reset({ name: editingCategory.name, icon: editingCategory.icon || "" });
      } else {
        form.reset({ name: "", icon: "" });
      }
    }
  }, [editingCategory, form, isFormOpen]);

  const handleFormSubmit = async (values: CategoryFormValues) => {
    setIsSubmitting(true);
    const payload = { ...values };
    if (editingCategory) {
      await onUpdateCategory({ ...payload, id: editingCategory.id });
    } else {
      await onAddCategory(payload);
    }
    setIsSubmitting(false);
    // setIsFormOpen(false); // Parent (MenuPage) will handle closing on success
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const openAddDialog = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (categoryId: string) => {
    setDeletingCategoryId(categoryId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingCategoryId) {
      setIsDeletingState(true);
      await onDeleteCategory(deletingCategoryId);
      setIsDeletingState(false);
      setIsDeleteDialogOpen(false);
      setDeletingCategoryId(null);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Manage Categories</CardTitle>
          <CardDescription>Add, edit, or delete menu categories.</CardDescription>
        </div>
        <Button onClick={openAddDialog} size="sm">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading && categories.length === 0 ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted/20 rounded-md">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-10">
            <Tag className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium text-foreground">No categories yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Get started by adding a new category.</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Icon</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      {category.icon ? (
                        <NextImage src={category.icon} alt={category.name} width={24} height={24} className="rounded-sm object-contain" data-ai-hint="category icon" />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {category.createdAt ? formatDate(category.createdAt, 'MMM d, yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(category)}>
                            <Edit3 className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDeleteDialog(category.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <Dialog open={isFormOpen} onOpenChange={(open) => {
          if (!open && !isSubmitting) form.reset();
          setIsFormOpen(open);
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
              <DialogDescription>
                {editingCategory ? "Update category details." : "Enter details for the new category."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Appetizers, Main Courses" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon URL (Optional)</FormLabel>
                      <FormControl>
                        <Input type="url" placeholder="https://example.com/icon.png" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} disabled={isSubmitting}>Cancel</Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : (editingCategory ? "Save Changes" : "Add Category")}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={confirmDelete}
          itemName="category"
          isLoading={isDeleting}
        />
      </CardContent>
    </Card>
  );
}
