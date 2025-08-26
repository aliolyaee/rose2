
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch"; // Added Switch
import type { MenuItem, Category } from "@/types";

interface MenuItemFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: any) => Promise<void>; // Accepts API payload structure
  menuItem?: MenuItem | null;
  categories: Category[];
}

// Schema based on API fields: title, description, fee, categoryId, image (optional), available
const formSchema = z.object({
  title: z.string().min(2, { message: "Item title must be at least 2 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  fee: z.coerce.number().min(0.01, { message: "Fee must be a positive value." }),
  categoryId: z.string().min(1, { message: "Please select a category." }),
  image: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  available: z.boolean().default(true),
});

type MenuItemFormValues = z.infer<typeof formSchema>;

export function MenuItemFormDialog({ isOpen, onOpenChange, onSubmit, menuItem, categories }: MenuItemFormDialogProps) {
  const isEditing = !!menuItem;

  const form = useForm<MenuItemFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      fee: 0,
      categoryId: "",
      image: "",
      available: true,
    },
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) { // Reset form only when dialog is opened or menuItem changes
      if (menuItem) {
        form.reset({
          title: menuItem.title,
          description: menuItem.description,
          fee: menuItem.fee,
          categoryId: menuItem.categoryId,
          image: menuItem.image || "",
          available: menuItem.available,
        });
      } else {
        form.reset({
          title: "",
          description: "",
          fee: 0,
          categoryId: "",
          image: "",
          available: true,
        });
      }
    }
  }, [menuItem, form, isOpen]);

  const handleFormSubmit = async (values: MenuItemFormValues) => {
    setIsSubmitting(true);
    // Construct payload for API (application/x-www-form-urlencoded)
    // This will be handled by the parent component (MenuPage)
    const payload = {
      ...values,
      available: values.available ? 'true' : 'false', // API expects string for boolean in form-urlencoded
    };
    if (isEditing && menuItem) {
      (payload as any).id = menuItem.id;
    }

    await onSubmit(payload);
    setIsSubmitting(false);
    // onOpenChange(false); // Parent will handle closing
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && !isSubmitting) form.reset(); // Reset if closing and not submitting
      onOpenChange(open)
    }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Menu Item" : "Add New Menu Item"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the item's details." : "Fill in the details for the new menu item."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-3 py-2 max-h-[70vh] overflow-y-auto pr-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Spaghetti Carbonara" {...field} />
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the menu item..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fee (Price)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g., 15.99" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL (Optional)</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://example.com/image.png" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="available"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Available</FormLabel>
                    <FormMessage />
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
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
                {isSubmitting ? (isEditing ? "Saving..." : "Adding...") : (isEditing ? "Save Changes" : "Add Item")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
