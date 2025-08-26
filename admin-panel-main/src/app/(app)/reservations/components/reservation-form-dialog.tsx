
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatDate as formatDateUtil } from "@/lib/utils"; // Renamed to avoid conflict
import type { Reservation, Table as TableType } from "@/types";
import { CalendarIcon } from "lucide-react";
import { format } from 'date-fns';

interface ReservationFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: any) => Promise<void>; // Adjusted for flexibility in payload
  reservation?: Reservation | null;
  tables: Pick<TableType, 'id' | 'name' | 'capacity'>[];
}

const formSchema = z.object({
  customerName: z.string().min(2, { message: "Customer name must be at least 2 characters." }),
  customerPhone: z.string().min(7, { message: "Phone number seems too short." }),
  tableId: z.string().min(1, { message: "Please select a table." }),
  dateTime: z.date({ required_error: "Reservation date and time are required." }),
  duration: z.coerce.number().min(30, { message: "Duration must be at least 30 minutes." }).max(360, { message: "Duration cannot exceed 360 minutes." }),
  guests: z.coerce.number().min(1, { message: "Number of guests must be at least 1." }),
  notes: z.string().optional(),
  // Status removed as it's not settable via API create/update
});

export function ReservationFormDialog({ isOpen, onOpenChange, onSubmit, reservation, tables }: ReservationFormDialogProps) {
  const isEditing = !!reservation;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      tableId: "",
      dateTime: new Date(),
      duration: 120, // Default to 2 hours (120 minutes)
      guests: 1,
      notes: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (reservation) {
      form.reset({
        customerName: reservation.customerName || "", // API might not have this field directly
        customerPhone: reservation.phone, // API has 'phone'
        tableId: reservation.tableId,
        dateTime: reservation.dateTime ? new Date(reservation.dateTime as string) : new Date(`${reservation.date}T${reservation.hour}`),
        duration: reservation.duration,
        guests: reservation.people, // API has 'people'
        notes: reservation.description || "", // API has 'description'
      });
    } else {
      const nextHour = new Date();
      nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
      form.reset({
        customerName: "",
        customerPhone: "",
        tableId: "",
        dateTime: nextHour,
        duration: 120,
        guests: 1,
        notes: "",
      });
    }
  }, [reservation, form, isOpen]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);

    const apiPayload = {
      tableId: values.tableId,
      date: format(values.dateTime, "yyyy-MM-dd"),
      hour: format(values.dateTime, "HH:mm"),
      duration: values.duration,
      people: values.guests,
      phone: values.customerPhone,
      description: values.notes ? `${values.notes}. Customer: ${values.customerName}` : `Customer: ${values.customerName}`,
    };

    let submissionData: any = apiPayload;

    if (isEditing && reservation) {
      submissionData = { ...apiPayload, id: reservation.id }; // For PATCH, include id
    }

    await onSubmit(submissionData); // onSubmit will decide POST or PATCH
    setIsSubmitting(false);
    // onOpenChange(false) // Parent will handle closing
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && !isSubmitting) {
        form.reset();
      }
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Reservation" : "Add New Reservation"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the reservation details." : "Fill in the details for the new reservation."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3 py-2 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="555-123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="dateTime"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date & Time</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              formatDateUtil(field.value.toISOString(), "PPPp")
                            ) : (
                              <span>Pick a date and time</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            const newDateTime = date || new Date();
                            if (field.value) {
                              newDateTime.setHours(field.value.getHours());
                              newDateTime.setMinutes(field.value.getMinutes());
                            } else {
                              newDateTime.setHours(12, 0, 0, 0);
                            }
                            field.onChange(newDateTime);
                          }}
                          initialFocus
                        />
                        <div className="p-2 border-t">
                          <Input
                            type="time"
                            value={field.value ? `${String(field.value.getHours()).padStart(2, '0')}:${String(field.value.getMinutes()).padStart(2, '0')}` : "12:00"}
                            onChange={(e) => {
                              const [hours, minutes] = e.target.value.split(':').map(Number);
                              const newDate = field.value ? new Date(field.value) : new Date();
                              newDate.setHours(hours, minutes);
                              field.onChange(newDate);
                            }}
                            className="w-full"
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="guests" // maps to 'people' in API
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Guests</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" placeholder="e.g., 2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="tableId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Table</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a table" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tables.map(table => (
                          <SelectItem key={table.id} value={table.id}>
                            {table.name} (Capacity: {table.capacity})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duration" // API field 'duration'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" step="30" min="30" placeholder="e.g., 120" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes" // maps to 'description' in API (with customerName appended)
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Birthday celebration, dietary restrictions" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                {isSubmitting ? (isEditing ? "Saving..." : "Adding...") : (isEditing ? "Save Changes" : "Add Reservation")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

