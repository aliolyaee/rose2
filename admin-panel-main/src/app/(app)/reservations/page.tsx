
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

const ITEMS_PER_PAGE = 5;

export default function ReservationsPage() {
  const { toast } = useToast();
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
    setIsLoading(true);
    try {
      // API params: search, createdBefore, createdAfter
      // Current filters: searchTerm (maps to search), filterDate (maps to createdAfter/Before), filterStatus (client-side)
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (filterDate) {
        // Assuming filterDate means we want reservations *on* that date
        // The API uses createdBefore/createdAfter, which implies creation timestamp.
        // If API means *reservation date*, then this needs to be adjusted.
        // For now, I'll assume filtering on reservation date via client-side, as API spec is for `created` timestamps.
        // params.createdAfter = format(filterDate, "yyyy-MM-dd'T'00:00:00");
        // params.createdBefore = format(filterDate, "yyyy-MM-dd'T'23:59:59");
      }

      const response = await axiosInstance.get("/reservations", { params });
      const reservationsWithDateTime = response.data.map((res: ReservationType) => ({
        ...res,
        // Ensure dateTime is a Date object for the form, combining API's date and hour
        dateTime: res.date && res.hour ? parseISO(`${res.date}T${res.hour}:00`) : new Date(),
      }));
      setAllReservations(reservationsWithDateTime || []);
    } catch (error) {
      console.error("Failed to fetch reservations:", error);
      toast({ title: "Error Fetching Reservations", description: "Could not load reservation data.", variant: "destructive" });
      setAllReservations([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast, searchTerm]); // Removed filterDate from deps for now

  const fetchTables = React.useCallback(async () => {
    try {
      const response = await axiosInstance.get("/tables");
      setAllTables(response.data.map((t: TableType) => ({ id: t.id, name: t.name, capacity: t.capacity })) || []);
    } catch (error) {
      console.error("Failed to fetch tables:", error);
      toast({ title: "Error Fetching Tables", description: "Could not load tables for the form.", variant: "destructive" });
    }
  }, [toast]);

  React.useEffect(() => {
    fetchReservations();
    fetchTables();
  }, [fetchReservations, fetchTables]);

  const debouncedSearch = React.useCallback(debounce((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset page on new search
    // fetchReservations will be called due to searchTerm dependency change
  }, 300), []);


  // Client-side filtering for status and exact date match, as API spec for date is on creation time
  const filteredReservations = React.useMemo(() => {
    return allReservations.filter(res => {
      const statusMatch = filterStatus === "all" || res.status === filterStatus;

      let dateMatch = true;
      if (filterDate && res.dateTime) {
        const reservationDate = res.dateTime instanceof Date ? res.dateTime : new Date(res.dateTime);
        dateMatch = reservationDate.toDateString() === filterDate.toDateString();
      } else if (filterDate && !res.dateTime) { // if filterDate is set but reservation has no dateTime
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
    // formData from dialog already has: tableId, date, hour, duration, people, phone, description
    // if editing, it also includes 'id'
    try {
      if (formData.id) { // Editing existing reservation (PATCH with JSON)
        const { id, ...payload } = formData; // API expects { tableId, date, hour, duration, people, phone, description }
        await axiosInstance.patch(`/reservations/${id}`, payload);
        toast({ title: "Reservation Updated", description: `Reservation for ${formData.phone} has been updated.` });
      } else { // Adding new reservation (POST with x-www-form-urlencoded)
        const params = new URLSearchParams();
        Object.keys(formData).forEach(key => params.append(key, formData[key]));
        await axiosInstance.post("/reservations/create", params, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        toast({ title: "Reservation Added", description: `Reservation for ${formData.phone} has been added.` });
      }
      setIsFormOpen(false);
      setEditingReservation(null);
      fetchReservations(); // Refresh list
    } catch (error: any) {
      const apiError = error.response?.data?.message || "An error occurred while saving the reservation.";
      toast({ title: "Error", description: apiError, variant: "destructive" });
      console.error("Submit reservation error:", error.response?.data || error.message);
    }
  };

  const handleDeleteReservation = async (id: string) => {
    try {
      await axiosInstance.delete(`/reservations/${id}`);
      toast({ title: "Reservation Deleted", description: "The reservation has been successfully deleted." });
      fetchReservations(); // Refresh list
    } catch (error: any) {
      const apiError = error.response?.data?.message || "Could not delete the reservation.";
      toast({ title: "Error Deleting Reservation", description: apiError, variant: "destructive" });
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Reservation Management" description="Manage all customer reservations.">
        <Button onClick={handleAddReservation}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Reservation
        </Button>
      </PageHeader>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 border rounded-lg shadow-sm bg-card">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by phone, description..."
            className="pl-10"
            onChange={(e) => debouncedSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={filterStatus} onValueChange={(value) => { setFilterStatus(value); setCurrentPage(1); }}>
            <SelectTrigger className="w-full md:w-[180px]">

              <SelectValue>
                <span>Filter by status</span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
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
                {filterDate ? formatDateUtil(filterDate.toISOString(), 'PPP') : <span>Filter by date</span>}
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
            <Button variant="ghost" onClick={() => { setFilterStatus('all'); setFilterDate(undefined); setCurrentPage(1); }}>Clear Filters</Button>
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
        <p className="text-center text-muted-foreground py-4">No reservations found matching your criteria.</p>
      )}
      {allReservations.length === 0 && !isLoading && (
        <div className="text-center py-10">
          <CalendarCheck className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-medium text-foreground">No reservations yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Get started by adding a new reservation.</p>
          <div className="mt-6">
            <Button onClick={handleAddReservation}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Reservation
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
