// src/app/(app)/restaurants/page.tsx
"use client";

import * as React from "react";
import { Building, PlusCircle, Search } from "lucide-react";
import type { Restaurant } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/page-header";
import { RestaurantTable } from "./components/restaurant-table";
import { RestaurantFormDialog } from "./components/restaurant-form-dialog";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { useToast } from "@/hooks/use-toast";
import { debounce } from "@/lib/utils";
import axiosInstance from "@/lib/axiosInstance";
import { useRestaurant } from "@/contexts/restaurant-context";

const ITEMS_PER_PAGE = 5;

export default function RestaurantsPage() {
    const { toast } = useToast();
    const { refreshRestaurants } = useRestaurant();
    const [restaurants, setRestaurants] = React.useState<Restaurant[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [editingRestaurant, setEditingRestaurant] = React.useState<Restaurant | null>(null);

    const [searchTerm, setSearchTerm] = React.useState("");
    const [currentPage, setCurrentPage] = React.useState(1);

    const fetchRestaurants = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.get("/resturants");
            setRestaurants(response.data || []);
        } catch (error) {
            console.error("Failed to fetch restaurants:", error);
            toast({
                title: "خطا در بارگیری رستوران‌ها",
                description: "نمی‌توان اطلاعات رستوران‌ها را از سرور دریافت کرد.",
                variant: "destructive",
            });
            setRestaurants([]);
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    React.useEffect(() => {
        fetchRestaurants();
    }, [fetchRestaurants]);

    const debouncedSearch = React.useCallback(debounce((term: string) => {
        setSearchTerm(term);
        setCurrentPage(1);
    }, 300), []);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        debouncedSearch(event.target.value);
    };

    const filteredRestaurants = React.useMemo(() => {
        if (!searchTerm) return restaurants;
        return restaurants.filter(restaurant =>
            restaurant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            restaurant.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [restaurants, searchTerm]);

    const paginatedRestaurants = React.useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredRestaurants.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredRestaurants, currentPage]);

    const totalPages = Math.ceil(filteredRestaurants.length / ITEMS_PER_PAGE);

    const handleAddRestaurant = () => {
        setEditingRestaurant(null);
        setIsFormOpen(true);
    };

    const handleEditRestaurant = (id: string) => {
        const restaurantToEdit = restaurants.find(r => r.id === id);
        if (restaurantToEdit) {
            setEditingRestaurant(restaurantToEdit);
            setIsFormOpen(true);
        }
    };

    const handleSubmitForm = async (restaurantData: Omit<Restaurant, 'id' | 'createdAt'> | Restaurant) => {
        const payload = {
            name: restaurantData.name,
            description: restaurantData.description,
            tableIds: restaurantData.tableIds || [],
        };

        try {
            if ('id' in restaurantData && restaurantData.id) { // Editing
                await axiosInstance.patch(`/resturants/${restaurantData.id}`, payload);
                toast({ title: "رستوران بروزرسانی شد", description: `رستوران ${payload.name} بروزرسانی شد.` });
            } else { // Adding
                await axiosInstance.post("/resturants", payload);
                toast({ title: "رستوران اضافه شد", description: `رستوران ${payload.name} اضافه شد.` });
            }
            setIsFormOpen(false);
            setEditingRestaurant(null);
            fetchRestaurants(); // Refresh restaurant list
            refreshRestaurants(); // Refresh context
        } catch (error: any) {
            const apiError = error.response?.data?.message || "خطایی در ذخیره رستوران رخ داد.";
            toast({ title: "خطا", description: apiError, variant: "destructive" });
            console.error("Submit restaurant error:", error.response?.data || error.message);
        }
    };

    const handleDeleteRestaurant = async (id: string) => {
        try {
            await axiosInstance.delete(`/resturants/${id}`);
            toast({ title: "رستوران حذف شد", description: "رستوران با موفقیت حذف شد." });
            fetchRestaurants(); // Refresh restaurant list
            refreshRestaurants(); // Refresh context
        } catch (error: any) {
            const apiError = error.response?.data?.message || "نمی‌توان رستوران را حذف کرد.";
            toast({ title: "خطا در حذف رستوران", description: apiError, variant: "destructive" });
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader title="مدیریت رستوران‌ها" description="مدیریت تمامی رستوران‌های سیستم.">
                <Button onClick={handleAddRestaurant}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    افزودن رستوران
                </Button>
            </PageHeader>

            <div className="flex items-center justify-between gap-2">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="جستجو رستوران‌ها (نام، توضیحات)..."
                        className="pl-10"
                        onChange={handleSearchChange}
                    />
                </div>
            </div>

            <RestaurantTable
                restaurants={paginatedRestaurants}
                onEdit={handleEditRestaurant}
                onDelete={handleDeleteRestaurant}
                isLoading={isLoading && restaurants.length === 0}
            />

            {restaurants.length > 0 && totalPages > 0 && (
                <DataTablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={ITEMS_PER_PAGE}
                    totalItems={filteredRestaurants.length}
                />
            )}
            {restaurants.length > 0 && filteredRestaurants.length === 0 && !isLoading && (
                <p className="text-center text-muted-foreground py-4">هیچ رستورانی با معیارهای جستجو شما یافت نشد.</p>
            )}
            {restaurants.length === 0 && !isLoading && (
                <div className="text-center py-10">
                    <Building className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium text-foreground">هنوز رستورانی وجود ندارد</h3>
                    <p className="mt-1 text-sm text-muted-foreground">با افزودن رستوران جدید شروع کنید.</p>
                    <div className="mt-6">
                        <Button onClick={handleAddRestaurant}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            افزودن رستوران
                        </Button>
                    </div>
                </div>
            )}

            <RestaurantFormDialog
                isOpen={isFormOpen}
                onOpenChange={(isOpen: boolean | ((prevState: boolean) => boolean)) => {
                    setIsFormOpen(isOpen);
                    if (!isOpen) setEditingRestaurant(null);
                }}
                onSubmit={handleSubmitForm}
                restaurant={editingRestaurant}
            />
        </div>
    );
}