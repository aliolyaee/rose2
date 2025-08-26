
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { User } from "@/types"; // Ensure User type fields match: fullName, username, role

interface UserFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: Omit<User, 'id' | 'createdAt'> | User) => Promise<void>;
  user?: User | null; // For editing
}

// Schema for form fields. 'name' will map to 'fullName', 'email' to 'username'.
const baseFormSchema = z.object({
  name: z.string().min(2, { message: "Full name must be at least 2 characters." }), // Maps to fullName
  email: z.string().email({ message: "Invalid email address." }), // Maps to username
  role: z.enum(["admin", "staff"]),
  password: z.string().optional(),
});

const createUserSchema = baseFormSchema.extend({
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const editUserSchema = baseFormSchema.extend({
  password: z.string().min(6, { message: "Password must be at least 6 characters." }).optional().or(z.literal('')),
});


export function UserFormDialog({ isOpen, onOpenChange, onSubmit, user }: UserFormDialogProps) {
  const isEditing = !!user;
  const currentFormSchema = isEditing ? editUserSchema : createUserSchema;

  const form = useForm<z.infer<typeof currentFormSchema>>({
    resolver: zodResolver(currentFormSchema),
    defaultValues: {
      name: "", // Will hold fullName
      email: "", // Will hold username
      role: "staff",
      password: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) { // Only reset form when dialog is opened
      if (user) {
        form.reset({
          name: user.fullName, // Map from UserType.fullName
          email: user.username, // Map from UserType.username
          role: user.role as "admin" | "staff", // Cast if UserType.role is string
          password: "",
        });
      } else {
        form.reset({
          name: "",
          email: "",
          role: "staff",
          password: "",
        });
      }
    }
  }, [user, form, isOpen]);

  const handleFormSubmit = async (values: z.infer<typeof currentFormSchema>) => {
    setIsSubmitting(true);
    // Map form values to UserType structure before calling onSubmit
    const submissionData: any = {
      fullName: values.name, // Map 'name' from form to 'fullName'
      username: values.email, // Map 'email' from form to 'username'
      role: values.role,
    };

    if (values.password) {
      submissionData.password = values.password;
    }

    if (isEditing && user) {
      submissionData.id = user.id;
      submissionData.createdAt = user.createdAt;
    }

    await onSubmit(submissionData);
    // onSubmit is expected to handle closing the dialog on success
    // and error display itself.
    setIsSubmitting(false);
    // Do not close dialog here; let parent handle it based on API response
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        form.reset({ name: "", email: "", role: "staff", password: "" }); // Reset form if dialog is closed
      }
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit User" : "Add New User"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the user's details." : "Fill in the details for the new user."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name" // This is for 'fullName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email" // This is for 'username'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username (Email)</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="user@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isEditing ? "New Password (optional)" : "Password"}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder={isEditing ? "Leave blank to keep current" : "••••••••"} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
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
                {isSubmitting ? (isEditing ? "Saving..." : "Adding...") : (isEditing ? "Save Changes" : "Add User")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
