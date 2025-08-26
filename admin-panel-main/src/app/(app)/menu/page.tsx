
"use client";

import * as React from "react";
import { BookOpenText, PlusCircle, Search, ListOrdered, Tag } from "lucide-react";
import type { MenuItem as MenuItemType, Category as CategoryType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/page-header";
import { MenuItemTable } from "./components/menu-item-table";
import { MenuItemFormDialog } from "./components/menu-item-form-dialog";
import { CategoryManagement } from "./components/category-management";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { debounce } from "@/lib/utils";
import axiosInstance from "@/lib/axiosInstance";

const ITEMS_PER_PAGE = 5;

export default function MenuPage() {
  const { toast } = useToast();

  // Menu Items State
  const [menuItems, setMenuItems] = React.useState<MenuItemType[]>([]);
  const [isLoadingItems, setIsLoadingItems] = React.useState(true);
  const [searchTermItems, setSearchTermItems] = React.useState("");
  const [currentPageItems, setCurrentPageItems] = React.useState(1);
  const [isItemFormOpen, setIsItemFormOpen] = React.useState(false);
  const [editingMenuItem, setEditingMenuItem] = React.useState<MenuItemType | null>(null);

  // Categories State
  const [categories, setCategories] = React.useState<CategoryType[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = React.useState(true);

  // Fetch Categories
  const fetchCategories = React.useCallback(async () => {
    setIsLoadingCategories(true);
    try {
      const response = await axiosInstance.get("/menu/categories");
      setCategories(response.data || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast({ title: "Error Fetching Categories", description: "Could not load category data.", variant: "destructive" });
      setCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  }, [toast]);

  // Fetch Menu Items
  const fetchMenuItems = React.useCallback(async () => {
    setIsLoadingItems(true);
    try {
      const params: any = {};
      if (searchTermItems) params.search = searchTermItems;
      // Add category filter if needed: params.category = selectedCategoryId;
      const response = await axiosInstance.get("/menu/items", { params });
      const itemsWithCategoryNames = (response.data || []).map((item: MenuItemType) => ({
        ...item,
        categoryName: categories.find(c => c.id === item.categoryId)?.name || "Uncategorized",
      }));
      setMenuItems(itemsWithCategoryNames);
    } catch (error) {
      console.error("Failed to fetch menu items:", error);
      toast({ title: "Error Fetching Menu Items", description: "Could not load menu item data.", variant: "destructive" });
      setMenuItems([]);
    } finally {
      setIsLoadingItems(false);
    }
  }, [toast, searchTermItems, categories]); // Add categories to dependency array

  React.useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  React.useEffect(() => {
    if (categories.length > 0 || !isLoadingCategories) { // Fetch items once categories are loaded or attempt failed
      fetchMenuItems();
    }
  }, [fetchMenuItems, categories, isLoadingCategories]);

  const debouncedItemsSearch = React.useCallback(debounce((term: string) => {
    setSearchTermItems(term);
    setCurrentPageItems(1);
  }, 300), []);

  // Client-side filtering for menu items (if API search is not sufficient or for combined filtering)
  const filteredMenuItems = React.useMemo(() => {
    // API search handles basic term matching. Further client-side filtering can be added here if needed.
    return menuItems;
  }, [menuItems]);

  const paginatedMenuItems = React.useMemo(() => {
    const startIndex = (currentPageItems - 1) * ITEMS_PER_PAGE;
    return filteredMenuItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredMenuItems, currentPageItems]);

  const totalPagesItems = Math.ceil(filteredMenuItems.length / ITEMS_PER_PAGE);

  const handleAddMenuItem = () => {
    if (categories.length === 0) {
      toast({ title: "No Categories", description: "Please add a category before adding menu items.", variant: "destructive" });
      return;
    }
    setEditingMenuItem(null);
    setIsItemFormOpen(true);
  };

  const handleEditMenuItem = (id: string) => {
    const itemToEdit = menuItems.find(item => item.id === id);
    if (itemToEdit) {
      setEditingMenuItem(itemToEdit);
      setIsItemFormOpen(true);
    }
  };

  const handleSubmitMenuItemForm = async (formData: any) => {
    const params = new URLSearchParams();
    Object.keys(formData).forEach(key => {
      if (key !== 'id' && formData[key] !== undefined && formData[key] !== null) {
        params.append(key, formData[key]);
      }
    });

    try {
      if (formData.id) { // Editing existing item
        await axiosInstance.patch(`/menu/items/${formData.id}`, params, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        toast({ title: "Menu Item Updated", description: `Item ${formData.title} has been updated.` });
      } else { // Adding new item
        await axiosInstance.post("/menu/items", params, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        toast({ title: "Menu Item Added", description: `Item ${formData.title} has been added.` });
      }
      setIsItemFormOpen(false);
      setEditingMenuItem(null);
      fetchMenuItems();
    } catch (error: any) {
      const apiError = error.response?.data?.message || "An error occurred while saving the menu item.";
      toast({ title: "Error", description: apiError, variant: "destructive" });
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    try {
      await axiosInstance.delete(`/menu/items/${id}`);
      toast({ title: "Menu Item Deleted", description: "The item has been deleted from the menu." });
      fetchMenuItems();
    } catch (error: any) {
      const apiError = error.response?.data?.message || "Could not delete the menu item.";
      toast({ title: "Error Deleting Item", description: apiError, variant: "destructive" });
    }
  };

  // Category CRUD operations
  const handleAddCategory = async (categoryData: any) => {
    const params = new URLSearchParams();
    Object.keys(categoryData).forEach(key => params.append(key, categoryData[key]));
    try {
      await axiosInstance.post("/menu/categories", params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      toast({ title: "Category Added", description: `Category ${categoryData.name} has been added.` });
      fetchCategories();
    } catch (error: any) {
      const apiError = error.response?.data?.message || "Could not add category.";
      toast({ title: "Error Adding Category", description: apiError, variant: "destructive" });
    }
  };

  const handleUpdateCategory = async (categoryData: any) => {
    const params = new URLSearchParams();
    Object.keys(categoryData).forEach(key => {
      if (key !== 'id') params.append(key, categoryData[key]);
    });
    try {
      await axiosInstance.patch(`/menu/categories/${categoryData.id}`, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      toast({ title: "Category Updated", description: `Category ${categoryData.name} has been updated.` });
      fetchCategories(); // Also refetch menu items if category names changed
      fetchMenuItems();
    } catch (error: any) {
      const apiError = error.response?.data?.message || "Could not update category.";
      toast({ title: "Error Updating Category", description: apiError, variant: "destructive" });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const isInUse = menuItems.some(item => item.categoryId === categoryId);
    if (isInUse) {
      toast({ title: "Cannot Delete Category", description: "This category is assigned to menu items. Please reassign or delete them first.", variant: "destructive" });
      return;
    }
    try {
      await axiosInstance.delete(`/menu/categories/${categoryId}`);
      toast({ title: "Category Deleted", description: "The category has been deleted." });
      fetchCategories();
    } catch (error: any) {
      const apiError = error.response?.data?.message || "Could not delete category.";
      toast({ title: "Error Deleting Category", description: apiError, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Menu Management" description="Manage menu items and categories.">
        <Button onClick={handleAddMenuItem}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Menu Item
        </Button>
      </PageHeader>

      <Tabs defaultValue="items" className="space-y-4">
        <TabsList>
          <TabsTrigger value="items"><ListOrdered className="mr-2 h-4 w-4" />Menu Items</TabsTrigger>
          <TabsTrigger value="categories"><Tag className="mr-2 h-4 w-4" />Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search menu items (title, description)..."
                className="pl-10"
                onChange={(e) => debouncedItemsSearch(e.target.value)}
              />
            </div>
          </div>

          <MenuItemTable
            menuItems={paginatedMenuItems}
            onEdit={handleEditMenuItem}
            onDelete={handleDeleteMenuItem}
            isLoading={isLoadingItems && menuItems.length === 0}
          />
          {menuItems.length > 0 && totalPagesItems > 0 && (
            <DataTablePagination
              currentPage={currentPageItems}
              totalPages={totalPagesItems}
              onPageChange={setCurrentPageItems}
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={filteredMenuItems.length}
            />
          )}
          {menuItems.length > 0 && filteredMenuItems.length === 0 && !isLoadingItems && (
            <p className="text-center text-muted-foreground py-4">No menu items found matching your search criteria.</p>
          )}
          {menuItems.length === 0 && !isLoadingItems && (
            <div className="text-center py-10">
              <BookOpenText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium text-foreground">No menu items yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {categories.length === 0 ? "Please add a category first." : "Get started by adding a new menu item."}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories">
          <CategoryManagement
            categories={categories}
            onAddCategory={handleAddCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
            isLoading={isLoadingCategories && categories.length === 0}
          />
        </TabsContent>
      </Tabs>

      <MenuItemFormDialog
        isOpen={isItemFormOpen}
        onOpenChange={(isOpen) => {
          setIsItemFormOpen(isOpen);
          if (!isOpen) setEditingMenuItem(null);
        }}
        onSubmit={handleSubmitMenuItemForm}
        menuItem={editingMenuItem}
        categories={categories}
      />
    </div>
  );
}
