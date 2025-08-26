
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
import { debounce, generateMockId } from "@/lib/utils"; // generateMockId only for FE-only IDs if needed before save
import axiosInstance from "@/lib/axiosInstance";

const ITEMS_PER_PAGE = 5;

export default function TablesPage() {
  const { toast } = useToast();
  const [allTables, setAllTables] = React.useState<TableType[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingTable, setEditingTable] = React.useState<TableType | null>(null);

  const [searchTerm, setSearchTerm] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);

  const fetchTables = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get("/tables");
      setAllTables(response.data || []);
    } catch (error) {
      console.error("Failed to fetch tables:", error);
      toast({
        title: "Error Fetching Tables",
        description: "Could not load table data from the server.",
        variant: "destructive",
      });
      setAllTables([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

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
    // API for tables expects: { name, description, capacity, photo }
    // 'status' is not part of the API POST/PATCH body for tables.
    const payload = {
      name: formData.name,
      description: formData.description,
      capacity: formData.capacity,
      photo: formData.photo,
    };

    try {
      if ('id' in formData && formData.id) { // Editing
        await axiosInstance.patch(`/tables/${formData.id}`, payload);
        toast({ title: "Table Updated", description: `Table ${payload.name} has been updated.` });
      } else { // Adding
        await axiosInstance.post("/tables", payload);
        toast({ title: "Table Added", description: `Table ${payload.name} has been added.` });
      }
      setIsFormOpen(false);
      setEditingTable(null);
      fetchTables(); // Refresh table list
    } catch (error: any) {
      const apiError = error.response?.data?.message || "An error occurred while saving the table.";
      toast({ title: "Error", description: apiError, variant: "destructive" });
      console.error("Submit table error:", error.response?.data || error.message);
    }
  };

  const handleDeleteTable = async (id: string) => {
    try {
      await axiosInstance.delete(`/tables/${id}`);
      toast({ title: "Table Deleted", description: "The table has been successfully deleted." });
      fetchTables(); // Refresh table list
    } catch (error) {
      toast({ title: "Error Deleting Table", description: "Could not delete the table.", variant: "destructive" });
    }
  };


  return (
    <div className="space-y-6">
      <PageHeader title="Table Management" description="Manage all restaurant tables.">
        <Button onClick={handleAddTable}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Table
        </Button>
      </PageHeader>

      <div className="flex items-center justify-between gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tables (name, description)..."
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
        <p className="text-center text-muted-foreground py-4">No tables found matching your search criteria.</p>
      )}
      {allTables.length === 0 && !isLoading && (
        <div className="text-center py-10">
          <Archive className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-medium text-foreground">No tables yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Get started by adding a new table.</p>
          <div className="mt-6">
            <Button onClick={handleAddTable}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Table
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
