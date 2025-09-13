// src/app/(app)/menu/page.tsx
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
import { useRestaurant } from "@/contexts/restaurant-context";

const ITEMS_PER_PAGE = 5;

export default function MenuPage() {
  const { toast } = useToast();
  const { currentRestaurant } = useRestaurant();

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
    if (!currentRestaurant) {
      setCategories([]);
      setIsLoadingCategories(false);
      return;
    }

    setIsLoadingCategories(true);
    try {
      const response = await axiosInstance.get("/menu/categories", {
        params: { restaurantId: currentRestaurant.id }
      });
      setCategories(response.data || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast({ title: "خطا در بارگیری دسته‌بندی‌ها", description: "نمی‌توان اطلاعات دسته‌بندی‌ها را دریافت کرد.", variant: "destructive" });
      setCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  }, [toast, currentRestaurant]);

  // Fetch Menu Items
  const fetchMenuItems = React.useCallback(async () => {
    if (!currentRestaurant) {
      setMenuItems([]);
      setIsLoadingItems(false);
      return;
    }

    setIsLoadingItems(true);
    try {
      const params: any = { restaurantId: currentRestaurant.id };
      if (searchTermItems) params.search = searchTermItems;
      const response = await axiosInstance.get("/menu/items", { params });
      const itemsWithCategoryNames = (response.data || []).map((item: MenuItemType) => ({
        ...item,
        categoryName: categories.find(c => c.id === item.categoryId)?.name || "Uncategorized",
      }));
      setMenuItems(itemsWithCategoryNames);
    } catch (error) {
      console.error("Failed to fetch menu items:", error);
      toast({ title: "خطا در بارگیری آیتم‌های منو", description: "نمی‌توان اطلاعات آیتم‌های منو را دریافت کرد.", variant: "destructive" });
      setMenuItems([]);
    } finally {
      setIsLoadingItems(false);
    }
  }, [toast, searchTermItems, categories, currentRestaurant]);

  React.useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  React.useEffect(() => {
    if (categories.length > 0 || !isLoadingCategories) {
      fetchMenuItems();
    }
  }, [fetchMenuItems, categories, isLoadingCategories]);

  const debouncedItemsSearch = React.useCallback(debounce((term: string) => {
    setSearchTermItems(term);
    setCurrentPageItems(1);
  }, 300), []);

  const filteredMenuItems = React.useMemo(() => {
    return menuItems;
  }, [menuItems]);

  const paginatedMenuItems = React.useMemo(() => {
    const startIndex = (currentPageItems - 1) * ITEMS_PER_PAGE;
    return filteredMenuItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredMenuItems, currentPageItems]);

  const totalPagesItems = Math.ceil(filteredMenuItems.length / ITEMS_PER_PAGE);

  const handleAddMenuItem = () => {
    if (!currentRestaurant) {
      toast({ title: "رستوران انتخاب نشده", description: "لطفاً ابتدا یک رستوران انتخاب کنید.", variant: "destructive" });
      return;
    }
    if (categories.length === 0) {
      toast({ title: "دسته‌بندی وجود ندارد", description: "لطفاً ابتدا یک دسته‌بندی اضافه کنید.", variant: "destructive" });
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
    if (!currentRestaurant) {
      toast({ title: "خطا", description: "رستوران فعلی یافت نشد.", variant: "destructive" });
      return;
    }

    const params = new URLSearchParams();
    Object.keys(formData).forEach(key => {
      if (key !== 'id' && formData[key] !== undefined && formData[key] !== null) {
        params.append(key, formData[key]);
      }
    });
    params.append('restaurantId', currentRestaurant.id);

    try {
      if (formData.id) {
        await axiosInstance.patch(`/menu/items/${formData.id}`, params, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        toast({ title: "آیتم منو بروزرسانی شد", description: `آیتم ${formData.title} بروزرسانی شد.` });
      } else {
        await axiosInstance.post("/menu/items", params, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        toast({ title: "آیتم منو اضافه شد", description: `آیتم ${formData.title} اضافه شد.` });
      }
      setIsItemFormOpen(false);
      setEditingMenuItem(null);
      fetchMenuItems();
    } catch (error: any) {
      const apiError = error.response?.data?.message || "خطایی در ذخیره آیتم منو رخ داد.";
      toast({ title: "خطا", description: apiError, variant: "destructive" });
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    try {
      await axiosInstance.delete(`/menu/items/${id}`);
      toast({ title: "آیتم منو حذف شد", description: "آیتم از منو حذف شد." });
      fetchMenuItems();
    } catch (error: any) {
      const apiError = error.response?.data?.message || "نمی‌توان آیتم منو را حذف کرد.";
      toast({ title: "خطا در حذف آیتم", description: apiError, variant: "destructive" });
    }
  };

  // Category CRUD operations
  const handleAddCategory = async (categoryData: any) => {
    if (!currentRestaurant) {
      toast({ title: "خطا", description: "رستوران فعلی یافت نشد.", variant: "destructive" });
      return;
    }

    const params = new URLSearchParams();
    Object.keys(categoryData).forEach(key => params.append(key, categoryData[key]));
    params.append('restaurantId', currentRestaurant.id);

    try {
      await axiosInstance.post("/menu/categories", params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      toast({ title: "دسته‌بندی اضافه شد", description: `دسته‌بندی ${categoryData.name} اضافه شد.` });
      fetchCategories();
    } catch (error: any) {
      const apiError = error.response?.data?.message || "نمی‌توان دسته‌بندی را اضافه کرد.";
      toast({ title: "خطا در افزودن دسته‌بندی", description: apiError, variant: "destructive" });
    }
  };

  const handleUpdateCategory = async (categoryData: any) => {
    const params = new URLSearchParams();
    Object.keys(categoryData).forEach(key => {
      if (key !== 'id') params.append(key, categoryData[key]);
    });
    if (currentRestaurant) {
      params.append('restaurantId', currentRestaurant.id);
    }

    try {
      await axiosInstance.patch(`/menu/categories/${categoryData.id}`, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      toast({ title: "دسته‌بندی بروزرسانی شد", description: `دسته‌بندی ${categoryData.name} بروزرسانی شد.` });
      fetchCategories();
      fetchMenuItems();
    } catch (error: any) {
      const apiError = error.response?.data?.message || "نمی‌توان دسته‌بندی را بروزرسانی کرد.";
      toast({ title: "خطا در بروزرسانی دسته‌بندی", description: apiError, variant: "destructive" });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const isInUse = menuItems.some(item => item.categoryId === categoryId);
    if (isInUse) {
      toast({ title: "نمی‌توان دسته‌بندی را حذف کرد", description: "این دسته‌بندی به آیتم‌های منو اختصاص داده شده. لطفاً ابتدا آنها را تغییر دهید یا حذف کنید.", variant: "destructive" });
      return;
    }
    try {
      await axiosInstance.delete(`/menu/categories/${categoryId}`);
      toast({ title: "دسته‌بندی حذف شد", description: "دسته‌بندی حذف شد." });
      fetchCategories();
    } catch (error: any) {
      const apiError = error.response?.data?.message || "نمی‌توان دسته‌بندی را حذف کرد.";
      toast({ title: "خطا در حذف دسته‌بندی", description: apiError, variant: "destructive" });
    }
  };

  if (!currentRestaurant) {
    return (
      <div className="space-y-6">
        <PageHeader title="مدیریت منو" description="مدیریت آیتم‌های منو و دسته‌بندی‌ها." />
        <div className="text-center py-10">
          <BookOpenText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-medium text-foreground">رستورانی انتخاب نشده</h3>
          <p className="mt-1 text-sm text-muted-foreground">برای مدیریت منو، لطفاً ابتدا یک رستوران انتخاب کنید.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="مدیریت منو" description={`مدیریت منوی رستوران ${currentRestaurant.name}`}>
        <Button onClick={handleAddMenuItem}>
          <PlusCircle className="mr-2 h-4 w-4" />
          افزودن آیتم منو
        </Button>
      </PageHeader>

      <Tabs defaultValue="items" className="space-y-4">
        <TabsList>
          <TabsTrigger value="items"><ListOrdered className="mr-2 h-4 w-4" />آیتم‌های منو</TabsTrigger>
          <TabsTrigger value="categories"><Tag className="mr-2 h-4 w-4" />دسته‌بندی‌ها</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="جستجو آیتم‌های منو (عنوان، توضیحات)..."
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
            <p className="text-center text-muted-foreground py-4">هیچ آیتم منویی با معیارهای جستجو شما یافت نشد.</p>
          )}
          {menuItems.length === 0 && !isLoadingItems && (
            <div className="text-center py-10">
              <BookOpenText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium text-foreground">هنوز آیتم منویی وجود ندارد</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {categories.length === 0 ? "لطفاً ابتدا یک دسته‌بندی اضافه کنید." : "با افزودن آیتم منو جدید شروع کنید."}
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