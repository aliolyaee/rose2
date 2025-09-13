// src/app/(app)/restaurants/components/restaurant-form-dialog.tsx
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
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Restaurant, Table } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import axiosInstance from "@/lib/axiosInstance";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface RestaurantFormDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSubmit: (data: Omit<Restaurant, 'id' | 'createdAt'> | Restaurant) => Promise<void>;
    restaurant?: Restaurant | null;
}

const formSchema = z.object({
    name: z.string().min(1, { message: "نام رستوران الزامی است." }),
    description: z.string().optional(),
    tableIds: z.array(z.string()),
});

type RestaurantFormValues = z.infer<typeof formSchema>;

export function RestaurantFormDialog({ isOpen, onOpenChange, onSubmit, restaurant }: RestaurantFormDialogProps) {
    const { toast } = useToast();
    const isEditing = !!restaurant;
    const [availableTables, setAvailableTables] = React.useState<Table[]>([]);
    const [isLoadingTables, setIsLoadingTables] = React.useState(false);

    const form = useForm<RestaurantFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            tableIds: [],
        },
    });

    const [isSubmitting, setIsSubmitting] = React.useState(false);

    // فچ کردن میزهای موجود
    const fetchAvailableTables = React.useCallback(async () => {
        setIsLoadingTables(true);
        try {
            const response = await axiosInstance.get("/tables");
            setAvailableTables(response.data || []);
        } catch (error) {
            console.error("Failed to fetch tables:", error);
            toast({
                title: "خطا در بارگیری میزها",
                description: "نمی‌توان میزها را دریافت کرد.",
                variant: "destructive",
            });
        } finally {
            setIsLoadingTables(false);
        }
    }, [toast]);

    React.useEffect(() => {
        if (isOpen) {
            fetchAvailableTables();
            if (restaurant) {
                form.reset({
                    name: restaurant.name,
                    description: restaurant.description || "",
                    tableIds: restaurant.tableIds,
                });
            } else {
                form.reset({
                    name: "",
                    description: "",
                    tableIds: [],
                });
            }
        }
    }, [restaurant, form, isOpen, fetchAvailableTables]);

    const handleFormSubmit = async (values: RestaurantFormValues) => {
        setIsSubmitting(true);
        const submissionData: any = { ...values };
        if (isEditing && restaurant) {
            submissionData.id = restaurant.id;
        }
        await onSubmit(submissionData);
        setIsSubmitting(false);
    };

    const handleTableToggle = (tableId: string, checked: boolean) => {
        const currentIds = form.getValues("tableIds");
        if (checked) {
            form.setValue("tableIds", [...currentIds, tableId]);
        } else {
            form.setValue("tableIds", currentIds.filter(id => id !== tableId));
        }
    };

    const selectedTableIds = form.watch("tableIds");

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open && !isSubmitting) {
                form.reset();
            }
            onOpenChange(open);
        }}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "ویرایش رستوران" : "افزودن رستوران جدید"}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? "اطلاعات رستوران را بروزرسانی کنید." : "اطلاعات رستوران جدید را وارد کنید."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>نام رستوران</FormLabel>
                                    <FormControl>
                                        <Input placeholder="مثال: رستوران سنتی شیراز" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>توضیحات (اختیاری)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="توضیحات مختصری در مورد رستوران..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-4">
                            <div>
                                <FormLabel className="text-base">میزهای رستوران</FormLabel>
                                <FormDescription className="text-sm text-muted-foreground">
                                    میزهایی که به این رستوران تعلق دارند را انتخاب کنید.
                                </FormDescription>
                            </div>
                            {isLoadingTables ? (
                                <div className="space-y-2">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="flex items-center space-x-2">
                                            <Skeleton className="h-4 w-4" />
                                            <Skeleton className="h-4 w-32" />
                                        </div>
                                    ))}
                                </div>
                            ) : availableTables.length > 0 ? (
                                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                                    {availableTables.map((table) => (
                                        <div key={table.id} className="flex items-center space-x-3 space-y-0">
                                            <Checkbox
                                                id={`table-${table.id}`}
                                                checked={selectedTableIds.includes(table.id)}
                                                onCheckedChange={(checked) =>
                                                    handleTableToggle(table.id, checked === true)
                                                }
                                                disabled={isSubmitting}
                                            />
                                            <label
                                                htmlFor={`table-${table.id}`}
                                                className="text-sm font-normal cursor-pointer"
                                            >
                                                {table.name} (ظرفیت: {table.capacity})
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">هیچ میزی برای انتخاب موجود نیست.</p>
                            )}
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                                انصراف
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : null}
                                {isSubmitting ? (isEditing ? "در حال ذخیره..." : "در حال افزودن...") : (isEditing ? "ذخیره تغییرات" : "افزودن رستوران")}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}