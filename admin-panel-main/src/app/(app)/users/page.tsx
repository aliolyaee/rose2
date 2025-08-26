
"use client";

import * as React from "react";
import { User as UserIconLucide, PlusCircle, Search } from "lucide-react";
import type { User as UserType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/page-header";
import { UserTable } from "./components/user-table";
import { UserFormDialog } from "./components/user-form-dialog";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { useToast } from "@/hooks/use-toast";
import { debounce } from "@/lib/utils";
import axiosInstance from "@/lib/axiosInstance";

const ITEMS_PER_PAGE = 5;

export default function UsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = React.useState<UserType[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<UserType | null>(null);

  const [searchTerm, setSearchTerm] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);

  const fetchUsers = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get("/admin/users");
      setUsers(response.data || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast({
        title: "Error Fetching Users",
        description: "Could not load user data from the server.",
        variant: "destructive",
      });
      setUsers([]); // Set to empty array on error
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const debouncedSearch = React.useCallback(debounce((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page on search
  }, 300), []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(event.target.value);
  };

  const filteredUsers = React.useMemo(() => {
    if (!searchTerm) return users;
    return users.filter(user =>
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const paginatedUsers = React.useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

  const handleAddUser = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleEditUser = (id: string) => {
    const userToEdit = users.find(user => user.id === id);
    if (userToEdit) {
      setEditingUser(userToEdit);
      setIsFormOpen(true);
    }
  };

  const handleSubmitForm = async (userData: Omit<UserType, 'id' | 'createdAt'> | UserType) => {
    const formData = new FormData();
    // The UserFormDialog uses 'name' for fullName and 'email' for username.
    // The API expects 'fullName' and 'username'.
    formData.append('fullName', (userData as any).name || userData.fullName);
    formData.append('username', (userData as any).email || userData.username);
    formData.append('role', userData.role);

    if (userData.password) {
      formData.append('password', userData.password);
      // API requires confirm_password for new user, and if password is being changed
      formData.append('confirm_password', userData.password);
    }

    try {
      if ('id' in userData && userData.id) { // Editing existing user
        // If password is not provided during edit, don't include it in FormData.
        // The API PATCH is optional for password.
        if (!userData.password) {
          formData.delete('password');
          formData.delete('confirm_password');
        }
        await axiosInstance.patch(`/admin/users/${userData.id}`, formData);
        toast({ title: "User Updated", description: `User ${formData.get('fullName')} has been updated.` });
      } else { // Adding new user
        if (!userData.password) { // Password is required for new user as per schema in UserFormDialog
          toast({ title: "Validation Error", description: "Password is required for new users.", variant: "destructive" });
          return;
        }
        await axiosInstance.post("/admin/users", formData);
        toast({ title: "User Added", description: `User ${formData.get('fullName')} has been added.` });
      }
      setIsFormOpen(false);
      setEditingUser(null);
      fetchUsers(); // Refresh user list
    } catch (error: any) {
      const apiError = error.response?.data?.message || "An error occurred while saving the user.";
      toast({ title: "Error", description: apiError, variant: "destructive" });
      console.error("Submit user error:", error.response?.data || error.message);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await axiosInstance.delete(`/admin/users/${id}`);
      toast({ title: "User Deleted", description: "The user has been successfully deleted." });
      fetchUsers(); // Refresh user list
    } catch (error) {
      toast({ title: "Error Deleting User", description: "Could not delete the user.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="User Management" description="Manage all users in the system.">
        <Button onClick={handleAddUser}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </PageHeader>

      <div className="flex items-center justify-between gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users (name, email, role)..."
            className="pl-10"
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <UserTable
        users={paginatedUsers}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        isLoading={isLoading && users.length === 0} // Show table skeleton only on initial load
      />

      {users.length > 0 && totalPages > 0 && (
        <DataTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={ITEMS_PER_PAGE}
          totalItems={filteredUsers.length}
        />
      )}
      {users.length > 0 && filteredUsers.length === 0 && !isLoading && (
        <p className="text-center text-muted-foreground py-4">No users found matching your search criteria.</p>
      )}
      {users.length === 0 && !isLoading && (
        <div className="text-center py-10">
          <UserIconLucide className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-medium text-foreground">No users yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Get started by adding a new user.</p>
          <div className="mt-6">
            <Button onClick={handleAddUser}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>
      )}

      <UserFormDialog
        isOpen={isFormOpen}
        onOpenChange={(isOpen) => {
          setIsFormOpen(isOpen);
          if (!isOpen) setEditingUser(null); // Clear editing user when dialog closes
        }}
        onSubmit={handleSubmitForm}
        user={editingUser}
      />
    </div>
  );
}
