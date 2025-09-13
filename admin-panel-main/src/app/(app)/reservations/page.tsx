// src/app/(app)/reservations/page.tsx
"use client";

import * as React from "react";
import { CalendarCheck, PlusCircle, Search } from "lucide-react";
import type { Reservation as ReservationType, Table as TableType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/page-header";
import { ReservationTable } from "./components/reservation-table";
import { ReservationFormDialog } from "./components/reservation-form-dialog";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn, debounce, formatDate as formatDateUtil } from "@/lib/utils";
import axiosInstance from "@/lib/axiosInstance";
import { format, parseISO } from 'date-fns';
import { useRestaurant } from "@/contexts/restaurant-context";

const ITEMS_PER_PAGE = 5;

export default function ReservationsPage() {
  const { toast } = useToast();
  const { currentRestaurant } = useRestaurant();
  const [allReservations, setAllReservations] = React.useState<ReservationType[]>([]);
  const [allTables, setAllTables] = React.useState<Pick<TableType, 'id' | 'name' | 'capacity'>[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingReservation, setEditingReservation] = React.useState<ReservationType | null>(null);

  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState<string>("all");
  const [filterDate, setFilterDate] = React.useState<Date | undefined>(undefined);
  const [currentPage, setCurrentPage] = React.useState(1);

  const fetchReservations = React.useCallback(async () => {
    if (!currentRestaurant) {
      setAllReservations([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const params: any = { restaurantId: currentRestaurant.id };
      if (searchTerm) params.search = searchTerm;

      const response = await axiosInstance.get("/reservations", { params });
      const reservationsWithDateTime = response.data.map((res: ReservationType) => ({
        ...res,
        dateTime: res.date && res.hour ? parseISO(`${res.date}T${res.hour}:00`) : new Date(),
      }));
      setAllReservations(reservationsWithDateTime || []);
    } catch (error) {
      console.error("Failed to fetch reservations:", error);
      toast({ title: "خطا در بارگیری رزروها", description: "نمی‌توان اطلاعات رزرو را دریافت کرد.", variant: "destructive" });
      setAllReservations([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast, searchTerm, currentRestaurant]);

  const fetchTables = React.useCallback(async () => {
    if (!currentRestaurant) {
      setAllTables([]);
      return;
    }

    try {
      const response = await axiosInstance.get("/tables", {
        params: { restaurantId: currentRestaurant.id }
      });
      setAllTables(response.data.map((t: TableType) => ({ id: t.id, name: t.name, capacity: t.capacity })) || []);
    } catch (error) {
      console.error("Failed to fetch tables:", error);
      toast({ title: "خطا در بارگیری میزها", description: "نمی‌توان میزها را برای فرم دریافت کرد.", variant: "destructive" });
    }
  }, [toast, currentRestaurant]);

  React.useEffect(() => {
    fetchReservations();
    fetchTables();
  }, [fetchReservations, fetchTables]);

  const debouncedSearch = React.useCallback(debounce((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  }, 300), []);

  const filteredReservations = React.useMemo(() => {
    return allReservations.filter(res => {
      const statusMatch = filterStatus === "all" || res.status === filterStatus;

      let dateMatch = true;
      if (filterDate && res.dateTime) {
        const reservationDate = res.dateTime instanceof Date ? res.dateTime : new Date(res.dateTime);
        dateMatch = reservationDate.toDateString() === filterDate.toDateString();
      } else if (filterDate && !res.dateTime) {
        dateMatch = false;
      }

      return statusMatch && dateMatch;
    });
  }, [allReservations, filterStatus, filterDate]);

  const paginatedReservations = React.useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredReservations.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredReservations, currentPage]);

  const totalPages = Math.ceil(filteredReservations.length / ITEMS_PER_PAGE);

  const handleAddReservation = () => {
    if (!currentRestaurant) {
      toast({ title: "رستوران انتخاب نشده", description: "لطفاً ابتدا یک رستوران انتخاب کنید.", variant: "destructive" });
      return;
    }
    if (allTables.length === 0) {
      toast({ title: "میزی وجود ندارد", description: "لطفاً ابتدا میز اضافه کنید.", variant: "destructive" });
      return;
    }
    setEditingReservation(null);
    setIsFormOpen(true);
  };

  const handleEditReservation = (id: string) => {
    const reservationToEdit = allReservations.find(r => r.id === id);
    if (reservationToEdit) {
      setEditingReservation(reservationToEdit);
      setIsFormOpen(true);
    }
  };

  const handleSubmitForm = async (formData: any) => {
    if (!currentRestaurant) {
      toast({ title: "خطا", description: "رستوران فعلی یافت نشد.", variant: "destructive" });
      return;
    }

    const payloadWithRestaurant = {
      ...formData,
      restaurantId: currentRestaurant.id,
    };

    try {
      if (formData.id) {
        const { id, ...payload } = payloadWithRestaurant;
        await axiosInstance.patch(`/reservations/${id}`, payload);
        toast({ title: "رزرو بروزرسانی شد", description: `رزرو برای ${formData.phone} بروزرسانی شد.` });
      } else {
        const params = new URLSearchParams();
        Object.keys(payloadWithRestaurant).forEach(key => params.append(key, payloadWithRestaurant[key]));
        await axiosInstance.post("/reservations/create", params, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        toast({ title: "رزرو اضافه شد", description: `رزرو برای ${formData.phone} اضافه شد.` });
      }
      setIsFormOpen(false);
      setEditingReservation(null);
      fetchReservations();
    } catch (error: any) {
      const apiError = error.response?.data?.message || "خطایی در ذخیره رزرو رخ داد.";
      toast({ title: "خطا", description: apiError, variant: "destructive" });
      console.error("Submit reservation error:", error.response?.data || error.message);
    }
  };

  const handleDeleteReservation = async (id: string) => {
    try {
      await axiosInstance.delete(`/reservations/${id}`);
      toast({ title: "رزرو حذف شد", description: "رزرو با موفقیت حذف شد." });
      fetchReservations();
    } catch (error: any) {
      const apiError = error.response?.data?.message || "نمی‌توان رزرو را حذف کرد.";
      toast({ title: "خطا در حذف رزرو", description: apiError, variant: "destructive" });
    }
  }

  if (!currentRestaurant) {
    return (
      <div className="space-y-6">
        <PageHeader title="مدیریت رزروها" description="مدیریت تمامی رزروهای مشتریان." />
        <div className="text-center py-10">
          <CalendarCheck className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-medium text-foreground">رستورانی انتخاب نشده</h3>
          <p className="mt-1 text-sm text-muted-foreground">برای مشاهده رزروها، لطفاً ابتدا یک رستوران انتخاب کنید.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="مدیریت رزروها" description={`مدیریت رزروهای رستوران ${currentRestaurant.name}`}>
        <Button onClick={handleAddReservation}>
          <PlusCircle className="mr-2 h-4 w-4" />
          افزودن رزرو
        </Button>
      </PageHeader>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 border rounded-lg shadow-sm bg-card">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="جستجو بر اساس تلفن، توضیحات..."
            className="pl-10"
            onChange={(e) => debouncedSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={filterStatus} onValueChange={(value) => { setFilterStatus(value); setCurrentPage(1); }}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue>
                <span>فیلتر بر اساس وضعیت</span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه وضعیت‌ها</SelectItem>
              <SelectItem value="confirmed">تایید شده</SelectItem>
              <SelectItem value="pending">در انتظار</SelectItem>
              <SelectItem value="cancelled">لغو شده</SelectItem>
              <SelectItem value="completed">تکمیل شده</SelectItem>
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full md:w-[240px] justify-start text-left font-normal",
                  !filterDate && "text-muted-foreground"
                )}
              >
                <CalendarCheck className="mr-2 h-4 w-4" />
                {filterDate ? formatDateUtil(filterDate.toISOString(), 'PPP') : <span>فیلتر بر اساس تاریخ</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filterDate}
                onSelect={(date) => { setFilterDate(date); setCurrentPage(1); }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {(filterStatus !== 'all' || filterDate) && (
            <Button variant="ghost" onClick={() => { setFilterStatus('all'); setFilterDate(undefined); setCurrentPage(1); }}>پاک کردن فیلترها</Button>
          )}
        </div>
      </div>

      <ReservationTable
        reservations={paginatedReservations}
        onEdit={handleEditReservation}
        onDelete={handleDeleteReservation}
        isLoading={isLoading && allReservations.length === 0}
      />

      {allReservations.length > 0 && totalPages > 0 && (
        <DataTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={ITEMS_PER_PAGE}
          totalItems={filteredReservations.length}
        />
      )}
      {allReservations.length > 0 && filteredReservations.length === 0 && !isLoading && (
        <p className="text-center text-muted-foreground py-4">هیچ رزرویی با معیارهای شما یافت نشد.</p>
      )}
      {allReservations.length === 0 && !isLoading && (
        <div className="text-center py-10">
          <CalendarCheck className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-medium text-foreground">هنوز رزرویی وجود ندارد</h3>
          <p className="mt-1 text-sm text-muted-foreground">با افزودن رزرو جدید شروع کنید.</p>
          <div className="mt-6">
            <Button onClick={handleAddReservation}>
              <PlusCircle className="mr-2 h-4 w-4" />
              افزودن رزرو
            </Button>
          </div>
        </div>
      )}

      <ReservationFormDialog
        isOpen={isFormOpen}
        onOpenChange={(isOpen) => {
          setIsFormOpen(isOpen);
          if (!isOpen) setEditingReservation(null);
        }}
        onSubmit={handleSubmitForm}
        reservation={editingReservation}
        tables={allTables}
      />
    </div>
  );
}