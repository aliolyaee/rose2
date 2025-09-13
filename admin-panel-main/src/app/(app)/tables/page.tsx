// src/app/(app)/tables/page.tsx
"use client";

import * as React from "react";
import { Archive, PlusCircle, Search } from "lucide-react";
import type { Table as TableType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/page-header";
import { TableManagementTable } from "./components/table-management-table";
import { TableFormDialog } from "./components/table-form-dialog";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { useToast } from "@/hooks/use-toast";
import { debounce } from "@/lib/utils";
import axiosInstance from "@/lib/axiosInstance";
import { useRestaurant } from "@/contexts/restaurant-context";

const ITEMS_PER_PAGE = 5;

export default function TablesPage() {
  const { toast } = useToast();
  const { currentRestaurant } = useRestaurant();
  const [allTables, setAllTables] = React.useState<TableType[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingTable, setEditingTable] = React.useState<TableType | null>(null);

  const [searchTerm, setSearchTerm] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);

  const fetchTables = React.useCallback(async () => {
    if (!currentRestaurant) {
      setAllTables([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosInstance.get("/tables", {
        params: { restaurantId: currentRestaurant.id }
      });
      setAllTables(response.data || []);
    } catch (error) {
      console.error("Failed to fetch tables:", error);
      toast({
        title: "خطا در بارگیری میزها",
        description: "نمی‌توان اطلاعات میزها را از سرور دریافت کرد.",
        variant: "destructive",
      });
      setAllTables([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast, currentRestaurant]);

  React.useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const debouncedSearch = React.useCallback(debounce((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  }, 300), []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(event.target.value);
  };

  const filteredTables = React.useMemo(() => {
    if (!searchTerm) return allTables;
    return allTables.filter(table =>
      table.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      table.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      table.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allTables, searchTerm]);

  const paginatedTables = React.useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTables.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredTables, currentPage]);

  const totalPages = Math.ceil(filteredTables.length / ITEMS_PER_PAGE);

  const handleAddTable = () => {
    if (!currentRestaurant) {
      toast({
        title: "رستوران انتخاب نشده",
        description: "لطفاً ابتدا یک رستوران انتخاب کنید.",
        variant: "destructive",
      });
      return;
    }
    setEditingTable(null);
    setIsFormOpen(true);
  };

  const handleEditTable = (id: string) => {
    const tableToEdit = allTables.find(t => t.id === id);
    if (tableToEdit) {
      setEditingTable(tableToEdit);
      setIsFormOpen(true);
    }
  };

  const handleSubmitForm = async (formData: Omit<TableType, 'id' | 'createdAt' | 'status'> | (TableType & { id: string })) => {
    if (!currentRestaurant) {
      toast({
        title: "خطا",
        description: "رستوران فعلی یافت نشد.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      capacity: formData.capacity,
      photo: formData.photo,
      restaurantId: currentRestaurant.id,
    };

    try {
      if ('id' in formData && formData.id) {
        await axiosInstance.patch(`/tables/${formData.id}`, payload);
        toast({ title: "میز بروزرسانی شد", description: `میز ${payload.name} بروزرسانی شد.` });
      } else {
        await axiosInstance.post("/tables", payload);
        toast({ title: "میز اضافه شد", description: `میز ${payload.name} اضافه شد.` });
      }
      setIsFormOpen(false);
      setEditingTable(null);
      fetchTables();
    } catch (error: any) {
      const apiError = error.response?.data?.message || "خطایی در ذخیره میز رخ داد.";
      toast({ title: "خطا", description: apiError, variant: "destructive" });
      console.error("Submit table error:", error.response?.data || error.message);
    }
  };

  const handleDeleteTable = async (id: string) => {
    try {
      await axiosInstance.delete(`/tables/${id}`);
      toast({ title: "میز حذف شد", description: "میز با موفقیت حذف شد." });
      fetchTables();
    } catch (error: any) {
      const apiError = error.response?.data?.message || "نمی‌توان میز را حذف کرد.";
      toast({ title: "خطا در حذف میز", description: apiError, variant: "destructive" });
    }
  };

  if (!currentRestaurant) {
    return (
      <div className="space-y-6">
        <PageHeader title="مدیریت میزها" description="مدیریت تمامی میزهای رستوران." />
        <div className="text-center py-10">
          <Archive className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-medium text-foreground">رستورانی انتخاب نشده</h3>
          <p className="mt-1 text-sm text-muted-foreground">برای مشاهده میزها، لطفاً ابتدا یک رستوران انتخاب کنید.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="مدیریت میزها" description={`مدیریت میزهای رستوران ${currentRestaurant.name}`}>
        <Button onClick={handleAddTable}>
          <PlusCircle className="mr-2 h-4 w-4" />
          افزودن میز
        </Button>
      </PageHeader>

      <div className="flex items-center justify-between gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="جستجو میزها (نام، توضیحات)..."
            className="pl-10"
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <TableManagementTable
        tables={paginatedTables}
        onEdit={handleEditTable}
        onDelete={handleDeleteTable}
        isLoading={isLoading && allTables.length === 0}
      />

      {allTables.length > 0 && totalPages > 0 && (
        <DataTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={ITEMS_PER_PAGE}
          totalItems={filteredTables.length}
        />
      )}
      {allTables.length > 0 && filteredTables.length === 0 && !isLoading && (
        <p className="text-center text-muted-foreground py-4">هیچ میزی با معیارهای جستجو شما یافت نشد.</p>
      )}
      {allTables.length === 0 && !isLoading && (
        <div className="text-center py-10">
          <Archive className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-medium text-foreground">هنوز میزی وجود ندارد</h3>
          <p className="mt-1 text-sm text-muted-foreground">با افزودن میز جدید شروع کنید.</p>
          <div className="mt-6">
            <Button onClick={handleAddTable}>
              <PlusCircle className="mr-2 h-4 w-4" />
              افزودن میز
            </Button>
          </div>
        </div>
      )}

      <TableFormDialog
        isOpen={isFormOpen}
        onOpenChange={(isOpen) => {
          setIsFormOpen(isOpen);
          if (!isOpen) setEditingTable(null);
        }}
        onSubmit={handleSubmitForm}
        table={editingTable}
      />
    </div>
  );
}