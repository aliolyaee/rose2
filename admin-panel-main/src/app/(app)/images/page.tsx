
"use client";

import * as React from "react";
import { ImageIcon as ImageIconLucide, Search, UploadCloud } from "lucide-react";
import type { ManagedImage } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/page-header";
import { ImageGallery } from "./components/image-gallery";
import { ImageFormDialog } from "./components/image-form-dialog";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { useToast } from "@/hooks/use-toast";
import { debounce } from "@/lib/utils";
import axiosInstance from "@/lib/axiosInstance";

const ITEMS_PER_PAGE = 8;

export default function ImagesPage() {
  const { toast } = useToast();
  const [allImages, setAllImages] = React.useState<ManagedImage[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingImage, setEditingImage] = React.useState<ManagedImage | null>(null);

  const [searchTerm, setSearchTerm] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);

  const fetchImages = React.useCallback(async () => {
    setIsLoading(true);
    try {
      // API for GET /image does not specify search query params
      const response = await axiosInstance.get("/image");
      // setAllImages(response.data || []);
      setAllImages(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch images:", error);
      toast({ title: "Error Fetching Images", description: "Could not load image data.", variant: "destructive" });
      setAllImages([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const debouncedSearch = React.useCallback(debounce((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  }, 300), []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(event.target.value);
  };

  const filteredImages = React.useMemo(() => {
    if (!searchTerm) return allImages;
    return allImages.filter(image =>
      image.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.alt?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allImages, searchTerm]);

  const paginatedImages = React.useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredImages.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredImages, currentPage]);

  const totalPages = Math.ceil(filteredImages.length / ITEMS_PER_PAGE);

  const handleAddImage = () => {
    setEditingImage(null);
    setIsFormOpen(true);
  };

  const handleEditImage = (id: string) => {
    const imageToEdit = allImages.find(img => img.id === id);
    if (imageToEdit) {
      setEditingImage(imageToEdit);
      setIsFormOpen(true);
    }
  };

  const handleSubmitForm = async (imageData: Omit<ManagedImage, 'id' | 'uploadedAt'> | ManagedImage) => {
    // API requires: name, alt, image (URL). It's application/json.
    const payload = {
      name: imageData.name,
      alt: imageData.alt || '', // Ensure alt is string, even if empty
      image: imageData.image,
    };

    try {
      if ('id' in imageData && imageData.id) { // Editing
        await axiosInstance.patch(`/image/${imageData.id}`, payload);
        toast({ title: "Image Updated", description: `Image ${payload.name} has been updated.` });
      } else { // Adding
        await axiosInstance.post("/image", payload);
        toast({ title: "Image Added", description: `Image ${payload.name} has been added.` });
      }
      setIsFormOpen(false);
      setEditingImage(null);
      fetchImages();
    } catch (error: any) {
      const apiError = error.response?.data?.message || "An error occurred while saving the image.";
      toast({ title: "Error", description: apiError, variant: "destructive" });
      console.error("Submit image error:", error.response?.data || error.message);
    }
  };

  const handleDeleteImage = async (id: string) => {
    try {
      await axiosInstance.delete(`/image/${id}`);
      toast({ title: "Image Deleted", description: "The image has been successfully deleted." });
      fetchImages();
    } catch (error: any) {
      const apiError = error.response?.data?.message || "Could not delete the image.";
      toast({ title: "Error Deleting Image", description: apiError, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Image Management" description="Manage all images used in the system.">
        <Button onClick={handleAddImage}>
          <UploadCloud className="mr-2 h-4 w-4" />
          Add Image
        </Button>
      </PageHeader>

      <div className="flex items-center justify-between gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search images (name, alt text)..."
            className="pl-10"
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <ImageGallery
        images={paginatedImages}
        onEdit={handleEditImage}
        onDelete={handleDeleteImage}
        isLoading={isLoading && allImages.length === 0}
      />

      {allImages.length > 0 && totalPages > 0 && (
        <DataTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={ITEMS_PER_PAGE}
          totalItems={filteredImages.length}
        />
      )}
      {allImages.length > 0 && filteredImages.length === 0 && !isLoading && (
        <p className="text-center text-muted-foreground py-4">No images found matching your search criteria.</p>
      )}
      {allImages.length === 0 && !isLoading && (
        <div className="text-center py-10">
          <ImageIconLucide className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-medium text-foreground">No images yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Get started by adding a new image.</p>
          <div className="mt-6">
            <Button onClick={handleAddImage}>
              <UploadCloud className="mr-2 h-4 w-4" />
              Add Image
            </Button>
          </div>
        </div>
      )}

      <ImageFormDialog
        isOpen={isFormOpen}
        onOpenChange={(isOpen) => {
          setIsFormOpen(isOpen);
          if (!isOpen) setEditingImage(null);
        }}
        onSubmit={handleSubmitForm}
        image={editingImage}
      />
    </div>
  );
}
