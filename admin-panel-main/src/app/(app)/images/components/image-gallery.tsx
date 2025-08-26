
"use client";

import * as React from "react";
import type { ManagedImage } from "@/types";
import NextImage from "next/image"; // Renamed to avoid conflict
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit3, Trash2, Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface ImageGalleryProps {
  images: ManagedImage[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export function ImageGallery({ images, onEdit, onDelete, isLoading }: ImageGalleryProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedImageId, setSelectedImageId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDeleteClick = (id: string) => {
    setSelectedImageId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedImageId) {
      setIsDeleting(true);
      await onDelete(selectedImageId);
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setSelectedImageId(null);
    }
  };

  if (isLoading && images.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="overflow-hidden shadow-sm">
            <Skeleton className="aspect-[4/3] w-full" />
            <CardContent className="p-3 space-y-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </CardContent>
            <CardFooter className="p-3 pt-0 flex justify-end">
              <Skeleton className="h-8 w-8 rounded-md" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <Card key={image.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group">
            <div className="aspect-[4/3] w-full relative bg-muted overflow-hidden">
              <NextImage
                src={image.image} // Use image.image (API field)
                alt={image.alt || image.name || "Managed image"}
                layout="fill"
                objectFit="cover"
                className="group-hover:scale-105 transition-transform duration-300"
                data-ai-hint="gallery photo"
              />
            </div>
            <CardContent className="p-3">
              <p className="text-sm font-medium truncate" title={image.name || image.alt}>
                {image.name || image.alt || "Untitled Image"}
              </p>
              {image.uploadedAt && (
                <p className="text-xs text-muted-foreground">
                  Uploaded: {formatDate(image.uploadedAt, 'MMM d, yyyy')}
                </p>
              )}
            </CardContent>
            <CardFooter className="p-3 pt-0 flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Image options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(image.id)}>
                    <Edit3 className="mr-2 h-4 w-4" />
                    Edit Info
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href={image.image} target="_blank" rel="noopener noreferrer" download={image.name}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDeleteClick(image.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardFooter>
          </Card>
        ))}
      </div>
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        itemName="image"
        isLoading={isDeleting}
      />
    </>
  );
}
