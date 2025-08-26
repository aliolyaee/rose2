
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
import type { ManagedImage } from "@/types";
import NextImage from "next/image"; // To preview image

interface ImageFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: Omit<ManagedImage, 'id' | 'uploadedAt'> | ManagedImage) => Promise<void>;
  image?: ManagedImage | null;
}

// Schema based on API: name, alt (optional), image (URL)
const formSchema = z.object({
  image: z.string().url({ message: "Please enter a valid image URL." }),
  alt: z.string().min(2, { message: "Alt text must be at least 2 characters." }).optional().or(z.literal('')),
  name: z.string().min(1, { message: "Name/Filename is required." }),
});

type ImageFormValues = z.infer<typeof formSchema>;

export function ImageFormDialog({ isOpen, onOpenChange, onSubmit, image }: ImageFormDialogProps) {
  const isEditing = !!image;

  const form = useForm<ImageFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      image: "",
      alt: "",
      name: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const imageUrlPreview = form.watch("image"); // For live preview

  React.useEffect(() => {
    if (isOpen) { // Reset form when dialog opens or image data changes
      if (image) {
        form.reset({
          image: image.image,
          alt: image.alt || "",
          name: image.name || "",
        });
      } else {
        form.reset({
          image: "",
          alt: "",
          name: "",
        });
      }
    }
  }, [image, form, isOpen]);

  const handleFormSubmit = async (values: ImageFormValues) => {
    setIsSubmitting(true);
    const submissionData: any = { ...values };
    if (isEditing && image) {
      submissionData.id = image.id;
      // uploadedAt is not sent for update
    }
    await onSubmit(submissionData);
    setIsSubmitting(false);
    // Parent (ImagesPage) will handle closing dialog
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && !isSubmitting) form.reset();
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Image Info" : "Add New Image"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the image's information." : "Provide the URL and details for the new image."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="image" // Maps to API 'image'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://example.com/image.jpg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {imageUrlPreview && (
              <div className="my-4 rounded-md border overflow-hidden aspect-video relative bg-muted">
                <NextImage src={imageUrlPreview} alt="Image preview" layout="fill" objectFit="contain" data-ai-hint="image preview" />
              </div>
            )}
            <FormField
              control={form.control}
              name="name" // Maps to API 'name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name / Filename</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., delicious-pasta.jpg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="alt" // Maps to API 'alt'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alt Text (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Descriptive text for accessibility" {...field} />
                  </FormControl>
                  <FormMessage />
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
                {isSubmitting ? (isEditing ? "Saving..." : "Adding...") : (isEditing ? "Save Changes" : "Add Image")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
