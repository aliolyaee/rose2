// src/components/layout/restaurant-selector.tsx
"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useRestaurant } from "@/contexts/restaurant-context";
import { ChefHat, Building } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function RestaurantSelector() {
    const { currentRestaurant, restaurants, setCurrentRestaurant, isLoading } = useRestaurant();

    if (isLoading) {
        return (
            <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <Skeleton className="h-9 w-48" />
            </div>
        );
    }

    if (restaurants.length === 0) {
        return (
            <div className="flex items-center gap-2 text-muted-foreground">
                <Building className="h-4 w-4" />
                <span className="text-sm">هیچ رستورانی یافت نشد</span>
            </div>
        );
    }

    if (restaurants.length === 1) {
        return (
            <div className="flex items-center gap-2 text-sm">
                <ChefHat className="h-4 w-4 text-primary" />
                <span className="font-medium">{currentRestaurant?.name || restaurants[0].name}</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-primary" />
            <Select
                value={currentRestaurant?.id || ""}
                onValueChange={(value) => {
                    const restaurant = restaurants.find(r => r.id === value);
                    setCurrentRestaurant(restaurant || null);
                }}
            >
                <SelectTrigger className="w-48">
                    <SelectValue placeholder="انتخاب رستوران" />
                </SelectTrigger>
                <SelectContent>
                    {restaurants.map((restaurant) => (
                        <SelectItem key={restaurant.id} value={restaurant.id}>
                            <div className="flex flex-col text-right">
                                <span className="font-medium">{restaurant.name}</span>
                                {restaurant.description && (
                                    <span className="text-xs text-muted-foreground truncate max-w-xs">
                                        {restaurant.description}
                                    </span>
                                )}
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}